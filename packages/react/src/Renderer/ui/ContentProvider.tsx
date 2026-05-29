import React, { createContext, useContext, useMemo } from 'react';
import { ContentItem } from './Views/Content';

export type GetContentByIdFunction = (id: string, componentName?: string) => Promise<ContentItem | null>;

type RenderContentFn =
    (contentId: string, environment?: Record<string, any>) => React.ReactNode;

// Define the type for the content context
interface ContentContextType {
    renderContent?: RenderContentFn;
    getContent?: GetContentByIdFunction;
}

// Default context with placeholder functions
const ContentContext = createContext<ContentContextType>({
    renderContent: () => null,
    getContent: async () => null,
});

const noopRender: RenderContentFn = () => null;
const noopGetContent: GetContentByIdFunction = async () => null;

type ProviderProps = {
    children: React.ReactNode;
    renderContent?: RenderContentFn;
    getContent?: GetContentByIdFunction;
};

// Provider component to pass down content functionality
export function ContentProvider({
    children,
    renderContent,
    getContent,
}: ProviderProps) {
    // Ensure stable references even if props are undefined
    const value = useMemo(
        () => ({
            renderContent: renderContent ?? noopRender,
            getContent: getContent ?? noopGetContent,
        }),
        [renderContent, getContent]
    );

    return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// Custom hook to use the ContentContext
export function useContent() {
    const context = useContext(ContentContext);

    return useMemo(
        () => ({
            renderContent: (id: string, environment?: Record<string, unknown>) =>
                (context.renderContent ?? noopRender)(id, environment),
            getContent: (id: string, componentName?: string) =>
                (context.getContent ?? noopGetContent)(id, componentName),
        }),
        [context.renderContent, context.getContent]
    );
}