import {
    ChartDirective,
    ChartForegroundStyle,
    PieChartModel,
    PieSliceMark,
    emptyPieChartModel,
} from './ChartModel';
import {
    ChartColorScheme,
    ForEachResolver,
    arrayify,
    colorFromRaw,
    error,
    foregroundStyleFromProps,
    numberFromRaw,
    warning,
} from './ChartCollector';
import { ChartModifierDirective } from './ChartModifierContext';
import { defaultChartColorAt } from './defaultChartColors';

const cartesianMarkTypes = new Set(['BarMark', 'LineMark', 'AreaMark', 'PointMark', 'RuleMark', 'RectangleMark']);
const cartesianChartModifiers = new Set([
    'chartXAxis',
    'chartYAxis',
    'chartXScale',
    'chartYScale',
    'chartSymbolScale',
    'chartXSelection',
    'chartYSelection',
    'chartXAxisLabel',
    'chartYAxisLabel',
]);
const pieChartModifiers = new Set([
    'chartForegroundStyleScale',
    'chartLegend',
    'chartSelection',
    'accessibilityLabel',
    'accessibilityHint',
]);
const cartesianOnlyMarkModifiers = new Set([
    'lineStyle',
    'interpolationMethod',
    'symbol',
    'symbolSize',
    'annotation',
]);

export function collectPieChartModel(
    children: unknown,
    chartModifiers: ChartModifierDirective[] = [],
    props: Record<string, any> = {},
    resolveForEach?: ForEachResolver,
    colorScheme?: ChartColorScheme
): PieChartModel {
    const model = emptyPieChartModel();
    const innerRadius = numberFromRaw(props.innerRadius);
    if (innerRadius != null) model.innerRadius = clamp01(innerRadius);
    const context: PieCollectorContext = { resolveForEach, colorScheme };
    collectChildren(arrayify(children), model, 'PieChart.children', context);
    for (const modifier of chartModifiers) {
        applyPieChartModifier(modifier, model, 'PieChart', context);
    }
    return model;
}

type PieCollectorContext = {
    resolveForEach?: ForEachResolver;
    colorScheme?: ChartColorScheme;
};

function collectChildren(children: unknown[], model: PieChartModel, path: string, context: PieCollectorContext) {
    children.forEach((child, index) => collectChild(child, model, `${path}[${index}]`, context));
}

function collectChild(child: unknown, model: PieChartModel, path: string, context: PieCollectorContext) {
    const directive = child as ChartDirective | undefined;
    if (!directive || typeof directive !== 'object' || !directive.type) return;

    if (directive.type === 'ForEach') {
        const expanded = expandForEachChildren(directive, context);
        collectChildren(expanded, model, `${path}.ForEach`, context);
        return;
    }

    if (directive.type === 'Group' || directive.type === 'ComponentCall') {
        collectChildren(arrayify(directive.props?.children), model, `${path}.${directive.type}`, context);
        return;
    }

    if (directive.type === 'ModifiedComponent') {
        collectModifiedChild(directive, model, path, context);
        return;
    }

    if (directive.type === 'PieSliceMark') {
        appendSlice(model, sliceFromDirective(directive, path), directive.type, path);
        return;
    }

    if (cartesianMarkTypes.has(directive.type)) {
        model.diagnostics.push(error(`PieChart children must be PieSliceMark, Group, or materialized ForEach; found Cartesian mark ${directive.type}`, path));
        return;
    }

    model.diagnostics.push(error(`PieChart children must be PieSliceMark, Group, or materialized ForEach; found ${directive.type}`, path));
}

function collectModifiedChild(directive: ChartDirective, model: PieChartModel, path: string, context: PieCollectorContext) {
    const modifiers: ChartModifierDirective[] = [];
    const base = unwrapModified(directive, modifiers);
    if (base.type !== 'PieSliceMark') {
        collectChild(base, model, path, context);
        return;
    }

    const slice = sliceFromDirective(base, path);
    if (!slice) {
        appendSlice(model, undefined, base.type, path);
        return;
    }
    for (const modifier of modifiers.reverse()) {
        foldSliceModifier(modifier, slice, model, path, context);
    }
    appendSlice(model, slice, base.type, path);
}

function expandForEachChildren(directive: ChartDirective, context: PieCollectorContext): unknown[] {
    const props = directive.props ?? {};
    const children = arrayify(props.children);
    if (children.length > 0) return children;
    if (!context.resolveForEach || props.functionId == null) return [];
    try {
        return arrayify(context.resolveForEach(props));
    } catch (e) {
        console.warn('PieChart ForEach resolution failed', e);
        return [];
    }
}

function sliceFromDirective(directive: ChartDirective, path: string): PieSliceMark | undefined {
    const props = directive.props ?? {};
    const value = numberFromRaw(props.value);
    if (value == null) return undefined;
    return {
        id: typeof props.id === 'string' ? props.id : path,
        value,
        label: typeof props.label === 'string' ? props.label : undefined,
        style: {},
        accessibility: {},
    };
}

function appendSlice(model: PieChartModel, slice: PieSliceMark | undefined, sliceName: string, path: string) {
    if (!slice) {
        model.diagnostics.push(error(`${sliceName} requires a literal numeric value.`, path));
        return;
    }
    model.slices.push(slice);
}

function unwrapModified(directive: ChartDirective, modifiers: ChartModifierDirective[]): ChartDirective {
    let current = directive;
    while (current.type === 'ModifiedComponent') {
        const modifier = current.props?.modifier;
        const content = arrayify(current.props?.content);
        if (!modifier || content.length !== 1) break;
        modifiers.push({ type: modifier.type, props: modifier.props ?? {} });
        current = content[0] as ChartDirective;
    }
    return current;
}

function foldSliceModifier(
    modifier: ChartModifierDirective,
    slice: PieSliceMark,
    model: PieChartModel,
    path: string,
    context: PieCollectorContext
) {
    switch (modifier.type) {
        case 'foregroundStyle': {
            const foregroundStyle = foregroundStyleFromProps(modifier.props, context.colorScheme);
            if (foregroundStyle) slice.style.foregroundStyle = foregroundStyle;
            return;
        }
        case 'cornerRadius':
            slice.style.cornerRadius = numberFromRaw(modifier.props.rawValue ?? modifier.props.value);
            return;
        case 'accessibilityLabel':
            slice.accessibility.label = modifier.props.rawValue ?? modifier.props.value;
            return;
        case 'accessibilityHint':
            slice.accessibility.description = modifier.props.rawValue ?? modifier.props.value;
            return;
        case 'accessibilityValue':
            slice.accessibility.value = modifier.props.rawValue ?? modifier.props.value;
            return;
        default:
            if (cartesianOnlyMarkModifiers.has(modifier.type)) {
                model.diagnostics.push(error(`Cartesian-only mark modifier ${modifier.type} cannot be attached to PieSliceMark`, path));
            } else if (pieChartModifiers.has(modifier.type) || cartesianChartModifiers.has(modifier.type)) {
                model.diagnostics.push(error(`Chart-level modifier ${modifier.type} cannot be attached to PieSliceMark`, path));
            } else {
                model.diagnostics.push(warning(`Ignoring unsupported pie slice modifier ${modifier.type}`, path));
            }
    }
}

function applyPieChartModifier(modifier: ChartModifierDirective, model: PieChartModel, path: string, context: PieCollectorContext) {
    const props = modifier.props ?? {};
    switch (modifier.type) {
        case 'chartForegroundStyleScale':
            model.style.foregroundStyleScale = foregroundScaleFromProps(props, context.colorScheme);
            return;
        case 'chartLegend': {
            const raw = props.rawValue ?? props.value;
            model.legend.hidden = props.hidden === true || props.visibility === 'hidden' || props.position === 'hidden' || raw === 'hidden';
            return;
        }
        case 'chartSelection':
            model.selection = {
                value: typeof (props.value ?? props.rawValue) === 'string' ? (props.value ?? props.rawValue) : null,
                onChangeId: props.onChangeId,
            };
            return;
        case 'chartXSelection':
        case 'chartYSelection':
            model.diagnostics.push(error(`${modifier.type} is not supported on PieChart; use chartSelection instead`, path));
            return;
        case 'accessibilityLabel':
            model.accessibility.label = props.rawValue ?? props.value;
            return;
        case 'accessibilityHint':
            model.accessibility.description = props.rawValue ?? props.value;
            return;
        default:
            if (cartesianChartModifiers.has(modifier.type)) {
                model.diagnostics.push(error(`Cartesian chart modifier ${modifier.type} is not supported on PieChart`, path));
            } else {
                model.diagnostics.push(warning(`Ignoring unsupported pie chart modifier ${modifier.type}`, path));
            }
    }
}

function foregroundScaleFromProps(props: Record<string, any>, colorScheme?: ChartColorScheme): Record<string, string> {
    const source = props.scale && typeof props.scale === 'object' ? props.scale : props;
    return Object.fromEntries(
        Object.entries(source)
            .filter(([key]) => !['children', 'rawValue', 'value', '_type'].includes(key))
            .map(([key, value]) => [key, colorFromRaw(value, colorScheme) ?? String(value)])
    );
}

export function pieSelectionPayloadForSlice(
    model: PieChartModel,
    slice: Pick<PieSliceMark, 'id'> | undefined
): { handlerId: string; value: string } | undefined {
    const handlerId = model.selection?.onChangeId;
    if (!handlerId || !slice?.id) return undefined;
    return { handlerId, value: slice.id };
}

export function colorForPieSlice(
    slice: PieSliceMark,
    model: PieChartModel,
    colorScheme?: ChartColorScheme,
    index: number = 0
): string {
    const style = slice.style.foregroundStyle;
    if (style?.type === 'color') return colorFromRaw(style.color, colorScheme) ?? style.color;
    if (style?.type === 'series') {
        const key = String(style.channel.value);
        return colorFromRaw(model.style.foregroundStyleScale[key], colorScheme)
            ?? model.style.foregroundStyleScale[key]
            ?? defaultChartColorAt(index, colorScheme);
    }
    const key = slice.label ?? slice.id;
    return colorFromRaw(model.style.foregroundStyleScale[key], colorScheme)
        ?? model.style.foregroundStyleScale[key]
        ?? defaultChartColorAt(index, colorScheme);
}

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function seriesKeyForPieSlice(slice: PieSliceMark): string {
    const foreground = slice.style.foregroundStyle as ChartForegroundStyle | undefined;
    if (foreground?.type === 'series') return String(foreground.channel.value);
    if (foreground?.type === 'color') return foreground.color;
    return slice.label ?? slice.id;
}
