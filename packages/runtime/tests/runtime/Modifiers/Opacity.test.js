import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('Opacity modifier', () => {
    let runtime, Color, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Color = runtime.getComponent('Color');
        Text = runtime.getComponent('Text');
    });

    describe('Color opacity modifier special case', () => {
        it('adds opacity property to Color props when using .opacity()', () => {
            const component = runtime.defineComponent({
                body: () => (
                    Color('red').opacity(0.5)
                )
            })
            const ast = runtime.invokeComponent(component).props.children[0];
            expect(ast.type).toBe('Color');
            expect(ast.props.opacity).toBe(0.5);
            expect(ast.props.rawValue).toBe('red');
        });

        it('does not add opacity property to non-Color components', () => {
            const component = runtime.defineComponent({
                body: () => (
                    Text({ rawValue: 'hello' }).opacity(0.5)
                )
            })
            const ast = runtime.invokeComponent(component).props.children[0];
            // The outer modifier is opacity, the inner is Text
            expect(ast.props.modifier.type).toBe('opacity');
            expect(ast.props.content[0].type).toBe('Text');
            expect(ast.props.content[0].props.opacity).toBeUndefined();
            expect(ast.props.modifier.props.rawValue).toBe(0.5);
        });
    });

    describe('Color edge cases and multiple opacity', () => {
        it('multiplies multiple opacity modifiers on Color', () => {
            const component = runtime.defineComponent({
                body: () => (
                    Color('red').opacity(0.5).opacity(0.5)
                )
            })
            const ast = runtime.invokeComponent(component).props.children[0];
            // Should multiply: 0.5 * 0.5 = 0.25
            expect(ast.type).toBe('Color');
            expect(ast.props.opacity).toBeCloseTo(0.25);
        });

        it('returns black for null input', () => {
            const component = runtime.defineComponent({
                body: () => Color(null)
            })
            const ast = runtime.invokeComponent(component).props.children[0]
            expect(ast.props).toMatchObject({ r: 0, g: 0, b: 0, a: 1 });
        });
        it('returns black for undefined input', () => {
            const component = runtime.defineComponent({
                body: () => Color(undefined)
            })
            const ast = runtime.invokeComponent(component).props.children[0]
            expect(ast.props).toMatchObject({ r: 0, g: 0, b: 0, a: 1 });
        });
        it('returns black for empty object input', () => {
            const component = runtime.defineComponent({
                body: () => Color({})
            })
            const ast = runtime.invokeComponent(component).props.children[0]
            expect(ast.props).toMatchObject({ r: 0, g: 0, b: 0, a: 1 });
        });
    });

    describe('Non-Color opacity modifier chaining', () => {
        it('multiplies and collapses chained opacity modifiers on non-Color components', () => {
            const component = runtime.defineComponent({
                body: () => (
                    Text({ rawValue: 'hello' }).opacity(0.5).opacity(0.5)
                )
            })
            const ast = runtime.invokeComponent(component).props.children[0];
            // Should collapse to a single opacity modifier with 0.25
            expect(ast.type).toBe('ModifiedComponent');
            expect(ast.props.modifier.type).toBe('opacity');
            expect(ast.props.modifier.props.rawValue).toBeCloseTo(0.25);
            expect(ast.props.content[0].type).toBe('Text');
            expect(ast.props.content[0].props.rawValue).toBe('hello');
            expect(ast.props.content[0].props.opacity).toBeUndefined();
        });
    });
});
