import React from 'react';
import { UnitPoint, unitPointToTransformOrigin } from '../Utils/unitPointUtils';
import { ScaleProvider } from '../Scale';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { AnimatableValuesProvider } from '../AnimatableStyle';
import { StyleProvider, useStyle } from '../Style';

/**
 * ScaleEffect
 *
 * Applies scaling to a component with optional anchor point.
 * Per metabind.d.ts, this accepts either:
 * 1. A number (uniform scale)
 * 2. An object with {x?: number, y?: number, anchor?: UnitPoint}
 */
interface ScaleEffectPropObject {
    x?: number;
    y?: number;
    anchor?: UnitPoint;
}

// This interface handles all possible prop formats:
// 1. Direct props as they come from Component.scaleEffect() method
// 2. The rawValue pattern used internally
// 3. The _0 pattern used by YapUIDecoder for first argument
interface ScaleEffectProps {
    // For direct usage: .scaleEffect({x: 1.2, y: 1.5, anchor: "center"})
    x?: number;
    y?: number;
    anchor?: UnitPoint;

    // For internal usage with rawValue pattern
    rawValue?: number | ScaleEffectPropObject;

    // For YapUIDecoder which passes the first argument as _0
    _0?: number | ScaleEffectPropObject;

    // Other props
    _type?: string;
    children?: React.ReactNode;
}

export function ScaleEffect(props: ScaleEffectProps): React.ReactNode {
    // Destructure props
    const { rawValue, _0, x: directX, y: directY, anchor: directAnchor, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, ScaleEffect);
    const baseStyle = useStyle();

    // Determine the value source based on available props
    // Priority: direct props > _0 > rawValue
    const usingDirectProps = directX !== undefined || directY !== undefined;
    const value = usingDirectProps ? undefined : (_0 !== undefined ? _0 : rawValue);

    // Early return if no scale specified
    if (value == null && !usingDirectProps) {
        return children;
    }

    // Default scale values
    let scaleX = 1;
    let scaleY = 1;
    let anchor: UnitPoint | undefined;

    if (usingDirectProps) {
        // Using direct props
        scaleX = directX ?? 1;
        scaleY = directY ?? 1;
        anchor = directAnchor;
    } else if (typeof value === 'number') {
        // Simple uniform scale
        scaleX = scaleY = value;
    } else if (value && typeof value === 'object') {
        // Object with potential x, y, and anchor values
        scaleX = value.x ?? 1;
        scaleY = value.y ?? 1;
        anchor = value.anchor;
    }

    // Build style for transform-origin (anchor point)
    const style: React.CSSProperties = {
        ...baseStyle,
    };

    if (anchor) {
        style.transformOrigin = unitPointToTransformOrigin(anchor);
    }

    // Only apply transform if scale values are valid and not 1 (default)
    if ((scaleX > 0 && scaleX !== 1) || (scaleY > 0 && scaleY !== 1)) {
        // Use scale(x, y) if they're different, otherwise use simple scale(x)
        style.transform = scaleX === scaleY
            ? `scale(${scaleX})`
            : `scale(${scaleX}, ${scaleY})`;
    }

    // Determine animation values
    // If scaleX === scaleY, use uniform scale, otherwise use separate scaleX/scaleY
    const animationValues = scaleX === scaleY
        ? { scale: scaleX }
        : { scaleX, scaleY };

    return (
        <StyleProvider style={style}>
            <ScaleProvider scale={{ scaleX, scaleY }}>
                <LayoutNodeChildren layout={layout}>
                    <AnimatableValuesProvider values={animationValues}>
                        {children}
                    </AnimatableValuesProvider>
                </LayoutNodeChildren>
            </ScaleProvider>
        </StyleProvider>
    );
}
