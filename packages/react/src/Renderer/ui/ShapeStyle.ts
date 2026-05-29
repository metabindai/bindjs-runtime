import React from 'react';

import { colorNodeToCSS } from './Utils/colorNodeToCSS';
import { gradientNodeToCSS } from './Utils/gradientNodeToCSS';
import { materialNodeToCSS } from './Utils/materialNodeToCSS';
import { px } from '../Utils';

interface FillStyle {
    style: React.ReactNode
}

interface StrokeStyle {
    style: React.ReactNode
    lineWidth?: number;
}

export interface ShapeStyleProps {
    fill: FillStyle;
    stroke: StrokeStyle;
}

function applyFillShapeStyle(fill: FillStyle, colorScheme?: "light" | "dark") {
    let styleNode = fill.style
    let colorValue = colorNodeToCSS(styleNode, colorScheme);
    let gradientValue = gradientNodeToCSS(styleNode, colorScheme);
    let materialValue = materialNodeToCSS(styleNode, colorScheme);
    var cssStyle : React.CSSProperties = { } 

    if (colorValue) {
        cssStyle.backgroundColor = colorValue;
    } else if (gradientValue) {
        cssStyle.background = gradientValue;
    } else if (materialValue) {
        cssStyle = { ...materialValue };
        cssStyle.backgroundColor = materialValue.backgroundColor;
        cssStyle.backdropFilter = materialValue.backdropFilter;
        cssStyle.WebkitBackdropFilter = materialValue.backdropFilter; // For Safari
        cssStyle.opacity = materialValue.opacity;
    }

    return cssStyle;
}

function applyStrokeShapeStyle(stroke: StrokeStyle, colorScheme?: "light" | "dark") : React.CSSProperties  {
    let style = stroke.style
    let lineWidth = px(stroke.lineWidth ?? 1);
    var cssStyle : React.CSSProperties = { }

    const color = colorNodeToCSS(style, colorScheme);
    const gradient = gradientNodeToCSS(style, colorScheme);
    const material = materialNodeToCSS (style, colorScheme);

    if (color) {
        cssStyle.borderColor = color;
        cssStyle.borderWidth = lineWidth;
        cssStyle.borderStyle = 'solid';
    } else if (gradient) {
        cssStyle.mask = 'linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px) content-box exclude, linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px)'
        cssStyle.background = gradient
        cssStyle.borderColor = 'rgba(255,255,255,0.01)'
        cssStyle.padding = lineWidth;
    } else if (material) {
        cssStyle = {  ...material };
        cssStyle.mask = 'linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px) content-box exclude, linear-gradient(rgb(255, 255, 255) 0px, rgb(255, 255, 255) 0px)'
        cssStyle.borderColor = 'rgba(255,255,255,0.01)'
        cssStyle.borderWidth = lineWidth
        cssStyle.borderStyle = 'solid';
    }
        
    return cssStyle;
}

export function shapeStyleToCSS({ fill, stroke } : ShapeStyleProps, colorScheme?: "light" | "dark") : React.CSSProperties | null {
    if (fill) {
        let fillStyle = applyFillShapeStyle(fill, colorScheme);
        return fillStyle;
    } else if (stroke) {
        let strokeStyle = applyStrokeShapeStyle(stroke, colorScheme);
        return strokeStyle;
    }
    return null
}
