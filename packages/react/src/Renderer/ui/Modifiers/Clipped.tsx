import React from 'react';
import { useStyle, ClearStyle } from '../Style';
import { useLayout, layoutStyle, LayoutNode, layoutRegistry } from '../Layout';
import type { LayoutMeasurement } from '../Layout';
import { measureMaxChild } from '../Layout/utils';
import { useAnimationNode } from '../AnimatableStyle';

/**
 * clipped(): clips the content to the view's layout bounds.
 *
 * It draws its own element, laid out like padding(0), instead of putting
 * overflow: hidden on the child: a child's own transform (rotationEffect,
 * scaleEffect, offset) is drawn by the child's element, which can't clip
 * itself, and SwiftUI clips that drawing to the untransformed frame.
 */
export function Clipped(props: { children?: React.ReactNode }): React.ReactNode {
    const layout = useLayout(props, Clipped);
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        // clipped() never changes its content's size, but overflow: hidden makes a
        // flex item's automatic minimum 0, so a flex parent could shrink the box
        // below its content. min-content restores that minimum: a natural-size
        // image keeps its size and flexible content still shares space.
        minWidth: 'min-content',
        minHeight: 'min-content',
        ...useStyle(),
        ...layoutStyle(layout),
        ...animationStyle,
        overflow: 'hidden',
    };

    return (
        <LayoutNode layout={layout}>
            <ClearStyle>
                <div className="clipped" ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
                    {props.children}
                </div>
            </ClearStyle>
        </LayoutNode>
    );
}

const sizeThatFits = ({ proposal, children, environment }): LayoutMeasurement => ({
    frame: measureMaxChild({ children, proposal, environment: environment ?? {}, nodeEnvironment: {} }),
});

layoutRegistry.register(Clipped, sizeThatFits);
