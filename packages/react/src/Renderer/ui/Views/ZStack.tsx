import React from 'react';
import styled from 'styled-components';
import { useStyle, ClearStyle } from '../Style';
import { px, getDomEvents } from "../../Utils";
import { useID, ClearID, ID } from '../Modifiers/ID';
import { unwrapGroupChildren } from './Group';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureChildren } from '../Layout/utils';
import { Alignment, alignmentMap } from '../Alignment';
import { useAnimationNode } from '../AnimatableStyle';

interface ZStackProps {
    className?: any;
    children: React.ReactNode[];
    alignment?: Alignment;
}

/**
 * ZStack component that overlays children on top of each other
 */
export function ZStack(props: ZStackProps): React.ReactElement {

    // Declare unique ID for the ZStack
    const id = useID();

    // Destructure props
    const { alignment, children: rawChildren, className } = props;

    // Perform layout calculation
    const layout = useLayout(props, ZStack);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Unwrap any children contained in a Group.
    // Avoid extra hierarchy and is important for sizing children.
    const children = unwrapGroupChildren(rawChildren)

    // Remap children using the utility function.
    // If a child's outermost modifier is `.id(value)`, use that as the React key
    // so siblings keep stable identity across re-orderings and can animate
    // between positions (e.g. a card stack shuffling). Falls back to index.
    const remappedChildren = React.Children.map(children, (child, index) => {
        const stableId = React.isValidElement(child) && child.type === ID
            ? (child.props as { rawValue?: string | number }).rawValue
            : undefined
        const key = stableId != null ? `id:${stableId}` : index
        return <ZStackElement key={key}>{child}</ZStackElement>
    });

    // Apply alignment (optional)
    const alignStyle =
        alignment && alignmentMap[alignment]
            ? {
                justifyContent: alignmentMap[alignment].justifyContent,
                alignItems: alignmentMap[alignment].alignItems,
            } : {};

    // Define style for the ZStack
    const style: React.CSSProperties = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

        // Apply alignment styles
        ...alignStyle,

        // Apply animation styles (transform, opacity, etc. when not animating)
        ...animationStyle,
    }

    const domEvents = getDomEvents(props);

    return (
        <LayoutNode layout={layout}>
            <ClearStyle>
                <ClearID>
                    <ZStackContent
                        ref={animationRef as React.Ref<HTMLDivElement>}
                        key={id}
                        id={id ? String(id) : undefined}
                        className={`zstack ${id} ${className ?? ''}`}
                        style={style}
                        {...domEvents}>
                        {remappedChildren}
                    </ZStackContent>
                </ClearID>
            </ClearStyle>
        </LayoutNode>
    )
}

const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    const nodeEnvironment = {
        layout: 'zstack'
    }

    // ZStack uses sizeForMaxChild logic - take the largest child dimensions
    let sizesOfChildren = measureChildren(children, proposal, environment, nodeEnvironment)

    var width: (number | null) = proposal.width
    var height: number | null = proposal.height

    var sizedChildrenWidth = 0
    var sizedChildrenHeight = 0

    /**
     * Determine width and height based on maximum child size
     */
    for (const measurement of sizesOfChildren) {
        const size = measurement.frame;
        if (size.width != null) {
            width = Math.max((width ?? 0), size.width)
            sizedChildrenWidth += 1
        }
        if (size.height != null) {
            height = Math.max((height ?? 0), size.height)
            sizedChildrenHeight += 1
        }
    }

    // Clamp to proposed width
    if (proposal.width && width && width > proposal.width) {
        width = proposal.width
    }

    // Clamp to proposed height
    if (proposal.height && height && height > proposal.height) {
        height = proposal.height
    }

    // If a child has no defined height, then dont clamp to sized one.
    const childLength = React.Children.count(children)
    if (sizedChildrenHeight != childLength && height != Infinity) {
        height = null
    }
    if (sizedChildrenWidth != childLength && width != Infinity) {
        width = null
    }

    return {
        environment: nodeEnvironment,
        frame: { width: width, height: height }
    }
}

layoutRegistry.register(
    ZStack,
    sizeThatFits
);

function ZStackElement({ children }) {
    return children
}

const ZStackContent = styled('div')`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    & > * {
        position: absolute !important;
    }
`;