import React, { createContext, useContext } from 'react';
import type { PaddingInsets } from '../Modifiers/Padding';

/**
 * Padding applied directly around a text input (TextField, SecureField, TextEditor), for
 * the input to absorb as native padding. Set by Padding, accumulated across nested
 * paddings, and cleared by layout containers so it only reaches an input through a
 * modifier chain - e.g. TextField().frame().padding() - not a padded stack or form.
 */
const TextInputPaddingContext = createContext<PaddingInsets | null>(null);

export function useTextInputPadding(): PaddingInsets | null {
    return useContext(TextInputPaddingContext);
}

export function TextInputPaddingProvider({ insets, children }: { insets: PaddingInsets | null, children: React.ReactNode }) {
    return <TextInputPaddingContext.Provider value={insets}>{children}</TextInputPaddingContext.Provider>;
}

export function ClearTextInputPadding({ children }: { children: React.ReactNode }) {
    // Skip the extra provider in the common case where there's nothing to clear.
    if (useTextInputPadding() == null) {
        return <>{children}</>;
    }
    return <TextInputPaddingContext.Provider value={null}>{children}</TextInputPaddingContext.Provider>;
}

/**
 * Style that makes padding applied around a text control native padding of the control:
 * the control grows over the wrapper's padding area (padding + equal negative margin), so
 * layout is unchanged but clicks, the text cursor, selection and scrolling all include it.
 */
export function useTextInputPaddingStyle(style: React.CSSProperties): React.CSSProperties {
    const insets = useTextInputPadding();
    if (!insets) {
        return {};
    }

    const { left, right, top, bottom } = insets;
    const grow = (size: React.CSSProperties['width'], by: number) => size === '100%' ? `calc(100% + ${by}px)` : size;

    return {
        boxSizing: 'border-box',
        padding: `${top}px ${right}px ${bottom}px ${left}px`,
        margin: `${-top}px ${-right}px ${-bottom}px ${-left}px`,
        width: grow(style.width, left + right),
        height: grow(style.height, top + bottom),
    };
}
