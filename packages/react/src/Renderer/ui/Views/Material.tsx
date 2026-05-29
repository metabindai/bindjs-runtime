import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { MaterialType, MaterialStyle, materialStyleToCSS } from '../Styles/MaterialStyle';
import { useEnvironment } from '../Environment';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode, LayoutNodeChildren } from '../Layout';
import { useAnimationNode } from '../AnimatableStyle';

interface MaterialProps {
    content?: React.ReactNode;
    rawValue?: MaterialType | MaterialStyle;
    children?: React.ReactNode;
}

/**
 * Material component that applies a material effect (blur + tint) based on SwiftUI materials
 * Similar to the iOS/macOS system materials used for backgrounds
 */
export function Material(props: MaterialProps) {
    // Perform layout   
    const layout = useLayout(props, Material);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const content = props.content;
    const environment = useEnvironment();

    // Get the material value from props
    const materialValue = props.rawValue || 'regular';

    // Convert the material to CSS properties
    const materialCSS = materialStyleToCSS(materialValue, environment.colorScheme);

    // Apply the material CSS properties to the style
    const style = {
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply animation styles
        ...animationStyle,

        // Apply material styles
        ...materialCSS,
    };

    // If content is provided, apply the material as a background
    if (content) {
        return (
            <StyleProvider style={style}>
                <LayoutNodeChildren layout={layout}>
                    {content}
                </LayoutNodeChildren>
            </StyleProvider>
        );
    }
    // Otherwise render the material as a standalone element
    else {
        return <div style={style} className="material" ref={animationRef as React.Ref<HTMLDivElement>}>&nbsp;</div>;
    }
}

// Size that fits implementation for layout system
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    Material,
    sizeThatFits
);