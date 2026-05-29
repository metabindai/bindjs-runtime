/**
 * Utilities for handling UnitPoint conversions from SwiftUI to CSS
 */

/**
 * UnitPoint type definition matching metabind.d.ts
 * Can be either a string name or x,y coordinates
 */
export type UnitPoint = {x: number; y: number} | 
                    "zero" | "center" | "top" | "bottom" | 
                    "leading" | "trailing" | "topLeading" | "topTrailing" | 
                    "bottomLeading" | "bottomTrailing";

/**
 * Convert a named UnitPoint to x,y coordinates
 */
export function convertNamedUnitPoint(name: string): { x: number; y: number } {
    switch (name) {
        case 'zero': return { x: 0, y: 0 };
        case 'center': return { x: 0.5, y: 0.5 };
        case 'top': return { x: 0.5, y: 0 };
        case 'bottom': return { x: 0.5, y: 1 };
        case 'leading': return { x: 0, y: 0.5 };
        case 'trailing': return { x: 1, y: 0.5 };
        case 'topLeading': return { x: 0, y: 0 };
        case 'topTrailing': return { x: 1, y: 0 };
        case 'bottomLeading': return { x: 0, y: 1 };
        case 'bottomTrailing': return { x: 1, y: 1 };
        default: return { x: 0.5, y: 0.5 };
    }
}

/**
 * Convert a UnitPoint to CSS transform-origin value
 * 
 * @param unitPoint The UnitPoint to convert, either as string or {x,y} coordinates
 * @returns CSS transform-origin value (e.g., "center center", "left top", "25% 75%")
 */
export function unitPointToTransformOrigin(unitPoint?: UnitPoint): string {
    if (!unitPoint) {
        return "center center"; // Default
    }
    
    if (typeof unitPoint === "object") {
        // Handle {x, y} coordinate pairs (0-1 range → percentage)
        return `${unitPoint.x * 100}% ${unitPoint.y * 100}%`;
    }
    
    // Handle named points
    switch(unitPoint) {
        case "zero":
            return "0% 0%";
        case "top":
            return "center top";
        case "bottom":
            return "center bottom";
        case "leading":
            return "left center";
        case "trailing":
            return "right center";
        case "topLeading":
            return "left top";
        case "topTrailing":
            return "right top";
        case "bottomLeading":
            return "left bottom";
        case "bottomTrailing":
            return "right bottom";
        case "center":
        default:
            return "center center";
    }
}

/**
 * Convert a UnitPoint to CSS background-position value
 * Works the same as transform-origin but is used for different CSS properties
 * 
 * @param unitPoint The UnitPoint to convert
 * @returns CSS background-position value
 */
function unitPointToBackgroundPosition(unitPoint?: UnitPoint): string {
    return unitPointToTransformOrigin(unitPoint);
}

/**
 * Convert a UnitPoint to CSS object-position value for <img> elements
 * 
 * @param unitPoint The UnitPoint to convert
 * @returns CSS object-position value
 */
function unitPointToObjectPosition(unitPoint?: UnitPoint): string {
    return unitPointToTransformOrigin(unitPoint);
}

/**
 * Convert a UnitPoint to CSS align-items and justify-content values
 * Useful for flex container alignment
 * 
 * @param unitPoint The UnitPoint to convert
 * @returns An object with alignItems and justifyContent CSS properties
 */
function unitPointToFlexAlignment(unitPoint?: UnitPoint): { alignItems: string, justifyContent: string } {
    if (!unitPoint) {
        return { alignItems: "center", justifyContent: "center" };
    }
    
    if (typeof unitPoint === "object") {
        // Convert coordinates to alignment
        const justifyContent = unitPoint.x <= 0.25 ? "flex-start" : 
                              unitPoint.x >= 0.75 ? "flex-end" : "center";
        
        const alignItems = unitPoint.y <= 0.25 ? "flex-start" : 
                          unitPoint.y >= 0.75 ? "flex-end" : "center";
                          
        return { alignItems, justifyContent };
    }
    
    // Handle named points
    switch(unitPoint) {
        case "zero":
        case "topLeading":
            return { alignItems: "flex-start", justifyContent: "flex-start" };
        case "top":
            return { alignItems: "flex-start", justifyContent: "center" };
        case "topTrailing":
            return { alignItems: "flex-start", justifyContent: "flex-end" };
        case "leading":
            return { alignItems: "center", justifyContent: "flex-start" };
        case "trailing":
            return { alignItems: "center", justifyContent: "flex-end" };
        case "bottomLeading":
            return { alignItems: "flex-end", justifyContent: "flex-start" };
        case "bottom":
            return { alignItems: "flex-end", justifyContent: "center" };
        case "bottomTrailing":
            return { alignItems: "flex-end", justifyContent: "flex-end" };
        case "center":
        default:
            return { alignItems: "center", justifyContent: "center" };
    }
}

/**
 * Convert start and end points to CSS angle
 * CSS: 0deg is pointing up, 90deg is right, etc (clockwise)
 */
export function unitPointsToAngle(startPoint: UnitPoint, endPoint: UnitPoint): number {
    const start = typeof startPoint === 'string' ? convertNamedUnitPoint(startPoint) : startPoint;
    const end = typeof endPoint === 'string' ? convertNamedUnitPoint(endPoint) : endPoint;

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Invert Y for CSS coordinates (positive y is down)
    const angleRad = Math.atan2(-dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Convert to CSS-compatible angle: 0deg is up, increasing clockwise
    return (450 - angleDeg) % 360;
}