import React from 'react';
import { useStyle, ClearStyle } from '../Style';
import { measureChildren } from '../Layout/utils';
import { useAnimationContext, cssForAnimation } from '../AnimationContext';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { LayoutFrameType } from '../Layout/LayoutTypes';
import { alignmentMap } from '../Alignment';
import { AnimatableValuesProvider, useAnimationNode } from '../AnimatableStyle';

/**
 * Frame
 */
export function Frame(props) {

    // Destructure props
    const { children, alignment } = props;

    // Perform layout calculation
    const layout = useLayout(props, Frame);

    // Get the sizeThatFits result for the frame
    const style: React.CSSProperties = {
        // Apply flex box for alignment
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),
    }

    // Fix for the alignment switch statement
    // TODO: Replace with alignment map
    if (alignment) {
        Object.assign(style, {
            ...alignmentMap[alignment]
        });
    }

    var animationValues = {
        width: layout.frame.width,
        height: layout.frame.height
    }

    return (
        <LayoutNode layout={layout}>
            <AnimatableValuesProvider values={animationValues}>
                <AnimatedFrame style={style}>{children}</AnimatedFrame>
            </AnimatableValuesProvider>
        </LayoutNode>
    )
}

function AnimatedFrame(props) {
    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const children = props.children;

    // Get the sizeThatFits result for the frame
    const style: React.CSSProperties = {
        ...props.style,
    }

    return (
        <ClearStyle>
            <div className="frame" ref={animationRef as React.Ref<HTMLDivElement>} style={style}>{children}</div>
        </ClearStyle>
    )
}

const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {

    let v: LayoutFrameType = {
        width: props.width ?? proposal.width,
        height: props.height ?? proposal.height,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        maxHeight: props.maxHeight,
        maxWidth: props.maxWidth,
        alignment: props.alignment
    }

    const nodeEnvironment = {
        frame: v,
        layout: 'frame'
    }

    const sizesOfChildren = measureChildren(children, proposal, environment, nodeEnvironment);

    var contentWidth: number | null = null
    var contentHeight: number | null = null

    sizesOfChildren.forEach((layoutResult) => {
        const size = layoutResult.frame;
        if (size.width) {
            contentWidth = Math.max((contentWidth ?? 0), size.width)
        }
        if (size.height) {
            contentHeight = Math.max((contentHeight ?? 0), size.height)
        }
    })

    if (v.width == null && contentWidth != null) {
        v.width = contentWidth
    }

    if (v.height == null && contentHeight != null) {
        v.height = contentHeight
    }

    // Push width out to infinity when max width is specified.
    // Then css with enforce the max width.
    if (props.maxWidth) {
        v.width = Infinity
    }

    if (props.maxHeight) {
        v.height = Infinity
    }

    if (props.maxWidth != null && proposal.width > props.maxWidth) {
        v.width = props.maxWidth
    }

    if (props.maxHeight != null && v.height != null && proposal.height > props.maxHeight) {
        v.height = props.maxHeight
    }

    return {
        environment: nodeEnvironment,
        frame: v
    }
}

layoutRegistry.register(Frame, sizeThatFits);

function FlexFrame(props) {
    return Frame(props);
}

layoutRegistry.register(FlexFrame, sizeThatFits);
