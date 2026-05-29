import React, { useState } from 'react';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle } from '../Layout';
import { useStyle } from '../Style';
import { useAnimationNode } from '../AnimatableStyle';
import { useRendererContext } from '../../RendererContext';

interface SliderProps {
    value?: number;
    setValueId?: string;
    range?: [number, number];
    lowerBound?: number;
    upperBound?: number;
    step?: number | null;
    label?: string;
    minimumValueLabel?: React.ReactNode;
    maximumValueLabel?: React.ReactNode;
}

export function Slider(props: SliderProps) {
    const {
        value: controlledValue,
        setValueId,
        step,
        label,
        minimumValueLabel,
        maximumValueLabel,
    } = props;

    const bounds = props.range;
    const lowerBound = bounds ? bounds[0] : (props.lowerBound ?? 0);
    const upperBound = bounds ? bounds[1] : (props.upperBound ?? 1);

    const [localValue, setLocalValue] = useState(lowerBound);
    const layout = useLayout({}, Slider);
    const { ref: animationRef, style: animationStyle } = useAnimationNode();
    const functionCallback = useRendererContext().functionCallback;

    const currentValue = controlledValue ?? localValue;

    const setValue = setValueId
        ? (newValue: number) => {
              const handler = functionCallback(setValueId);
              try {
                  handler(newValue);
              } catch (error) {
                  console.error(error);
              }
          }
        : setLocalValue;

    const updateSliderValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseFloat(e.target.value));
    };

    const style: React.CSSProperties = {
        ...useStyle(),
        ...layoutStyle(layout),
        ...animationStyle,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
    };

    return (
        <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
            {React.isValidElement(minimumValueLabel) && (
                <div style={{ flexShrink: 0 }}>{minimumValueLabel}</div>
            )}
            <input
                type="range"
                min={lowerBound}
                max={upperBound}
                step={step ?? 'any'}
                value={currentValue}
                onChange={updateSliderValue}
                aria-label={label}
                style={{
                    flex: 1,
                    height: '4px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-primary, #007AFF)',
                }}
            />
            {React.isValidElement(maximumValueLabel) && (
                <div style={{ flexShrink: 0 }}>{maximumValueLabel}</div>
            )}
        </div>
    );
}

const sizeThatFits = ({ proposal }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? 28,
        },
    };
};

layoutRegistry.register(Slider, sizeThatFits);
