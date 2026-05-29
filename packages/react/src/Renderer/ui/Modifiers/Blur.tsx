import React from 'react';
import { useStyle, StyleProvider } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';
import { AnimatableValuesProvider } from '../AnimatableStyle';

/**
 * Blur
 *
 * Applies a blur filter to the wrapped component. The radius is contributed
 * to the AnimatableValues system so transitions under `withAnimation`
 * smoothly interpolate the blur amount instead of snapping.
 *
 * Stacks additively with any other Blur modifiers in the chain
 * (filter: blur(2px) + blur(3px) ≈ blur(5px)).
 */
interface BlurProps {
    rawValue?: number;
    radius?: number;
    _0?: number;
    children: React.ReactNode;
}

export function Blur(props: BlurProps): React.ReactElement {
    const { rawValue, radius, _0, children } = props;

    // Perform layout calculation
    const layout = useLayout(props, Blur);

    const blurRadius = _0 ?? rawValue ?? radius ?? 0;

    // Compose with any filter coming from a parent style so the static
    // (non-animated) render still produces the right CSS.
    const parentStyle = useStyle();
    const inheritedFilter = (parentStyle as React.CSSProperties).filter;
    const composedFilter = blurRadius > 0
        ? [inheritedFilter, `blur(${blurRadius}px)`].filter(Boolean).join(' ')
        : inheritedFilter;

    const style: React.CSSProperties = {
        ...parentStyle,
        ...(composedFilter ? { filter: composedFilter } : {}),
    };

    return (
        <StyleProvider style={style}>
            <LayoutNodeChildren layout={layout}>
                <AnimatableValuesProvider values={{ blur: blurRadius }}>
                    {children}
                </AnimatableValuesProvider>
            </LayoutNodeChildren>
        </StyleProvider>
    );
}
