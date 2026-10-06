import React, { useContext, ReactNode } from 'react';
import { StyleContext, ElementSemanticsType } from './StyleContext'
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
    const { forwardedRef: styleRef, element } = useContext(StyleContext);
    return <StyleContext.Provider value={{ style, forwardedRef: forwardedRef ?? styleRef, element }}>{children}</StyleContext.Provider>;
}


/**
 * Element Semantics
 */
export function useElementSemantics(): ElementSemanticsType | null {
    return useContext(StyleContext).element ?? null;
}

// Adds to the semantics pending for the next DOM element, keeping the style and any semantics already pending.
export function ElementSemanticsProvider({
    children,
    as,
    attributes
}: {
    children: ReactNode;
    as?: ElementSemanticsType['as'];
    attributes?: ElementSemanticsType['attributes'];
}) {
    const context = useContext(StyleContext);
    const pending = context.element;
    const added = Object.fromEntries(Object.entries(attributes ?? {}).filter(([, value]) => value !== undefined));
    const element = { as: as ?? pending?.as, attributes: { ...pending?.attributes, ...added } };
    return <StyleContext.Provider value={{ ...context, element }}>{children}</StyleContext.Provider>;
}

// Keeps pending semantics out of a subtree that shares the style but isn't the element, such as an overlay's content.
export function ClearElementSemantics({ children }: { children: ReactNode }) {
    const context = useContext(StyleContext);
    return <StyleContext.Provider value={{ ...context, element: null }}>{children}</StyleContext.Provider>;
}

// Attributes for a form control (input, textarea, select): its label and value, never a button or link role.
export function useControlAttributes(options: { takesValue?: boolean } = {}): Record<string, any> {
    const element = useElementSemantics();
    return elementProps(element && { attributes: element.attributes }, { replaced: true, ...options });
}

interface ElementPropsOptions {
    // Role for an element that has a label but no role of its own: 'img' for drawn content, 'group' for containers.
    labelRole?: 'img' | 'group';
    // The element is an img, video or canvas, which can't render as a button or link, so it takes the role and keyboard handling instead.
    replaced?: boolean;
    // The element has a role that takes aria-valuetext (a slider or progress bar).
    takesValue?: boolean;
}

/**
 * Props for the DOM element of the view that applies the style.
 * `as` is set when the element must render as a button or link: styled components take it
 * as it is, and plain elements read it for their tag.
 */
export function useElementProps(options: ElementPropsOptions = {}): { as?: ElementSemanticsType['as'], [attribute: string]: any } {
    return elementProps(useElementSemantics(), options);
}

export function elementProps(element: ElementSemanticsType | null, { labelRole, replaced, takesValue }: ElementPropsOptions = {}): { as?: ElementSemanticsType['as'], [attribute: string]: any } {
    if (!element) {
        return {};
    }

    const { href, type, disabled, 'aria-pressed': pressed, 'aria-valuetext': valueText, ...attributes } = element.attributes;
    const props: Record<string, any> = attributes;

    if (element.as && !replaced) {
        // A real button or link, reset to look like the view (see the renderer container's style).
        props.as = element.as;
        props['data-bindjs-control'] = '';
        if (element.as === 'a') {
            props.href = href;
        } else {
            props.type = type;
            props.disabled = disabled;
            props['aria-pressed'] = pressed;
        }
    } else if (element.as) {
        // An element that can't change tag takes the role, focus and keys of a button or link.
        const role = element.as === 'a' ? 'link' : 'button';
        props.role = role;
        props.tabIndex = disabled ? -1 : 0;
        props['aria-disabled'] = disabled;
        if (role === 'button') {
            props['aria-pressed'] = pressed;
        }
        props.onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Enter' || (role === 'button' && event.key === ' ')) {
                event.preventDefault();
                event.currentTarget.click();
            }
        };
    } else if (props['aria-label'] && labelRole && !props.role) {
        props.role = labelRole;
    }

    if (takesValue) {
        props['aria-valuetext'] = valueText;
    }

    return props;
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