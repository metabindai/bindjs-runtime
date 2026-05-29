import React from 'react';
import { useRendererContext } from '../../RendererContext';
import { useStyle, StyleProvider } from '../Style';
import { ActionsProvider } from '../Actions';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface OnHoverProps {
    handlerId: string;
    children: React.ReactNode[];
}

/**
 * OnHover modifier - triggers a callback when the user hovers over the component.
 * 
 * The callback receives a boolean indicating whether the mouse is hovering (true) or not (false).
 */
export function OnHover(props: OnHoverProps): React.ReactNode {
    const { handlerId, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, OnHover);

    const style = { ...useStyle() };

    const rendererContext = useRendererContext();

    const onMouseEnter = () => {
        const functionCallback = rendererContext.functionCallback;
        const hoverHandler = functionCallback(handlerId);
        if (hoverHandler) {
            hoverHandler(true);
        }
    };

    const onMouseLeave = () => {
        const functionCallback = rendererContext.functionCallback;
        const hoverHandler = functionCallback(handlerId);
        if (hoverHandler) {
            hoverHandler(false);
        }
    };

    return (
        <StyleProvider style={style}>
            <ActionsProvider actions={{ onMouseEnter, onMouseLeave }} gesture="onHover">
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </ActionsProvider>
        </StyleProvider>
    );
}
