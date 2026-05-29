import React, { useEffect } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface OnDisappearProps {
    handlerId: string;
    children: React.ReactNode[];
}

export function OnDisappear(props: OnDisappearProps): React.ReactNode {
    const { handlerId, children } = props;
    
    // Perform layout calculation
    const layout = useLayout(props, OnDisappear, { hasDOMElement: false });
    const functionCallback = useRendererContext().functionCallback
        
    useEffect(() => {
        return () => {
            const handler = functionCallback(handlerId)
            console.log('OnDisappear:', handler)
            try {
                handler()
            } catch (e) {
                console.error('OnDisappear: Error in handler: ', e)
            }
        }
    }, [])

    return (
        <LayoutNodeChildren layout={layout}>
            {children}
        </LayoutNodeChildren>
    );
}