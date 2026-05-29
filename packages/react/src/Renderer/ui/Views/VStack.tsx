import React from 'react';
import styled from 'styled-components';
import { useStyle, ClearStyle, useEnvironmentStyle, EnvironmentStyleProvider, StyleProvider } from '../Style';
import { px, getDomEvents } from "../../Utils";
import { useID, ClearID } from '../Modifiers/ID';
import { unwrapGroupChildren } from './Group';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode, LayoutNodeChildren } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureChildren } from '../Layout/utils';
import { HorizontalAlignment, horizontalAlignmentMap } from '../Alignment';
import { useAnimationNode } from '../AnimatableStyle';

interface VStackProps {
    spacing?: number;
    alignment?: HorizontalAlignment;
    children: React.ReactNode[];
}

/**
 * VStack component that arranges children vertically
 */
export function VStack(props: VStackProps): React.ReactElement {

    // Declare unique ID for the VStack
    const id = useID();

    // Destructure props
    const { spacing, alignment, children: rawChildren } = props;

    // Perform layout calculation
    const layout = useLayout(props, VStack);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Unwrap any children contained in a Group.
    // Avoid extra hierarchy and is important for sizing children.
    const children = unwrapGroupChildren(rawChildren)

    // Determine horizontal alignment
    const horizontalAlignment: string = horizontalAlignmentMap[alignment || 'center'];

    // Define style for the VStack
    const style: React.CSSProperties = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply gap between elements
        gap: px(spacing ?? 8),

        // Apply alignment
        alignItems: horizontalAlignment,

        // Apply animation styles (transform, opacity, etc. when not animating)
        ...animationStyle,
    }

    // Get environment style for scroll target layout
    const envStyle = useEnvironmentStyle();

    if (style['_container'] == 'scrollview') {
        delete style.height;
    }

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
        const childCount = React.Children.count(children);

        wrappedChildren = React.Children.map(children, (child, index) => {
            const isFirst = index === 0;
            const isLast = index === childCount - 1;

            return (
                <StyleProvider
                    key={scrollTargetKey(child)}
                    style={{
                        scrollSnapAlign: 'start',
                        // Apply scroll margin from padding on first/last items
                        scrollMarginTop: isFirst && scrollPadding?.top ? scrollPadding.top : undefined,
                        scrollMarginBottom: isLast && scrollPadding?.bottom ? scrollPadding.bottom : undefined,
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
                <VStackContent
                    ref={animationRef as React.Ref<HTMLDivElement>}
                    key={id}
                    id={id ? String(id) : undefined}
                    className={`vstack ${id}`}
                    style={style}
                    {...domEvents}>
                    <EnvironmentStyleProvider style={childEnvStyle}>
                        <LayoutNodeChildren layout={layout}>
                            {wrappedChildren}
                        </LayoutNodeChildren>
                    </EnvironmentStyleProvider>
                </VStackContent>
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
    const vstackEnvironment = {
        layout: 'vstack'
    }

    let sizesOfChildren = measureChildren(children, proposal, environment, vstackEnvironment)

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
        if (size.height != null) {
            if (size.height == Infinity || contentHeight == Infinity) {
                contentHeight = Infinity
            } else {
                if (contentHeight == null) { contentHeight = 0 }
                contentHeight += size.height
                sizedChildrenHeight += 1
            }
        }

        if (size.width != null) {
            contentWidth = Math.max(size.width, contentWidth ?? 0)
            if (size.width != Infinity) {
                sizedChildrenWidth += 1
            }
        }
    }

    if (contentHeight != null) {
        contentHeight += (props.spacing ?? 0) * (children.length - 1)
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
        // Validate if needed. Causing issues when in a vstack with infinity siblings.
        //minHeight = height
        height = null
    }

    return {
        environment: vstackEnvironment,
        subviews: sizesOfChildren,
        frame: { width: width, height: height, minWidth: minWidth, minHeight: minHeight }
    }
}

layoutRegistry.register(
    VStack,
    sizeThatFits
);

const VStackContent = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: content-box;
`;
