import React, { createContext } from 'react';

// Define the scale values that can be tracked
export interface ScaleValues {
    scaleX: number;
    scaleY: number;
}

// Define a type for the scale context
export interface ScaleContextType {
    currentScale: ScaleValues;
}

// Create the ScaleContext with default values (no scaling)
export const ScaleContext = createContext<ScaleContextType>({ 
    currentScale: { scaleX: 1, scaleY: 1 } 
});