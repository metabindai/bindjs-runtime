import { describe, expect, it, vi } from 'vitest';
import { chartSelectionPayloadsForMark } from './Chart';
import { collectChartModel } from './ChartCollector';
import { collectPieChartModel, colorForPieSlice, pieSelectionPayloadForSlice } from './PieChartCollector';
import { defaultChartColorAt, defaultChartColorRange } from './defaultChartColors';

describe('ChartCollector', () => {
    it('collects tier-one marks', () => {
        const model = collectChartModel([
            bar('Jan', 12),
            { type: 'LineMark', props: { x: { value: 'Jan' }, y: { value: 10 }, children: [] } },
            { type: 'AreaMark', props: { x: { value: 'Jan' }, y: { value: 8 }, children: [] } },
            { type: 'PointMark', props: { x: { value: 'Jan' }, y: { value: 12 }, children: [] } },
            { type: 'RuleMark', props: { y: { value: 9 }, children: [] } },
        ]);

        expect(model.marks.map((mark) => mark.kind)).toEqual(['bar', 'line', 'area', 'point', 'rule']);
        expect(model.marks[0].channels.x?.value).toBe('Jan');
        expect(model.marks[0].channels.y?.value).toBe(12);
    });

    it('collects tier-two Cartesian marks', () => {
        const model = collectChartModel([
            {
                type: 'RectangleMark',
                props: {
                    x: { value: 'Jan' },
                    y: { value: 'North' },
                    y2: { value: 'South' },
                    children: [],
                },
            },
            { type: 'RuleMark', props: { x: { value: 'Feb', label: 'Release' }, children: [] } },
        ]);

        expect(model.marks.map((mark) => mark.kind)).toEqual(['rectangle', 'rule']);
        expect(model.marks[0].channels.x?.value).toBe('Jan');
        expect(model.marks[0].channels.y?.value).toBe('North');
        expect(model.marks[0].channels.y2?.value).toBe('South');
        expect(model.marks[1].channels.x?.value).toBe('Feb');
        expect(model.diagnostics).toEqual([]);
    });

    it('folds mark modifiers', () => {
        const model = collectChartModel([
            modified(
                { type: 'lineStyle', props: { width: 4, dash: [5, 2] } },
                modified(
                    { type: 'foregroundStyle', props: { by: { value: 'North', label: 'Region' } } },
                    bar('Jan', 12)
                )
            ),
        ]);

        const mark = model.marks[0];
        expect(mark.style.lineStyle).toEqual({ width: 4, dash: [5, 2] });
        expect(mark.style.foregroundStyle).toEqual({
            type: 'series',
            channel: { value: 'North', label: 'Region' },
        });
    });

    it('folds tier-two mark and chart modifiers', () => {
        const model = collectChartModel(
            [
                modified(
                    { type: 'annotation', props: { text: 'Peak', position: 'top' } },
                    modified(
                        { type: 'symbolSize', props: { rawValue: 96 } },
                        modified({ type: 'symbol', props: { rawValue: 'diamond' } }, point('Jan', 12))
                    )
                ),
            ],
            [
                {
                    type: 'chartXAxis',
                    props: {
                        values: ['Jan', 'Feb'],
                        position: 'top',
                        labelsHidden: true,
                        formatter: { style: 'number', maximumFractionDigits: 0 },
                    },
                },
                { type: 'chartSymbolScale', props: { scale: { North: 'circle', South: 'square' } } },
                { type: 'chartXSelection', props: { value: 'Jan', onChangeId: 'selectMonth' } },
                { type: 'chartYSelection', props: { value: 12, onChangeId: 'selectValue' } },
            ]
        );

        expect(model.marks[0].style.symbol).toBe('diamond');
        expect(model.marks[0].style.symbolSize).toBe(96);
        expect(model.marks[0].style.annotation).toEqual({ text: 'Peak', position: 'top' });
        expect(model.axes.x?.values).toEqual(['Jan', 'Feb']);
        expect(model.axes.x?.position).toBe('top');
        expect(model.axes.x?.labelsHidden).toBe(true);
        expect(model.axes.x?.formatter).toEqual({ style: 'number', maximumFractionDigits: 0 });
        expect(model.style.symbolScale).toEqual({ North: 'circle', South: 'square' });
        expect(model.selection?.x).toEqual({ value: 'Jan', onChangeId: 'selectMonth' });
        expect(model.selection?.y).toEqual({ value: 12, onChangeId: 'selectValue' });
        expect(model.diagnostics).toEqual([]);
    });

    it('folds corner radius on Cartesian and pie marks', () => {
        const chartModel = collectChartModel([
            modified({ type: 'cornerRadius', props: { rawValue: 10 } }, bar('Jan', 12)),
        ]);
        const pieModel = collectPieChartModel([
            modified({ type: 'cornerRadius', props: { rawValue: 6 } }, pieSlice('north', 40, 'North')),
        ]);

        expect(chartModel.marks[0].style.cornerRadius).toBe(10);
        expect(pieModel.slices[0].style.cornerRadius).toBe(6);
    });

    it('materializes unexpanded ForEach children via the resolver', () => {
        const data = [
            { month: 'Jan', revenue: 12 },
            { month: 'Feb', revenue: 18 },
            { month: 'Mar', revenue: 9 },
        ];
        const calls: Array<{ functionId: string; props: any }> = [];
        const resolver = (props: any) => {
            calls.push({ functionId: props.functionId, props });
            return data.map((item) => bar(item.month, item.revenue));
        };

        const model = collectChartModel(
            [unexpandedForEach('data-1', 'fn-1', 'env-1')],
            [],
            resolver
        );

        expect(model.marks.map((mark) => mark.kind)).toEqual(['bar', 'bar', 'bar']);
        expect(model.marks.map((mark) => mark.channels.x?.value)).toEqual(['Jan', 'Feb', 'Mar']);
        expect(model.marks.map((mark) => mark.channels.y?.value)).toEqual([12, 18, 9]);
        expect(calls).toHaveLength(1);
        expect(calls[0].functionId).toBe('fn-1');
        expect(calls[0].props.dataId).toBe('data-1');
        expect(calls[0].props.environmentId).toBe('env-1');
        expect(model.diagnostics).toEqual([]);
    });

    it('prefers materialized ForEach children when present over the resolver', () => {
        const resolver = vi.fn(() => [bar('Mar', 9)]);
        const model = collectChartModel(
            [
                {
                    type: 'ForEach',
                    props: {
                        dataId: 'data-1',
                        functionId: 'fn-1',
                        environmentId: 'env-1',
                        children: [bar('Jan', 12), bar('Feb', 18)],
                    },
                },
            ],
            [],
            resolver
        );

        expect(model.marks.map((mark) => mark.channels.x?.value)).toEqual(['Jan', 'Feb']);
        expect(resolver).not.toHaveBeenCalled();
    });

    it('skips unexpanded ForEach without a resolver', () => {
        const model = collectChartModel([unexpandedForEach('data-1', 'fn-1', 'env-1')]);
        expect(model.marks).toEqual([]);
        expect(model.diagnostics).toEqual([]);
    });

    it('materializes unexpanded ForEach for pie charts', () => {
        const data = [
            { region: 'North', value: 40 },
            { region: 'South', value: 60 },
        ];
        const resolver = (props: any) => {
            expect(props.functionId).toBe('fn-1');
            return data.map((item) => pieSlice(item.region.toLowerCase(), item.value, item.region));
        };

        const model = collectPieChartModel(
            [unexpandedForEach('data-1', 'fn-1', 'env-1')],
            [],
            {},
            resolver
        );

        expect(model.slices.map((slice) => slice.id)).toEqual(['north', 'south']);
        expect(model.slices.map((slice) => slice.value)).toEqual([40, 60]);
        expect(model.diagnostics).toEqual([]);
    });

    it('builds selection callback payloads from the selected mark', () => {
        const model = collectChartModel(
            [bar('Jan', 12), bar('Feb', 14)],
            [{ type: 'chartXSelection', props: { value: 'Jan', onChangeId: 'selectMonth' } }]
        );

        expect(chartSelectionPayloadsForMark(model, model.marks[1])).toEqual([
            { handlerId: 'selectMonth', value: 'Feb' },
        ]);
    });

    it('folds chart modifiers from context directives', () => {
        const model = collectChartModel(
            [bar('Jan', 12)],
            [
                { type: 'chartXAxis', props: { rawValue: 'hidden' } },
                { type: 'chartYScale', props: { domain: [0, 20] } },
                { type: 'chartForegroundStyleScale', props: { North: 'red', South: 'blue' } },
                { type: 'accessibilityHint', props: { rawValue: 'Quarterly revenue' } },
            ]
        );

        expect(model.axes.x?.hidden).toBe(true);
        expect(model.scales.y?.domain).toEqual([0, 20]);
        expect(model.style.foregroundStyleScale).toEqual({ North: 'rgba(255, 59, 48, 1)', South: 'rgba(0, 122, 255, 1)' });
        expect(model.accessibility.description).toBe('Quarterly revenue');
    });

    it('resolves named colors using the dark iOS palette when colorScheme=dark', () => {
        const model = collectChartModel(
            [bar('Jan', 12)],
            [{ type: 'chartForegroundStyleScale', props: { North: 'red', South: 'blue' } }],
            undefined,
            'dark'
        );
        expect(model.style.foregroundStyleScale).toEqual({
            North: 'rgba(255, 69, 58, 1)',
            South: 'rgba(10, 132, 255, 1)',
        });
    });

    it('exposes the SwiftUI default color cycle in light and dark mode', () => {
        const light = defaultChartColorRange('light');
        const dark = defaultChartColorRange('dark');
        expect(light).toHaveLength(12);
        // First three entries are blue, green, orange in iOS light values.
        expect(light.slice(0, 3)).toEqual([
            'rgba(0, 122, 255, 1)',
            'rgba(52, 199, 89, 1)',
            'rgba(255, 149, 0, 1)',
        ]);
        // Dark mode picks the dark-mode iOS values.
        expect(dark.slice(0, 3)).toEqual([
            'rgba(10, 132, 255, 1)',
            'rgba(48, 209, 88, 1)',
            'rgba(255, 159, 10, 1)',
        ]);
        // Index helper wraps around past the cycle length.
        expect(defaultChartColorAt(0, 'light')).toBe(light[0]);
        expect(defaultChartColorAt(12, 'light')).toBe(light[0]);
        expect(defaultChartColorAt(-1, 'light')).toBe(light[light.length - 1]);
    });

    it('falls back to the SwiftUI cycle for unstyled pie slices by position', () => {
        const model = collectPieChartModel(
            [pieSlice('north', 40, 'North'), pieSlice('south', 60, 'South')]
        );
        expect(colorForPieSlice(model.slices[0], model, 'light', 0)).toBe('rgba(0, 122, 255, 1)');
        expect(colorForPieSlice(model.slices[1], model, 'light', 1)).toBe('rgba(52, 199, 89, 1)');
    });

    it('applies chart-level modifiers with outer-wins precedence', () => {
        const model = collectChartModel(
            [bar('Jan', 12)],
            [
                { type: 'chartXAxis', props: { label: 'Inner' } },
                { type: 'chartXAxis', props: { label: 'Outer' } },
            ]
        );

        expect(model.axes.x?.label).toBe('Outer');
    });

    it('reports unsupported boolean axis values', () => {
        const model = collectChartModel(
            [bar('Jan', 12)],
            [{ type: 'chartXAxis', props: { values: ['Jan', true, 'Feb'] } }]
        );

        expect(model.axes.x?.values).toEqual(['Jan', 'Feb']);
        expect(model.diagnostics).toEqual([
            {
                severity: 'warning',
                message: 'Ignoring unsupported chart axis value at index 1; expected string or number.',
                path: 'Chart',
            },
        ]);
    });

    it('reports invalid scale domains', () => {
        const model = collectChartModel(
            [bar('Jan', 12)],
            [{ type: 'chartYScale', props: { domain: [20, 0] } }]
        );

        expect(model.diagnostics.some((diagnostic) => (
            diagnostic.severity === 'error' &&
            diagnostic.message.includes('Invalid chart y-scale domain')
        ))).toBe(true);
    });

    it('reports invalid tier-two Cartesian marks', () => {
        const model = collectChartModel([
            { type: 'RuleMark', props: { x: { value: 'Jan' }, y: { value: 10 }, children: [] } },
            { type: 'RectangleMark', props: { x: { value: 'Jan' }, children: [] } },
        ]);

        expect(model.marks).toEqual([]);
        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('RuleMark requires exactly one of x or y'))).toBe(true);
        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('RectangleMark requires x and y channels'))).toBe(true);
    });

    it('reports invalid chart content and chart modifiers on marks', () => {
        const model = collectChartModel([
            modified({ type: 'chartXAxis', props: { rawValue: 'hidden' } }, bar('Jan', 12)),
            { type: 'Text', props: { rawValue: 'not a mark', children: [] } },
        ]);

        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('cannot be attached'))).toBe(true);
        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('Chart children must be chart marks'))).toBe(true);
    });

    it('collects pie slices and modifiers', () => {
        const model = collectPieChartModel(
            [
                modified(
                    { type: 'accessibilityValue', props: { rawValue: '40 percent' } },
                    modified(
                        { type: 'foregroundStyle', props: { by: { value: 'North', label: 'Region' } } },
                        pieSlice('north', 40, 'North')
                    )
                ),
                pieSlice(undefined, 25, 'South'),
            ],
            [
                { type: 'chartForegroundStyleScale', props: { North: 'blue', South: 'green' } },
                { type: 'chartSelection', props: { value: 'north', onChangeId: 'selectRegion' } },
            ],
            { innerRadius: 1.4 }
        );

        expect(model.innerRadius).toBe(1);
        expect(model.slices.map((slice) => slice.id)).toEqual(['north', 'PieChart.children[1]']);
        expect(model.slices[0].style.foregroundStyle).toEqual({
            type: 'series',
            channel: { value: 'North', label: 'Region' },
        });
        expect(model.slices[0].accessibility.value).toBe('40 percent');
        expect(model.style.foregroundStyleScale).toEqual({ North: 'rgba(0, 122, 255, 1)', South: 'rgba(52, 199, 89, 1)' });
        expect(model.selection).toEqual({ value: 'north', onChangeId: 'selectRegion' });
        expect(model.diagnostics).toEqual([]);
    });

    it('reports invalid pie content and modifiers', () => {
        const model = collectPieChartModel(
            [
                bar('Jan', 12),
                modified({ type: 'lineStyle', props: { width: 2 } }, pieSlice('north', 40, 'North')),
            ],
            [{ type: 'chartXSelection', props: { value: 'Jan', onChangeId: 'selectMonth' } }]
        );

        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('Cartesian mark'))).toBe(true);
        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('Cartesian-only mark modifier'))).toBe(true);
        expect(model.diagnostics.some((diagnostic) => diagnostic.severity === 'error' && diagnostic.message.includes('use chartSelection'))).toBe(true);
    });

    it('builds pie selection callback payloads from the selected slice', () => {
        const model = collectPieChartModel(
            [pieSlice('north', 40, 'North'), pieSlice('south', 60, 'South')],
            [{ type: 'chartSelection', props: { value: 'north', onChangeId: 'selectRegion' } }]
        );

        expect(pieSelectionPayloadForSlice(model, model.slices[1])).toEqual({
            handlerId: 'selectRegion',
            value: 'south',
        });
    });
});

function bar(x: string, y: number) {
    return {
        type: 'BarMark',
        props: {
            x: { value: x },
            y: { value: y },
            children: [],
        },
    };
}

function point(x: string, y: number) {
    return {
        type: 'PointMark',
        props: {
            x: { value: x },
            y: { value: y },
            children: [],
        },
    };
}

function pieSlice(id: string | undefined, value: number, label?: string) {
    return {
        type: 'PieSliceMark',
        props: {
            id,
            value,
            label,
            children: [],
        },
    };
}

function modified(modifier: any, content: any) {
    return {
        type: 'ModifiedComponent',
        props: {
            modifier,
            content: [content],
        },
    };
}

function unexpandedForEach(dataId: string, functionId: string, environmentId: string) {
    return {
        type: 'ForEach',
        props: {
            dataId,
            functionId,
            environmentId,
            count: 0,
            children: null,
        },
    };
}
