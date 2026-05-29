import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { ColorStyle, colorStyleToCSS } from '../Styles/ColorStyle';
import { useEnvironment } from '../Environment';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { LayoutNodeChildren } from '../Layout/LayoutNode';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { useAnimationNode } from '../AnimatableStyle';

interface ColorProps {
    content?: React.ReactNode;
    opacity?: number;
    environmentId?: string;
    rawValue?: ColorStyle;
}

/**
 * The Color component that renders a color swatch or applies a color as background
 */
export function Color(props: ColorProps): React.ReactElement {
    // Perform layout calculation
    const layout = useLayout(props, Color);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    var style = {
        ...useStyle(),
        ...layoutStyle(layout),
        ...animationStyle
    };

    const content = props.content;
    const environment = useEnvironment();

    const input = props.rawValue ?? props;
    const color = colorStyleToCSS(input as ColorStyle, props.opacity, environment.colorScheme);

    if (color) {
        style.backgroundColor = color;
    }

    // If content is passed, apply the color as a background color style
    if (content) {
        return (
            <StyleProvider style={style}>
                <LayoutNodeChildren layout={layout}>
                    {content}
                </LayoutNodeChildren>
            </StyleProvider>
        );
        // Otherwise present the color
    } else {
        return (
            <div style={style} ref={animationRef as React.Ref<HTMLDivElement>}>&nbsp;</div>
        );
    }
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
    Color,
    sizeThatFits
);
