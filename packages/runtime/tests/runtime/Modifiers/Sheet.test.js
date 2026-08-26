import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('sheet modifier', () => {
    let runtime, Text, Detent;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Text = runtime.getComponent('Text');
        Detent = runtime.getComponent('Detent');
    });

    function sheetProps(sheetArgs) {
        const component = runtime.defineComponent({
            body: () => Text({ rawValue: 'Hello' }).sheet(sheetArgs)
        });
        return runtime.invokeComponent(component).props.children[0].props.modifier.props;
    }

    it('wires setIsPresented through processProps so dismiss reaches the component', () => {
        const calls = [];
        const props = sheetProps({
            isPresented: true,
            setIsPresented: (v) => calls.push(v),
            content: () => () => Text({ rawValue: 'Sheet' }),
        });

        expect(props.isPresented).toBe(true);
        expect(props.setIsPresentedHandlerId).toBeTruthy();
        runtime.restoreFunction(props.setIsPresentedHandlerId)(false);
        expect(calls).toEqual([false]);
    });

    it('wires onDismiss through processProps', () => {
        let dismissed = false;
        const props = sheetProps({
            isPresented: true,
            setIsPresented: () => {},
            onDismiss: () => { dismissed = true },
        });
        expect(props.dismissHandlerId).toBeTruthy();
        runtime.restoreFunction(props.dismissHandlerId)();
        expect(dismissed).toBe(true);
    });

    it('reports null handler ids when no callbacks are given', () => {
        const props = sheetProps({ isPresented: false });
        expect(props.setIsPresentedHandlerId).toBeNull();
        expect(props.dismissHandlerId).toBeNull();
        expect(props.contentHandlerId).toBeTruthy();
    });

    it('exposes Detent as a value namespace', () => {
        expect(Detent.medium).toEqual({ detentType: 'medium' });
        expect(Detent.large).toEqual({ detentType: 'large' });
        expect(Detent.fraction(0.5)).toEqual({ detentType: 'fraction', value: 0.5 });
        expect(Detent.height(200)).toEqual({ detentType: 'height', value: 200 });
    });

    it('passes Detent values through presentationDetents', () => {
        const component = runtime.defineComponent({
            body: () => Text({ rawValue: 'Hello' }).presentationDetents([Detent.medium, Detent.large])
        });
        const props = runtime.invokeComponent(component).props.children[0].props.modifier.props;
        expect(JSON.stringify(props)).toContain('"detentType":"medium"');
        expect(JSON.stringify(props)).toContain('"detentType":"large"');
    });
});
