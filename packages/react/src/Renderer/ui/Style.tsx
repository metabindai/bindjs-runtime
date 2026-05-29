import React, { useContext, ReactNode } from 'react';
import { StyleContext } from './StyleContext'
import { EnvironmentStyleContext, EnvironmentStyleContextType } from './StyleContext';
import styled from 'styled-components'
import { ClearAnimatableValues } from './AnimatableStyle';

function ViewStyle({ children }) {
    const style = { ...useStyle() }
    return <div style={style}><ClearStyle>{children}</ClearStyle></div>
}

export function ClearStyle({ children }) {
    return (
        <StyleContext.Provider value={{ style: {} }}>
            <ClearAnimatableValues>
                {children}
            </ClearAnimatableValues>
        </StyleContext.Provider>
    );
}

// Custom hook to use the StyleContext
function useStyleContext() {
    return useContext(StyleContext);
}

export function useStyle(): React.CSSProperties {
    return useContext(StyleContext).style ?? {};
}

// Hook to get the ref from StyleContext (for child components to attach to DOM elements)
export function useStyleRef(): React.Ref<HTMLElement> | undefined {
    return useContext(StyleContext).forwardedRef;
}

// Provider component to pass down styles and optionally a ref
export function StyleProvider({
    children,
    style,
    forwardedRef
}: {
    children: ReactNode;
    style: React.CSSProperties;
    forwardedRef?: React.Ref<HTMLElement>;
}) {
    const styleRef = useStyleRef();
    return <StyleContext.Provider value={{ style, forwardedRef: forwardedRef ?? styleRef }}>{children}</StyleContext.Provider>;
}


/**
 * Environment Style
 */
export function useEnvironmentStyle(): EnvironmentStyleContextType {
    return useContext(EnvironmentStyleContext) ?? {};
}

export function EnvironmentStyleProvider({ children, style }: { children: ReactNode; style: EnvironmentStyleContextType }) {
    return <EnvironmentStyleContext.Provider value={style}>{children}</EnvironmentStyleContext.Provider>;
}