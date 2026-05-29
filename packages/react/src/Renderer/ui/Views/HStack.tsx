import React from 'react';
import styled from 'styled-components';
import { useStyle, ClearStyle, useEnvironmentStyle, EnvironmentStyleProvider, StyleProvider } from '../Style';
import { px, getDomEvents } from "../../Utils";
import { useID, ClearID } from '../Modifiers/ID';
import { unwrapGroupChildren } from './Group';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { LayoutNodeChildren, LayoutNode } from '../Layout/LayoutNode';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureChildren } from '../Layout/utils';
import { VerticalAlignment, verticalAlignmentMap } from '../Alignment';
import { useAnimationNode } from '../AnimatableStyle';

interface HStackProps {
    spacing?: number;
    alignment?: VerticalAlignment;
    children: React.ReactNode[];
}

/**
 * HStack component that arranges children horizontally
 */
export function HStack(props: HStackProps): React.ReactElement {

    // Declare unique ID for the HStack
    const id = useID();

    // Destructure props
    const { spacing, alignment, children: rawChildren } = props;

    // Perform layout calculation
    const layout = useLayout(props, HStack);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Unwrap any children contained in a Group.
    // Avoid extra hierarchy and is important for sizing children.
    const children = unwrapGroupChildren(rawChildren)

    // Determine vertical alignment
    const verticalAlignment: string = verticalAlignmentMap[alignment || 'center'];

    // Define style for the HStack
    const style: React.CSSProperties = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply gap between elements
        gap: px(spacing ?? 8),

        // Apply alignment
        alignItems: verticalAlignment,

        // Apply animation styles (transform, opacity, etc. when not animating)
        ...animationStyle,
    }

    // Get environment style for scroll target layout
    const envStyle = useEnvironmentStyle();

    // Reset scrollTargetLayout for nested children
    const childEnvStyle = {
        ...envStyle,
        scrollTargetLayout: null
    };

    const domEvents = getDomEvents(props);

    // If scrollTargetLayout is set, wrap each child in StyleProvider with scroll-snap-align
    var wrappedChildren = children
    if (envStyle.scrollTargetLayout) {
        const scrollPadding = envStyle.scrollPadding;

        wrappedChildren = React.Children.map(children, (child) => {
            return (
                <StyleProvider
                    key={scrollTargetKey(child)}
                    style={{
                        scrollSnapAlign: 'start',
                        scrollMarginLeft: scrollPadding?.left ? scrollPadding.left : undefined,
                    }}
                >
                    {child}
                </StyleProvider>
            );
        });
    }

    return (
        <ClearStyle>
            <ClearID>
                <HStackContent
                    ref={animationRef as React.Ref<HTMLDivElement>}
                    key={id}
                    id={id ? String(id) : undefined}
                    className={`hstack ${id}`}
                    style={style}
                    {...domEvents}>
                    <EnvironmentStyleProvider style={childEnvStyle}>
                        <LayoutNodeChildren layout={layout}>
                            {wrappedChildren}
                        </LayoutNodeChildren>
                    </EnvironmentStyleProvider>
                </HStackContent>
            </ClearID>
        </ClearStyle>
    )
}

function scrollTargetKey(child: React.ReactNode): React.Key {
    if (React.isValidElement(child)) {
        const props = child.props as any;
        return child.key ?? props.id ?? props.rawValue ?? props.name ?? String(child.type);
    }

    return String(child);
}

const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    const nodeEnvironment = {
        layout: 'hstack'
    }

    let sizesOfChildren = measureChildren(children, proposal, environment, nodeEnvironment)

    var width: (number | null) = proposal.width
    var height: number | null = proposal.height

    var sizedChildrenWidth = 0
    var sizedChildrenHeight = 0

    /**
     * Determine width and height of children
     */
    var contentWidth: (number | null) = null
    var contentHeight: number | null = null

    for (const measurement of sizesOfChildren) {
        const size = measurement.frame;
        if (size.width != null) {
            if (size.width == Infinity || contentWidth == Infinity) {
                contentWidth = Infinity
            } else {
                if (contentWidth == null) { contentWidth = 0 }
                contentWidth += size.width
                sizedChildrenWidth += 1
            }
        }

        if (size.height != null) {
            contentHeight = Math.max(size.height, contentHeight ?? 0)
            if (size.height != Infinity) {
                sizedChildrenHeight += 1
            }
        }
    }

    if (contentWidth != null) {
        contentWidth += (props.spacing ?? 0) * (children.length - 1)
    }

    if (contentWidth != null || width != null) {
        width = Math.max(contentWidth ?? 0, width ?? 0)
    }

    if (contentHeight != null || height != null) {
        height = Math.max(contentHeight ?? 0, height ?? 0)
    }

    var minHeight: number | null = null
    var minWidth: number | null = null

    const childLength = React.Children.count(children)

    if (sizedChildrenWidth != childLength && width != Infinity) {
        minWidth = width
        width = null
    }

    if (sizedChildrenHeight != childLength && height != Infinity) {
        minHeight = height
        height = null
    }

    return {
        environment: nodeEnvironment,
        subviews: sizesOfChildren,
        frame: { width: width, height: height, minWidth: minWidth, minHeight: minHeight }
    }
}

layoutRegistry.register(
    HStack,
    sizeThatFits
);

const HStackContent = styled('div')`
    display: flex;
    flex-direction: row;
    justify-content: center;
    box-sizing: content-box;
`;
