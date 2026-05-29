import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * Hidden
 * 
 * Makes a component invisible but preserves its space in the layout.
 * Unlike CSS display: none (which removes the element from layout),
 * this modifier keeps the element's dimensions and spacing.
 */
interface HiddenProps {
    children?: React.ReactNode;
}

export function Hidden({ children }: HiddenProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ children }, Hidden);
    
    const style = {
        ...useStyle()
        // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    };
    
    // Set visibility to hidden to make the element invisible
    // while preserving its space in the layout
    style.visibility = 'hidden';
    
    // Also disable pointer events since the element is effectively not there
    style.pointerEvents = 'none';
    
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}