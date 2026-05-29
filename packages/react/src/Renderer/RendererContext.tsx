import React, { useEffect, createContext, useContext } from 'react';

// Define a type for the style context
export interface RendererContextType {
    viewCallback: any;
    navigateCallback: any;
    dataCallback: any;
    functionCallback: any;
    restoreEnvironmentCallback: any;
    getEnvironmentCallback: any;
    forEachCallback: any;
    decodeViewCallback: any;
    setForEachId: any;
    makeView: any;
    renderVersion: number;
}

// Create the StyleContext with an empty default value
export const RendererContext = createContext<RendererContextType>({ viewCallback: null, makeView: null, navigateCallback: null, dataCallback: null, functionCallback: null, decodeViewCallback: null, forEachCallback: null, getEnvironmentCallback: null, restoreEnvironmentCallback: null, setForEachId: null, renderVersion: 0 });


export interface RendererIssue {
    type: "error" | "warning";
    message: string;
    componentName?: string;
    lineNumber?: number;
    stack?: string;
    errorName?: string;
    rawError?: any; // holds the original error if it's not a standard Error object
}

export interface RendererExecutionContextProps {
    executionIssue: (issue: RendererIssue) => void;
}

export const RendererExecutionContext = createContext<RendererExecutionContextProps>({

    /** Default implementation */
    executionIssue: (issue: RendererIssue) => {
        if (issue.type === "error") {
            console.error('Render ' + issue.message);
        } else {
            console.warn('Render ' + issue.message);
        }
    }
});

// Custom hook to use the RendererExecutionContext
export function useRendererExecutionContext() {
    return useContext(RendererExecutionContext);
}


// Custom hook to use the StyleContext
export function useRendererContext() {
    return useContext(RendererContext);
}

export const RendererEnvironmentContext = createContext<Record<string, any>>({});

// Custom hook to use the StyleContext
export function useRendererEnvironmentContext() {
    return useContext(RendererEnvironmentContext);
}
