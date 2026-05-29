import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('Color function', () => {
    let runtime, Color;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Color = runtime.getComponent('Color');
    });

    function getColorProps(arg) {
        const component = runtime.defineComponent({
            body: () => Color(arg)
        })
        return runtime.invokeComponent(component).props.children[0].props;
    }

    it('parses 3-digit hex', () => {
        expect(getColorProps('#f0a')).toMatchObject({ r: 255, g: 0, b: 170, a: 1 });
    });
    it('parses 4-digit hex (with alpha)', () => {
        expect(getColorProps('#f0a8')).toMatchObject({ r: 255, g: 0, b: 170, a: 0.5333333333333333 });
    });
    it('parses 6-digit hex', () => {
        expect(getColorProps('#ff00aa')).toMatchObject({ r: 255, g: 0, b: 170, a: 1 });
    });
    it('parses 8-digit hex (with alpha)', () => {
        expect(getColorProps('#ff00aa80')).toMatchObject({ r: 255, g: 0, b: 170, a: 0.5019607843137255 });
    });
    it('returns named colors as-is', () => {
        expect(getColorProps('red').rawValue).toBe('red');
        expect(getColorProps('blue').rawValue).toBe('blue');
    });
    it('parses short rgb object', () => {
        expect(getColorProps({ r: 1, g: 0, b: 0 })).toMatchObject({ r: 255, g: 0, b: 0, a: 1 });
        expect(getColorProps({ r: 0.5, g: 0.5, b: 0.5, a: 0.5 })).toMatchObject({ r: 128, g: 128, b: 128, a: 0.5 });
    });
    it('parses fully spelled out rgb object', () => {
        expect(getColorProps({ red: 1, green: 0, blue: 0 })).toMatchObject({ r: 255, g: 0, b: 0, a: 1 });
        expect(getColorProps({ red: 128, green: 128, blue: 128, alpha: 0.5 })).toMatchObject({ r: 128, g: 128, b: 128, a: 0.5 });
    });
    it('parses hsb object (short keys) for red', () => {
        expect(getColorProps({ h: 0, s: 1, b: 1 })).toMatchObject({ r: 255, g: 0, b: 0, a: 1 });
    });
    it('parses hsb object (short keys) for blue', () => {
        expect(getColorProps({ h: 240, s: 1, b: 1 })).toMatchObject({ r: 0, g: 0, b: 255, a: 1 });
    });
    it('parses fully spelled out hsb object', () => {
        expect(getColorProps({ hue: 0, saturation: 1, brightness: 0.5 })).toMatchObject({ r: 128, g: 0, b: 0, a: 1 });
        expect(getColorProps({ hue: 120, saturation: 1, brightness: 0.5, alpha: 0.5 })).toMatchObject({ r: 0, g: 128, b: 0, a: 0.5 });
    });
    it('returns non-hex, non-named strings as-is', () => {
        expect(getColorProps('rgba(1,2,3,0.5)').rawValue).toBe('rgba(1,2,3,0.5)');
        expect(getColorProps('hsla(1,2,3,0.5)').rawValue).toBe('hsla(1,2,3,0.5)');
        expect(getColorProps('notacolor').rawValue).toBe('notacolor');
    });
    it('parses short rgb object with fractional values', () => {
        expect(getColorProps({ r: 0.0, g: 0.8, b: 0.5 })).toMatchObject({ r: 0, g: 204, b: 128, a: 1 });
    });
});
