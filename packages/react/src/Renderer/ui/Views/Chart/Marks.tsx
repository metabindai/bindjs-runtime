import React from 'react';

function UnsupportedChartContent({ name }: { name: string }) {
    return (
        <span style={{ display: 'inline-block', fontSize: 12, color: '#b00020' }}>
            Unsupported chart content: {name}
        </span>
    );
}

export function BarMark() {
    return <UnsupportedChartContent name="BarMark" />;
}

export function LineMark() {
    return <UnsupportedChartContent name="LineMark" />;
}

export function AreaMark() {
    return <UnsupportedChartContent name="AreaMark" />;
}

export function PointMark() {
    return <UnsupportedChartContent name="PointMark" />;
}

export function RuleMark() {
    return <UnsupportedChartContent name="RuleMark" />;
}

export function RectangleMark() {
    return <UnsupportedChartContent name="RectangleMark" />;
}

export function PieSliceMark() {
    return <UnsupportedChartContent name="PieSliceMark" />;
}
