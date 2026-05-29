import React from 'react';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { Environment } from '../Environment';

/**
 * Disabled modifier
 * Controls disabled state through Variables context
 */
interface DisabledProps {
    rawValue?: boolean;
    children: React.ReactNode;
}

export function Disabled({ rawValue, children }: DisabledProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, Disabled);
    
    if (rawValue == null || rawValue == true) {
        return (
            <Environment values={{ isEnabled: false }}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </Environment>
        );
    } else {
        return (
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        );
    }
}