import React, { createContext } from 'react';

/**
 * Element semantics
 * What the next DOM element is to assistive technology and the browser: the tag it
 * renders as (Button asks for a button, Link for a link) and the attributes it
 * carries (ARIA, href). Passed down with the style; the view that applies the
 * style applies these.
 */
export interface ElementSemanticsType {
    as?: 'button' | 'a';
    attributes: Record<string, string | number | boolean | undefined>;
}

// Define a type for the style context
export interface StyleContextType {
    style: React.CSSProperties;
    forwardedRef?: React.Ref<HTMLElement>;
    element?: ElementSemanticsType | null;
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
