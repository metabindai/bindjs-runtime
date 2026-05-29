import React from 'react';
import { EnvironmentStyleProvider, useEnvironmentStyle } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

/**
 * ScrollTargetLayout Modifier
 * 
 * In SwiftUI, this modifier marks a container's children as scroll targets,
 * enabling scroll snapping behavior when used with scrollTargetBehavior.
 * 
 * This modifier sets scrollTargetLayout in the environment style, which layout
 * containers (VStack, HStack) read to apply scroll-snap-align CSS to their children.
 */
export function ScrollTargetLayout({ isEnabled = true, children }: {
    isEnabled?: boolean;
    children: React.ReactNode
}) {
    // Perform layout calculation
    const layout = useLayout({ isEnabled, children }, ScrollTargetLayout, { hasDOMElement: false });

    // Get current environment style and add scrollTargetLayout
    const envStyle = {
        ...useEnvironmentStyle(),
        scrollTargetLayout: isEnabled
    };

    return (
        <EnvironmentStyleProvider style={envStyle}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentStyleProvider>
    );
}

/**
 * ScrollTargetBehavior Modifier
 * 
 * In SwiftUI, this modifier configures the scroll snapping behavior for a ScrollView.
 * 
 * Behavior values:
 * - "viewAligned" - Aligns scroll position to child views marked with scrollTargetLayout
 * - "paging" - Snaps to page boundaries based on the scroll view's visible size
 * 
 * This modifier sets scrollTargetBehavior in the environment style, which ScrollView
 * reads to apply the appropriate CSS scroll-snap-type.
 * 
 * @param {string} rawValue - The behavior type ("viewAligned", "paging")
 */
export function ScrollTargetBehavior({ rawValue, children }: {
    rawValue?: 'viewAligned' | 'paging';
    children: React.ReactNode;
}) {
    // Perform layout calculation
    const layout = useLayout({ rawValue, children }, ScrollTargetBehavior, { hasDOMElement: false });

    // Get current environment style and add scrollTargetBehavior
    const envStyle = {
        ...useEnvironmentStyle(),
        scrollTargetBehavior: rawValue
    };

    return (
        <EnvironmentStyleProvider style={envStyle}>
            <LayoutNodeChildren layout={layout}>
                {children}
            </LayoutNodeChildren>
        </EnvironmentStyleProvider>
    );
}
