import React from 'react';
import { ElementSemanticsProvider } from '../Style';
import { ControlProvider } from '../Actions';
import { useLayout, LayoutNodeChildren } from '../Layout';
import type { ElementSemanticsType } from '../StyleContext';

/**
 * Accessibility modifiers
 *
 * Put ARIA attributes on the DOM element of the view they modify (see
 * ElementSemanticsType). Charts read their own accessibility modifiers
 * (ChartModifierContext).
 */
interface AccessibilityProps {
    rawValue?: string | boolean | string[];
    children: React.ReactNode;
}

function AccessibilityAttributes({ attributes, children }: { attributes: ElementSemanticsType['attributes'], children: React.ReactNode }) {
    // Perform layout calculation
    const layout = useLayout({ children }, AccessibilityAttributes, { hasDOMElement: false });

    return (
        <ElementSemanticsProvider attributes={attributes}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </ElementSemanticsProvider>
    );
}

// aria-label; alt on an image.
export function AccessibilityLabel({ rawValue, children }: AccessibilityProps): React.ReactNode {
    return <AccessibilityAttributes attributes={{ 'aria-label': typeof rawValue === 'string' ? rawValue : undefined }}>{children}</AccessibilityAttributes>;
}

export function AccessibilityHint({ rawValue, children }: AccessibilityProps): React.ReactNode {
    return <AccessibilityAttributes attributes={{ 'aria-description': typeof rawValue === 'string' ? rawValue : undefined }}>{children}</AccessibilityAttributes>;
}

// aria-valuetext, kept only by elements whose role takes a value (Slider, ProgressView).
export function AccessibilityValue({ rawValue, children }: AccessibilityProps): React.ReactNode {
    return <AccessibilityAttributes attributes={{ 'aria-valuetext': typeof rawValue === 'string' ? rawValue : undefined }}>{children}</AccessibilityAttributes>;
}

// accessibilityHidden() and accessibilityHidden(true) hide; accessibilityHidden(false) doesn't.
export function AccessibilityHidden({ rawValue, children }: AccessibilityProps): React.ReactNode {
    return <AccessibilityAttributes attributes={{ 'aria-hidden': rawValue !== false ? true : undefined }}>{children}</AccessibilityAttributes>;
}

/**
 * Traits with a web equivalent:
 * - isButton renders the view as a <button>, for views made tappable with onTapGesture.
 * - isSelected sets aria-pressed on a button.
 */
export function AccessibilityAddTraits({ rawValue, children }: AccessibilityProps): React.ReactNode {
    const traits = Array.isArray(rawValue) ? rawValue : [rawValue];
    const content = (
        <AccessibilityAttributes attributes={{ 'aria-pressed': traits.includes('isSelected') ? true : undefined }}>
            {children}
        </AccessibilityAttributes>
    );

    if (traits.includes('isButton')) {
        return <ControlProvider as="button" attributes={{ type: 'button' }}>{content}</ControlProvider>;
    }

    return content;
}
