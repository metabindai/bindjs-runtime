import React from "react"
import { nodeOfType, nodeOfTypeWithParent } from '../../Utils';
import Text from '../Views/Text'
import styled from "styled-components";
import { Tag } from "../Modifiers/Tag";
import { useRendererContext } from '../../RendererContext';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { useStyle } from '../Style';
import { useAnimationNode } from '../AnimatableStyle';

type Binding<V = string> = readonly [
    value: V,
    setValue: (value: V) => void
];

interface PickerProps {
    label: string;
    selection: Binding;
    environmentId: string;
    children: React.ReactElement;
}

export function Picker(props: PickerProps) {
    const layout = useLayout(props, Picker);

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    const style: React.CSSProperties = {
        ...useStyle(),
        ...layoutStyle(layout),
        ...animationStyle,
    };

    const textNodes = React.Children.map(props.children, child => {
        return nodeOfTypeWithParent(child, Text, true)
    })

    const options = textNodes.map((textNode) => {
        if (textNode == null) {
            return { label: '', value: '' }
        }
        const node = textNode.node;
        const parent = textNode.parent;

        return {
            label: node?.props.rawValue,
            value: parent?.type == Tag ? parent?.props.rawValue : null
        }
    })

    const values = options.map(option => option.value)
    const selectedIndex = values.indexOf(props.selection[0] as string)

    const rendererContext = useRendererContext();

    const onChange = (index: number) => {
        props.selection[1](values[index])
    }

    /**
     * Render with picker style '_SegmentedPickerStyle' if avialable.
     */
    const pickerStyle = 'SegmentedPickerStyle'

    // Call the picker style 
    let pickerStyleView = rendererContext.viewCallback(pickerStyle, { options, selectedIndex, setSelectedIndex: onChange }, [], props.environmentId);

    // Return if exists
    if (pickerStyleView) {
        return (
            <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
                {pickerStyleView}
            </div>
        );
    }

    // Otherwise, use default react picker style
    return (
        <div ref={animationRef as React.Ref<HTMLDivElement>} style={style}>
            <select
                value={props.selection[0]}
                onChange={(e) => {
                    const idx = options.findIndex(opt => opt.value === e.target.value);
                    if (idx >= 0) onChange(idx);
                }}
                style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            >
                {options.map((option) => (
                    <option key={option.value ?? option.label} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    )
}



// Size that fits implementation for layout system
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width,
            height: proposal.height
        }
    };
}

layoutRegistry.register(
    Picker,
    sizeThatFits
);
