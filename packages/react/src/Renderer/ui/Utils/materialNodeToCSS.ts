import React from 'react';
import { nodeProps } from './nodeProps';
import { MaterialType, MaterialStyle, materialStyleToCSS } from '../Styles/MaterialStyle';
import { Material } from '../Views/Material';

/**
 * Converts a React node representing a material (e.g. a <Material> component)
 * into a set of CSS properties for backdrop filter and background.
 *
 * This is useful when you need to dynamically extract and apply material styles from JSX-based props.
 *
 * @param value - A React node, typically a <Material> component or fragment wrapping one
 * @returns CSS properties for material styling or `undefined` if the node is not valid
 *
 * @example
 * ```tsx
 * const materialCSS = materialNodeToCSS(<Material rawValue="regular" />);
 * // => { backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.5)" }
 * ```  
 */
export function materialNodeToCSS(value: React.ReactNode, colorScheme?: "light" | "dark"): React.CSSProperties | undefined {
    // Extract props from the Material component
    const props = nodeProps<{ rawValue?: MaterialType | MaterialStyle, type?: MaterialType, blurRadius?: number, color?: string }>(value, Material);

    // If invalid node or no props, return undefined
    if (!props) return undefined;
    
    // Get the material value from props or default to 'regular'
    const materialValue = props.type ? { type: props.type, blurRadius: props.blurRadius, color: props.color } : (props.rawValue || 'regular');
    
    // Convert to CSS properties
    return materialStyleToCSS(materialValue, colorScheme);
}
