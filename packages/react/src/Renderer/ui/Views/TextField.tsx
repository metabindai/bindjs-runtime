import React, { useState } from 'react';
import { StyleProvider, useStyle } from '../Style';
import { useRendererContext } from '../../RendererContext';
import { Variables } from '../Variable';
import { useAnimationNode } from '../AnimatableStyle';
import { useResolvedFontStyle } from '../Modifiers/Font';
import { useForegroundStyleContext, foregroundStyleToCSS } from '../Modifiers/ForegroundStyle';
import { useEnvironment } from '../Environment';
import { ClearTextInputPadding, useTextInputPaddingStyle } from '../Utils/textInputPadding';

import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle } from '../Layout';

interface TextFieldProps {
    placeholder?: string;
    prompt?: string;
    text?: string;
    setTextId?: string;
    secure?: boolean;
    textFieldStyle?: any;
    children?: React.ReactNode;
}

export function TextField(props: TextFieldProps) {
    const { placeholder, prompt, text, setTextId, secure, textFieldStyle } = props;
    const layout = useLayout({}, TextField);

    const style = {
        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout)
    }

    const rendererContext = useRendererContext();

    const finalPlaceholder = placeholder ?? prompt;

    if (textFieldStyle && rendererContext.viewCallback) {
        let textFieldStyleView = rendererContext.viewCallback(textFieldStyle, { label: { type: 'Variable', name: 'configuration.label' } });

        if (textFieldStyleView) {
            let variableProps = {
                'configuration.label': <TextFieldInput placeholder={finalPlaceholder} text={text} setTextId={setTextId} secure={secure} />
            }

            style['textAlign'] = style['textAlign'] || 'center'

            // A custom style places the input somewhere inside its own view, so padding
            // around the TextField is no longer padding around the input.
            return <ClearTextInputPadding><Variables {...variableProps} {...style}><StyleProvider style={style}>{textFieldStyleView}</StyleProvider></Variables></ClearTextInputPadding>
        }
    }
    return (
        <TextFieldInput placeholder={finalPlaceholder} text={text} setTextId={setTextId} secure={secure} style={style} />
    );
}

function TextFieldInput({ placeholder, text, setTextId, secure, style: outerStyle }: {
    placeholder?: string;
    text?: string;
    setTextId?: string;
    secure?: boolean;
    style?: React.CSSProperties;
}) {
    const [localText, setLocalText] = useState('');
    const functionCallback = useRendererContext().functionCallback;
    const foregroundStyleContext = useForegroundStyleContext();
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Resolve font modifiers (.font, .fontWeight, .bold, etc.) the same way Text does.
    // Inputs don't inherit font from parent elements, so this must be applied explicitly.
    const resolvedFontStyle = useResolvedFontStyle();

    // Apply foreground style for text color
    const foregroundStyle = foregroundStyleToCSS(foregroundStyleContext, 'text', environment.colorScheme);

    const style: React.CSSProperties = {
        background: 'transparent',
        boxSizing: 'border-box',
        width: '100%',
        ...useStyle(),
        ...outerStyle,
        ...foregroundStyle,
        ...resolvedFontStyle,
        ...animationStyle,
    }

    // Absorb padding applied directly around the field as native padding of the control.
    Object.assign(style, useTextInputPaddingStyle(style));

    // Remove default border if not specified
    if (style.borderWidth === undefined && style.border === undefined) {
        style['border'] = '0px';
    }

    const setText = setTextId ? (value: string) => {
        const handler = functionCallback(setTextId)
        try {
            handler(value)
        } catch (error) {
            console.error(error)
        }
    } : setLocalText;

    return (
        <input
            ref={animationRef as React.Ref<HTMLInputElement>}
            type={secure ? 'password' : 'text'}
            placeholder={placeholder}
            value={text == null ? localText : text}
            onChange={(e) => setText(e.target.value)}
            style={style}
        />
    );
}

export function SecureField(props: TextFieldProps) {
    return <TextField {...props} secure={true} />
}

// Size calculation function
const sizeThatFits = ({ proposal, environment }): LayoutMeasurement => {
    // Directly inside a fixed-height frame, fill it so the whole frame is the field
    // (clickable, text stays vertically centered) rather than a short input floating in it.
    const fillsFrameHeight = environment?.layout === 'frame' && environment?.frame?.height != null;

    return {
        frame: {
            // Fill the proposed width so .frame({ maxWidth: Infinity }) etc composes,
            // matching SwiftUI's greedy-width TextField behaviour.
            width: proposal.width ?? Infinity,
            // Height stays intrinsic unless proposed.
            height: proposal.height ?? (fillsFrameHeight ? Infinity : undefined),
        }
    };
}

layoutRegistry.register(
    TextField,
    sizeThatFits
);

layoutRegistry.register(
    SecureField,
    sizeThatFits
);
