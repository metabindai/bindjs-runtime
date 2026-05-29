import { useEffect, useState } from 'react';
import { colorNodeToCSS } from '../Utils/colorNodeToCSS';
import { useEnvironment } from '../Environment';
import { LayoutMeasurement, layoutRegistry, useLayout } from '../Layout';
import { styled } from 'styled-components';
import { useAnimationNode } from '../AnimatableStyle';

export function Divider({ color }: { color?: React.ReactNode | undefined }) {
    const layout = useLayout({}, Divider);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();
    const environment = useEnvironment();

    const colorValue = colorNodeToCSS(color, environment.colorScheme);

    const borderColor = colorValue ?? 'var(--color-divider)';

    const axis = layout.environment?.layout === 'hstack' ? 'vertical' : 'horizontal';

    const DividerStyle = axis === 'horizontal' ? DividerHorizontalStyle : DividerVerticalStyle;

    return (
        <DividerStyle style={animationStyle} ref={animationRef as React.Ref<HTMLDivElement>} className={`divider ${axis}`} $borderColor={borderColor} />
    );
}

const DividerHorizontalStyle = styled.hr<{ $borderColor: string; }>`
    border: 0px;
    border-top: ${(props: { $borderColor: string; }) => `1px solid ${props.$borderColor}`};
    height: 1px;
    margin: 0px;
    width: 100%;
`

const DividerVerticalStyle = styled.div<{ $borderColor: string; }>`
    border: 0px;
    border-right: ${(props: { $borderColor: string; }) => `1px solid ${props.$borderColor}`};
    height: 100%;
    margin: 0px;
    width: 1px;
`

const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    if (environment.layout == 'hstack') {
        return {
            frame: { width: 1, height: Infinity }
        }
    } else {
        return {
            frame: { width: Infinity, height: 1 }
        }
    }
}

layoutRegistry.register(
    Divider,
    sizeThatFits
);
