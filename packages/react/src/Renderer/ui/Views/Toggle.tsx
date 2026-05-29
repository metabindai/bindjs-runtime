import React, { useState, useEffect } from 'react';
import Switch from 'react-ios-switch';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useStyle } from '../Style';
import { useAnimationNode } from '../AnimatableStyle';
import { useRendererContext } from '../../RendererContext';

export function Toggle(props: { isOn?: boolean, setIsOnId?: string }) {
    const { isOn, setIsOnId } = props
    const [checked, setChecked] = useState(false);
    const layout = useLayout({}, Toggle);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        ...useStyle(),
        ...layoutStyle(layout),
        ...animationStyle,
    };

    const functionCallback = useRendererContext().functionCallback

    const setIsOn = setIsOnId ? (value: boolean) => {
        const handler = functionCallback(setIsOnId)
        try {
            handler(value)
        } catch (error) {
            console.error(error)
        }
    } : undefined;

    return (
        <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
            <Switch checked={isOn == null ? checked : isOn} onChange={setIsOn == null ? setChecked : setIsOn} />
        </div>
    );
}

// Size calculation function
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: proposal
    };
}

layoutRegistry.register(
    Toggle,
    sizeThatFits
);