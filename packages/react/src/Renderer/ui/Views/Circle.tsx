import React, { useLayoutEffect, useRef, useState } from 'react';
import { useStyle } from '../Style';
import { foregroundStyleToCSS, useForegroundStyleContext } from '../Modifiers/ForegroundStyle';
import { shapeStyleToCSS, ShapeStyleProps } from '../ShapeStyle';
import { useEnvironment } from '../Environment';
import { FitToParent } from '../Utils/FitToParent';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationNode } from '../AnimatableStyle';

interface CircleProps extends ShapeStyleProps {
    children?: React.ReactNode
    sizeThatFits?: (props: CircleProps) => { width: number, height: number }
}

function Circle(props: CircleProps): React.ReactElement {
    // Perform layout calculation
    const layout = useLayout(props, Circle);

    const foregroundStyleContext = useForegroundStyleContext();
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const circleStyle: React.CSSProperties = {
        ...useStyle(),
        ...layoutStyle(layout),
        aspectRatio: '1', /* Maintain 1:1 aspect ratio */
        flexGrow: 1,
        borderRadius: '50%', /* Makes it a circle */

        ...animationStyle,
    }

    /** Shape Style */
    const { fill, stroke } = props;
    const shapeStyle = shapeStyleToCSS({ fill, stroke } as ShapeStyleProps, environment.colorScheme);

    if (shapeStyle) {
        Object.assign(circleStyle, shapeStyle);
    } else if (foregroundStyleContext) {
        Object.assign(circleStyle, foregroundStyleToCSS(foregroundStyleContext, 'shape', environment.colorScheme));

        // Default background color        
    } else {
        Object.assign(circleStyle, {
            backgroundColor: '#222222',
        })
    }

    return (
        <FitToParent>
            <div ref={animationRef as React.Ref<HTMLDivElement>} style={circleStyle}></div>
        </FitToParent>

    )
}

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    Circle,
    sizeThatFits
);

export { Circle }

