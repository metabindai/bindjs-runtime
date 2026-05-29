import React, { createContext } from 'react';

// Define a type for the style context
export interface StyleContextType {
    style: React.CSSProperties;
    forwardedRef?: React.Ref<HTMLElement>;
}

// Create the StyleContext with an empty default value
export const StyleContext = createContext<StyleContextType>({ style: {} });

// Aspect Ratio Content Mode
export type AspectRatioContentMode = 'fill' | 'fit'

/**
 * Environment Style
 */
// Define a type for the style context
export interface EnvironmentStyleContextType {
    buttonStyle?: { name: string, props: Record<string, any>, handlerId: string, environmentId: string } | null,
    textFieldStyle?: string | null,
    controlSize?: 'mini' | 'small' | 'regular' | 'large' | 'extraLarge' | null,
    textSelection?: 'enabled' | 'disabled' | null
    aspectRatioContentMode?: AspectRatioContentMode | null,
    aspectRatio?: number | null,
    accentColor?: React.ReactNode | null,
    scrollTargetLayout?: boolean | null,
    scrollTargetBehavior?: 'viewAligned' | 'paging' | null,
    scrollPadding?: { left?: number, right?: number, top?: number, bottom?: number } | null,
}

export const EnvironmentStyleContext = createContext<EnvironmentStyleContextType>({});
