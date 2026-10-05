import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('AudioPlayer component', () => {
    let runtime;
    let AudioPlayer;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        AudioPlayer = runtime.getComponent('AudioPlayer');
    });

    it('is a registered built-in', () => {
        expect(AudioPlayer).toBeDefined();
    });

    it('serializes playback values and replaces every callback with a handler id', () => {
        const setIsPlaying = vi.fn();
        const setCurrentTime = vi.fn();
        const onStatusChange = vi.fn();
        const onEnded = vi.fn();
        const component = runtime.defineComponent({
            body: () => AudioPlayer({
                url: 'https://example.com/episode.mp3',
                isPlaying: true, setIsPlaying,
                currentTime: 12.5, setCurrentTime,
                rate: 1.5, volume: 0.8, isMuted: false, loop: true,
                onStatusChange, onEnded,
            })
        })
        const ast = runtime.invokeComponent(component).props.children[0];

        expect(ast.type).toBe('AudioPlayer');
        expect(ast.props).toMatchObject({
            url: 'https://example.com/episode.mp3',
            isPlaying: true, currentTime: 12.5,
            rate: 1.5, volume: 0.8, isMuted: false, loop: true,
        });
        for (const [key, fn] of Object.entries({ setIsPlaying, setCurrentTime, onStatusChange, onEnded })) {
            expect(ast.props[key]).toBeUndefined();
            expect(typeof ast.props[key + 'Id']).toBe('string');
            expect(runtime.storedFunctions[ast.props[key + 'Id']]).toBe(fn);
        }
    });

    it('keeps handler ids stable across renders', () => {
        const render = (setCurrentTime) => {
            const component = runtime.defineComponent({
                body: () => AudioPlayer({ audio: 'episode-asset', setCurrentTime })
            })
            return runtime.invokeComponent(component).props.children[0];
        };
        const first = render(vi.fn());
        const second = render(vi.fn());
        expect(first.props.audio).toBe('episode-asset');
        expect(second.props.setCurrentTimeId).toBe(first.props.setCurrentTimeId);
    });
});
