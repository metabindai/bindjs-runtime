import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { px } from '../../Utils';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * CornerRadius
 */
interface CornerRadiusProps {
    rawValue?: string;
    children: React.ReactNode[];
}

export function CornerRadius(props: CornerRadiusProps) {
    const { rawValue, children } = props;
    
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, CornerRadius);
    
    const style = {
        ...useStyle()
        // Note: StyleProvider doesn't create DOM element, so no layoutStyle needed
    };

    if (rawValue) {
        style.borderRadius = rawValue ? px(rawValue) : style.borderRadius;
        style.overflow = 'hidden';
    }

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </StyleProvider>
    );
}
