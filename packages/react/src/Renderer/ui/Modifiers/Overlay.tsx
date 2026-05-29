import React from 'react';
import styled from 'styled-components';
import { alignmentMap, Alignment } from '../Alignment';
import { useLayout, layoutStyle, LayoutNode, layoutRegistry, LayoutMeasurement, LayoutNodeChildren } from '../Layout';
import { measureMaxChild } from '../Layout/utils';

/**
 * Overlay
 *
 * Places overlay content (`content` or `rawValue`) on top of one or more `children`
 * while maintaining the same layout bounds.
 *
 * Mirrors SwiftUI’s `.overlay(...)` modifier semantics.
 *
 * - The container (outer <div>) takes on the size of its children.
 * - The overlay content is absolutely positioned and fills that same size.
 * - Pointer events are disabled on the overlay to let underlying content remain interactive.
 */
interface OverlayProps {
    rawValue?: string;
    alignment?: Alignment;
    content: React.ReactNode;
    children: React.ReactNode[];
}

export function Overlay(props: OverlayProps): React.ReactNode {
    const { rawValue, alignment, content, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, Overlay);

    // --- Handle legacy props ---
    // Prefer `content`; fall back to `rawValue`.    
    const overlayContent = content ?? rawValue;

    // Size overlay element to the item it's being applied to
    const style: React.CSSProperties = {
        position: 'relative',
        ...layoutStyle(layout)
    };

    // Inner overlay content.
    const overlayItemStyle: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        top: 0,
        left: 0,
        // Apply alignment
        ...alignmentMap[alignment ?? 'center'],
    };

    return (
        <LayoutNode layout={layout}>
            <div style={style} className="overlay">
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
                <OverlayItemFrame style={overlayItemStyle} className="overlay-item">
                    <LayoutNode layout={null}>
                        {overlayContent}
                    </LayoutNode>
                </OverlayItemFrame>
            </div>
        </LayoutNode>
    );
}

/**
 * Prevent pointer events from reaching overlay positioning frame, but allow its children to receive pointer events.
 */
const OverlayItemFrame = styled.div`  
    pointer-events: none;
    & * {
        pointer-events: initial;
    }
`