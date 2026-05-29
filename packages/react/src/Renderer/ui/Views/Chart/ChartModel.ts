export type ChartValue = string | number | boolean;
export type ChartAxisValue = string | number;

export type ChartChannel = {
    value: ChartValue;
    label?: string;
};

export type ChartMarkKind = 'bar' | 'line' | 'area' | 'point' | 'rule' | 'rectangle';

export type ChartForegroundStyle =
    | { type: 'color'; color: string }
    | { type: 'series'; channel: ChartChannel };

export type ChartMarkStyle = {
    foregroundStyle?: ChartForegroundStyle;
    lineStyle?: {
        width?: number;
        dash?: number[];
    };
    interpolationMethod?: string;
    cornerRadius?: number;
    stacking?: 'standard' | 'unstacked';
    symbol?: ChartSymbolName;
    symbolSize?: number;
    annotation?: ChartAnnotation;
};

export type ChartSymbolName = 'circle' | 'square' | 'diamond' | 'triangle' | 'plus' | 'cross';

export type ChartAnnotation = {
    text: string;
    position?: 'top' | 'bottom' | 'leading' | 'trailing' | 'center';
};

export type ChartMark = {
    id: string;
    kind: ChartMarkKind;
    channels: {
        x?: ChartChannel;
        y?: ChartChannel;
        x2?: ChartChannel;
        y2?: ChartChannel;
    };
    style: ChartMarkStyle;
    accessibility: {
        label?: string;
        description?: string;
        value?: string;
    };
};

export type ChartModel = {
    marks: ChartMark[];
    axes: {
        x?: ChartAxisOption;
        y?: ChartAxisOption;
    };
    scales: {
        x?: ChartScaleOption;
        y?: ChartScaleOption;
    };
    legend: {
        hidden?: boolean;
    };
    style: {
        foregroundStyleScale: Record<string, string>;
        symbolScale: Record<string, ChartSymbolName>;
    };
    selection?: ChartSelectionOptions;
    accessibility: {
        label?: string;
        description?: string;
    };
    diagnostics: ChartDiagnostic[];
};

export type PieChartModel = {
    slices: PieSliceMark[];
    innerRadius?: number;
    legend: {
        hidden?: boolean;
    };
    style: {
        foregroundStyleScale: Record<string, string>;
    };
    selection?: PieSelectionBinding;
    accessibility: {
        label?: string;
        description?: string;
    };
    diagnostics: ChartDiagnostic[];
};

export type PieSliceMark = {
    id: string;
    value: number;
    label?: string;
    style: PieSliceStyle;
    accessibility: {
        label?: string;
        description?: string;
        value?: string;
    };
};

export type PieSliceStyle = {
    foregroundStyle?: ChartForegroundStyle;
    cornerRadius?: number;
};

export type PieSelectionBinding = {
    value?: string | null;
    onChangeId?: string;
};

export type ChartAxisOption = {
    hidden?: boolean;
    values?: 'automatic' | ChartAxisValue[];
    position?: string;
    label?: string;
    labelsHidden?: boolean;
    ticksHidden?: boolean;
    gridHidden?: boolean;
    formatter?: ChartValueFormatter;
};

export type ChartValueFormatter =
    | { style: 'number'; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: 'percent'; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: 'currency'; currency: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: 'date'; dateStyle?: string; timeStyle?: string };

export type ChartScaleOption = {
    type?: string;
    domain?: ChartAxisValue[];
};

export type ChartSelectionOptions = {
    x?: ChartSelectionBinding;
    y?: ChartSelectionBinding;
};

export type ChartSelectionBinding = {
    value?: ChartAxisValue | null;
    onChangeId?: string;
};

export type ChartDiagnostic = {
    severity: 'warning' | 'error';
    message: string;
    path: string;
};

export type ChartDirective = {
    type: string;
    props?: Record<string, any>;
};

export const emptyChartModel = (): ChartModel => ({
    marks: [],
    axes: {},
    scales: {},
    legend: {},
    style: { foregroundStyleScale: {}, symbolScale: {} },
    accessibility: {},
    diagnostics: [],
});

export const emptyPieChartModel = (): PieChartModel => ({
    slices: [],
    legend: {},
    style: { foregroundStyleScale: {} },
    accessibility: {},
    diagnostics: [],
});
