import { useStyle } from '../Style';
import { EllipticalGradientStyle, ellipticalGradientStyleToCSS } from '../Styles/EllipticalGradientStyle';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';

interface EllipticalGradientProps extends EllipticalGradientStyle {

}

/**
 * `EllipticalGradient` is a React component that renders a radial gradient background
 * with an elliptical shape. It supports customizable color stops, center position,
 * and start/end radii, using unit coordinates.
 * 
 * @param props - EllipticalGradientProps including `colors`, `center`, `startRadius`, and `endRadius`
 * @returns A styled <div> with the computed elliptical radial gradient
 *
 * @example
 * ```tsx
 * <EllipticalGradient
 *   colors={['purple', 'cyan']}
 *   center={{ x: 0.5, y: 0.5 }}
 *   startRadius={0}
 *   endRadius={1}
 * />
 * ```
 */
export function EllipticalGradient(props: EllipticalGradientProps) {

    const layout = useLayout(props, EllipticalGradient);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Convert the props to a CSS linear-gradient string
    const css = ellipticalGradientStyleToCSS(props);

    // Get the current style from context and apply the gradient
    const style = {
        ...useStyle(),

        ...layoutStyle(layout),

        ...animationStyle,

        background: css,
    };

    // Render the gradient container
    return <div style={style} ref={animationRef as React.Ref<HTMLDivElement>}>&nbsp;</div>
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
    EllipticalGradient,
    sizeThatFits
);