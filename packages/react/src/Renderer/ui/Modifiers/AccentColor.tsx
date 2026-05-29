import React from 'react';
import { EnvironmentStyleProvider, useEnvironmentStyle } from '../Style';
import { LayoutNode, layoutRegistry, layoutStyle, useLayout, LayoutNodeChildren } from '../Layout';

export function AccentColor(props: {
    rawValue: React.ReactNode,
    children: React.ReactNode
}) {
    const { rawValue, children } = props;

    const envStyle = { ...useEnvironmentStyle() };
    envStyle.accentColor = rawValue;

    // Perform layout calculation
    const layout = useLayout(props, AccentColor, { hasDOMElement: false });

    return (
        <EnvironmentStyleProvider style={envStyle}>
            <LayoutNodeChildren layout={layout}>{children}</LayoutNodeChildren>
        </EnvironmentStyleProvider>
    );
}