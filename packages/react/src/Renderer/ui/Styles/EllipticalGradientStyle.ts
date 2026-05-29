import React from 'react';
import { UnitPoint } from '../Utils/unitPointUtils';
import { convertNamedUnitPoint } from '../Utils/unitPointUtils';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { GradientStyle } from './GradientStyle';

/** Common color props type */
type GradientColor = any; // Alias for ColorProps | Color

/**
 * Interface for defining an elliptical gradient style.
 */
export interface EllipticalGradientStyle extends GradientStyle {
    /**
     * Array of color stops used in the gradient.
     * Can include raw values or Color nodes.
     */
    colors?: GradientColor[];

    /**
     * The center point of the gradient, expressed in unit coordinates (0–1 range).
     * Default is { x: 0.5, y: 0.5 } (center of the element).
     */
    center?: UnitPoint;

    /**
     * The radius at which the gradient starts, expressed as a proportion of the element size.
     * Default is 0.
     */
    startRadius?: number;

    /**
     * The radius at which the gradient ends, expressed as a proportion of the element size.
     * Default is 1.
     */
    endRadius?: number;
}


/**
 * Converts an elliptical gradient style definition into a valid CSS radial-gradient string.
 * The resulting CSS uses the `ellipse` shape with percentage-based color stops to simulate
 * start and end radii.
 *
 * @param style - Object containing optional `colors`, `center`, `startRadius`, and `endRadius` properties
 * @returns A CSS `radial-gradient` string representing the elliptical gradient
 *
 * @example
 * ellipticalGradientStyleToCSS({
 *   colors: ['red', 'blue'],
 *   center: { x: 0.5, y: 0.5 },
 *   startRadius: 0,
 *   endRadius: 1
 * });
 * // "radial-gradient(ellipse at 50% 50%, red 0%, blue 100%)"
 */
export function ellipticalGradientStyleToCSS(style: EllipticalGradientStyle, colorScheme?: "light" | "dark"): string {
    const {
        colors = [],
        center = { x: 0.5, y: 0.5 }, // Default: center
        startRadius = 0,
        endRadius = 1
    } = style;

    const colorsArray = Array.isArray(colors) ? colors : [];
    const colorValues = colorsArray.map(color => colorNodeToCSS(color, colorScheme) || 'transparent');
    const gradientColors = colorValues.length ? colorValues : ['white', 'black'];

    // Convert center point to CSS percentage values
    const centerPoint = typeof center === 'string' ? convertNamedUnitPoint(center) : center;
    const centerPosition = `${centerPoint.x * 100}% ${centerPoint.y * 100}%`;

    // CSS radial gradients don't directly support startRadius, so we need to calculate color stops
    // We'll convert radii to percentage of the element size
    const startRadiusPercent = startRadius * 100;
    const endRadiusPercent = endRadius * 100;

    // Create color stops with proper radius percentages
    let colorStops;
    if (startRadius > 0) {
        // If startRadius > 0, we need to create a hard transition at that point
        // by duplicating the first color at both 0% and startRadius%
        colorStops = gradientColors.map((color, index, array) => {
            if (index === 0) {
                return `${color} ${startRadiusPercent}%`;
            } else {
                const position = startRadiusPercent + (index / (array.length - 1)) * (endRadiusPercent - startRadiusPercent);
                return `${color} ${position}%`;
            }
        });

        // Add the hard stop at 0%
        colorStops.unshift(`${gradientColors[0]} 0%`);
    } else {
        // Simple case where startRadius is 0
        colorStops = gradientColors.map((color, index, array) => {
            const position = (index / (array.length - 1)) * endRadiusPercent;
            return `${color} ${position}%`;
        });
    }

    // Create the CSS gradient string
    // For elliptical gradient, we use 'ellipse' instead of 'circle'
    const css = `radial-gradient(ellipse at ${centerPosition}, ${colorStops.join(', ')})`;

    return css
}