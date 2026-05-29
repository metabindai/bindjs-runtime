import React, { createContext, useContext, ReactNode } from 'react';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { gradientNodeToCSS } from '../Utils/gradientNodeToCSS';
import { materialNodeToCSS } from '../Utils/materialNodeToCSS';
import { Color } from '../Views/Color';
import { Material } from '../Views/Material';
import { LinearGradient } from '../Views/LinearGradient';
import { RadialGradient } from '../Views/RadialGradient';
import { EllipticalGradient } from '../Views/EllipticalGradient';
import { AngularGradient } from '../Views/AngularGradient';

const gradientTypes = new Set([
    LinearGradient,
    RadialGradient,
    AngularGradient,
    EllipticalGradient,
]);

/**
 * Extended CSS properties to include properly typed background
 */
interface ExtendedCSSProperties extends React.CSSProperties {
    background?: string;
}

type ForegroundStyleType = 'color' | 'gradient' | 'material';

/**
 * Type for foreground styling with support for solid colors, gradients, and materials
 */
export interface ForegroundStyleContextType {
    /**
     * Node
     */
    rawValue?: React.ReactNode | string | undefined;

    /**
     * Type of the style, either 'color', 'gradient', or 'material'
     */
    type?: ForegroundStyleType;
}

/**
 * Environment Support
 */
const ForegroundStyleContext = createContext<ForegroundStyleContextType>({ type: 'color', rawValue: <Color rawValue={"primary"} /> });

export function useForegroundStyleContext(): ForegroundStyleContextType {
    const context = useContext(ForegroundStyleContext);
    return context;
}

function ForegroundStyleProvider({ children, type, rawValue }: {
    children: ReactNode;
    rawValue?: React.ReactNode | string | undefined,
    type?: 'color' | 'gradient' | 'material'
}) {
    return <ForegroundStyleContext.Provider value={{ type, rawValue }}>{children}</ForegroundStyleContext.Provider>;
}

/**
 * ForegroundStyle
 * Applies either a solid color, gradient, or material as foreground styling
 */
export function ForegroundStyle(props: { rawValue?: React.ReactNode, children: React.ReactNode }): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ForegroundStyle, { hasDOMElement: false });
    // Only ReactElements carry a .type
    if (!React.isValidElement(rawValue)) {
        return (
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        );
    }

    const { type: nodeType } = rawValue;

    // figure out what kind of style it is
    let styleType: ForegroundStyleType | null = null;
    if (nodeType === Material) {
        styleType = "material";
    } else if (gradientTypes.has(nodeType as any)) {
        styleType = "gradient";
    } else if (nodeType === Color) {
        styleType = "color";
    }

    // if we didn’t recognize it, bail out
    if (!styleType) {
        return (
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        );
    }

    // otherwise wrap in the provider
    return (
        <ForegroundStyleProvider type={styleType} rawValue={rawValue}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </ForegroundStyleProvider>
    );
}

/**
 * Convert a ForegroundStyleContext into a plain CSS style object.
 *
 * @param foregroundStyle
 *   Value from useForegroundStyleContext, which contains:
 *   - type: "material" | "gradient" | "color"  
 *   - rawValue: the React node carrying the style data
 * @param context
 *   - "shape": output background styles  
 *   - "text": output text-clipping styles
 * @returns a React.CSSProperties object
 */
export function foregroundStyleToCSS(
    foregroundStyle: ForegroundStyleContextType,
    context: 'shape' | 'text',
    colorScheme?: "light" | "dark"
): React.CSSProperties {
    const style: React.CSSProperties = {};

    const { type, rawValue } = foregroundStyle

    // shared logic for text‐clipping
    const applyTextClipping = () => {
        Object.assign(style, {
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
        });
    };

    switch (type) {
        case 'material': {
            const materialNodeCSS = materialNodeToCSS(rawValue, colorScheme);
            if (!materialNodeCSS) break;

            const { backdropFilter, backgroundColor, opacity } = materialNodeCSS;

            Object.assign(style, {
                backdropFilter,
                WebkitBackdropFilter: backdropFilter, // Safari
                background: backgroundColor,
                opacity,
            });

            if (context === 'text') applyTextClipping();
            break;
        }

        case 'gradient': {
            style.background = gradientNodeToCSS(rawValue, colorScheme);
            if (context === 'text') applyTextClipping();
            break;
        }

        case 'color': {
            const color = colorNodeToCSS(rawValue, colorScheme);
            if (context === 'text') {
                style.color = color;
            } else {
                style.backgroundColor = color;
            }
            break;
        }
    }

    return style;
}
