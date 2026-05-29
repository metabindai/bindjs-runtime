import React from 'react';
import { UnitPoint } from '../Utils/unitPointUtils';
import { convertNamedUnitPoint } from '../Utils/unitPointUtils';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { GradientStyle } from './GradientStyle';

/** Common color props type */
type GradientColor = any; // Alias for ColorProps | Color

/**
 * Interface for defining an angular (conic) gradient style.
 */
export interface AngularGradientStyle extends GradientStyle {
    /**
     * Array of color stops used in the gradient.
     * Must include at least two values, which can be raw color values or Color nodes.
     */
    colors: [GradientColor, ...GradientColor[]];

    /**
     * The center point of the gradient, expressed in unit coordinates (0–1 range).
     * Default is { x: 0.5, y: 0.5 } (center of the element).
     */
    center?: UnitPoint;

    /**
     * Starting angle of the gradient, in degrees.
     * Default is 0.
     */
    startAngle?: number;

    /**
     * Ending angle of the gradient, in degrees.
     * Default is 360.
     */
    endAngle?: number;
}

/**
 * Converts an angular gradient style definition into a valid CSS conic-gradient string.
 *
 * @param style - Object containing `colors`, and optional `center`, `startAngle`, and `endAngle` properties
 * @returns A CSS conic-gradient string representing the gradient
 *
 * @example
 * angularGradientStyleToCSS({
 *   colors: ['red', 'yellow', 'blue'],
 *   center: { x: 0.5, y: 0.5 },
 *   startAngle: 0,
 *   endAngle: 270
 * });
 * // "conic-gradient(from 0deg at 50% 50%, red 0deg, yellow 135deg, blue 270deg)"
 */
export function angularGradientStyleToCSS(style: AngularGradientStyle, colorScheme?: "light" | "dark"): string {
    const {
        colors = [],
        center = { x: 0.5, y: 0.5 },
        startAngle = 0,
        endAngle = 360
    } = style;

    const colorsArray = Array.isArray(colors) ? colors : [];
    const colorValues = colorsArray.map(color => colorNodeToCSS(color, colorScheme) || 'transparent');
    const gradientColors = colorValues.length ? colorValues : ['white', 'black'];

    const centerPoint = typeof center === 'string' ? convertNamedUnitPoint(center) : center;
    const centerPosition = `${centerPoint.x * 100}% ${centerPoint.y * 100}%`;

    const angleRange = ((endAngle - startAngle) + 360) % 360 || 360;

    let colorStops;

    if (gradientColors.length === 1) {
        colorStops = [`${gradientColors[0]} ${startAngle}deg`, `${gradientColors[0]} ${endAngle}deg`];
    } else {
        colorStops = gradientColors.map((color, index) => {
            const t = index / (gradientColors.length - 1);
            const angle = startAngle + t * angleRange;
            return `${color} ${angle}deg`;
        });
    }

    const css = `conic-gradient(from ${startAngle}deg at ${centerPosition}, ${colorStops.join(', ')})`;

    return css
}