import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('aspectRatio modifier', () => {
    let runtime, Color, Image;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Color = runtime.getComponent('Color');
        Image = runtime.getComponent('Image');
    });

    function modifierOf(build, base = () => Color({ rawValue: 'red' })) {
        const component = runtime.defineComponent({ body: () => build(base()) });
        return runtime.invokeComponent(component).props.children[0].props.modifier;
    }

    it('keeps both positional arguments', () => {
        const m = modifierOf(c => c.aspectRatio(2, 'fit'));
        expect(m.type).toBe('aspectRatio');
        expect(m.props).toMatchObject({ aspectRatio: 2, contentMode: 'fit' });
        expect(m.props.rawValue).toBeUndefined();
    });

    it('keeps the content mode when the ratio is omitted', () => {
        expect(modifierOf(c => c.aspectRatio(null, 'fill')).props).toMatchObject({ aspectRatio: null, contentMode: 'fill' });
        expect(modifierOf(c => c.aspectRatio(undefined, 'fit')).props).toMatchObject({ aspectRatio: null, contentMode: 'fit' });
    });

    it('a ratio alone fits', () => {
        expect(modifierOf(c => c.aspectRatio(16 / 9)).props).toMatchObject({ aspectRatio: 16 / 9, contentMode: 'fit' });
    });

    it('accepts the object form', () => {
        expect(modifierOf(c => c.aspectRatio({ aspectRatio: 1.5, contentMode: 'fill' })).props).toMatchObject({ aspectRatio: 1.5, contentMode: 'fill' });
    });

    it('treats a lone string as the content mode', () => {
        expect(modifierOf(c => c.aspectRatio('fit')).props).toMatchObject({ aspectRatio: null, contentMode: 'fit' });
    });

    it('no arguments means the intrinsic ratio, fitted', () => {
        expect(modifierOf(c => c.aspectRatio()).props).toMatchObject({ aspectRatio: null, contentMode: 'fit' });
    });

    it('drops ratios that cannot size a view', () => {
        for (const bad of [0, -1, NaN, Infinity, '2']) {
            expect(modifierOf(c => c.aspectRatio(bad, 'fit')).props.aspectRatio).toBeNull();
        }
    });

    it('an unknown content mode fits', () => {
        expect(modifierOf(c => c.aspectRatio(2, 'stretch')).props.contentMode).toBe('fit');
    });

    it('wraps a resizable image without disturbing resizable', () => {
        const component = runtime.defineComponent({ body: () => Image({ url: 'x' }).resizable().aspectRatio(null, 'fit') });
        const node = runtime.invokeComponent(component).props.children[0];
        expect(node.props.modifier.props).toMatchObject({ aspectRatio: null, contentMode: 'fit' });
        expect(node.props.content[0].props.resizable).toBe(true);
    });

    it('scaledToFit and scaledToFill stay argument-free modifiers', () => {
        expect(modifierOf(c => c.scaledToFit()).type).toBe('scaledToFit');
        expect(modifierOf(c => c.scaledToFill()).type).toBe('scaledToFill');
    });
});
