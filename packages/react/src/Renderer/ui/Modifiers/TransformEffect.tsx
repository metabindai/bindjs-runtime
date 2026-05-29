import React from 'react';
import { useStyle, StyleProvider, ClearStyle } from '../Style';
import { useLayout, layoutStyle, LayoutNode, LayoutNodeChildren } from '../Layout';

/**
 * TransformEffect
 */
// Model after CGAffineTransform, with alternate transform options.
// Note: Only one of the alternative props (rotationAngle, scale, translation)
// will be used if provided.
interface TransformEffectProps {
    // Matrix values (fallback)
    a?: number;  // Default scaleX is 1
    b?: number;  // Default skewY is 0
    c?: number;  // Default skewX is 0
    d?: number;  // Default scaleY is 1
    tx?: number; // Default translation X is 0
    ty?: number; // Default translation Y is 0

    // Alternate transform options (only one will be applied if provided)
    rotationAngle?: number; // Rotation angle in degrees
    scale?: number;         // Scale factor
    translation?: { x: number, y: number }; // Translation values

    // For YapUIDecoder
    _0?: any;
    rawValue?: any;
    
    children: React.ReactNode;
}

export function TransformEffect(props: TransformEffectProps): React.ReactNode {
    var {
        a = 1,
        b = 0,
        c = 0,
        d = 1,
        tx = 0,
        ty = 0,
        rotationAngle,
        scale,
        translation,
        _0,
        rawValue,
        children,
    } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, TransformEffect);
    // Create a new style object for the transform container
    let transformStyle: React.CSSProperties = {};
    
    let newTransform = '';

    // Handle passed in value from _0 or rawValue if present
    const value = _0 ?? rawValue;
    
    if (value && typeof value === 'object') {
        // Extract values from the passed object
        if (value.a !== undefined) a = value.a;
        if (value.b !== undefined) b = value.b;
        if (value.c !== undefined) c = value.c;
        if (value.d !== undefined) d = value.d;
        if (value.tx !== undefined) tx = value.tx;
        if (value.ty !== undefined) ty = value.ty;
        if (value.rotationAngle !== undefined) rotationAngle = value.rotationAngle;
        if (value.scale !== undefined) scale = value.scale;
        if (value.translation !== undefined) translation = value.translation;
    }

    if (rotationAngle !== undefined) {
        // Apply a rotation transform.
        newTransform = `rotate(${rotationAngle}deg)`;
    } else if (scale !== undefined) {
        // Apply a uniform scale transform.
        newTransform = `scale(${scale})`;
    } else if (translation !== undefined) {
        // Apply a translation transform.
        newTransform = `translate(${translation.x}px, ${translation.y}px)`;
    } else {
        // Fallback: use the matrix values to recreate a CGAffineTransform effect.
        newTransform = `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
    }

    // Apply the transform
    transformStyle.transform = newTransform;

    // Create parent container to maintain original positioning
    const wrapperStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        ...layoutStyle(layout)
    };
    
    // Add hints for browser rendering
    transformStyle.willChange = 'transform';
    transformStyle.transformStyle = 'preserve-3d';
    transformStyle.position = 'absolute';
    transformStyle.left = 0;
    transformStyle.top = 0;
    transformStyle.right = 0;
    transformStyle.bottom = 0;
    transformStyle.display = 'flex';
    
    return (
            <div className="transform-effect-wrapper" style={wrapperStyle}>
                <div className="transform-effect" style={transformStyle}>
                    <LayoutNodeChildren layout={layout}>
                        {children}
                    </LayoutNodeChildren>
                </div>
            </div>
    );

}