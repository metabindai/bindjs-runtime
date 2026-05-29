import React from 'react';
import { EnvironmentStyleProvider, useEnvironmentStyle } from '../Style';
import { AspectRatioContentMode } from '../StyleContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface AspectRatioProps {
    aspectRatio?: number;
    contentMode?: AspectRatioContentMode;
    children: React.ReactNode;
}

export function AspectRatio(props: AspectRatioProps): React.ReactNode {
    const { aspectRatio, contentMode, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, AspectRatio, { hasDOMElement: false });
    const envStyle = { ...useEnvironmentStyle() };
    if (aspectRatio) {
        envStyle.aspectRatio = aspectRatio;
    }
    
    if (contentMode) {
        envStyle.aspectRatioContentMode = contentMode;
    }

    return (
        <EnvironmentStyleProvider style={envStyle}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentStyleProvider>
    );
}

interface ScaledToFitProps {
    children: React.ReactNode[];
}

export function ScaledToFit(props: ScaledToFitProps): React.ReactNode {
    const { children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ScaledToFit, { hasDOMElement: false });

    return (
        <AspectRatio contentMode="fit">
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </AspectRatio>
    );
}

interface ScaledToFillProps {
    children: React.ReactNode[];
}

export function ScaledToFill(props: ScaledToFillProps): React.ReactNode {
    const { children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ScaledToFill, { hasDOMElement: false });
    return (
        <AspectRatio contentMode="fill">
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </AspectRatio>
    );
}