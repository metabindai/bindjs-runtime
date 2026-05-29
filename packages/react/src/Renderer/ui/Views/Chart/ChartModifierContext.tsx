import React, { createContext, ReactNode, useContext } from 'react';

export type ChartModifierDirective = {
    type: string;
    props: Record<string, any>;
};

const ChartModifierContext = createContext<ChartModifierDirective[]>([]);

export function useChartModifiers(): ChartModifierDirective[] {
    return useContext(ChartModifierContext);
}

function makeChartModifier(type: string) {
    return function ChartSemanticModifier(props: Record<string, any> & { children?: ReactNode }) {
        const inherited = useChartModifiers();
        const { children, ...modifierProps } = props;
        return (
            <ChartModifierContext.Provider value={[{ type, props: modifierProps }, ...inherited]}>
                {children}
            </ChartModifierContext.Provider>
        );
    };
}

export const ChartXAxis = makeChartModifier('chartXAxis');
export const ChartYAxis = makeChartModifier('chartYAxis');
export const ChartXScale = makeChartModifier('chartXScale');
export const ChartYScale = makeChartModifier('chartYScale');
export const ChartForegroundStyleScale = makeChartModifier('chartForegroundStyleScale');
export const ChartSymbolScale = makeChartModifier('chartSymbolScale');
export const ChartSelection = makeChartModifier('chartSelection');
export const ChartXSelection = makeChartModifier('chartXSelection');
export const ChartYSelection = makeChartModifier('chartYSelection');
export const ChartLegend = makeChartModifier('chartLegend');
export const ChartXAxisLabel = makeChartModifier('chartXAxisLabel');
export const ChartYAxisLabel = makeChartModifier('chartYAxisLabel');
export const LineStyle = makeChartModifier('lineStyle');
export const InterpolationMethod = makeChartModifier('interpolationMethod');
export const Symbol = makeChartModifier('symbol');
export const SymbolSize = makeChartModifier('symbolSize');
export const Annotation = makeChartModifier('annotation');
export const ChartAccessibilityLabel = makeChartModifier('accessibilityLabel');
export const ChartAccessibilityHint = makeChartModifier('accessibilityHint');
export const ChartAccessibilityValue = makeChartModifier('accessibilityValue');
