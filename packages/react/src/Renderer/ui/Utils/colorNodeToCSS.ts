import React from 'react';

import { nodeProps } from './nodeProps';
import { ColorStyle, NamedColor, colorStyleToCSS, HexColor } from '../Styles/ColorStyle';
import { Color } from '../Views/Color';
import { Opacity } from '../Modifiers/Opacity';

/**
 * Converts a React node representing a color (e.g. a <Color> component or similar)
 * into a valid CSS color string using the `ColorStyle` type system.
 *
 * This is useful when you need to dynamically extract and render a color from JSX-based props.
 *
 * @param value - A React node, typically a <Color> component or fragment wrapping one
 * @returns A CSS color string (e.g. "rgba(255, 0, 0, 1.0)") or `undefined` if the node is not valid
 *
 * @example
 * ```tsx
 * const cssColor = colorNodeToCSS(<Color r={1} g={0} b={0} a={1} />);
 * // => "rgba(255, 0, 0, 1.0)"
 * ```  
 */
export function colorNodeToCSS(value: React.ReactNode | NamedColor | HexColor, colorScheme?: "light" | "dark"): string | undefined {

    // Color value
    var colorValue = value;

    /**
     * Check if the value is modified by Opacity.
     */
    var opacity : number | undefined = undefined;
    // if (React.isValidElement(value) && value.type === Opacity) {
    //     // Get opacity
    //     opacity = value.props.rawValue ?? 1.0;

    //     // Get the color node from the Opacity component
    //     colorValue = value.props.children[0];
    // }

    // Otherwise if a react node, extract props using nodeProps
    const props = nodeProps<ColorStyle & { rawValue?: NamedColor, opacity?: number }>(colorValue, Color);

    // If invalid node or no props, return undefined
    if (!props) return undefined;

    // If props have a rawValue (named or hex color), use that; otherwise use the props directly
    const color = props.rawValue ?? props;

    // A color node could include an additional opacity value if modified directly by an opacity modifier
    if (props.opacity) {    
        opacity = props.opacity;
    }

    return colorStyleToCSS(color, opacity, colorScheme);
}
