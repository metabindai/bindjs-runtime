import {
    ChartAxisValue,
    ChartChannel,
    ChartDiagnostic,
    ChartDirective,
    ChartForegroundStyle,
    ChartMark,
    ChartMarkKind,
    ChartMarkStyle,
    ChartModel,
    ChartScaleOption,
    ChartSymbolName,
    ChartValue,
    emptyChartModel,
} from './ChartModel';
import { ChartModifierDirective } from './ChartModifierContext';
import { ColorStyle, colorStyleToCSS } from '../../Styles/ColorStyle';

export type ChartColorScheme = 'light' | 'dark' | undefined;

const markTypes: Record<string, ChartMarkKind> = {
    BarMark: 'bar',
    LineMark: 'line',
    AreaMark: 'area',
    PointMark: 'point',
    RuleMark: 'rule',
    RectangleMark: 'rectangle',
};

const chartModifierTypes = new Set([
    'chartXAxis',
    'chartYAxis',
    'chartXScale',
    'chartYScale',
    'chartForegroundStyleScale',
    'chartSelection',
    'chartSymbolScale',
    'chartXSelection',
    'chartYSelection',
    'chartLegend',
    'chartXAxisLabel',
    'chartYAxisLabel',
]);

export type ForEachResolver = (props: Record<string, any>) => unknown[];

export function collectChartModel(
    children: unknown,
    chartModifiers: ChartModifierDirective[] = [],
    resolveForEach?: ForEachResolver,
    colorScheme?: ChartColorScheme
): ChartModel {
    const model = emptyChartModel();
    const context: CollectorContext = { resolveForEach, colorScheme };
    collectChildren(arrayify(children), model, 'Chart.children', context);
    for (const modifier of chartModifiers) {
        applyChartModifier(modifier, model, 'Chart', context);
    }
    return model;
}

type CollectorContext = {
    resolveForEach?: ForEachResolver;
    colorScheme?: ChartColorScheme;
};

function collectChildren(children: unknown[], model: ChartModel, path: string, context: CollectorContext) {
    children.forEach((child, index) => collectChild(child, model, `${path}[${index}]`, context));
}

function collectChild(child: unknown, model: ChartModel, path: string, context: CollectorContext) {
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

    const kind = markTypes[directive.type];
    if (kind) {
        appendMark(model, markFromDirective(directive, kind, path), path);
        return;
    }

    model.diagnostics.push(error(`Chart children must be chart marks, Group, or materialized ForEach; found ${directive.type}`, path));
}

function collectModifiedChild(directive: ChartDirective, model: ChartModel, path: string, context: CollectorContext) {
    const modifiers: ChartModifierDirective[] = [];
    const base = unwrapModified(directive, modifiers);
    const kind = markTypes[base.type];
    if (!kind) {
        collectChild(base, model, path, context);
        return;
    }

    const mark = markFromDirective(base, kind, path);
    for (const modifier of modifiers.reverse()) {
        foldMarkModifier(modifier, mark, model, path, context);
    }
    appendMark(model, mark, path);
}

function expandForEachChildren(directive: ChartDirective, context: CollectorContext): unknown[] {
    const props = directive.props ?? {};
    const children = arrayify(props.children);
    if (children.length > 0) return children;
    if (!context.resolveForEach || props.functionId == null) return [];
    try {
        return arrayify(context.resolveForEach(props));
    } catch (e) {
        console.warn('Chart ForEach resolution failed', e);
        return [];
    }
}

function appendMark(model: ChartModel, mark: ChartMark, path: string) {
    if (mark.kind === 'rule') {
        const hasX = mark.channels.x != null;
        const hasY = mark.channels.y != null;
        if (hasX === hasY) {
            model.diagnostics.push(error('RuleMark requires exactly one of x or y.', path));
            return;
        }
    }
    if (mark.kind === 'rectangle' && (!mark.channels.x || !mark.channels.y)) {
        model.diagnostics.push(error('RectangleMark requires x and y channels.', path));
        return;
    }
    model.marks.push(mark);
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

function markFromDirective(directive: ChartDirective, kind: ChartMarkKind, path: string): ChartMark {
    const props = directive.props ?? {};
    return {
        id: props.id ?? path,
        kind,
        channels: {
            x: channelFromRaw(props.x, 'x'),
            y: channelFromRaw(props.y, 'y'),
            x2: channelFromRaw(props.x2, 'x2'),
            y2: channelFromRaw(props.y2, 'y2'),
        },
        style: {
            stacking: props.stacking === 'unstacked' ? 'unstacked' : 'standard',
        },
        accessibility: {},
    };
}

function foldMarkModifier(
    modifier: ChartModifierDirective,
    mark: ChartMark,
    model: ChartModel,
    path: string,
    context: CollectorContext
) {
    switch (modifier.type) {
        case 'foregroundStyle': {
            const foregroundStyle = foregroundStyleFromProps(modifier.props, context.colorScheme);
            if (foregroundStyle) mark.style.foregroundStyle = foregroundStyle;
            return;
        }
        case 'lineStyle':
            mark.style.lineStyle = {
                width: numberFromRaw(modifier.props.width),
                dash: Array.isArray(modifier.props.dash) ? modifier.props.dash.map(numberFromRaw).filter(isNumber) : undefined,
            };
            return;
        case 'interpolationMethod':
            mark.style.interpolationMethod = modifier.props.method ?? modifier.props.rawValue;
            return;
        case 'cornerRadius':
            mark.style.cornerRadius = numberFromRaw(modifier.props.rawValue ?? modifier.props.value);
            return;
        case 'symbol': {
            const raw = modifier.props.symbol ?? modifier.props.rawValue ?? modifier.props.value;
            const symbol = symbolNameFromRaw(raw);
            if (symbol) mark.style.symbol = symbol;
            else if (raw != null) model.diagnostics.push(error(`Unknown chart symbol '${raw}'. Expected circle, square, diamond, triangle, plus, or cross.`, path));
            return;
        }
        case 'symbolSize':
            mark.style.symbolSize = numberFromRaw(modifier.props.size ?? modifier.props.rawValue ?? modifier.props.value);
            return;
        case 'annotation': {
            const annotation = annotationFromProps(modifier.props);
            if (annotation) mark.style.annotation = annotation;
            else model.diagnostics.push(error('chart annotation requires text.', path));
            return;
        }
        case 'accessibilityLabel':
            mark.accessibility.label = modifier.props.rawValue ?? modifier.props.value;
            return;
        case 'accessibilityHint':
            mark.accessibility.description = modifier.props.rawValue ?? modifier.props.value;
            return;
        case 'accessibilityValue':
            mark.accessibility.value = modifier.props.rawValue ?? modifier.props.value;
            return;
        default:
            if (chartModifierTypes.has(modifier.type)) {
                model.diagnostics.push(error(`Chart-level modifier ${modifier.type} cannot be attached to ${mark.kind}`, path));
            } else {
                model.diagnostics.push(warning(`Ignoring unsupported chart mark modifier ${modifier.type}`, path));
            }
    }
}

function applyChartModifier(modifier: ChartModifierDirective, model: ChartModel, path: string, context: CollectorContext) {
    const props = modifier.props ?? {};
    switch (modifier.type) {
        case 'chartXAxis':
            model.axes.x = axisOptionFromProps(props, model, path);
            return;
        case 'chartYAxis':
            model.axes.y = axisOptionFromProps(props, model, path);
            return;
        case 'chartXScale':
            model.scales.x = scaleOptionFromProps(props);
            validateScale(model.scales.x, 'x', model, path);
            return;
        case 'chartYScale':
            model.scales.y = scaleOptionFromProps(props);
            validateScale(model.scales.y, 'y', model, path);
            return;
        case 'chartForegroundStyleScale':
            model.style.foregroundStyleScale = foregroundScaleFromProps(props, context.colorScheme);
            return;
        case 'chartSymbolScale':
            model.style.symbolScale = symbolScaleFromProps(props, model, path);
            return;
        case 'chartXSelection':
            model.selection = { ...(model.selection ?? {}), x: selectionFromProps(props) };
            return;
        case 'chartYSelection':
            model.selection = { ...(model.selection ?? {}), y: selectionFromProps(props) };
            return;
        case 'chartSelection':
            model.diagnostics.push(error('chartSelection is not supported on Chart; use chartXSelection or chartYSelection instead', path));
            return;
        case 'chartLegend': {
            const raw = props.rawValue ?? props.value;
            model.legend.hidden = props.hidden === true || props.visibility === 'hidden' || props.position === 'hidden' || raw === 'hidden';
            return;
        }
        case 'chartXAxisLabel':
            model.axes.x = { ...(model.axes.x ?? {}), label: props.label ?? props.rawValue ?? props.value ?? '' };
            return;
        case 'chartYAxisLabel':
            model.axes.y = { ...(model.axes.y ?? {}), label: props.label ?? props.rawValue ?? props.value ?? '' };
            return;
        case 'accessibilityLabel':
            model.accessibility.label = props.rawValue ?? props.value;
            return;
        case 'accessibilityHint':
            model.accessibility.description = props.rawValue ?? props.value;
            return;
        default:
            model.diagnostics.push(warning(`Ignoring unsupported chart modifier ${modifier.type}`, path));
    }
}

function axisOptionFromProps(props: Record<string, any>, model: ChartModel, path: string) {
    const raw = props.rawValue ?? props.value;
    return {
        hidden: props.hidden === true || props.visibility === 'hidden' || raw === 'hidden',
        values: axisValuesFromRaw(props.values ?? raw, model, path),
        position: props.position,
        label: props.label,
        labelsHidden: props.labelsHidden === true,
        ticksHidden: props.ticksHidden === true,
        gridHidden: props.gridHidden === true,
        formatter: formatterFromRaw(props.formatter),
    };
}

function scaleOptionFromProps(props: Record<string, any>): ChartScaleOption {
    return {
        type: props.type,
        domain: Array.isArray(props.domain) ? props.domain.map(axisValueFromRaw).filter(isAxisValue) : undefined,
    };
}

function validateScale(scale: ChartScaleOption | undefined, axis: string, model: ChartModel, path: string) {
    const domain = scale?.domain;
    if (
        Array.isArray(domain) &&
        domain.length === 2 &&
        typeof domain[0] === 'number' &&
        typeof domain[1] === 'number' &&
        domain[0] > domain[1]
    ) {
        model.diagnostics.push(error(`Invalid chart ${axis}-scale domain: lower bound must be less than or equal to upper bound`, path));
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

function symbolScaleFromProps(props: Record<string, any>, model: ChartModel, path: string): Record<string, ChartSymbolName> {
    const source = props.scale && typeof props.scale === 'object' ? props.scale : props;
    const entries = Object.entries(source)
        .filter(([key]) => !['children', 'rawValue', 'value', '_type'].includes(key))
        .map(([key, value]): [string, ChartSymbolName] | undefined => {
            const symbol = symbolNameFromRaw(value);
            if (!symbol) {
                model.diagnostics.push(error(`Unknown chart symbol '${String(value)}'. Expected circle, square, diamond, triangle, plus, or cross.`, path));
                return undefined;
            }
            return [key, symbol];
        })
        .filter((entry): entry is [string, ChartSymbolName] => Boolean(entry));
    return Object.fromEntries(entries);
}

function selectionFromProps(props: Record<string, any>) {
    const value = axisValueFromRaw(props.value ?? props.rawValue);
    return {
        value: value ?? null,
        onChangeId: props.onChangeId,
    };
}

function annotationFromProps(props: Record<string, any>) {
    const raw = props.rawValue ?? props.value;
    const text = props.text ?? raw?.text ?? (typeof raw === 'string' ? raw : undefined);
    if (typeof text !== 'string' || text.length === 0) return undefined;
    const position = props.position ?? raw?.position;
    return { text, position };
}

function axisValuesFromRaw(raw: unknown, model: ChartModel, path: string): 'automatic' | ChartAxisValue[] | undefined {
    if (raw === 'automatic') return 'automatic';
    if (!Array.isArray(raw)) return undefined;
    return raw
        .map((value, index) => {
            const axisValue = axisValueFromRaw(value);
            if (axisValue == null) {
                model.diagnostics.push(warning(
                    `Ignoring unsupported chart axis value at index ${index}; expected string or number.`,
                    path
                ));
            }
            return axisValue;
        })
        .filter(isAxisValue);
}

function formatterFromRaw(raw: unknown) {
    if (!raw || typeof raw !== 'object') return undefined;
    const formatter = raw as Record<string, any>;
    if (formatter.style === 'currency' && typeof formatter.currency !== 'string') return undefined;
    if (['number', 'percent', 'currency', 'date'].includes(formatter.style)) return formatter as any;
    return undefined;
}

function symbolNameFromRaw(raw: unknown): ChartSymbolName | undefined {
    if (raw === 'circle' || raw === 'square' || raw === 'diamond' || raw === 'triangle' || raw === 'plus' || raw === 'cross') {
        return raw;
    }
    return undefined;
}

export function foregroundStyleFromProps(props: Record<string, any>, colorScheme?: ChartColorScheme): ChartForegroundStyle | undefined {
    const raw = props.rawValue ?? props.value;
    const by = props.by ?? raw?.by;
    if (by != null) {
        const channel = channelFromRaw(by, 'series');
        if (channel) return { type: 'series', channel };
    }

    const color = props.color ?? raw?.color ?? colorFromRaw(raw, colorScheme);
    return color ? { type: 'color', color } : undefined;
}

export function channelFromRaw(raw: unknown, defaultLabel?: string): ChartChannel | undefined {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        const value = valueFromRaw((raw as any).value);
        if (value == null) return undefined;
        return { value, label: (raw as any).label ?? defaultLabel };
    }

    const value = valueFromRaw(raw);
    return value == null ? undefined : { value, label: defaultLabel };
}

function valueFromRaw(raw: unknown): ChartValue | undefined {
    if (typeof raw === 'number' || typeof raw === 'string' || typeof raw === 'boolean') return raw;
    return undefined;
}

function axisValueFromRaw(raw: unknown): ChartAxisValue | undefined {
    if (typeof raw === 'number' || typeof raw === 'string') return raw;
    return undefined;
}

export function colorFromRaw(raw: unknown, colorScheme?: ChartColorScheme): string | undefined {
    if (raw == null) return undefined;
    if (typeof raw === 'string') return colorStyleToCSS(raw as ColorStyle, undefined, colorScheme);
    if (typeof raw !== 'object') return undefined;

    const directive = raw as ChartDirective;
    if (directive.type === 'Color') {
        const props = directive.props ?? {};
        const named = props.rawValue ?? props.value;
        if (typeof named === 'string') return colorStyleToCSS(named as ColorStyle, undefined, colorScheme);
        if (isNumber(props.r) && isNumber(props.g) && isNumber(props.b)) {
            const alpha = isNumber(props.a) ? props.a : 1;
            return colorStyleToCSS({ r: props.r, g: props.g, b: props.b, a: alpha }, undefined, colorScheme);
        }
    }

    return undefined;
}

export function arrayify(value: unknown): unknown[] {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

export function numberFromRaw(raw: unknown): number | undefined {
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isChartValue(value: unknown): value is ChartValue {
    return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
}

function isAxisValue(value: unknown): value is ChartAxisValue {
    return typeof value === 'number' || typeof value === 'string';
}

export function warning(message: string, path: string): ChartDiagnostic {
    return { severity: 'warning', message, path };
}

export function error(message: string, path: string): ChartDiagnostic {
    return { severity: 'error', message, path };
}
