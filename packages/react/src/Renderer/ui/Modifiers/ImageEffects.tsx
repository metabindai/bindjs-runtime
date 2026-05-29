import React, { useRef } from 'react'
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * Common interface for image effect modifiers
 */
interface ImageEffectProps {
    rawValue: number;
    children?: React.ReactNode;
}

/**
 * Helper function to add a filter to existing style
 */
function addFilter(style: React.CSSProperties, filterName: string, value: string) {
    const newFilter = `${filterName}(${value})`;
    if (style.filter) {
        style.filter = `${style.filter} ${newFilter}`;
    } else {
        style.filter = newFilter;
    }
}

/**
 * Saturation
 * 
 * Adjusts the saturation of an element.
 * Values:
 * - 0: No saturation (grayscale)
 * - 1: Normal saturation (default)
 * - >1: Increased saturation
 */
export function Saturation(props: ImageEffectProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Saturation, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    // Convert SwiftUI value to CSS value (0-2 → 0-200%)
    const saturationValue = `${Math.max(0, rawValue) * 100}%`;
    addFilter(style, 'saturate', saturationValue);
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

/**
 * Brightness
 * 
 * Adjusts the brightness of an element.
 * Values:
 * - 0: Completely black
 * - 1: Normal brightness (default)
 * - >1: Increased brightness
 */
export function Brightness(props: ImageEffectProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Brightness);
    
    const style = { ...useStyle() }
  
    // Clamp to [–1…1]
    const f = Math.max(-1, Math.min(rawValue, 1))
  
    // Build the 4×5 “additive” matrix in sRGB space:
    // [1 0 0 0 f,  0 1 0 0 f,  0 0 1 0 f,  0 0 0 1 0]
    const values = [
      1, 0, 0, 0, f,
      0, 1, 0, 0, f,
      0, 0, 1, 0, f,
      0, 0, 0, 1, 0
    ].join(' ')
  
    // Generate a stable, unique ID once per component instance
    const idRef = useRef(
      `brightness-filter-${Math.random().toString(36).substr(2, 9)}`
    )
    const filterId = idRef.current
  
    // Inject the SVG <filter> into the DOM
    const defs = (
      <svg
        width={0}
        height={0}
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={values} />
          </filter>
        </defs>
      </svg>
    )
  
    // Point the CSS filter at our SVG definition
    addFilter(style, 'url', `#${filterId}`)
  
    return (
      <>
        {defs}
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
      </>
    )
  }

/**
 * Contrast
 * 
 * Adjusts the contrast of an element.
 * Values:
 * - 0: No contrast (gray)
 * - 1: Normal contrast (default)
 * - >1: Increased contrast
 */
export function Contrast(props: ImageEffectProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Contrast, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    // Convert SwiftUI value to CSS value (0-2 → 0-200%)
    const contrastValue = `${Math.max(0, rawValue) * 100}%`;
    addFilter(style, 'contrast', contrastValue);
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

/**
 * Grayscale
 * 
 * Converts an element to grayscale.
 * When called with:
 * - No argument: Full grayscale (100%)
 * - With value: 
 *   - 0: No grayscale effect (normal color)
 *   - 1: Full grayscale (completely desaturated)
 *   - Intermediate values: Partial grayscale
 */
interface GrayscaleProps {
    rawValue?: number;
    children?: React.ReactNode;
}

export function Grayscale(props: GrayscaleProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, Grayscale, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    
    // If no value provided, use 100% grayscale
    // Otherwise scale the provided value to percentage
    const grayscaleAmount = rawValue === undefined 
        ? '100%'  // No argument = full grayscale
        : `${Math.min(1, Math.max(0, rawValue)) * 100}%`;
        
    addFilter(style, 'grayscale', grayscaleAmount);
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

/**
 * ColorInvert
 * 
 * Inverts the colors of an element.
 */
interface ColorInvertProps {
    children?: React.ReactNode;
}

export function ColorInvert(props: ColorInvertProps): React.ReactNode {
    const { children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ColorInvert, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    addFilter(style, 'invert', '100%');
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}

/**
 * Blend Mode
 */
type BlendModeType = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "colorDodge" | "colorBurn" | "softLight" | "hardLight" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity" | "plusLighter";

const blendModeToCss: Record<BlendModeType, React.CSSProperties["mixBlendMode"]> = {
    normal: "normal",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    darken: "darken",
    lighten: "lighten",
    colorDodge: "color-dodge",
    colorBurn: "color-burn",
    softLight: "soft-light",
    hardLight: "hard-light",
    difference: "difference",
    exclusion: "exclusion",
    hue: "hue",
    saturation: "saturation",
    color: "color",
    luminosity: "luminosity",
    plusLighter: "plus-lighter",
};

interface BlendModeProps {
    rawValue?: BlendModeType;
    children?: React.ReactNode;
}

export function BlendMode(props: BlendModeProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, BlendMode, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    if (rawValue && blendModeToCss[rawValue]) {
        style.mixBlendMode = blendModeToCss[rawValue];
    }
    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}