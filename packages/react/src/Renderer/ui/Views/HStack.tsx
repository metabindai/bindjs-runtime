import React from 'react';
import styled from 'styled-components';
import { useStyle, ClearStyle, useEnvironmentStyle, EnvironmentStyleProvider, StyleProvider } from '../Style';
import { px, getDomEvents } from "../../Utils";
import { useID, ClearID } from '../Modifiers/ID';
import { unwrapGroupChildren, stackElements } from './Group';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import { StackLayoutChildren } from '../Layout/LayoutNode';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureChildren, knownMinimum } from '../Layout/utils';
import { getOffer, sharedLength, isKnownLength } from '../Layout/offer';
import { distributeStack } from '../Layout/stack';
import { VerticalAlignment, verticalAlignmentMap } from '../Alignment';
import { useAnimationNode } from '../AnimatableStyle';
import { ClearTextInputPadding } from '../Utils/textInputPadding';

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
                        <ClearTextInputPadding>
                            <StackLayoutChildren layout={layout}>
                                {wrappedChildren}
                            </StackLayoutChildren>
                        </ClearTextInputPadding>
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

    const measuringOffer = { width: sharedLength(getOffer(environment).width), height: getOffer(environment).height };
    let sizesOfChildren = measureChildren(children, proposal, environment, { ...nodeEnvironment, proposal: measuringOffer })

    // Offered a width in points, the stack shares it as SwiftUI does, least flexible
    // child first, when the layout pass knows every child's width (see stack.ts).
    const stackOffer = getOffer(environment).width;
    const elements = isKnownLength(stackOffer) ? stackElements(children) : null;
    const distribution = elements && isKnownLength(stackOffer) ? distributeStack({
        children: elements,
        measured: elements.length === React.Children.toArray(children).filter(React.isValidElement).length
            ? sizesOfChildren
            : measureChildren(elements, proposal, environment, { ...nodeEnvironment, proposal: measuringOffer }),
        axis: 'width',
        length: stackOffer,
        cross: measuringOffer.height,
        spacing: props.spacing ?? 8,
        proposal,
        environment: { ...environment, ...nodeEnvironment },
    }) : null;
    if (distribution) {
        sizesOfChildren = distribution.measurements
    }

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
        contentWidth += (props.spacing ?? 0) * (sizesOfChildren.length - 1)
    }

    if (contentWidth != null || width != null) {
        width = Math.max(contentWidth ?? 0, width ?? 0)
    }

    if (contentHeight != null || height != null) {
        height = Math.max(contentHeight ?? 0, height ?? 0)
    }

    var minHeight: number | null = null
    var minWidth: number | null = null

    // The measured children: a ForEach counts as its items.
    const childLength = sizesOfChildren.length

    if (sizedChildrenWidth != childLength && width != Infinity) {
        minWidth = width
        width = null
    }

    if (sizedChildrenHeight != childLength && height != Infinity) {
        minHeight = height
        height = null
    }

    // A flexible stack is at least as large as its children's known sizes:
    // their sum (and spacing) along the stack, the largest across it.
    if (height === Infinity) {
        const least = Math.max(0, ...sizesOfChildren.map((m) => knownMinimum(m.frame, 'height')))
        if (least > 0) minHeight = Math.max(minHeight ?? 0, least)
    }
    if (width === Infinity) {
        const least = sizesOfChildren.reduce((sum, m) => sum + knownMinimum(m.frame, 'width'), 0)
        if (least > 0) minWidth = Math.max(minWidth ?? 0, least + (props.spacing ?? 0) * (sizesOfChildren.length - 1))
    }

    // SwiftUI's stack proposes from its own proposal, not from the size its
    // children add up to: the children see at render what they were measured with.
    if (distribution) {
        width = distribution.length
        minWidth = null
    }

    const offer = measuringOffer;
    return {
        environment: { ...nodeEnvironment, offer },
        subviews: sizesOfChildren,
        frame: { width: width, height: height, minWidth: minWidth, minHeight: minHeight },
        childOffers: distribution?.offers,
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
