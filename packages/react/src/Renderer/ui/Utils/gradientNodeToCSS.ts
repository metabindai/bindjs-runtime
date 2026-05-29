
import React from 'react';

import { nodeProps } from './nodeProps';

import { LinearGradientStyle, linearGradientStyleToCSS } from '../Styles/LinearGradientStyle';
import { RadialGradientStyle, radialGradientStyleToCSS } from '../Styles/RadialGradientStyle';
import { EllipticalGradientStyle, ellipticalGradientStyleToCSS } from '../Styles/EllipticalGradientStyle';
import { AngularGradientStyle, angularGradientStyleToCSS } from '../Styles/AngularGradientStyle';

import { LinearGradient } from '../Views/LinearGradient';
import { RadialGradient } from '../Views/RadialGradient';
import { EllipticalGradient } from '../Views/EllipticalGradient';
import { AngularGradient } from '../Views/AngularGradient';

/**
 * Extracts props from a LinearGradient node.
 */
function linearGradientNode(value: React.ReactNode | string): LinearGradientStyle | undefined {
    return nodeProps<LinearGradientStyle>(value, LinearGradient);
}

/**
 * Extracts props from a RadialGradient node.
 */
function radialGradientNode(value: React.ReactNode | string): RadialGradientStyle | undefined {
    return nodeProps<RadialGradientStyle>(value, RadialGradient);
}

/**
 * Extracts props from an EllipticalGradient node.
 */
function ellipticalGradientNode(value: React.ReactNode | string): EllipticalGradientStyle | undefined {
    return nodeProps<EllipticalGradientStyle>(value, EllipticalGradient);
}

/**
 * Extracts props from an AngularGradient node.
 */
function angularGradientNode(value: React.ReactNode | string): AngularGradientStyle | undefined {
    return nodeProps<AngularGradientStyle>(value, AngularGradient);
}

/**
 * Attempts to convert any supported gradient React node into a CSS gradient string.
 *
 * @param value - A React node representing a gradient component
 * @returns A CSS gradient string or `undefined` if the node is not a recognized gradient
 *
 * @example
 * ```tsx
 * const css = gradientNodeToCSS(<LinearGradient colors={['red', 'blue']} />);
 * // => "linear-gradient(180deg, red, blue)"
 * ```
 */
export function gradientNodeToCSS(value: React.ReactNode, colorScheme?: "light" | "dark"): string | undefined {
    const gradientParsers: {
        parse: (node: React.ReactNode) => any;
        toCSS: (style: any, colorScheme?: "light" | "dark") => string;
    }[] = [
            { parse: linearGradientNode, toCSS: linearGradientStyleToCSS },
            { parse: radialGradientNode, toCSS: radialGradientStyleToCSS },
            { parse: ellipticalGradientNode, toCSS: ellipticalGradientStyleToCSS },
            { parse: angularGradientNode, toCSS: angularGradientStyleToCSS }
        ];

    for (const { parse, toCSS } of gradientParsers) {
        const style = parse(value);
        if (style) return toCSS(style, colorScheme);
    }

    return undefined;
}