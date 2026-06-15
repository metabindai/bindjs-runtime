import React from 'react';
import { useStyle, StyleProvider, ClearStyle } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * ZIndex
 * 
 * Sets the z-index for a component, controlling its stacking order.
 * 
 * This implementation ensures that negative values create a relative
 * stacking order below the default (0), but not below the entire UI.
 * We accomplish this by offsetting all z-index values to ensure they
 * remain within a defined stacking context.
 */
interface ZIndexProps {
    rawValue: number;
    children?: React.ReactNode;
}

// Base offset to keep all indices above parent elements
// This allows even extreme negative values (-10000) to still appear above the main UI
const BASE_Z_INDEX = 10000;

export function ZIndex({ rawValue, children }: ZIndexProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, ZIndex);
    
    const parentStyle = useStyle();
    
    // Calculate z-index with offset to ensure negative values don't go below UI
    // rawValue=0 → zIndex=10000 (default)
    // rawValue=10 → zIndex=10010 (above default)
    // rawValue=-5000 → zIndex=5000 (below default but still visible)
    // Non-finite rawValue (caller off-contract, e.g. null) → no-op, apply no zIndex.
    if (!Number.isFinite(rawValue)) return children;
    const calculatedZIndex = BASE_Z_INDEX + rawValue;
    
    // Create a new style object for the z-index container
    // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    const style: React.CSSProperties = {
        ...parentStyle,
        zIndex: calculatedZIndex,
        // Make sure the positioned element creates a new stacking context
        position: parentStyle.position || 'relative'
    };
    
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}