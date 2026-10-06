import { useEffect, useRef, useState } from 'react';
import { useAssets } from '../Assets';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle } from '../Layout';
import { useStyle } from '../Style';
import { useAnimationNode } from '../AnimatableStyle';
import { useRendererContext } from '../../RendererContext';

type MediaStatus = 'loading' | 'ready' | 'buffering' | 'ended' | 'failed';

interface AudioPlayerProps {
    url?: string;
    audio?: string;                 // Asset ID
    isPlaying?: boolean;
    setIsPlayingId?: string;
    currentTime?: number;
    setCurrentTimeId?: string;
    rate?: number;
    volume?: number;
    isMuted?: boolean;
    loop?: boolean;
    controls?: boolean;
    onStatusChangeId?: string;
    onEndedId?: string;
}

// How often the position is reported while playing (spec: every 0.25 to 0.5 s).
const TIME_REPORT_INTERVAL_MS = 250;
// Height of the drawn controls (Chrome and Firefox draw <audio controls> at 54px).
const CONTROLS_HEIGHT = 54;

/**
 * Audio player (BEP-0004). Without `controls` it renders a hidden <audio> element
 * and takes no space; with them it renders the browser's <audio controls>. Either
 * way it reports playback through the author's setters.
 */
export function AudioPlayer(props: AudioPlayerProps) {
    const {
        url, audio,
        isPlaying = false, currentTime,
        rate = 1, volume = 1, isMuted = false, loop = false, controls = false,
    } = props;

    const layout = useLayout(props, AudioPlayer);
    const { ref: animationRef, style: animationStyle } = useAnimationNode();
    const envStyle = useStyle();

    const functionCallback = useRendererContext().functionCallback;
    const assets = useAssets();
    const audioRef = useRef<HTMLAudioElement>(null);

    // Latest props, read from media event handlers.
    const propsRef = useRef(props);
    propsRef.current = props;

    const call = (id: string | undefined, value?: unknown) => {
        if (!id) return;
        try {
            functionCallback(id)(value);
        } catch (error) {
            console.error(error);
        }
    };

    // Resolve the source: a direct URL, or an asset looked up by id.
    const [assetUrl, setAssetUrl] = useState<string | null>(null);
    useEffect(() => {
        if (url || !audio) return;
        let cancelled = false;
        Promise.resolve(assets.getAssetById(audio)).then(asset => {
            if (!cancelled) setAssetUrl(asset?.url ?? null);
        });
        return () => { cancelled = true; };
    }, [url, audio]);
    const src = url ?? assetUrl ?? undefined;

    // The last position this player reported. currentTime coming back as that value is
    // the report echoing through the author's state, not a request to seek.
    const lastReportedTime = useRef<number | null>(null);
    const reportTime = (time: number) => {
        lastReportedTime.current = time;
        call(propsRef.current.setCurrentTimeId, time);
    };

    // Status reporting, deduplicated per the spec.
    const lastStatus = useRef<{ status: MediaStatus; duration: number | null; bufferedTime: number } | null>(null);
    const reportStatus = (status: MediaStatus, error?: string) => {
        const el = audioRef.current;
        const duration = el && !Number.isNaN(el.duration) ? el.duration : null;
        const buffered = el && el.buffered.length > 0 ? el.buffered.end(el.buffered.length - 1) : 0;
        const last = lastStatus.current;
        if (last && last.status === status && last.duration === duration
            && buffered - last.bufferedTime < 1 && !error) {
            return;
        }
        lastStatus.current = { status, duration, bufferedTime: buffered };
        call(propsRef.current.onStatusChangeId, {
            status, duration, bufferedTime: buffered, ...(error ? { error } : {}),
        });
    };
    const currentStatus = () => lastStatus.current?.status ?? 'loading';

    // A seek requested before metadata loaded is applied once it has.
    const pendingSeek = useRef<number | null>(currentTime ?? null);

    // Source changes: start over.
    const isFirstSource = useRef(true);
    useEffect(() => {
        lastStatus.current = null;
        reportStatus('loading');
        if (!isFirstSource.current) {
            pendingSeek.current = null;
            reportTime(0);
        }
        isFirstSource.current = false;
    }, [src]);

    // Whether the author's state was last told playback is on: its isPlaying when that
    // changes, or the value most recently sent through setIsPlaying.
    const authorIsPlaying = useRef(isPlaying);
    const reportIsPlaying = (value: boolean) => {
        if (value === authorIsPlaying.current) return;
        authorIsPlaying.current = value;
        call(propsRef.current.setIsPlayingId, value);
    };

    // Play / pause, when isPlaying changes, so the drawn controls work without the author's state.
    useEffect(() => {
        authorIsPlaying.current = isPlaying;
        const el = audioRef.current;
        if (!el || !src) return;
        if (isPlaying && el.paused) {
            el.play().catch(() => {
                // Autoplay policy or a load failure refused playback.
                reportIsPlaying(false);
            });
        } else if (!isPlaying && !el.paused) {
            el.pause();
        }
    }, [isPlaying, src]);

    // Seek when currentTime changes to anything but the last position this player reported.
    const previousTime = useRef(currentTime);
    useEffect(() => {
        if (currentTime === undefined || currentTime === previousTime.current) return;
        previousTime.current = currentTime;
        if (currentTime === lastReportedTime.current) return;
        const el = audioRef.current;
        if (el && el.readyState >= HTMLMediaElement.HAVE_METADATA) {
            el.currentTime = currentTime;
        } else {
            pendingSeek.current = currentTime;
        }
    }, [currentTime]);

    // Rate, volume, mute, loop.
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        el.playbackRate = rate;
        el.defaultPlaybackRate = rate;
        el.volume = Math.min(1, Math.max(0, volume));
        el.muted = isMuted;
        el.loop = loop;
    }, [rate, volume, isMuted, loop, src]);

    // Report the position on a fixed interval while playing.
    const [isTicking, setIsTicking] = useState(false);
    useEffect(() => {
        if (!isTicking) return;
        const timer = setInterval(() => {
            const el = audioRef.current;
            if (el) reportTime(el.currentTime);
        }, TIME_REPORT_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [isTicking]);

    // Stop playback when leaving the tree.
    useEffect(() => () => { audioRef.current?.pause(); }, []);

    const onLoadedMetadata = () => {
        const el = audioRef.current;
        if (el && pendingSeek.current !== null) {
            el.currentTime = pendingSeek.current;
            pendingSeek.current = null;
        }
        reportStatus('ready');
    };

    const onPlay = () => {
        // Started from outside the author's state (e.g. a hardware media key).
        reportIsPlaying(true);
    };

    const onPause = () => {
        setIsTicking(false);
        const el = audioRef.current;
        // Stopped on its own (interruption, media key), not because the author asked.
        if (el && !el.ended) reportIsPlaying(false);
    };

    const onEnded = () => {
        setIsTicking(false);
        const el = audioRef.current;
        if (el) reportTime(el.currentTime);
        reportStatus('ended');
        reportIsPlaying(false);
        call(propsRef.current.onEndedId);
    };

    const onError = () => {
        setIsTicking(false);
        const message = audioRef.current?.error?.message || 'The audio could not be loaded.';
        reportStatus('failed', message);
        reportIsPlaying(false);
    };

    const audioElement = (
        <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            controls={controls}
            style={controls ? { width: '100%', height: '100%' } : { display: 'none' }}
            onLoadedMetadata={onLoadedMetadata}
            onDurationChange={() => reportStatus(currentStatus())}
            onProgress={() => reportStatus(currentStatus())}
            onWaiting={() => reportStatus('buffering')}
            onPlaying={() => { setIsTicking(true); reportStatus('ready'); }}
            onCanPlay={() => { if (currentStatus() !== 'ended') reportStatus('ready'); }}
            onSeeked={() => { const el = audioRef.current; if (el) reportTime(el.currentTime); }}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
        />
    );

    if (!controls) return audioElement;

    const style: React.CSSProperties = {
        ...envStyle,
        ...layoutStyle(layout),
        ...animationStyle,
    };
    return (
        <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
            {audioElement}
        </div>
    );
}

// Headless: no space. With controls: full width at a fixed height.
const sizeThatFits = ({ proposal, props }): LayoutMeasurement => {
    if (!props.controls) {
        return { frame: { width: 0, height: 0 } };
    }
    return {
        frame: { width: proposal.width ?? Infinity, height: CONTROLS_HEIGHT },
    };
};

layoutRegistry.register(AudioPlayer, sizeThatFits);
