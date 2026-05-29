import { useStyle } from '../Style';
import { LinearGradientStyle, linearGradientStyleToCSS } from '../Styles/LinearGradientStyle';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { layoutStyle } from '../Layout/layoutStyle';
import { useLayout } from '../Layout/useLayout';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationNode } from '../AnimatableStyle';

/**
 * Props for the `LinearGradient` component.
 * Extends `LinearGradientStyle` with optional `children`.
 */
interface LinearGradientProps extends LinearGradientStyle {

}

/**
 * `LinearGradient` is a React component that renders a `div` with a background
 * defined by a CSS linear gradient. The gradient is angle-based and derived
 * from unit coordinates (`startPoint` and `endPoint`).
 *
 * @param props - Gradient style and optional children for layout sizing.
 *
 * @returns A `div` element styled with a linear gradient background.
 *
 * @example
 * <LinearGradient
 *   colors={['#f00', '#00f']}
 *   startPoint={{ x: 0, y: 0 }}
 *   endPoint={{ x: 1, y: 1 }}
 * />
 */
export function LinearGradient(props: LinearGradientProps) {

    // Perform layout calculation
    const layout = useLayout(props, LinearGradient);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Convert the props to a CSS linear-gradient string
    const css = linearGradientStyleToCSS(props);

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

    // Render the gradient container
    return <div style={style} ref={animationRef as React.Ref<HTMLDivElement>}>&nbsp;</div>;
}

/**
 * Determines the size of the gradient component.
 * Falls back to infinite width/height if no constraints are provided.
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
    LinearGradient,
    sizeThatFits
);

