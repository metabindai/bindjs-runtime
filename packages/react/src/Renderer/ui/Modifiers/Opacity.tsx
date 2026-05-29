import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { AnimatableValuesProvider } from '../AnimatableStyle';

/**
 * Opacity modifier
 * Controls the opacity of a component and its children
 */
interface OpacityProps {
    rawValue: number;
    children?: React.ReactNode;
}

export function Opacity({ rawValue, children }: OpacityProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, Opacity);

    const style = {
        ...useStyle()
    };

    style.opacity = rawValue;

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                <AnimatableValuesProvider values={{ opacity: rawValue }}>
                    {children}
                </AnimatableValuesProvider>
            </LayoutNodeChildren>
        </StyleProvider>
    );
}
