import React from 'react';
import { unitPointToTransformOrigin, UnitPoint } from '../Utils/unitPointUtils';
import { LayoutNode, layoutStyle, useLayout } from '../Layout';
import { AnimatableValuesProvider } from '../AnimatableStyle';
import { StyleProvider } from '../Style';
import { useStyle } from '../Style';

/**
 * RotationEffect
 * 
 * Applies rotation to a component with optional anchor point.
 * Per metabind.d.ts, this accepts either:
 * 1. A number (degrees)
 * 2. An object with {degrees: number, anchor?: {x: number, y: number}}
 */
interface RotationEffectPropObject {
    degrees: number;
    anchor?: UnitPoint;
}

// This interface handles all possible prop formats:
// 1. Direct props as they come from Component.rotationEffect() method
// 2. The rawValue pattern used internally
// 3. The _0 pattern used by YapUIDecoder for first argument
interface RotationEffectProps {
    // For direct usage: .rotationEffect({degrees: 20, anchor: {...}})
    degrees?: number;
    anchor?: UnitPoint;

    // For internal usage with rawValue pattern
    rawValue?: number | RotationEffectPropObject;

    // For YapUIDecoder which passes the first argument as _0
    _0?: number | RotationEffectPropObject;

    // Other props
    _type?: string;
    children?: React.ReactNode;
}

export function RotationEffect(props: RotationEffectProps): React.ReactNode {
    const { rawValue, _0, degrees: directDegrees, anchor: directAnchor, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, RotationEffect);
    const baseStyle = useStyle();

    // Determine the value source based on available props
    // Priority: direct props > _0 > rawValue
    const usingDirectProps = directDegrees !== undefined;
    const value = usingDirectProps ? undefined : (_0 !== undefined ? _0 : rawValue);

    // Early return if no rotation specified
    if (value == null && !usingDirectProps) {
        return children;
    }

    // Determine degrees and anchor point based on input type
    let degrees: number;
    let anchor: UnitPoint | undefined = 'center';

    if (usingDirectProps) {
        // Using direct props: degrees and anchor directly provided
        degrees = directDegrees!;
        anchor = directAnchor;
    } else if (typeof value === 'number') {
        // Value as simple number input - just degrees
        degrees = value;
    } else if (value && typeof value === 'object') {
        // Value as object input with degrees and optional anchor
        degrees = value.degrees;
        anchor = value.anchor;
    } else {
        // Fallback - should never happen due to early return
        degrees = 0;
    }

    // Create a new style object for the rotation container
    // We don't inherit parent styles here - creates a clean container
    let rotationStyle: React.CSSProperties = {
        ...baseStyle,

        ...layoutStyle(layout),
    };

    // Apply rotation transform
    rotationStyle.transform = [
        rotationStyle.transform, `rotate(${degrees}deg)`
    ]
        .filter(Boolean)
        .join(" ");

    // Convert UnitPoint to CSS transform-origin using our utility function
    rotationStyle.transformOrigin = unitPointToTransformOrigin(anchor);

    return (
        <StyleProvider style={rotationStyle}>
            <LayoutNode layout={layout}>
                <AnimatableValuesProvider values={{ rotate: degrees }}>
                    {children}
                </AnimatableValuesProvider>
            </LayoutNode>
        </StyleProvider>
    );
}
