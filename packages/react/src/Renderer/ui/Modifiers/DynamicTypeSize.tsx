import React from 'react';
import { EnvironmentProvider, useEnvironment } from '../Environment';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface DynamicTypeSizeProps {
    rawValue: "xSmall" | "small" | "medium" | "large" | "xLarge" | "xxLarge" | "xxxLarge" | "accessibility1" | "accessibility2" | "accessibility3" | "accessibility4" | "accessibility5";
    children: React.ReactNode;
}

/**
 * Sets the dynamic type size for the component and its descendants.
 * 
 * This modifier sets the dynamicTypeSize environment value, which can be used by
 * components to adapt their typography and layout based on the specified text size
 * preference. This affects components that support dynamic type.
 * 
 * @param rawValue The dynamic type size to apply
 * @param children The component(s) to which the dynamic type size will be applied
 * @returns A component with the specified dynamic type size applied to its environment
 */
/**
 * Sets the dynamic type size for the component and its descendants.
 * This implementation uses the environment to propagate the value to child components.
 */
export function DynamicTypeSize(props: DynamicTypeSizeProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, DynamicTypeSize, { hasDOMElement: false });
    
    const environment = useEnvironment();
    
    return (
        <EnvironmentProvider 
            values={{ 
                ...environment, 
                dynamicTypeSize: rawValue 
            }}
        >
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentProvider>
    );
}