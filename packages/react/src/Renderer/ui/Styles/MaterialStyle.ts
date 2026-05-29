// Types of materials available in SwiftUI
export type MaterialType = 
    | 'regular'       // Standard material
    | 'thick'         // More prominent material
    | 'thin'          // Lighter material
    | 'ultraThin'     // Very light material
    | 'ultrathin'     // Alias for 'ultraThin'
    | 'bar'           // Used for toolbars
    | 'chrome'        // Used for UI elements like popups and menus
    | 'titlebar'      // Used for title bars
    | 'toolbarMaterial'; // Used for toolbars

// Interface for material style with customization options
export interface MaterialStyle {
    type: MaterialType;
    opacity?: number; // Custom opacity (0-1)
    blurRadius?: number; // Custom blur radius
    color?: string; // Custom color (optional)
}

// CSS mapping for material types
interface MaterialCSSProperties {
    backdropFilter: string;
    backgroundColor: string;
    opacity?: number;
}

// Material mappings to CSS properties
const materialTypeToCSS: Record<MaterialType, MaterialCSSProperties> = {
    // Regular balanced material
    regular: {
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
    
    // Thicker, more prominent material
    thick: {
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.65)'
    },
    
    // Thinner, more subtle material
    thin: {
        backdropFilter: 'blur(7px)',
        backgroundColor: 'rgba(255, 255, 255, 0.4)'
    },
    
    // Very light, most transparent material
    ultraThin: {
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    
    // Alias for ultraThin
    ultrathin: {
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    
    // Bar material for toolbars
    bar: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)'
    },
    
    // Chrome material for menu and popups
    chrome: {
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255, 255, 255, 0.55)'
    },
    
    // Title bar material
    titlebar: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)'
    },
    
    // Toolbar specific material
    toolbarMaterial: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)'
    }
};

// Dark mode variants
const materialTypeToCSSDark: Record<MaterialType, MaterialCSSProperties> = {
    regular: {
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(25, 25, 25, 0.5)'
    },
    thick: {
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(25, 25, 25, 0.65)'
    },
    thin: {
        backdropFilter: 'blur(7px)',
        backgroundColor: 'rgba(25, 25, 25, 0.4)'
    },
    ultraThin: {
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(25, 25, 25, 0.25)'
    },
    ultrathin: {
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(25, 25, 25, 0.25)'
    },
    bar: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(25, 25, 25, 0.6)'
    },
    chrome: {
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(25, 25, 25, 0.55)'
    },
    titlebar: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(25, 25, 25, 0.7)'
    },
    toolbarMaterial: {
        backdropFilter: 'blur(15px)',
        backgroundColor: 'rgba(25, 25, 25, 0.6)'
    }
};

/**
 * Converts a material type to CSS properties
 * 
 * @param material Material type or style object
 * @param colorScheme 'light' or 'dark' color scheme
 * @returns CSS properties for material
 */
export function materialStyleToCSS(
    material: MaterialType | MaterialStyle,
    colorScheme?: 'light' | 'dark'
): React.CSSProperties {
    // Default to regular material if invalid input
    if (!material) {
        return materialTypeToCSS.regular;
    }
    
    // Handle string material types
    if (typeof material === 'string') {
        const materialType = material as MaterialType;
        const materialMap = colorScheme === 'dark' ? materialTypeToCSSDark : materialTypeToCSS;
        
        // Return the matching material or default to regular
        return materialMap[materialType] || materialMap.regular;
    }
    
    // Handle material style object
    if (typeof material === 'object' && 'type' in material) {
        const materialStyle = material as MaterialStyle;
        const materialMap = colorScheme === 'dark' ? materialTypeToCSSDark : materialTypeToCSS;
        let baseStyle = materialMap[materialStyle.type] || materialMap.regular;
        
        // Apply custom opacity if provided
        if (materialStyle.opacity !== undefined) {
            // Extract the RGBA values from backgroundColor
            const bgColorMatch = baseStyle.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            
            if (bgColorMatch) {
                const [_, r, g, b] = bgColorMatch;
                baseStyle = {
                    ...baseStyle,
                    backgroundColor: `rgba(${r}, ${g}, ${b}, ${materialStyle.opacity})`
                };
            }
        }
        
        
        // Apply custom blur radius if provided
        if (materialStyle.blurRadius !== undefined) {
            baseStyle = {
                ...baseStyle,
                backdropFilter: `blur(${materialStyle.blurRadius}px)`
            };
        }
        
        if (materialStyle.color !== undefined) {
            baseStyle = {
                ...baseStyle,
                backgroundColor: materialStyle.color
            };
        }
        
        return baseStyle;
    }
    
    // Default fallback
    return materialTypeToCSS.regular;
}