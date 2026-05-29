import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNodeChildren } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';

interface GeometryProxy {
    size: {
        width: number;
        height: number;
    };
    safeAreaInsets: {
        top: number;
        leading: number;
        bottom: number;
        trailing: number;
    };
    frame: (coordinateSpace: string) => { x: number; y: number; width: number; height: number };
    bounds: (coordinateSpace: string) => { x: number; y: number; width: number; height: number } | {};
}

interface GeometryReaderProps {
    rawValue?: any;
    handlerId?: string;
    environmentId?: string;
}

/**
 * GeometryReader component - provides geometry information to its content.
 * 
 * Similar to SwiftUI's GeometryReader, this component measures its container
 * and passes size/geometry information to a callback function that renders content.
 */
export function GeometryReader(props: GeometryReaderProps): React.ReactElement {
    const { handlerId, environmentId } = props;

    // Perform layout calculation
    const layout = useLayout(props, GeometryReader);

    const rendererContext = useRendererContext();
    const functionCallback = rendererContext.functionCallback;

    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Track the last size we rendered content for to avoid unnecessary re-executions
    const lastRenderedSizeRef = useRef<{ width: number; height: number } | null>(null);
    const lastRenderVersion = useRef<number>(0);
    // Cache the rendered content
    const contentCacheRef = useRef<React.ReactNode>(null);

    // Create a GeometryProxy object
    const createGeometryProxy = (width: number, height: number): GeometryProxy => {
        return {
            size: { width, height },
            safeAreaInsets: {
                top: 0,
                leading: 0,
                bottom: 0,
                trailing: 0
            },
            frame: (coordinateSpace: string) => {
                // For now, return the local frame
                // In a full implementation, this would convert to different coordinate spaces
                return { x: 0, y: 0, width, height };
            },
            bounds: (coordinateSpace: string) => {
                // Return the bounds in the given coordinate space
                return { x: 0, y: 0, width, height };
            }
        };
    };

    // Synchronously compute content during render when size changes
    const content = useMemo(() => {
        if (!handlerId || !functionCallback) {
            return null;
        }

        var s = size;
        if (!s) {
            const rect = containerRef.current?.getBoundingClientRect();
            s = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
        }

        // Only render when we have a valid size
        if (s.width === 0 && s.height === 0) {
            return null;
        }

        try {
            // Get the callback function from the handler
            const contentCallback = functionCallback(handlerId, environmentId);

            if (contentCallback && typeof contentCallback === 'function') {
                // Create geometry proxy with current size
                const geometry = createGeometryProxy(s.width, s.height);

                // Call the callback with geometry to get the AST
                const viewAST = contentCallback(geometry);

                if (viewAST) {
                    // Decode the view AST to React components
                    const decodedContent = rendererContext.decodeViewCallback(viewAST);

                    // Update cache
                    lastRenderedSizeRef.current = { ...s };
                    lastRenderVersion.current = rendererContext?.renderVersion;
                    contentCacheRef.current = decodedContent;

                    return decodedContent;
                }
            }
        } catch (error) {
            console.error('GeometryReader: Error rendering content', error);
        }

        return null;
    }, [size, handlerId, environmentId, rendererContext?.renderVersion]);

    // Observe size changes using ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize((prevSize) => {
                    // Only update if size actually changed
                    if (prevSize.width !== width || prevSize.height !== height) {
                        return { width, height };
                    }
                    return prevSize;
                });
            }
        });

        resizeObserver.observe(container);

        // Initial size measurement
        const rect = container.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                ...layoutStyle(layout),
            }}
        >
            <LayoutNodeChildren layout={layout}>
                {content ? content : ""}
            </LayoutNodeChildren>

        </div>
    );
}

const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? Infinity,
            height: proposal.height ?? Infinity,
        }
    };
}

layoutRegistry.register(
    GeometryReader,
    sizeThatFits
);


