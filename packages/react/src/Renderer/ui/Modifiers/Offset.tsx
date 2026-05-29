import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { AnimatableValuesProvider } from '../AnimatableStyle';

/**
 * Offset modifier
 * Applies x/y translation to a component
 */
interface OffsetProps {
    x?: number;
    y?: number;
    children: React.ReactNode;
}

export function Offset({ x, y, children }: OffsetProps): React.ReactNode {
    // Perform layout calculation
    const layout = useLayout({ x, y, children }, Offset);

    const style = {
        ...useStyle(),
    };

    const transforms: string[] = [];

    if (x != null) {
        transforms.push(`translateX(${x ?? 0}px)`);
    }
    if (y != null) {
        transforms.push(`translateY(${y ?? 0}px)`);
    }

    style.transform = [style.transform, ...transforms]
        .filter(Boolean)
        .join(" ");

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                <AnimatableValuesProvider values={{ x: x, y: y }}>
                    {children}
                </AnimatableValuesProvider>
            </LayoutNodeChildren>
        </StyleProvider>
    );
}
