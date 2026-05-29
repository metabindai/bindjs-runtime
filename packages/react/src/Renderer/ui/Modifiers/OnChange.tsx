import React, { useEffect, useRef } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useLayout, LayoutNodeChildren } from '../Layout';

interface OnChangeProps {
    value: any;
    handlerId: string;
    children: React.ReactNode[];
}

export function OnChange(props: OnChangeProps): React.ReactNode {
    const { value, handlerId, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, OnChange, { hasDOMElement: false });
    const functionCallback = useRendererContext().functionCallback;

    // Store previous value to compare and pass to handler
    const previousValueRef = useRef(value);

    useEffect(() => {
        // If the value has changed
        if (previousValueRef.current !== value) {
            const handler = functionCallback(handlerId);
            const oldValue = previousValueRef.current;

            // Update previous value ref
            previousValueRef.current = value;

            try {
                // Call handler with [oldValue, newValue]
                if (handler && typeof handler === 'function') {
                    handler([oldValue, value]);
                }
            } catch (e) {
                console.error('OnChange: Error in handler: ', e);
            }
        }
    }, [value, handlerId]);

    return (
        <LayoutNodeChildren layout={layout}>
            {children}
        </LayoutNodeChildren>
    );
}
