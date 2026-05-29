import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Define the font registration interface
interface FontRegistration {
    family: string;
    url: string;
    weight?: string;
    style?: string;
    refCount: number; // Track how many components are using this font
}

// Define the context type
interface FontManagerContextType {
    registerFont: (font: Omit<FontRegistration, 'refCount'>) => void;
    unregisterFont: (family: string) => void;
    registeredFonts: Omit<FontRegistration, 'refCount'>[];
}

// Create context with default values
const FontManagerContext = createContext<FontManagerContextType>({
    registerFont: () => { },
    unregisterFont: () => { },
    registeredFonts: [],
});

// Helper to construct the font URL
const constructGoogleFontLink = (fontRegistration: FontRegistration): string => {
    const { url, family, weight = '400', style = 'normal' } = fontRegistration;

    // If it's already a complete URL (http or https), use it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a Google Fonts name (no URL extension)
    if (!url.includes('.') && !url.includes('/')) {
        // Format: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
        const formattedFamily = family.replace(/\s+/g, '+');
        const weightParam = weight === 'normal' ? '400' : weight === 'bold' ? '700' : weight;
        const styleParam = style === 'normal' ? '' : `,${style}`;

        return `https://fonts.googleapis.com/css2?family=${formattedFamily}:wght@${weightParam}${styleParam}&display=swap`;
    }

    // Otherwise, treat as a relative or absolute path to a font file
    return url;
};

const generateFont = (font: FontRegistration) => {
    let url = constructGoogleFontLink(font)

    if (url.includes('fonts.googleapis.com')) {
        return (
            <link
                key={font.family + url}
                href={url}
                rel="stylesheet"
            />
        );
    } else {
        return (
            <style key={font.family + url} type="text/css">{`
                @font-face {
                    font-family: '${font.family}';
                    src: url('${url}') format('opentype');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            `}</style>
        );
    }
};


// Custom hook to use the font manager
export const useFontManager = (): FontManagerContextType => {
    return useContext(FontManagerContext);
};

interface FontManagerProps {
    children: ReactNode;
}

export function FontManager({ children }: FontManagerProps) {
    const [fonts, setFonts] = useState<Record<string, FontRegistration>>({});
    const helmetContext = {};

    // Register a new font or increment reference count if it already exists
    const registerFont = useCallback((fontData: Omit<FontRegistration, 'refCount'>) => {
        setFonts(prevFonts => {
            // Check if font already exists
            const existingFont = prevFonts[fontData.family];

            if (existingFont) {
                // If URL is different, treat as a new registration replacing the old one
                if (existingFont.url !== fontData.url) {
                    return {
                        ...prevFonts,
                        [fontData.family]: {
                            ...fontData,
                            refCount: 1
                        }
                    };
                }

                // Otherwise increment the reference count
                return {
                    ...prevFonts,
                    [fontData.family]: {
                        ...existingFont,
                        refCount: existingFont.refCount + 1
                    }
                };
            }

            // Font doesn't exist yet, add with reference count 1
            return {
                ...prevFonts,
                [fontData.family]: {
                    ...fontData,
                    refCount: 1
                }
            };
        });
    }, []);

    // Unregister a font (decrement reference count, remove if reaches 0)
    const unregisterFont = useCallback((family: string) => {
        setFonts(prevFonts => {
            const existingFont = prevFonts[family];

            // If font doesn't exist, no change
            if (!existingFont) {
                return prevFonts;
            }

            // Decrement reference count
            const newRefCount = existingFont.refCount - 1;

            // Avoid this for now, creates more visual noise in the UI
            //
            // If reference count is 0, remove the font
            // if (newRefCount <= 0) {
            //     const newFonts = { ...prevFonts };
            //     delete newFonts[family];
            //     return newFonts;
            // }

            // Otherwise, update the reference count
            return {
                ...prevFonts,
                [family]: {
                    ...existingFont,
                    refCount: newRefCount
                }
            };
        });
    }, []);

    // Convert fonts object to array for rendering and strip out refCount
    // @ts-ignore
    const registeredFonts: Omit<FontRegistration, "refCount">[] = Object.values(fonts).map(({ refCount, ...fontData }) => fontData);

    // Create context value
    const contextValue: FontManagerContextType = {
        registerFont,
        unregisterFont,
        registeredFonts,
    };

    return (
        <FontManagerContext.Provider value={contextValue}>
            <HelmetProvider context={helmetContext}>
                <>
                    <Helmet>

                        {
                            // @ts-ignore
                            Object.values(fonts as FontRegistration[]).map((font, index) => (
                                generateFont(font)
                            ))}
                    </Helmet>
                    {children}
                </>
            </HelmetProvider>
        </FontManagerContext.Provider>
    );
}