import { describe, it, expect, beforeEach } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('chart scale modifiers', () => {
    let runtime, Text;
    beforeEach(() => {
        runtime = new BindJSRuntime();
        runtime.registerBuiltInComponents();
        Text = runtime.getComponent('Text');
    });

    function modifierProps(build) {
        const component = runtime.defineComponent({ body: () => build(Text({ rawValue: 'x' })) });
        return runtime.invokeComponent(component).props.children[0].props.modifier.props;
    }

    it('chartForegroundStyleScale records the key order as the scale domain', () => {
        const props = modifierProps(t => t.chartForegroundStyleScale({ High: 'red', Medium: 'orange', Low: 'blue' }));
        expect(props.__bindjsScaleDomain).toEqual(['High', 'Medium', 'Low']);
        expect(props.High).toBe('red');
    });

    it('chartSymbolScale records the key order as the scale domain', () => {
        const props = modifierProps(t => t.chartSymbolScale({ High: 'triangle', Medium: 'square', Low: 'circle' }));
        expect(props.__bindjsScaleDomain).toEqual(['High', 'Medium', 'Low']);
    });

    it('other modifiers are untouched', () => {
        const props = modifierProps(t => t.padding({ top: 4 }));
        expect(props.__bindjsScaleDomain).toBeUndefined();
    });
});
