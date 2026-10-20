import React from 'react';
import { useLayout, LayoutNodeChildren, layoutStyle } from '../Layout';
import { Environment } from '../Environment';

/**
 * Disabled modifier
 * Preserves inherited environment while disabling the entire subtree.
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
                <div {...{ inert: '' }} aria-disabled="true" style={{ ...layoutStyle(layout), opacity: 0.5, pointerEvents: 'none' }}>
                    <LayoutNodeChildren layout={layout}>
                        {children}
                    </LayoutNodeChildren>
                </div>
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
