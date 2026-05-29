import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { px } from '../../Utils';
import { useForegroundStyleContext, foregroundStyleToCSS } from '../Modifiers/ForegroundStyle';
import { shapeStyleToCSS, ShapeStyleProps } from '../ShapeStyle';
import { useEnvironment } from '../Environment';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode, LayoutNodeChildren } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import styled from 'styled-components';
import useMeasure from 'react-use-measure';
import { useAnimationNode } from '../AnimatableStyle';

export interface RoundedRectangleProps extends ShapeStyleProps {
    cornerRadius?: number | string | null;
    style?: 'circular' | 'continuous'
}

export function RoundedRectangle(props: RoundedRectangleProps): React.ReactElement {
    const { cornerRadius, style: cornerStyle } = props;

    // Perform layout calculation
    const layout = useLayout(props, RoundedRectangle);

    const foregroundStyleContext = useForegroundStyleContext()
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        // Apply environment style
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply animatable css
        ...animationStyle
    };

    // Apply shape styles (fill/stroke)
    const { fill, stroke } = props;
    const shapeStyle = shapeStyleToCSS({ fill, stroke } as ShapeStyleProps, environment.colorScheme);

    if (shapeStyle) {
        Object.assign(style, shapeStyle);
    } else if (foregroundStyleContext) {
        Object.assign(style, foregroundStyleToCSS(foregroundStyleContext, 'shape', environment.colorScheme));
    } else {
        Object.assign(style, {
            backgroundColor: '#222222', // Default background color
        })
    }

    var elementContent: React.ReactElement | null = null
    if (cornerStyle === 'circular' || cornerStyle == null) {
        style.borderRadius = px(props.cornerRadius ?? 8);
        elementContent = <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}></div>
    } else if (cornerStyle === 'continuous') {
        elementContent = <Squircle cornerRadius={parseInt(cornerRadius as string)} style={style} />;
    }

    return elementContent;
}

const EMPTY_STYLE: React.CSSProperties = {};

const Squircle = ({
    className = '',
    style = EMPTY_STYLE,
    cornerRadius = 40,
    cornerSmoothing = 1,
    ...props
}) => {
    const clipPathId = React.useId();
    const [ref, { width, height }] = useMeasure();

    const generatePath = () => {
        if (width === 0 || height === 0) return '';

        const r = Math.min(cornerRadius * 2, width / 2, height / 2);
        const p = cornerSmoothing;

        // Control point offset for smooth curve
        const smoothing = r * (1 - p) * 0.6;

        return `
            M 0,${r}
            C 0,${smoothing} ${smoothing},0 ${r},0
            L ${width - r},0
            C ${width - smoothing},0 ${width},${smoothing} ${width},${r}
            L ${width},${height - r}
            C ${width},${height - smoothing} ${width - smoothing},${height} ${width - r},${height}
            L ${r},${height}
            C ${smoothing},${height} 0,${height - smoothing} 0,${height - r}
            Z
        `.trim();
    };

    return (
        <>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <clipPath id={clipPathId}>
                        <path d={generatePath()} />
                    </clipPath>
                </defs>
            </svg>

            <div
                ref={ref}
                className={className}
                style={{
                    ...style,
                    clipPath: `url(#${clipPathId})`,
                }}
                {...props}
            />
        </>
    );
};

export const rectangleSizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    RoundedRectangle,
    rectangleSizeThatFits
);

/**
 * RoundedRectangle
 */
interface RectangleProps extends ShapeStyleProps {

}

export function Rectangle(props: RectangleProps) {
    return <RoundedRectangle cornerRadius={0} {...props}></RoundedRectangle>
}

layoutRegistry.register(
    Rectangle,
    rectangleSizeThatFits
);


const PathContinuous = styled.div`
  clip-path: path("M 0.5 0 C 0.22 0 0 0.22 0 0.5 C 0 0.78 0.22 1 0.5 1 C 0.78 1 1 0.78 1 0.5 C 1 0.22 0.78 0 0.5 0 Z");
`
