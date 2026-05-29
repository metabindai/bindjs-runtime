import React, { useEffect, useMemo, useRef } from 'react';
import { useStyle } from '../../Style';
import { layoutRegistry, LayoutMeasurement, layoutStyle, useLayout } from '../../Layout';
import { useChartModifiers } from './ChartModifierContext';
import { useRendererContext } from '../../../RendererContext';
import { PieChartModel, PieSliceMark } from './ChartModel';
import {
    collectPieChartModel,
    colorForPieSlice,
    pieSelectionPayloadForSlice,
} from './PieChartCollector';
import { useChartForEachResolver } from './useChartForEachResolver';
import { useEnvironment } from '../../Environment';
import { useMeasuredSize } from '../../../../hooks/useMeasuredSize';
import { ChartLegend, chartLegendHeight } from './ChartLegend';

type PieChartProps = {
    children?: any;
    innerRadius?: number;
};

type PreparedArc = {
    slice: PieSliceMark;
    start: number;
    end: number;
    color: string;
};

export function PieChart(props: PieChartProps): React.ReactNode {
    const rootRef = useRef<HTMLDivElement>(null);
    const style = useStyle();
    const layout = useLayout(props, PieChart);
    const chartModifiers = useChartModifiers();
    const rendererContext = useRendererContext();
    const size = useMeasuredSize(rootRef, 180, 180);
    const resolveForEach = useChartForEachResolver();
    const { colorScheme } = useEnvironment();
    const model = useMemo(
        () => collectPieChartModel(props.children, chartModifiers, props, resolveForEach, colorScheme),
        [props.children, chartModifiers, props.innerRadius, resolveForEach, colorScheme]
    );
    const arcs = useMemo(() => arcsFor(model, colorScheme), [model, colorScheme]);

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

    const label = [model.accessibility.label, model.accessibility.description].filter(Boolean).join('. ') || undefined;

    if (!size) {
        return <div ref={rootRef} role="img" aria-label={label} style={css} />;
    }

    const legendEntries = model.legend.hidden
        ? []
        : arcs.map((arc) => ({
            key: arc.slice.id,
            color: arc.color,
            label: arc.slice.label ?? arc.slice.id,
        }));
    const legendHeight = chartLegendHeight(legendEntries);
    const svgHeight = Math.max(160, size.height - legendHeight);
    const radius = Math.max(0, (Math.min(size.width, svgHeight) / 2) - 10);
    const innerRadius = radius * Math.max(0, Math.min(model.innerRadius ?? 0, 1));
    const cx = size.width / 2;
    const cy = svgHeight / 2;

    return (
        <div ref={rootRef} role="img" aria-label={label} style={css}>
            <svg width={size.width} height={svgHeight} viewBox={`0 0 ${size.width} ${svgHeight}`}>
                {arcs.map((arc) => (
                    <PieSlicePath
                        key={arc.slice.id}
                        arc={arc}
                        cx={cx}
                        cy={cy}
                        radius={radius}
                        innerRadius={innerRadius}
                        onSelect={() => {
                            const payload = pieSelectionPayloadForSlice(model, arc.slice);
                            if (payload) rendererContext.functionCallback?.(payload.handlerId)?.(payload.value);
                        }}
                    />
                ))}
            </svg>
            <ChartLegend entries={legendEntries} />
        </div>
    );
}

function PieSlicePath(props: {
    arc: PreparedArc;
    cx: number;
    cy: number;
    radius: number;
    innerRadius: number;
    onSelect: () => void;
}) {
    const { arc, cx, cy, radius, innerRadius, onSelect } = props;
    const cornerRadius = roundedSliceStrokeWidth(arc.slice, radius, innerRadius);
    const label = arc.slice.accessibility.label ?? arc.slice.label ?? arc.slice.id;

    return (
        <path
            d={arcPath(cx, cy, radius, innerRadius, arc.start, arc.end)}
            fill={arc.color}
            stroke={cornerRadius > 0 ? arc.color : 'rgba(255,255,255,0.85)'}
            strokeWidth={cornerRadius > 0 ? cornerRadius : 1}
            strokeLinecap={cornerRadius > 0 ? 'round' : undefined}
            strokeLinejoin={cornerRadius > 0 ? 'round' : undefined}
            data-corner-radius={arc.slice.style.cornerRadius ?? undefined}
            role="button"
            aria-label={label}
            onClick={onSelect}
        >
            <title>{label}</title>
        </path>
    );
}

function arcsFor(model: PieChartModel, colorScheme?: 'light' | 'dark'): PreparedArc[] {
    const slices = model.slices.filter((slice) => slice.value > 0);
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    if (total <= 0) return [];
    let cursor = -Math.PI / 2;
    return slices.map((slice, index) => {
        const span = (slice.value / total) * Math.PI * 2;
        const arc = {
            slice,
            start: cursor,
            end: cursor + span,
            color: colorForPieSlice(slice, model, colorScheme, index),
        };
        cursor += span;
        return arc;
    });
}

function arcPath(cx: number, cy: number, outerRadius: number, innerRadius: number, start: number, end: number): string {
    const epsilon = 0.0001;
    const adjustedEnd = end - start >= Math.PI * 2 ? start + (Math.PI * 2) - epsilon : end;
    const outerStart = point(cx, cy, outerRadius, start);
    const outerEnd = point(cx, cy, outerRadius, adjustedEnd);
    const largeArc = adjustedEnd - start > Math.PI ? 1 : 0;
    if (innerRadius <= 0) {
        return [
            `M ${cx} ${cy}`,
            `L ${outerStart.x} ${outerStart.y}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
            'Z',
        ].join(' ');
    }

    const innerEnd = point(cx, cy, innerRadius, adjustedEnd);
    const innerStart = point(cx, cy, innerRadius, start);
    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
    ].join(' ');
}

function point(cx: number, cy: number, radius: number, angle: number) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    };
}

function roundedSliceStrokeWidth(slice: PieSliceMark, outerRadius: number, innerRadius: number): number {
    const cornerRadius = slice.style.cornerRadius;
    if (typeof cornerRadius !== 'number' || !Number.isFinite(cornerRadius) || cornerRadius <= 0) return 0;

    const thickness = Math.max(1, outerRadius - innerRadius);
    return Math.min(cornerRadius * 2, thickness * 0.65, outerRadius * 0.18);
}

const sizeThatFits = ({ proposal }): LayoutMeasurement => ({
    frame: {
        width: proposal.width ?? 320,
        height: proposal.height ?? 240,
    },
});

layoutRegistry.register(PieChart, sizeThatFits);
