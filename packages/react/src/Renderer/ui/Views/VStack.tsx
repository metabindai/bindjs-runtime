import React from 'react';
import styled from 'styled-components';
import { useStyle, ClearStyle, useEnvironmentStyle, EnvironmentStyleProvider, StyleProvider } from '../Style';
import { px, getDomEvents } from "../../Utils";
import { useID, ClearID } from '../Modifiers/ID';
import { unwrapGroupChildren, stackElements } from './Group';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { StackLayoutChildren } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureChildren, knownMinimum } from '../Layout/utils';
import { getOffer, sharedLength, isKnownLength } from '../Layout/offer';
import { distributeStack, groupOffers, stackSpacing } from '../Layout/stack';
import { HorizontalAlignment, horizontalAlignmentMap } from '../Alignment';
import { useAnimationNode } from '../AnimatableStyle';
import { ClearTextInputPadding } from '../Utils/textInputPadding';

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
        gap: px(stackSpacing(spacing)),

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
            // An empty child stays empty: wrapped, it would count as a child.
            if (!React.isValidElement(child)) return child;
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
                        <ClearTextInputPadding>
                            <StackLayoutChildren layout={layout}>
                                {wrappedChildren}
                            </StackLayoutChildren>
                        </ClearTextInputPadding>
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

    const measuringOffer = { height: sharedLength(getOffer(environment).height), width: getOffer(environment).width };
    let sizesOfChildren = measureChildren(children, proposal, environment, { ...vstackEnvironment, proposal: measuringOffer })

    // Offered a height in points, the stack shares it as SwiftUI does, least flexible
    // child first, when the layout pass knows every child's height (see stack.ts).
    const stackOffer = getOffer(environment).height;
    // A ForEach's rows count as children, as measureChildren measures them.
    const elements = isKnownLength(stackOffer) ? stackElements(children, environment?.expandForEach) : null;
    const distribution = elements && isKnownLength(stackOffer) ? distributeStack({
        children: elements.items,
        measured: unwrapGroupChildren(children) === children
            ? sizesOfChildren
            : measureChildren(elements.items, proposal, environment, { ...vstackEnvironment, proposal: measuringOffer }),
        axis: 'height',
        length: stackOffer,
        cross: measuringOffer.width,
        spacing: stackSpacing(props.spacing),
        proposal,
        environment: { ...environment, ...vstackEnvironment },
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
        contentHeight += stackSpacing(props.spacing) * (sizesOfChildren.length - 1)
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
        // Validate if needed. Causing issues when in a vstack with infinity siblings.
        //minHeight = height
        height = null
    }

    // A flexible stack is at least as large as its children's known sizes:
    // their sum (and spacing) along the stack, the largest across it.
    if (width === Infinity) {
        const least = Math.max(0, ...sizesOfChildren.map((m) => knownMinimum(m.frame, 'width')))
        if (least > 0) minWidth = Math.max(minWidth ?? 0, least)
    }
    if (height === Infinity) {
        const least = sizesOfChildren.reduce((sum, m) => sum + knownMinimum(m.frame, 'height'), 0)
        if (least > 0) minHeight = Math.max(minHeight ?? 0, least + stackSpacing(props.spacing) * (sizesOfChildren.length - 1))
    }

    // SwiftUI's stack proposes from its own proposal, not from the size its
    // children add up to: the children see at render what they were measured with.
    if (distribution) {
        height = distribution.length
        minHeight = null
    }

    const offer = measuringOffer;
    return {
        environment: { ...vstackEnvironment, offer },
        subviews: sizesOfChildren,
        frame: { width: width, height: height, minWidth: minWidth, minHeight: minHeight },
        childOffers: distribution && elements ? groupOffers(distribution.offers, elements.shape) : undefined,
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
