import { useStyle } from '../Style';
import { useAssets } from '../Assets';
import { useEffect, useReducer, useRef, ReactNode } from 'react';
import { AssetMediaType } from '../Assets';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';
import type Hls from 'hls.js';

type VideoContentMode = 'fill' | 'fit';

interface BaseVideoProps {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    contentMode?: VideoContentMode;
    // URL of the image shown before playback begins (HTML `<video poster>`).
    poster?: string;
}

export interface UIVideoProps extends BaseVideoProps {
    video?: string;                 // Asset ID for video
    url?: string;                   // Direct URL
    children?: ReactNode;
}

interface VideoContentProps extends BaseVideoProps {
    url: string;
}

/**
 * VideoContent component displays a video from a direct URL
 */
function VideoContent(props: VideoContentProps) {
    const { url, autoplay = false, muted = true, loop = false, controls = true, contentMode, poster } = props;

    const layout = useLayout(props, UIVideo);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply animation styles
        ...animationStyle,
    };

    const videoRef = useRef<HTMLVideoElement>(null);
    useHLSPlayback(videoRef, url, autoplay);

    // Video object fit based on environment aspect ratio content mode
    const objectFit = contentMode === 'fill' ? 'cover' : 'contain';

    return (
        <div style={style} ref={animationRef as React.Ref<HTMLDivElement>}>
            <video
                ref={videoRef}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit
                }}
                src={url}
                poster={poster}
                autoPlay={autoplay}
                muted={muted}
                loop={loop}
                controls={controls}
                playsInline
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

/**
 * Plays an HLS playlist (.m3u8) in browsers that can't play one natively, such
 * as Firefox, through hls.js. hls.js is only loaded in those browsers.
 */
function useHLSPlayback(videoRef: React.RefObject<HTMLVideoElement>, url: string, autoplay: boolean) {
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !/\.m3u8($|[?#])/i.test(url) || video.canPlayType('application/vnd.apple.mpegurl')) {
            return;
        }

        let hls: Hls | null = null;
        let cancelled = false;

        import('hls.js/light').then(({ default: HlsLight }) => {
            if (cancelled || !HlsLight.isSupported()) return;

            // A video that doesn't autoplay loads its segments when it starts playing.
            hls = new HlsLight({ autoStartLoad: autoplay });
            hls.loadSource(url);
            hls.attachMedia(video);
            if (!autoplay) {
                video.addEventListener('play', () => hls?.startLoad(), { once: true });
            }
        }).catch((error) => {
            console.warn('Video: HLS playback unavailable', error);
        });

        return () => {
            cancelled = true;
            hls?.destroy();
            hls = null;
        };
    }, [url, autoplay]);
}

interface AssetLoaderProps {
    asset: Partial<AssetMediaType> | string;
    children: (url: string) => ReactNode;
}

/**
 * AssetLoader component loads an asset by ID and renders its children
 * with the asset URL
 */
function AssetLoader({
    asset,
    children
}: AssetLoaderProps) {
    const [assetItem, dispatchAssetItem] = useReducer(
        (_: Partial<AssetMediaType> | null, next: Partial<AssetMediaType> | null) => next,
        null
    );
    const assets = useAssets();

    var assetId: string | null = null
    if (typeof asset === 'string') {
        // If image is a string, it is an asset id
        assetId = asset;
    } else if (typeof asset === 'object' && asset !== null) {
        // If image is an object, it should have an id property
        assetId = asset['id'];

    } else {
        // If image is neither, return null
        return null;
    }

    /**
     * Load the asset from the database using the id
     */
    useEffect(() => {
        if (typeof asset === 'object' && asset !== null && asset.url) {
            dispatchAssetItem(asset)
            return
        }

        const loadAsset = async () => {
            const asset = await assets.getAssetById(assetId);
            dispatchAssetItem(asset);
        }
        if (assetId) {
            loadAsset();
        } else {
            dispatchAssetItem(null);
        }
    }, [assetId]);

    if (assetItem === null) {
        return null;
    }

    // Call children function with the URL
    return <>{children(assetItem.url)}</>;
}

/**
 * UIVideo is the main component that can either:
 * 1. Use AssetLoader to load a video asset by ID
 * 2. Directly use VideoContent with a URL
 */
export function UIVideo({ video, url, autoplay = false, muted = true, loop = false, controls = true, contentMode, poster, children }: UIVideoProps) {

    // For asset-based video
    if (video) {
        return (
            <AssetLoader asset={video}>
                {(assetUrl) => (
                    <VideoContent
                        url={assetUrl}
                        autoplay={autoplay}
                        muted={muted}
                        loop={loop}
                        controls={controls}
                        contentMode={contentMode}
                        poster={poster}
                    />
                )}
            </AssetLoader>
        );

        // For URL-based video
    } else if (url) {
        return (
            <VideoContent
                url={url}
                autoplay={autoplay}
                muted={muted}
                loop={loop}
                controls={controls}
                contentMode={contentMode}
                poster={poster}
            />
        );
    }

    return null;
}

// Size calculation function
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    // If a proposed size return that
    if (proposal.width && proposal.height) {
        return {
            frame: proposal
        }
    }

    // Default size
    return {
        frame: { width: proposal.width ?? Infinity, height: proposal.height ?? Infinity }
    }
}

layoutRegistry.register(
    UIVideo,
    sizeThatFits
);
