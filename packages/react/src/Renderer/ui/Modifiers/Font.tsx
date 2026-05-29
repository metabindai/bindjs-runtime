import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { pt, px } from '../../Utils'
import { useFontManager } from '../FontManager';

// Define a type for the style context
export interface FontContextType {
    style: React.CSSProperties;
    size?: number;
    weight?: string;
    textAlign?: string;
    lineSpacing?: number;
    styleName?: string | null;
    textStyle?: string; // Holds the semantic text style name (e.g., 'title', 'body')
    designName?: string; // Holds the font design name
    custom?: boolean; // Indicates if it's a custom font
}

/**
 * Environment Support
 */
const FontStyleContext = createContext<FontContextType>({ style: {} });

export function useFontStyle() : React.CSSProperties {
    return useContext(FontStyleContext).style ?? { };
}

export function useFont() : FontContextType {
    let context : FontContextType = useContext(FontStyleContext) ?? { style: {} };
    return { ...context, style: {...context.style} };
}

export function FontStyleProvider({ children, font }: { children: ReactNode; font: FontContextType }) {
    return <FontStyleContext.Provider value={font}>{children}</FontStyleContext.Provider>;
}

// TODO: Have function generate style / css from font properties.

/**
 * Font
 */
interface FontProps {
    rawValue: number | string;
    design: string;
    custom?: CustomFontProps;
    children?: React.ReactNode
}

interface CustomFontProps {
    url: string;
    family: string;
    size?: number;
    relativeToTextStyle?: string;
}


// TODO: For font, color, etc… we need to resolve it ultimately at the point of use. That way we can use the environment to get the right value.
export function Font(props: FontProps) : React.ReactNode {
    const { rawValue, custom, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Font, { hasDOMElement: false });
    const v = rawValue;
    const fontManager = useFontManager();
    const font = {...useFont()}
    const style = {...font.style};

    // Register custom font if provided
    useEffect(() => {
        if (custom && custom.family && custom.url) {
            fontManager.registerFont({
                family: custom.family,
                url: custom.url,
                weight: 'normal',
                style: 'normal'
            });
            
            // Apply the custom font to the style
            style.fontFamily = `"${custom.family}", system-ui, sans-serif`;
            
            // Apply custom font size if provided
            if (custom.size) {
                style.fontSize = px(custom.size);
                font.size = custom.size;
            }
        }
        
        // Clean up when component unmounts
        return () => {
            if (custom && custom.family) {
                fontManager.unregisterFont(custom.family);
            }
        };
    }, [custom?.family, custom?.url, custom?.size]);
    
    if (custom) {
        style.fontFamily = `${custom.family}, ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif`;
        style.fontSize = px(custom.size);
        font.size = custom.size;
        font.style = style
        font.custom = true;
        font.textStyle = custom.relativeToTextStyle || 'body';
        return (
            <FontStyleProvider font={font}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </FontStyleProvider>
        );
    } else if (v) {

        // Store semantic style information but don't calculate exact sizes yet
        // This will be resolved by the Text component based on dynamicTypeSize
        switch (typeof v) {
            case 'number':
                // For explicit numeric sizes, we still apply directly
                style.fontSize = px(v);
                font.size = v;
                break;
            case 'string':
                // For semantic styles, store the name but don't calculate size yet
                // We're deferring the calculation to when the text is rendered
                font.textStyle = v;
                style['_fontStyle'] = v; // Keep for compatibility
                break;
            default:
                break;
        }

    }

    return (
        <FontStyleProvider font={font}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </FontStyleProvider>
    );
}

/**
 * Font Size
 */
interface FontSizeProps {
    rawValue?: number;
    size?: number;
    children?: React.ReactNode
}

export function FontSize({ rawValue, size, children }: FontSizeProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue || size ) {
        font.size = rawValue ?? size;   
        style.fontSize = rawValue ?? size;
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Font Weight
 */
interface FontWeightProps {
    rawValue: string;
    children?: React.ReactNode
}

export function FontWeight({ rawValue, children } : FontWeightProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    // Store the weight name but don't apply the CSS yet
    // This will be fully resolved in the Text component
    font.weight = rawValue;

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}   

/**
 * Bold
 */
interface BoldProps {
    rawValue?: boolean;
    children?: React.ReactNode
}

export function Bold({ rawValue = true, children } : BoldProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue) {
        style.fontWeight = '700';
        font.weight = 'bold';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Italic
 */
interface ItalicProps {
    rawValue?: boolean;
    children?: React.ReactNode
}

export function Italic({ rawValue = true, children } : ItalicProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue) {
        style.fontStyle = 'italic';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Strikethrough
 */
interface StrikethroughProps {
    rawValue?: boolean;
    children?: React.ReactNode
}

export function Strikethrough({ rawValue = true, children } : StrikethroughProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue) {
        style.textDecoration = style.textDecoration ? `${style.textDecoration} line-through` : 'line-through';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Underline
 */
interface UnderlineProps {
    rawValue?: boolean;
    children?: React.ReactNode
}

export function Underline({ rawValue = true, children } : UnderlineProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue) {
        style.textDecoration = style.textDecoration ? `${style.textDecoration} underline` : 'underline';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Monospaced
 */
interface MonospacedProps {
    rawValue?: boolean;
    children?: React.ReactNode
}

export function Monospaced({ rawValue = true, children } : MonospacedProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue) {
        style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Font Design
 */
interface FontDesignProps {
    rawValue: string;
    children?: React.ReactNode
}

export function FontDesign({ rawValue, children } : FontDesignProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    // Store the design name for later resolution
    font.designName = rawValue;
    
    // Apply the font family immediately, since dynamic type size doesn't affect it
    // Map SwiftUI font designs to CSS font-family values
    switch (rawValue) {
        case 'default':
            style.fontFamily = 'system-ui, ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif';
            break;
        case 'serif':
            style.fontFamily = 'ui-serif, Times New Roman, serif';
            break;
        case 'rounded':
            style.fontFamily = 'ui-rounded, system-ui, sans-serif';
            break;
        case 'monospaced':
            style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
            break;
        default:
            // Default to system font
            style.fontFamily = 'system-ui, ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Line Spacing
 */
interface LineSpacingProps {
    rawValue: number;
    children?: React.ReactNode
}

export function LineSpacing({ rawValue, children } :LineSpacingProps) : React.ReactNode {
    const font = {...useFont()}

    font.lineSpacing = rawValue;
    
    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}   

/**
 * Multiline Text Spacing
 */
interface MultilineSpacingProps {
    rawValue: string;
    children?: React.ReactNode
}

export function MultilineTextAlignment({ rawValue, children } : MultilineSpacingProps) {   
    const font = {...useFont()}
    const style = font.style;

    switch (rawValue) {
        case 'center':
            style.textAlign = 'center';
            break;
        case 'leading':
            style.textAlign = 'left';
            break;
        case 'trailing':
            style.textAlign = 'right';
            break;
        default:
            style.textAlign = 'center';
            break;
    }

    font.textAlign = rawValue;

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Line Limit
 */
interface LineLimitProps {
    rawValue: number;
    children?: React.ReactNode
}

export function LineLimit({ rawValue, children } : LineLimitProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    if (rawValue > 0) {
        // CSS properties for limiting text lines
        style.display = '-webkit-box';
        style.WebkitLineClamp = rawValue;
        style.WebkitBoxOrient = 'vertical';
        style.overflow = 'hidden';
        style.textOverflow = 'ellipsis';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}


/**
 * Tracking (letter spacing - almost identical to kerning in CSS)
 */
interface TrackingProps {
    rawValue: number;
    children?: React.ReactNode
}

export function Tracking({ rawValue, children } : TrackingProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    // Convert to CSS letter-spacing in pixels
    style.letterSpacing = `${rawValue}px`;

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}

/**
 * Text Case
 */
interface TextCaseProps {
    rawValue: string;
    children?: React.ReactNode
}

export function TextCase({ rawValue, children } : TextCaseProps) : React.ReactNode {
    const font = {...useFont()}
    const style = font.style;

    switch (rawValue) {
        case 'uppercase':
            style.textTransform = 'uppercase';
            break;
        case 'lowercase':
            style.textTransform = 'lowercase';
            break;
        default:
            style.textTransform = 'none';
    }

    return <FontStyleProvider font={font}>{children}</FontStyleProvider>;
}
