import React, { useContext, ReactNode } from 'react';
import { ScaleContext, ScaleContextType, ScaleValues } from './ScaleContext';

// Custom hook to use the ScaleContext
function useScaleContext(): ScaleContextType {
    return useContext(ScaleContext);
}

// Hook to get the current cumulative scale in the hierarchy
export function useCurrentScale(): ScaleValues {
    const { currentScale } = useScaleContext();
    return currentScale;
}

// Provider component to pass down scale values
export function ScaleProvider({ children, scale }: { children: ReactNode; scale: ScaleValues }) {
    const parentScale = useCurrentScale();
    
    // Calculate cumulative scale by multiplying with parent scale
    const cumulativeScale: ScaleValues = {
        scaleX: parentScale.scaleX * scale.scaleX,
        scaleY: parentScale.scaleY * scale.scaleY
    };
    
    return (
        <ScaleContext.Provider value={{ currentScale: cumulativeScale }}>
            {children}
        </ScaleContext.Provider>
    );
}