import React from 'react';
import { useRendererContext } from '../../RendererContext';
import { useStyle, useStyleRef, StyleProvider } from '../Style';
import { useLastGestureState } from '../GestureState';
import { ActionsProvider } from '../Actions';
import { useLayout, LayoutNode, LayoutNodeChildren } from '../Layout';

interface OnTapGestureProps {
    value?: string;
    handlerId: string;
    children: React.ReactNode[];
}

export function OnTapGesture(props: OnTapGestureProps): React.ReactNode {
    const { handlerId, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, OnTapGesture);

    const style = { ...useStyle() }

    const rendererContext = useRendererContext()
    const [lastGestureState, _] = useLastGestureState();

    const onClick = () => {

        // Cancel onclick if last gesture just occured and was a drag.
        const lastState = lastGestureState.current
        const diff = (Date.now() - lastState.time)
        if (diff < 10 && lastState.type == 'OnDrag') {
            return
        }

        // Otherwise execute the handler
        const functionCallback = rendererContext.functionCallback
        const clickHandler = functionCallback(handlerId)
        if (clickHandler) {
            clickHandler()
        }
    }

    style['cursor'] = style['cursor'] ?? 'pointer';

    return (
        <StyleProvider style={style}>
            <ActionsProvider actions={{ onClick }} gesture="onTap">
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </ActionsProvider>
        </StyleProvider>
    )
}
