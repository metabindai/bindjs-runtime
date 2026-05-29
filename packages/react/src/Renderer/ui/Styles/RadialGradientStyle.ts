
import React from 'react';
import { UnitPoint, convertNamedUnitPoint, unitPointsToAngle } from '../Utils/unitPointUtils';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { GradientStyle } from './GradientStyle';

/** Common color props type */
type GradientColor = any; // Alias for ColorProps | Color

export interface RadialGradientStyle extends GradientStyle {
    colors?: GradientColor[];
    center?: UnitPoint;
    startRadius?: number;
    endRadius?: number;
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
export function radialGradientStyleToCSS(style: RadialGradientStyle, colorScheme?: "light" | "dark"): string {
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
    return `radial-gradient(circle at ${centerPosition}, ${colorStops.join(', ')})`;
}