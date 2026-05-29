
import React, { useState, useLayoutEffect, useRef } from "react";
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { Circle } from '../Views/Circle';
import { Rectangle, RoundedRectangle } from '../Views/Rectangle';
import { Ellipse } from '../Views/Ellipse';
import { Capsule } from '../Views/Capsule';
import useMeasure from 'react-use-measure';
import { useCurrentScale } from "../Scale";

/**
 * ClipShape modifier props
 */
interface ClipShapeProps {
    rawValue?: React.ReactElement; // The shape component to use for clipping
    children?: React.ReactNode;
}

/**
 * ClipShape
 * 
 * Clips the component to the specified shape using CSS clip-path.
 * Supports Circle, Rectangle, RoundedRectangle, Ellipse, and Capsule shapes.
 * 
 * @param rawValue The shape component to use for clipping
 * @param children The component content to be clipped
 * @returns A component with the clip shape applied
 */
export function ClipShape(props: ClipShapeProps): React.ReactNode {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, ClipShape, { hasDOMElement: false });
    
    const style = { ...useStyle() };
    const shapeComponent = rawValue;

    // Measurement for dynamic shapes like Circle
    const [ref, { width, height }] = useMeasure();

    // Current parent scale
    const scale = useCurrentScale();

    if (!shapeComponent) {
        return (
            <StyleProvider style={style}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </StyleProvider>
        );
    }

    // Convert shape component to CSS clip-path
    const [clipPath, needsMeasure] = getClipPathFromShape(shapeComponent, { width: width * 1 / scale.scaleX, height: height * 1 / scale.scaleY });

    if (clipPath) {
        style.clipPath = clipPath;
        style.WebkitClipPath = clipPath; // Safari support
    } else {
        console.warn('ClipShape: Unsupported shape type', shapeComponent.type);
    }

    if (needsMeasure) {
        return (
            <div ref={ref}>
                <StyleProvider style={style}>
                    <LayoutNodeChildren layout={layout}>
                        {children}
                    </LayoutNodeChildren>
                </StyleProvider>
            </div>
        );
    } else {
        return (
            <StyleProvider style={style}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </StyleProvider>
        );
    }
}

/**
 * Converts a shape component to CSS clip-path value
 */
function getClipPathFromShape(shapeComponent: React.ReactElement, dimensions: { width: number; height: number }): [string | null, boolean] {
    const shapeType = shapeComponent.type;
    const shapeProps = shapeComponent.props || {};

    switch (shapeType) {
        case Circle:
            // CSS circle clip-path: circle(radius at center)
            if (dimensions.width && dimensions.height && Math.round(dimensions.width) != Math.round(dimensions.height)) {
                const radius = Math.min(dimensions.width, dimensions.height) / 2;
                return [`circle(${radius}px at 50% 50%)`, true];
            } else {
                return ['circle(calc(min(100%, 100%) / 2) at 50% 50%)', true];
            }

        case Rectangle:
            // CSS polygon clip-path for rectangle (covering full area)
            return ['polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', false];

        case RoundedRectangle:
            const cornerRadius = Math.min(shapeProps.cornerRadius || 12, 50);
            return [`inset(0% round ${cornerRadius}px)`, false];

        case Ellipse:
            // CSS ellipse clip-path: ellipse(radiusX radiusY at centerX centerY)
            return ['ellipse(50% 50% at 50% 50%)', false];

        case Capsule:
            // Capsule is essentially a rounded rectangle with maximum border radius
            return ['inset(0% round 9999px)', false];

        default:
            return [null, false];
    }
}

function useUnscaledMeasure() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);

            // Parse the transform matrix (scaleX=a, scaleY=d)
            const matrix = new DOMMatrixReadOnly(style.transform);

            const scaleX = matrix.a !== 0 ? matrix.a : 1;
            const scaleY = matrix.d !== 0 ? matrix.d : 1;

            // Unscaled dimensions
            const width = rect.width / scaleX;
            const height = rect.height / scaleY;

            setSize({ width, height });
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    return [ref, size] as const;
}