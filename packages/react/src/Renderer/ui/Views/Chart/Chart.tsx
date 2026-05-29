import React, { useEffect, useMemo, useRef } from 'react';
import * as Plot from '@observablehq/plot';
import { useStyle } from '../../Style';
import { layoutRegistry, LayoutMeasurement, layoutStyle, useLayout } from '../../Layout';
import { collectChartModel, colorFromRaw } from './ChartCollector';
import { ChartMark, ChartModel } from './ChartModel';
import { useChartModifiers } from './ChartModifierContext';
import { useRendererContext } from '../../../RendererContext';
import { useChartForEachResolver } from './useChartForEachResolver';
import { useEnvironment } from '../../Environment';
import { defaultChartColorRange } from './defaultChartColors';
import { useMeasuredSize } from '../../../../hooks/useMeasuredSize';
import { ChartLegend, ChartLegendEntry, chartLegendHeight } from './ChartLegend';

type ChartProps = {
    children?: any;
};

export function Chart(props: ChartProps): React.ReactNode {
    const rootRef = useRef<HTMLDivElement>(null);
    const plotMountRef = useRef<HTMLDivElement>(null);
    const style = useStyle();
    const layout = useLayout(props, Chart);
    const chartModifiers = useChartModifiers();
    const rendererContext = useRendererContext();
    const size = useMeasuredSize(rootRef, 240, 180);
    const resolveForEach = useChartForEachResolver();
    const { colorScheme } = useEnvironment();
    const model = useMemo(
        () => collectChartModel(props.children, chartModifiers, resolveForEach, colorScheme),
        [props.children, chartModifiers, resolveForEach, colorScheme]
    );
    const legendEntries = useMemo(
        () => (model.legend.hidden ? [] : legendEntriesFor(model, colorScheme)),
        [model, colorScheme]
    );

    const legendHeight = chartLegendHeight(legendEntries);
    const plotSize = size ? { width: size.width, height: Math.max(120, size.height - legendHeight) } : null;

    useEffect(() => {
        const mount = plotMountRef.current;
        if (!mount || !plotSize) return;

        mount.replaceChildren();
        const plot = Plot.plot(plotOptions(model, plotSize, colorScheme));
        mount.append(plot);
        const removeSelection = installChartSelection(mount, model, plotSize, rendererContext.functionCallback);

        return () => {
            removeSelection?.();
            plot.remove();
        };
    }, [model, plotSize?.width, plotSize?.height, rendererContext.functionCallback, colorScheme]);

    useEffect(() => {
        for (const diagnostic of model.diagnostics) {
            const message = `${diagnostic.path}: ${diagnostic.message}`;
            if (diagnostic.severity === 'error') console.error(message);
            else console.warn(message);
        }
    }, [model.diagnostics]);

    const css: React.CSSProperties = {
        ...style,
        ...layoutStyle(layout),
        width: '100%',
        minHeight: 240,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
    };

    return (
        <div
            ref={rootRef}
            role="img"
            aria-label={[model.accessibility.label, model.accessibility.description].filter(Boolean).join('. ') || undefined}
            style={css}
        >
            <div ref={plotMountRef} />
            <ChartLegend entries={legendEntries} />
        </div>
    );
}

function legendEntriesFor(model: ChartModel, colorScheme?: 'light' | 'dark'): ChartLegendEntry[] {
    const scale = foregroundStyleScale(model, colorScheme);
    if (!scale.domain?.length) return [];
    return scale.domain.map((key, i) => ({
        key,
        color: scale.range[i % scale.range.length],
        symbol: model.style.symbolScale[key],
    }));
}

function plotOptions(model: ChartModel, size: { width: number; height: number }, colorScheme?: 'light' | 'dark'): Plot.PlotOptions {
    const marks: Plot.Markish[] = [];
    const colorScale = foregroundStyleScale(model, colorScheme);

    const barRows = rowsFor(model, 'bar');
    if (barRows.length) {
        for (const rows of groupRowsByStyle(barRows, rectStyleKey)) {
            marks.push(Plot.barY(rows, {
                x: 'x',
                y: 'y',
                fill: fillOption(rows),
                title: titleOption,
                tip: true,
                ...cornerRadiusOptions(rows[0]?.mark),
            }));
        }
    }

    const rectangleRows = rectangleRowsFor(model);
    const rectangleRangeRows = rectangleRows.filter((row) => row.x2 != null && row.y2 != null);
    const rectangleCellRows = rectangleRows.filter((row) => row.x2 == null || row.y2 == null);
    if (rectangleRangeRows.length) {
        for (const rows of groupRowsByStyle(rectangleRangeRows, rectStyleKey)) {
            marks.push(Plot.rect(rows, {
                x1: 'x',
                x2: 'x2',
                y1: 'y',
                y2: 'y2',
                fill: fillOption(rows),
                stroke: 'currentColor',
                strokeOpacity: 0.12,
                title: titleOption,
                tip: true,
                ...cornerRadiusOptions(rows[0]?.mark),
            }));
        }
    }
    if (rectangleCellRows.length) {
        for (const rows of groupRowsByStyle(rectangleCellRows, rectStyleKey)) {
            marks.push(Plot.cell(rows, {
                x: 'x',
                y: 'y',
                fill: fillOption(rows),
                stroke: 'currentColor',
                strokeOpacity: 0.12,
                title: titleOption,
                tip: true,
                ...cornerRadiusOptions(rows[0]?.mark),
            }));
        }
    }

    const areaRows = rowsFor(model, 'area');
    if (areaRows.length) {
        for (const rows of groupRowsByStyle(areaRows, curveStyleKey)) {
            const stacked = shouldStackArea(rows);
            const areaOptions = {
                z: 'series',
                fill: fillOption(rows),
                fillOpacity: stacked ? 1 : 0.25,
                curve: curveFor(rows[0]?.mark),
                title: titleOption,
                tip: true,
            };
            marks.push(stacked
                ? Plot.areaY(rows, {
                    x: 'x',
                    y: 'y',
                    ...areaOptions,
                })
                : Plot.area(rows, {
                    x1: 'x',
                    x2: 'x',
                    y1: 0,
                    y2: 'y',
                    ...areaOptions,
                }));
        }
    }

    const lineRows = rowsFor(model, 'line');
    if (lineRows.length) {
        for (const rows of groupRowsByStyle(lineRows, lineStyleKey)) {
            marks.push(Plot.lineY(rows, {
                x: 'x',
                y: 'y',
                stroke: strokeOption(rows),
                strokeWidth: widthFor(rows[0]?.mark),
                strokeDasharray: dashFor(rows[0]?.mark),
                curve: curveFor(rows[0]?.mark),
                title: titleOption,
                tip: true,
            }));
        }
    }

    const pointRows = rowsFor(model, 'point');
    if (pointRows.length) {
        marks.push(Plot.dot(pointRows, {
            x: 'x',
            y: 'y',
            fill: fillOption(pointRows),
            stroke: strokeOption(pointRows),
            r: { value: (row: ChartRow) => symbolRadiusFor(row.mark), scale: null } as any,
            symbol: symbolOption(pointRows, model),
            title: titleOption,
            tip: true,
        }));
    }

    const yRuleRows = rowsFor(model, 'rule').filter((row) => row.y != null);
    if (yRuleRows.length) {
        for (const rows of groupRowsByStyle(yRuleRows, lineStyleKey)) {
            marks.push(Plot.ruleY(rows, {
                y: 'y',
                stroke: strokeOption(rows),
                strokeWidth: widthFor(rows[0]?.mark),
                strokeDasharray: dashFor(rows[0]?.mark),
            }));
        }
    }
    const xRuleRows = rowsFor(model, 'rule').filter((row) => row.x != null && row.y == null);
    if (xRuleRows.length) {
        for (const rows of groupRowsByStyle(xRuleRows, lineStyleKey)) {
            marks.push(Plot.ruleX(rows, {
                x: 'x',
                stroke: strokeOption(rows),
                strokeWidth: widthFor(rows[0]?.mark),
                strokeDasharray: dashFor(rows[0]?.mark),
            }));
        }
    }

    const annotationRows = annotationRowsFor(model);
    if (annotationRows.length) {
        for (const position of [...new Set(annotationRows.map((row) => row.position))]) {
            const rows = annotationRows.filter((row) => row.position === position);
            const offset = annotationOffset(position);
            marks.push(Plot.text(rows, {
                x: 'x',
                y: 'y',
                text: 'text',
                dx: offset.dx,
                dy: offset.dy,
                textAnchor: offset.textAnchor,
                fill: 'currentColor',
                fontSize: 12,
            }));
        }
    }

    const allRows = [...barRows, ...rectangleRows, ...areaRows, ...lineRows, ...pointRows, ...yRuleRows, ...xRuleRows];
    const xDomain = xDomainFor(model, allRows);

    return {
        width: size.width,
        height: size.height,
        marginLeft: 48,
        marginBottom: 36,
        x: {
            label: model.axes.x?.label ?? null,
            labelArrow: null,
            type: plotScaleType(model.scales.x?.type),
            domain: xDomain,
            ticks: axisTicks(model.axes.x?.values, model.scales.x?.type),
            tickFormat: formatterFor(model.axes.x?.formatter),
            axis: model.axes.x?.hidden ? null : model.axes.x?.position === 'top' ? 'top' : undefined,
        },
        y: {
            label: model.axes.y?.label ?? null,
            labelArrow: null,
            domain: yDomainFor(model),
            nice: true,
            ticks: axisTicks(model.axes.y?.values, model.scales.y?.type),
            tickFormat: formatterFor(model.axes.y?.formatter),
            grid: model.axes.y?.gridHidden ? false : true,
            axis: model.axes.y?.hidden ? null : model.axes.y?.position === 'trailing' ? 'right' : undefined,
        },
        symbol: symbolScale(model),
        color: {
            ...colorScale,
            legend: false,
        },
        marks,
    };
}

type ChartRowValue = string | number | boolean | Date;

type ChartRow = {
    x?: ChartRowValue;
    x2?: ChartRowValue;
    y?: ChartRowValue;
    y2?: ChartRowValue;
    series: string;
    color?: string;
    title: string;
    mark: ChartMark;
};

function rowsFor(model: ChartModel, kind: ChartMark['kind']): ChartRow[] {
    return model.marks
        .filter((mark) => mark.kind === kind)
        .map((mark) => {
            const series = seriesKey(mark);
            return {
                x: xValueFor(model, mark),
                y: yValueForMark(model, mark),
                series,
                color: colorForMark(mark, model),
                title: mark.accessibility.label ?? `${mark.channels.x?.value ?? ''} ${mark.channels.y?.value ?? ''}`.trim(),
                mark,
            };
        });
}

function rectangleRowsFor(model: ChartModel): ChartRow[] {
    return model.marks
        .filter((mark) => mark.kind === 'rectangle')
        .map((mark) => {
            const series = seriesKey(mark);
            return {
                x: xValueFor(model, mark),
                x2: xValueForChannel(model, mark.channels.x2?.value),
                y: yValueForChannel(model, mark.channels.y?.value),
                y2: yValueForChannel(model, mark.channels.y2?.value),
                series,
                color: colorForMark(mark, model),
                title: mark.accessibility.label ?? `${mark.channels.x?.value ?? ''} ${mark.channels.y?.value ?? ''}`.trim(),
                mark,
            };
        });
}

function xValueFor(model: ChartModel, mark: ChartMark): ChartRow['x'] {
    return xValueForChannel(model, mark.channels.x?.value);
}

function xValueForChannel(model: ChartModel, value: string | number | boolean | undefined): ChartRow['x'] {
    return valueForChannel(model.scales.x?.type, value);
}

function yValueForMark(model: ChartModel, mark: ChartMark): ChartRow['y'] {
    if (mark.kind === 'bar' || mark.kind === 'line' || mark.kind === 'area') {
        return typeof mark.channels.y?.value === 'number' ? mark.channels.y.value : undefined;
    }
    return yValueForChannel(model, mark.channels.y?.value);
}

function yValueForChannel(model: ChartModel, value: string | number | boolean | undefined): ChartRow['y'] {
    return valueForChannel(model.scales.y?.type, value);
}

function valueForChannel(scaleType: string | undefined, value: string | number | boolean | undefined): ChartRowValue | undefined {
    if (scaleType === 'date' && typeof value === 'string') {
        const date = new Date(value);
        if (!Number.isNaN(date.valueOf())) return date;
    }
    return value;
}

function yDomainFor(model: ChartModel): Plot.ScaleOptions['domain'] | undefined {
    if (model.scales.y?.domain) {
        return model.scales.y.domain as Plot.ScaleOptions['domain'];
    }
    const type = model.scales.y?.type;
    if (type && type !== 'linear') return undefined;

    let min = Infinity;
    let max = -Infinity;
    const observe = (value: number) => {
        if (value < min) min = value;
        if (value > max) max = value;
    };

    // Bars and (standard-stacked) areas accumulate per x — y axis must
    // accommodate the stacked total, not just the largest individual value.
    const stackTotals = new Map<string, { pos: number; neg: number }>();

    for (const mark of model.marks) {
        const kind = mark.kind;
        if (kind !== 'bar' && kind !== 'line' && kind !== 'area' && kind !== 'point' && kind !== 'rectangle' && kind !== 'rule') continue;

        const y = mark.channels.y?.value;
        const yNum = typeof y === 'number' && Number.isFinite(y) ? y : undefined;
        const y2 = mark.channels.y2?.value;
        const y2Num = typeof y2 === 'number' && Number.isFinite(y2) ? y2 : undefined;

        const stackable = (kind === 'bar' || kind === 'area') && mark.style.stacking !== 'unstacked';

        if (stackable && yNum != null) {
            const key = `${kind}|${String(mark.channels.x?.value)}`;
            const cur = stackTotals.get(key) ?? { pos: 0, neg: 0 };
            if (yNum >= 0) cur.pos += yNum;
            else cur.neg += yNum;
            stackTotals.set(key, cur);
            continue;
        }

        if (yNum != null) observe(yNum);
        if (y2Num != null) observe(y2Num);
    }

    for (const { pos, neg } of stackTotals.values()) {
        if (pos !== 0) observe(pos);
        if (neg !== 0) observe(neg);
    }

    if (min === Infinity || max === -Infinity) return undefined;
    return niceDomain(Math.min(0, min), Math.max(0, max));
}

function niceDomain(min: number, max: number): [number, number] {
    if (min === max) return [min, max];
    const range = niceNumber(max - min, false);
    const tickSpacing = niceNumber(range / 5, true);
    const niceMin = Math.floor(min / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
    return [niceMin, niceMax];
}

function niceNumber(value: number, round: boolean): number {
    if (value === 0) return 0;
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const fraction = value / Math.pow(10, exponent);
    let niceFraction: number;
    if (round) {
        if (fraction < 1.5) niceFraction = 1;
        else if (fraction < 3) niceFraction = 2;
        else if (fraction < 7) niceFraction = 5;
        else niceFraction = 10;
    } else {
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
}

function xDomainFor(model: ChartModel, rows: ChartRow[]): Plot.ScaleOptions['domain'] {
    const explicitDomain = model.scales.x?.domain;
    if (explicitDomain) {
        return explicitDomain.map((value) => {
            if (model.scales.x?.type === 'date' && typeof value === 'string') {
                const date = new Date(value);
                if (!Number.isNaN(date.valueOf())) return date;
            }
            return value;
        }) as Plot.ScaleOptions['domain'];
    }

    if (model.scales.x?.type === 'date') return undefined;

    if (Array.isArray(model.axes.x?.values)) return model.axes.x.values as Plot.ScaleOptions['domain'];

    const values = rows.flatMap((row) => [row.x, row.x2]).filter((value): value is string | boolean => {
        return typeof value === 'string' || typeof value === 'boolean';
    });
    if (!values.length) return undefined;

    return [...new Set(values)] as Plot.ScaleOptions['domain'];
}

function plotScaleType(type?: string): Plot.ScaleOptions['type'] | undefined {
    if (type === 'date') return 'utc';
    return type as Plot.ScaleOptions['type'] | undefined;
}

function fillOption(rows: ChartRow[]) {
    const literal = literalColor(rows);
    return literal ?? 'series';
}

function strokeOption(rows: ChartRow[]) {
    const literal = literalColor(rows);
    return literal ?? 'series';
}

function symbolOption(rows: ChartRow[], model: ChartModel): string | ((row: ChartRow) => string) | undefined {
    const symbols = rows.map((row) => symbolForMark(row.mark, model)).filter(Boolean);
    const unique = new Set(symbols);
    if (unique.size === 1) return symbols[0];
    return (row: ChartRow) => symbolForMark(row.mark, model) ?? 'circle';
}

function literalColor(rows: ChartRow[]): string | undefined {
    if (!rows.length) return undefined;
    const colors = new Set(rows.map((row) => row.color).filter(Boolean));
    return colors.size === 1 ? [...colors][0] : undefined;
}

function titleOption(row: ChartRow): string {
    return row.title;
}

const DEFAULT_SERIES_KEY = '__default__';

function seriesKey(mark: ChartMark): string {
    const style = mark.style.foregroundStyle;
    if (style?.type === 'series') return String(style.channel.value);
    if (style?.type === 'color') return style.color;
    return DEFAULT_SERIES_KEY;
}

function colorForMark(mark: ChartMark, model: ChartModel): string | undefined {
    const style = mark.style.foregroundStyle;
    if (style?.type === 'color') return style.color;
    if (style?.type === 'series') return model.style.foregroundStyleScale[String(style.channel.value)];
    return undefined;
}

function symbolForMark(mark: ChartMark, model: ChartModel): string | undefined {
    if (mark.style.symbol) return mark.style.symbol;
    const style = mark.style.foregroundStyle;
    if (style?.type === 'series') return model.style.symbolScale[String(style.channel.value)];
    return model.style.symbolScale[seriesKey(mark)];
}

function symbolRadiusFor(mark: ChartMark): number {
    const size = mark.style.symbolSize;
    return typeof size === 'number' && Number.isFinite(size) && size > 0 ? Math.sqrt(size) : 3.5;
}

function groupRowsByStyle(rows: ChartRow[], keyForRow: (row: ChartRow) => string): ChartRow[][] {
    const groups = new Map<string, ChartRow[]>();
    for (const row of rows) {
        const key = keyForRow(row);
        const group = groups.get(key);
        if (group) group.push(row);
        else groups.set(key, [row]);
    }
    return [...groups.values()];
}

function rectStyleKey(row: ChartRow): string {
    return JSON.stringify({
        cornerRadius: row.mark.style.cornerRadius ?? null,
    });
}

function lineStyleKey(row: ChartRow): string {
    return JSON.stringify({
        lineStyle: row.mark.style.lineStyle ?? null,
        interpolationMethod: row.mark.style.interpolationMethod ?? null,
    });
}

function curveStyleKey(row: ChartRow): string {
    return JSON.stringify({
        interpolationMethod: row.mark.style.interpolationMethod ?? null,
        stacking: row.mark.style.stacking ?? null,
    });
}

function cornerRadiusOptions(mark?: ChartMark): { r?: number } {
    const radius = mark?.style.cornerRadius;
    return typeof radius === 'number' && Number.isFinite(radius) && radius > 0 ? { r: radius } : {};
}

function shouldStackArea(rows: ChartRow[]): boolean {
    const seriesCount = new Set(rows.map((row) => row.series)).size;
    return seriesCount > 1 && rows.some((row) => row.mark.style.stacking !== 'unstacked');
}

function foregroundStyleScale(model: ChartModel, colorScheme?: 'light' | 'dark'): { domain?: string[]; range: string[] } {
    const explicit = Object.entries(model.style.foregroundStyleScale);
    if (explicit.length) {
        return {
            domain: explicit.map(([key]) => key),
            range: explicit.map(([, value]) => colorFromRaw(value, colorScheme) ?? value),
        };
    }

    // Derive the domain from series-styled marks in encounter order so Plot
    // and our HTML legend agree on which series gets which color.
    const seen = new Set<string>();
    const keys: string[] = [];
    for (const mark of model.marks) {
        const style = mark.style.foregroundStyle;
        if (style?.type !== 'series') continue;
        const key = String(style.channel.value);
        if (seen.has(key)) continue;
        seen.add(key);
        keys.push(key);
    }

    const range = defaultChartColorRange(colorScheme);
    if (!keys.length) {
        // No explicit scale and no series encoding — just expose the SwiftUI
        // default range for any ordinal color encoding Plot might infer.
        return { range };
    }
    return {
        domain: keys,
        range: keys.map((_, i) => range[i % range.length]),
    };
}

function symbolScale(model: ChartModel): { domain?: string[]; range?: string[] } {
    const entries = Object.entries(model.style.symbolScale);
    if (!entries.length) return {};
    return {
        domain: entries.map(([key]) => key),
        range: entries.map(([, value]) => value),
    };
}

type AnnotationRow = ChartRow & { text: string; position: string };

function annotationRowsFor(model: ChartModel): AnnotationRow[] {
    return model.marks.flatMap((mark) => {
        const annotation = mark.style.annotation;
        if (!annotation) return [];
        const y = typeof mark.channels.y?.value === 'number' ? mark.channels.y.value : undefined;
        if (y == null) return [];
        return [{
            x: xValueFor(model, mark),
            y,
            series: seriesKey(mark),
            color: colorForMark(mark, model),
            title: annotation.text,
            mark,
            text: annotation.text,
            position: annotation.position ?? 'top',
        }];
    });
}

function annotationOffset(position: string): { dx: number; dy: number; textAnchor: 'start' | 'middle' | 'end' } {
    switch (position) {
        case 'bottom':
            return { dx: 0, dy: 14, textAnchor: 'middle' };
        case 'leading':
            return { dx: -8, dy: 4, textAnchor: 'end' };
        case 'trailing':
            return { dx: 8, dy: 4, textAnchor: 'start' };
        case 'center':
            return { dx: 0, dy: 4, textAnchor: 'middle' };
        case 'top':
        default:
            return { dx: 0, dy: -8, textAnchor: 'middle' };
    }
}

function axisTicks(values: ChartModel['axes']['x'] extends infer _ ? any : never, scaleType?: string): any {
    if (!Array.isArray(values)) return undefined;
    if (scaleType === 'date') {
        return values.map((value) => typeof value === 'string' ? new Date(value) : value);
    }
    return values;
}

function formatterFor(formatter: ChartModel['axes']['x'] extends infer _ ? any : never): ((value: any) => string) | undefined {
    if (!formatter) return undefined;
    try {
        switch (formatter.style) {
            case 'number':
                return (value) => new Intl.NumberFormat(undefined, {
                    minimumFractionDigits: formatter.minimumFractionDigits,
                    maximumFractionDigits: formatter.maximumFractionDigits,
                }).format(value);
            case 'percent':
                return (value) => new Intl.NumberFormat(undefined, {
                    style: 'percent',
                    minimumFractionDigits: formatter.minimumFractionDigits,
                    maximumFractionDigits: formatter.maximumFractionDigits,
                }).format(value);
            case 'currency':
                return (value) => new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: formatter.currency,
                    minimumFractionDigits: formatter.minimumFractionDigits,
                    maximumFractionDigits: formatter.maximumFractionDigits,
                }).format(value);
            case 'date':
                return (value) => new Intl.DateTimeFormat(undefined, {
                    dateStyle: formatter.dateStyle,
                    timeStyle: formatter.timeStyle,
                }).format(value instanceof Date ? value : new Date(value));
            default:
                return undefined;
        }
    } catch {
        return undefined;
    }
}

function installChartSelection(
    root: HTMLDivElement,
    model: ChartModel,
    size: { width: number; height: number },
    functionCallback?: ((id: string) => ((value: any) => void) | undefined) | null
): (() => void) | undefined {
    const xHandlerId = model.selection?.x?.onChangeId;
    const yHandlerId = model.selection?.y?.onChangeId;
    if (!functionCallback || (!xHandlerId && !yHandlerId)) return undefined;
    const rows = [
        ...rowsFor(model, 'bar'),
        ...rectangleRowsFor(model),
        ...rowsFor(model, 'area'),
        ...rowsFor(model, 'line'),
        ...rowsFor(model, 'point'),
    ].filter((row) => row.x != null || row.y != null);

    const handler = (event: MouseEvent) => {
        const nearest = nearestRow(event, root, model, size, rows);
        if (!nearest) return;
        for (const payload of chartSelectionPayloadsForMark(model, nearest.mark)) {
            functionCallback(payload.handlerId)?.(payload.value);
        }
    };
    root.addEventListener('click', handler);
    return () => root.removeEventListener('click', handler);
}

export type ChartSelectionPayload = { handlerId: string; value: any };

export function chartSelectionPayloadsForMark(model: ChartModel, mark: ChartMark): ChartSelectionPayload[] {
    const payloads: ChartSelectionPayload[] = [];
    const xHandlerId = model.selection?.x?.onChangeId;
    const yHandlerId = model.selection?.y?.onChangeId;
    if (xHandlerId) payloads.push({ handlerId: xHandlerId, value: mark.channels.x?.value ?? null });
    if (yHandlerId) payloads.push({ handlerId: yHandlerId, value: mark.channels.y?.value ?? null });
    return payloads;
}

function nearestRow(
    event: MouseEvent,
    root: HTMLDivElement,
    model: ChartModel,
    size: { width: number; height: number },
    rows: ChartRow[]
): ChartRow | undefined {
    if (!rows.length) return undefined;
    const rect = root.getBoundingClientRect();
    const plotLeft = 48;
    const plotRight = size.width - 20;
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left - plotLeft) / Math.max(1, plotRight - plotLeft)));
    const domain = xDomainFor(model, rows);
    let best: { row: ChartRow; distance: number } | undefined;
    for (const row of rows) {
        const position = normalizedX(row.x, domain, rows);
        if (position == null) continue;
        const distance = Math.abs(position - px);
        if (!best || distance < best.distance) best = { row, distance };
    }
    return best?.row;
}

function normalizedX(value: ChartRow['x'], domain: Plot.ScaleOptions['domain'], rows: ChartRow[]): number | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number' || value instanceof Date) {
        const number = value instanceof Date ? value.valueOf() : value;
        const numericValues = (domain as any[] | undefined)?.map((item) => item instanceof Date ? item.valueOf() : item).filter((item) => typeof item === 'number') ??
            rows.map((row) => row.x).map((item) => item instanceof Date ? item.valueOf() : item).filter((item): item is number => typeof item === 'number');
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        return max === min ? 0.5 : (number - min) / (max - min);
    }
    const categorical = (domain as any[] | undefined) ?? [...new Set(rows.map((row) => row.x).filter((item) => typeof item === 'string' || typeof item === 'boolean'))];
    const index = categorical.findIndex((item) => item === value);
    if (index < 0) return undefined;
    return categorical.length <= 1 ? 0.5 : index / (categorical.length - 1);
}

function widthFor(mark?: ChartMark): number | undefined {
    return mark?.style.lineStyle?.width;
}

function dashFor(mark?: ChartMark): string | undefined {
    const dash = mark?.style.lineStyle?.dash;
    return dash?.length ? dash.join(' ') : undefined;
}

function curveFor(mark?: ChartMark): any {
    switch (mark?.style.interpolationMethod) {
        case 'monotone':
            return 'monotone-x';
        case 'cardinal':
            return 'cardinal';
        case 'catmullRom':
            return 'catmull-rom';
        case 'stepStart':
            return 'step-before';
        case 'stepCenter':
            return 'step';
        case 'stepEnd':
            return 'step-after';
        case 'linear':
        default:
            return 'linear';
    }
}

const sizeThatFits = ({ proposal }): LayoutMeasurement => ({
    frame: {
        width: proposal.width ?? Infinity,
        height: proposal.height ?? Infinity,
    },
});

layoutRegistry.register(Chart, sizeThatFits);
