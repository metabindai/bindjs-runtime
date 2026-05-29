import React from 'react';
import { useStyle } from '../Style';
import { AngularGradientStyle, angularGradientStyleToCSS } from '../Styles/AngularGradientStyle';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationNode } from '../AnimatableStyle';

/**
 * Props for the `AngularGradient` component.
 * Extends `AngularGradientStyle`
 */
interface AngularGradientProps extends AngularGradientStyle {

}

/**
 * `AngularGradient` is a React component that renders a conic (angular) gradient background
 * using standard CSS. It resolves colors using `colorNodeToCSS`, applies layout sizing, and
 * supports optional child content.
 *
 * @param props - AngularGradientProps object
 * 
 * @returns  A `div` element styled with a angular gradient background.
 * 
 * @example
 *     <AngularGradient
 *       colors={['red', 'yellow', 'green', 'blue', 'purple']}
 *       center={{ x: 0.5, y: 0.5 }}
 *       startAngle={0}
 *       endAngle={360}
 *     />
 */
export function AngularGradient(props: AngularGradientProps): React.ReactElement {

    // Perform layout calculation
    const layout = useLayout(props, AngularGradient);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Convert the props to a CSS conic-gradient string
    const css = angularGradientStyleToCSS(props);

    // Get the current style from context and apply the gradient
    const style = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply animation styles
        ...animationStyle,

        // Apply gradient background
        background: css,
    };

    return (
        <div style={style} ref={animationRef as React.Ref<HTMLDivElement>}>&nbsp;</div>
    );
}

/**
 * Computes the ideal size for the AngularGradient component.
 * Currently returns the proposed size or Infinity as fallback.
 */
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    AngularGradient,
    sizeThatFits
);

