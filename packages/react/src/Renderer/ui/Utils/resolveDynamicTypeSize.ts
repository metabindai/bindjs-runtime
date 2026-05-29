import { px } from '../../Utils';

// Define the font weight map to CSS values
const fontWeightMap = {
    ultraLight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900'
};

// Define font weights for each text style (consistent across all sizes)
const textStyleWeights = {
    largeTitle: 'regular',
    title: 'regular',  // title1
    title2: 'regular',
    title3: 'regular',
    headline: 'semibold',
    body: 'regular',
    callout: 'regular',
    subhead: 'regular',
    footnote: 'regular',
    caption1: 'regular',
    caption2: 'regular',
};

// Define the exact font sizes for each dynamic type size and text style
// These values come directly from the Apple Human Interface Guidelines
const fontSizes = {
    // xSmall
    xSmall: {
        largeTitle: 31,
        title: 25,      // title1
        title2: 19,
        title3: 17,
        headline: 14,
        body: 14,
        callout: 13,
        subhead: 12,
        footnote: 12,
        caption1: 11,
        caption2: 11,
    },
    
    // Small
    small: {
        largeTitle: 32,
        title: 26,
        title2: 20,
        title3: 18,
        headline: 15,
        body: 15,
        callout: 14,
        subhead: 13,
        footnote: 12,
        caption1: 11,
        caption2: 11,
    },
    
    // Medium
    medium: {
        largeTitle: 33,
        title: 27,
        title2: 21,
        title3: 19,
        headline: 16,
        body: 16,
        callout: 15,
        subhead: 14,
        footnote: 12,
        caption1: 11,
        caption2: 11,
    },
    
    // Large (default)
    large: {
        largeTitle: 34,
        title: 28,
        title2: 22,
        title3: 20,
        headline: 17,
        body: 17,
        callout: 16,
        subhead: 15,
        footnote: 13,
        caption1: 12,
        caption2: 11,
    },
    
    // xLarge
    xLarge: {
        largeTitle: 36,
        title: 30,
        title2: 24,
        title3: 22,
        headline: 19,
        body: 19,
        callout: 18,
        subhead: 17,
        footnote: 15,
        caption1: 14,
        caption2: 13,
    },
    
    // xxLarge
    xxLarge: {
        largeTitle: 38,
        title: 32,
        title2: 26,
        title3: 24,
        headline: 21,
        body: 21,
        callout: 20,
        subhead: 19,
        footnote: 17,
        caption1: 16,
        caption2: 15,
    },
    
    // xxxLarge
    xxxLarge: {
        largeTitle: 40,
        title: 34,
        title2: 28,
        title3: 26,
        headline: 23,
        body: 23,
        callout: 22,
        subhead: 21,
        footnote: 19,
        caption1: 18,
        caption2: 17,
    },
    
    // AX1
    accessibility1: {
        largeTitle: 44,
        title: 38,
        title2: 34,
        title3: 31,
        headline: 28,
        body: 28,
        callout: 26,
        subhead: 25,
        footnote: 23,
        caption1: 22,
        caption2: 20,
    },
    
    // AX2
    accessibility2: {
        largeTitle: 48,
        title: 43,
        title2: 39,
        title3: 37,
        headline: 33,
        body: 33,
        callout: 32,
        subhead: 30,
        footnote: 27,
        caption1: 26,
        caption2: 24,
    },
    
    // AX3
    accessibility3: {
        largeTitle: 52,
        title: 48,
        title2: 44,
        title3: 43,
        headline: 40,
        body: 40,
        callout: 38,
        subhead: 36,
        footnote: 33,
        caption1: 32,
        caption2: 29,
    },
    
    // AX4
    accessibility4: {
        largeTitle: 56,
        title: 53,
        title2: 50,
        title3: 49,
        headline: 47,
        body: 47,
        callout: 44,
        subhead: 42,
        footnote: 38,
        caption1: 37,
        caption2: 34,
    },
    
    // AX5
    accessibility5: {
        largeTitle: 60,
        title: 58,
        title2: 56,
        title3: 55,
        headline: 53,
        body: 53,
        callout: 51,
        subhead: 49,
        footnote: 44,
        caption1: 43,
        caption2: 40,
    },
};

// Define the line heights (leading) for each dynamic type size and text style
const lineHeights = {
    // xSmall
    xSmall: {
        largeTitle: 38,
        title: 31,
        title2: 24,
        title3: 22,
        headline: 19,
        body: 19,
        callout: 18,
        subhead: 16,
        footnote: 16,
        caption1: 13,
        caption2: 13,
    },
    
    // Small
    small: {
        largeTitle: 39,
        title: 32,
        title2: 25,
        title3: 23,
        headline: 20,
        body: 20,
        callout: 19,
        subhead: 18,
        footnote: 16,
        caption1: 13,
        caption2: 13,
    },
    
    // Medium
    medium: {
        largeTitle: 40,
        title: 33,
        title2: 26,
        title3: 24,
        headline: 21,
        body: 21,
        callout: 20,
        subhead: 19,
        footnote: 16,
        caption1: 13,
        caption2: 13,
    },
    
    // Large (default)
    large: {
        largeTitle: 41,
        title: 34,
        title2: 28,
        title3: 25,
        headline: 22,
        body: 22,
        callout: 21,
        subhead: 20,
        footnote: 18,
        caption1: 16,
        caption2: 13,
    },
    
    // xLarge
    xLarge: {
        largeTitle: 43,
        title: 37,
        title2: 30,
        title3: 28,
        headline: 24,
        body: 24,
        callout: 23,
        subhead: 22,
        footnote: 20,
        caption1: 19,
        caption2: 18,
    },
    
    // xxLarge
    xxLarge: {
        largeTitle: 46,
        title: 39,
        title2: 32,
        title3: 30,
        headline: 26,
        body: 26,
        callout: 25,
        subhead: 24,
        footnote: 22,
        caption1: 21,
        caption2: 20,
    },
    
    // xxxLarge
    xxxLarge: {
        largeTitle: 48,
        title: 41,
        title2: 34,
        title3: 32,
        headline: 29,
        body: 29,
        callout: 28,
        subhead: 28,
        footnote: 24,
        caption1: 23,
        caption2: 22,
    },
    
    // AX1
    accessibility1: {
        largeTitle: 52,
        title: 46,
        title2: 41,
        title3: 38,
        headline: 34,
        body: 34,
        callout: 32,
        subhead: 31,
        footnote: 29,
        caption1: 28,
        caption2: 25,
    },
    
    // AX2
    accessibility2: {
        largeTitle: 57,
        title: 51,
        title2: 47,
        title3: 44,
        headline: 40,
        body: 40,
        callout: 39,
        subhead: 37,
        footnote: 33,
        caption1: 32,
        caption2: 30,
    },
    
    // AX3
    accessibility3: {
        largeTitle: 61,
        title: 57,
        title2: 52,
        title3: 51,
        headline: 48,
        body: 48,
        callout: 46,
        subhead: 43,
        footnote: 40,
        caption1: 39,
        caption2: 35,
    },
    
    // AX4
    accessibility4: {
        largeTitle: 66,
        title: 62,
        title2: 59,
        title3: 58,
        headline: 56,
        body: 56,
        callout: 52,
        subhead: 50,
        footnote: 46,
        caption1: 44,
        caption2: 41,
    },
    
    // AX5
    accessibility5: {
        largeTitle: 70,
        title: 68,
        title2: 66,
        title3: 65,
        headline: 62,
        body: 62,
        callout: 60,
        subhead: 58,
        footnote: 52,
        caption1: 51,
        caption2: 48,
    },
};

// Type for the parameters
interface ResolveFontSizeParams {
    textStyle?: string;
    dynamicTypeSize?: string;
    explicitSize?: number;
    weight?: string;
    custom?: boolean;
}

/**
 * Resolves font size, weight, and line height based on text style and dynamic type size
 * 
 * @param params The parameters including textStyle, dynamicTypeSize, explicitSize, and weight
 * @returns The resolved font properties
 */
export function resolveFont(params: ResolveFontSizeParams): { 
    fontSize: string | undefined; 
    fontWeight: string | undefined;
    lineHeight: string | undefined;
} {
    const { textStyle, dynamicTypeSize = 'large', explicitSize, weight } = params;
    
    // Default return values
    let fontSize: string | undefined = undefined;
    let fontWeight: string | undefined = undefined;
    let lineHeight: string | undefined = undefined;

    // If there's an explicit size, just use that (not affected by dynamic type)
    if (explicitSize !== undefined) {
        let size = explicitSize;

        let lineHeight = undefined;

        // If it's a custom font, scale it based on the dynamic type size relative to the text style size
        if (dynamicTypeSize && params.custom) {
            // Default line height to the explicit size if not scaling            
            lineHeight = explicitSize;

            let originalSize = fontSizes['large']?.[textStyle]
            let currentSize = fontSizes[dynamicTypeSize]?.[textStyle]
            if (originalSize && currentSize) {
                let scale = currentSize / originalSize;

                // Scale size
                size = Math.round(size * scale)

                // Scale line height
                lineHeight = Math.round(lineHeight * scale)
            }
        }

        return { 
            fontSize: px(size), 
            fontWeight: weight ? fontWeightMap[weight] : undefined,
            lineHeight: lineHeight // No specific line height for explicit sizes
        };
    }

    // Process text style and dynamic type size
    if (textStyle) {
        // Normalize text style name (handle title vs title1)
        const normalizedTextStyle = textStyle === 'title1' ? 'title' : textStyle;
        
        // Normalize dynamic type size name (handle defaults)
        const normalizedTypeSize = dynamicTypeSize || 'large';
        
        // Look up the exact font size
        if (fontSizes[normalizedTypeSize] && fontSizes[normalizedTypeSize][normalizedTextStyle]) {
            fontSize = px(fontSizes[normalizedTypeSize][normalizedTextStyle]);
        }
        
        // Look up the exact line height
        if (lineHeights[normalizedTypeSize] && lineHeights[normalizedTypeSize][normalizedTextStyle]) {
            lineHeight = px(lineHeights[normalizedTypeSize][normalizedTextStyle]);
        }
        
        // Determine font weight (explicit weight overrides default)
        const styleWeight = textStyleWeights[normalizedTextStyle];
        fontWeight = fontWeightMap[weight || styleWeight];
    } else if (weight) {
        // If there's no text style but there is a weight, just apply the weight
        fontWeight = fontWeightMap[weight];
    }
    
    return {
        fontSize,
        fontWeight,
        lineHeight
    };
}