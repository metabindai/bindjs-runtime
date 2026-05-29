import React, { createContext, useContext, useRef, RefObject } from 'react';

/**
 * Information about a parent ScrollView, provided via context
 */
export interface ScrollViewInfo {
    /** Reference to the ScrollView's DOM element */
    ref: RefObject<HTMLDivElement>;
    /** The scroll axis: 'vertical', 'horizontal', or 'both' */
    axis: 'vertical' | 'horizontal' | 'both';
}

/**
 * Context to provide ScrollView info to descendant components
 */
const ScrollViewContext = createContext<ScrollViewInfo | null>(null);

/**
 * Hook to get the parent ScrollView info from context
 */
export function useScrollView(): ScrollViewInfo | null {
    return useContext(ScrollViewContext);
}

/**
 * Provider component for ScrollView context
 */
export function ScrollViewProvider({
    children,
    scrollRef,
    axis
}: {
    children: React.ReactNode;
    scrollRef: RefObject<HTMLDivElement>;
    axis: 'vertical' | 'horizontal' | 'both';
}) {
    const value: ScrollViewInfo = { ref: scrollRef, axis };
    return (
        <ScrollViewContext.Provider value={value}>
            {children}
        </ScrollViewContext.Provider>
    );
}

/**
 * Context to indicate that the first ScrollView should use document scrolling
 * instead of rendering its own scroll container. When set to true, the first
 * ScrollView in the hierarchy will render only its children and reset the
 * context to false for its descendants.
 */
export interface DocumentScrollContextType {
    /** When true, the first ScrollView should pass through its children */
    useDocumentScroll: boolean;
}

const DocumentScrollContext = createContext<DocumentScrollContextType>({
    useDocumentScroll: false
});

/**
 * Hook to get the document scroll context
 */
export function useDocumentScroll(): DocumentScrollContextType {
    return useContext(DocumentScrollContext);
}

/**
 * Provider component to enable document scrolling for the first ScrollView
 */
export function DocumentScrollProvider({
    children,
    useDocumentScroll = true
}: {
    children: React.ReactNode;
    useDocumentScroll?: boolean;
}) {
    return (
        <DocumentScrollContext.Provider value={{ useDocumentScroll }}>
            {children}
        </DocumentScrollContext.Provider>
    );
}
