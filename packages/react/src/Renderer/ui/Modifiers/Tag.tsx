
import React, { createContext, useContext, ReactNode } from 'react';
import { useStyle, StyleProvider, ClearStyle } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

// Define a type for the style context
interface TagContextType {
    tag: string | number | null;
}

// Create the StyleContext with an empty default value
const TagContext = createContext<TagContextType>({ tag: null });

function useTag() : string | number | null {
    return useContext(TagContext).tag
}

/**
 * Tag modifier
 * Sets a tag value in context for child components
 */
interface TagProps {
    rawValue: string | number;
    children: React.ReactNode;
}

export function Tag({ rawValue, children }: TagProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, Tag);
    
    return (
        <TagContext.Provider value={{tag: rawValue}}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </TagContext.Provider>
    );
}

interface ClearTagProps {
    children: React.ReactNode;
}

function ClearTag({ children }: ClearTagProps): React.ReactNode {
    return (
        <TagContext.Provider value={{tag: null}}>
            {children}
        </TagContext.Provider>
    );
}