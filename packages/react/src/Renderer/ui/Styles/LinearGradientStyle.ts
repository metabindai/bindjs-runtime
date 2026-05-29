
import React from 'react';
import { UnitPoint, convertNamedUnitPoint, unitPointsToAngle } from '../Utils/unitPointUtils';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { GradientStyle } from './GradientStyle';

/** Common color props type */
type GradientColor = any; // Alias for ColorProps | Color

export interface LinearGradientStyle extends GradientStyle{
    /**
     * Array of color stops used in the gradient. Can be raw values or Color nodes.
     */
    colors?: GradientColor[];

    /**
     * The starting point of the gradient, expressed in unit coordinates (0–1 range).
     * Default is { x: 0.5, y: 0 } (top center).
     */
    startPoint?: UnitPoint;

    /**
     * The ending point of the gradient, expressed in unit coordinates (0–1 range).
     * Default is { x: 0.5, y: 1 } (bottom center).
     */
    endPoint?: UnitPoint;
}

/**
 * Converts a linear gradient style definition into a valid CSS linear-gradient string.
 *
 * @param style - Object containing optional `colors`, `startPoint`, and `endPoint` properties
 * @returns A CSS linear-gradient string representing the gradient
 *
 * @example
 * linearGradientStyleToCSS({
 *   colors: ['red', 'blue'],
 *   startPoint: { x: 0, y: 0 },
 *   endPoint: { x: 1, y: 1 }
 * });
 * // "linear-gradient(45deg, red, blue)"
 */
export function linearGradientStyleToCSS(style: LinearGradientStyle, colorScheme?: "light" | "dark"): string {
    const {
        colors = [],
        startPoint = { x: 0.5, y: 0 }, // Default: top
        endPoint = { x: 0.5, y: 1 }    // Default: bottom
    } = style;

    const colorsArray = Array.isArray(colors) ? colors : [];

    const colorValues = colorsArray.map(color => colorNodeToCSS(color, colorScheme) || 'transparent');
    const gradientColors = colorValues.length ? colorValues : ['white', 'black'];
    const angle = unitPointsToAngle(startPoint, endPoint);

    return `linear-gradient(${angle}deg, ${gradientColors.join(', ')})`;
}
