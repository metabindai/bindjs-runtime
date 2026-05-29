import React from 'react';
import { FontStyleProvider } from './Modifiers/Font';
import { LayoutNodeChildren } from './Layout/LayoutNode';

/**
 * Root Element
 * @returns 
 */
export function Root({ children }) {
    return (
        <FontStyleProvider font={{ style: {} }}>
            <LayoutNodeChildren layout={null}>  
                {children}
            </LayoutNodeChildren>
        </FontStyleProvider>
    )
}