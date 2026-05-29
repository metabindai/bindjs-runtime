import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import styled from 'styled-components';
import { LayoutNode, layoutRegistry, layoutStyle, useLayout, LayoutNodeChildren } from '../Layout';

/**
 * AllowsHitTesting
 * 
 * Controls whether a component responds to pointer events.
 * When false, the component and its descendants don't receive pointer events.
 * When true (default), pointer events work normally.
 */
interface AllowsHitTestingProps {
    rawValue: boolean;
    children?: React.ReactNode;
}

export function AllowsHitTesting(props: AllowsHitTestingProps): React.ReactNode {
    const { rawValue, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, AllowsHitTesting);
        
    const style : React.CSSProperties = { 
        ...layoutStyle(layout),
    }

    const layoutChildren = (
        <LayoutNodeChildren layout={layout}>{children}</LayoutNodeChildren>
    )
    
    // When rawValue is true, pointer events work normally
    // When rawValue is false, pointer events are disabled
    return rawValue == true ? layoutChildren : <HitTestContainer className="allow-hit-testing" style={style}>{layoutChildren}</HitTestContainer>;
}

const HitTestContainer = styled.div`
    pointer-events: none;

    * {
        pointer-events: none;
    }
`