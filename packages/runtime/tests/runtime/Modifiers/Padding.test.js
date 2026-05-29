import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('padding modifier normalization', () => {
    let runtime, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Text = runtime.getComponent('Text');
    });

    function getPaddingPropsFromComponent(...args) {
        const component = runtime.defineComponent({
            body: () => (
                Text({ rawValue: 'Hello World' })
                    .padding(...args)
            )
        })
        return runtime.invokeComponent(component).props.children[0].props.modifier.props;
    }

    it('normalizes no arguments to all sides = 8', () => {
        expect(getPaddingPropsFromComponent()).toMatchObject({ top: 8, leading: 8, bottom: 8, trailing: 8 });
    });

    it('normalizes a single number', () => {
        expect(getPaddingPropsFromComponent(12)).toMatchObject({ top: 12, leading: 12, bottom: 12, trailing: 12 });
    });

    it('normalizes a single edge string', () => {
        expect(getPaddingPropsFromComponent('top')).toMatchObject({ top: 8, leading: 0, bottom: 0, trailing: 0 });
    });

    it('normalizes an array of edges', () => {
        expect(getPaddingPropsFromComponent(['top', 'bottom'])).toMatchObject({ top: 8, leading: 0, bottom: 8, trailing: 0 });
    });

    it('normalizes an object with horizontal/vertical', () => {
        expect(getPaddingPropsFromComponent({ horizontal: 5, vertical: 10 })).toMatchObject({ top: 10, leading: 5, bottom: 10, trailing: 5 });
    });

    it('normalizes an object with explicit edges', () => {
        expect(getPaddingPropsFromComponent({ top: 1, leading: 2, bottom: 3, trailing: 4 })).toMatchObject({ top: 1, leading: 2, bottom: 3, trailing: 4 });
    });

    it('normalizes two arguments: edges and length', () => {
        expect(getPaddingPropsFromComponent(['top', 'leading'], 7)).toMatchObject({ top: 7, leading: 7, bottom: 0, trailing: 0 });
    });

    it('normalizes unknown input to all sides = 8', () => {
        expect(getPaddingPropsFromComponent(undefined)).toMatchObject({ top: 8, leading: 8, bottom: 8, trailing: 8 });
    });
});
