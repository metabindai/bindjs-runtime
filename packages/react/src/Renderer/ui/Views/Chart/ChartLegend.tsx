import React from 'react';
import { ChartSymbolName } from './ChartModel';

export type ChartLegendEntry = {
    key: string;
    color: string;
    label?: string;
    symbol?: ChartSymbolName;
};

export function ChartLegend({ entries }: { entries: ChartLegendEntry[] }) {
    if (!entries.length) return null;
    return (
        <div style={legendStyle}>
            {entries.map((entry) => (
                <span key={entry.key} style={legendItemStyle}>
                    <ChartLegendSymbol name={entry.symbol ?? 'circle'} color={entry.color} />
                    {entry.label ?? entry.key}
                </span>
            ))}
        </div>
    );
}

export function chartLegendHeight(entries: ChartLegendEntry[]): number {
    if (!entries.length) return 0;
    return Math.min(72, Math.max(0, entries.length * 22));
}

function ChartLegendSymbol({ name, color }: { name: ChartSymbolName; color: string }) {
    const size = 10;
    const c = size / 2;
    switch (name) {
        case 'square':
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <rect x="0" y="0" width={size} height={size} fill={color} />
                </svg>
            );
        case 'diamond':
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <polygon points={`${c},0 ${size},${c} ${c},${size} 0,${c}`} fill={color} />
                </svg>
            );
        case 'triangle':
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <polygon points={`${c},0 ${size},${size} 0,${size}`} fill={color} />
                </svg>
            );
        case 'plus': {
            const t = 2.6;
            const m = (size - t) / 2;
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <rect x={m} y="0" width={t} height={size} fill={color} />
                    <rect x="0" y={m} width={size} height={t} fill={color} />
                </svg>
            );
        }
        case 'cross':
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <line x1="0.5" y1="0.5" x2={size - 0.5} y2={size - 0.5} stroke={color} strokeWidth="2" strokeLinecap="round" />
                    <line x1={size - 0.5} y1="0.5" x2="0.5" y2={size - 0.5} stroke={color} strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case 'circle':
        default:
            return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={symbolStyle}>
                    <circle cx={c} cy={c} r={c} fill={color} />
                </svg>
            );
    }
}

const legendStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 12px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px 8px',
    fontSize: 12,
};

const legendItemStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
};

const symbolStyle: React.CSSProperties = {
    display: 'inline-block',
    flexShrink: 0,
};
