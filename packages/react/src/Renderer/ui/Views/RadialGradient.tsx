import { useStyle } from '../Style';
import { RadialGradientStyle, radialGradientStyleToCSS } from '../Styles/RadialGradientStyle';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';

interface RadialGradientProps extends RadialGradientStyle {

}

/**
 * `RadialGradient` is a React component that renders a CSS-based radial gradient background.
 * It supports custom color stops and positioning using unit coordinates.
 * 
 * @param props - RadialGradientProps object defining color stops, center, and optional radius parameters
 * @returns A styled <div> with the computed radial-gradient background
 *
 * @example
 * ```tsx
 * <RadialGradient
 *   colors={['red', 'blue']}
 *   center={{ x: 0.5, y: 0.5 }}
 *   startRadius={0}
 *   endRadius={1}
 * />
 * ```
 */
export function RadialGradient(props: RadialGradientProps) {
    // Perform layout calculation
    const layout = useLayout(props, RadialGradient);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Convert the props to a CSS radial-gradient string
    const css = radialGradientStyleToCSS(props);

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

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    RadialGradient,
    sizeThatFits
);

