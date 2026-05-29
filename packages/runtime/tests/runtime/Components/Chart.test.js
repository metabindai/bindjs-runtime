import { describe, expect, it } from 'vitest';
import { BindJSRuntime } from '../../../src/runtime/BindJSRuntime.js';

describe('Chart components', () => {
    it('emits directives for chart and tier-one marks', () => {
        const runtime = new BindJSRuntime();
        const Chart = runtime.getComponent('Chart');
        const BarMark = runtime.getComponent('BarMark');
        const LineMark = runtime.getComponent('LineMark');

        const component = runtime.defineComponent({
            body: () => Chart({}, [
                BarMark({ x: { value: 'Jan' }, y: { value: 12 } }).foregroundStyle('red'),
                LineMark({ x: { value: 'Feb' }, y: { value: 14 } }).interpolationMethod('monotone'),
            ]),
        });

        const chart = runtime.invokeComponent(component).props.children[0];
        expect(chart.type).toBe('Chart');
        expect(chart.props.children[0].type).toBe('ModifiedComponent');
        expect(chart.props.children[0].props.content[0].type).toBe('BarMark');
        expect(chart.props.children[1].props.modifier.type).toBe('interpolationMethod');
    });
});
