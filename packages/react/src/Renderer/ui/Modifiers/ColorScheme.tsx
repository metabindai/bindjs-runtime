import React from 'react';
import { EnvironmentProvider, useEnvironment } from '../Environment';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface ColorSchemeProps {
    rawValue: "light" | "dark";
    children: React.ReactNode;
}

/**
 * Sets the color scheme for the component and its descendants.
 * 
 * This modifier sets the colorScheme environment value, which can be used by
 * components to adapt their appearance based on whether a light or dark mode
 * is specified. This affects semantic colors like "primary", "background", etc.
 * 
 * @param rawValue The color scheme to apply: "light" or "dark"
 * @param children The component(s) to which the color scheme will be applied
 * @returns A component with the specified color scheme applied to its environment
 */
export function ColorScheme(props: ColorSchemeProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ColorScheme, { hasDOMElement: false });
    
    const environment = useEnvironment();
    
    return (
        <EnvironmentProvider 
            values={{ 
                ...environment, 
                colorScheme: rawValue 
            }}
        >
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentProvider>
    );
}