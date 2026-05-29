
import React, { createContext, useContext, ReactNode } from 'react';
import { useStyle, StyleProvider, ClearStyle } from '../Style';
import { useLayout } from '../Layout/useLayout';
import { LayoutNodeChildren } from '../Layout/LayoutNode';

// Define a type for the style context
interface IDContextType {
    id: string | number | null;
}

// Create the StyleContext with an empty default value
const IDContext = createContext<IDContextType>({ id: null });

export function useID() : string | number | null {
    return useContext(IDContext).id
}

interface IDProps {
    rawValue: string | number;
    children: React.ReactNode;
}

/**
 * ID
 */
export function ID(props: IDProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ID, { hasDOMElement: false });
    
    return (
        <IDContext.Provider value={{id: rawValue}}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </IDContext.Provider>
    ); 
}

interface ClearIDProps {
    children: React.ReactNode;
}

export function ClearID(props: ClearIDProps): React.ReactNode {
    const { children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ClearID, { hasDOMElement: false });
    
    return (
        <IDContext.Provider value={{id: null}}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </IDContext.Provider>
    );
}