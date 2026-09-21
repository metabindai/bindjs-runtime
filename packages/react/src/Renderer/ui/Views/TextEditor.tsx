import React, { useState } from 'react';
import { useStyle } from '../Style';
import { useRendererContext } from '../../RendererContext';
import { useAnimationNode } from '../AnimatableStyle';
import { useResolvedFontStyle } from '../Modifiers/Font';
import { useForegroundStyleContext, foregroundStyleToCSS } from '../Modifiers/ForegroundStyle';
import { useEnvironment } from '../Environment';
import { useTextInputPaddingStyle } from '../Utils/textInputPadding';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle } from '../Layout';

interface TextEditorProps {
    text?: string;
    setTextId?: string;
}

export function TextEditor({ text, setTextId }: TextEditorProps) {
    const layout = useLayout({}, TextEditor);

    const [localText, setLocalText] = useState('');
    const functionCallback = useRendererContext().functionCallback;
    const foregroundStyleContext = useForegroundStyleContext();
    const environment = useEnvironment();

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    // Resolve font modifiers (.font, .fontWeight, .bold, etc.) the same way Text does.
    // Textareas don't inherit font from parent elements, so this must be applied explicitly.
    const resolvedFontStyle = useResolvedFontStyle();

    // Apply foreground style for text color
    const foregroundStyle = foregroundStyleToCSS(foregroundStyleContext, 'text', environment.colorScheme);

    const style: React.CSSProperties = {
        background: 'transparent',
        display: 'block',
        boxSizing: 'border-box',
        padding: 0,
        resize: 'none',

        // Apply environment style.
        ...useStyle(),

        // Apply layout positioning css
        ...layoutStyle(layout),

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
        <textarea
            ref={animationRef as React.Ref<HTMLTextAreaElement>}
            value={text == null ? localText : text}
            onChange={(e) => setText(e.target.value)}
            style={style}
        />
    );
}

// Size calculation function
const sizeThatFits = ({ proposal }): LayoutMeasurement => {
    return {
        frame: {
            // TextEditor is greedy on both axes, matching SwiftUI: it fills whatever
            // is proposed, so .frame({ height: 40 }) etc composes.
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    TextEditor,
    sizeThatFits
);
