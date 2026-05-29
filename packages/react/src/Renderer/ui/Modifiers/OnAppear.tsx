import React, { useEffect } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface OnAppearProps {
    handlerId: string;
    children: React.ReactNode[];
}

export function OnAppear(props: OnAppearProps): React.ReactNode {
    const { handlerId, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, OnAppear, { hasDOMElement: false });
    const functionCallback = useRendererContext().functionCallback

    useEffect(() => {
        const handler = functionCallback(handlerId)

        try {
            handler()
        } catch (e) {
            console.error('OnAppear: Error in handler: ', e)
        }
    }, [handlerId])

    return (
        <LayoutNodeChildren layout={layout}>
            {children}
        </LayoutNodeChildren>
    );
}
