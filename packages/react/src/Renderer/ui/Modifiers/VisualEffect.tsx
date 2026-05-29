import React, { useRef, useEffect, useReducer, useCallback } from 'react';
import { useRendererContext } from '../../RendererContext';
import { useScrollView } from '../ScrollViewContext';
import { useLayout } from '../Layout/useLayout';
import { layoutStyle } from '../Layout/layoutStyle';
import { LayoutNode, LayoutNodeChildren } from '../Layout/LayoutNode';
import { layoutRegistry } from '../Layout/LayoutRegistry';
import type { LayoutMeasurement } from '../Layout/LayoutTypes';
import { measureMaxChild } from '../Layout/utils';
import { useStyle } from '../Style';

/**
 * Visual effect builder result - accumulated effects from the callback
 */
interface VisualEffectResult {
    blur?: number;
    opacity?: number;
    offset?: { x: number; y: number };
    scale?: number | { x: number; y: number };
    rotation?: number; // in degrees
    translation?: { x: number; y: number };
    transform?: { a: number; b: number; c: number; d: number; tx: number; ty: number };
}

/**
 * Geometry rectangle with bounds info
 */
interface GeometryRect {
    x: number;
    y: number;
    width: number;
    height: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    midX: number;
    midY: number;
}

/**
 * Creates a GeometryRect from basic x, y, width, height
 */
function createGeometryRect(x: number, y: number, width: number, height: number): GeometryRect {
    return {
        x,
        y,
        width,
        height,
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
        midX: x + width / 2,
        midY: y + height / 2,
    };
}

/**
 * GeometryProxy provided to the callback
 */
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
    frame: (coordinateSpace: string) => GeometryRect;
    bounds: (coordinateSpace: string) => GeometryRect | {};
}

/**
 * Converts VisualEffectResult to CSS styles
 */
function visualEffectToCSS(effect: VisualEffectResult): React.CSSProperties {
    const style: React.CSSProperties = {};
    const transforms: string[] = [];

    // Blur
    if (effect.blur !== undefined) {
        style.filter = `blur(${effect.blur}px)`;
    }

    // Opacity
    if (effect.opacity !== undefined) {
        style.opacity = effect.opacity;
    }

    // Offset / Translation
    const offsetX = (effect.offset?.x ?? 0) + (effect.translation?.x ?? 0);
    const offsetY = (effect.offset?.y ?? 0) + (effect.translation?.y ?? 0);
    if (offsetX !== 0 || offsetY !== 0) {
        transforms.push(`translate(${offsetX}px, ${offsetY}px)`);
    }

    // Scale
    if (effect.scale !== undefined) {
        if (typeof effect.scale === 'number') {
            transforms.push(`scale(${effect.scale})`);
        } else {
            transforms.push(`scale(${effect.scale.x}, ${effect.scale.y})`);
        }
    }

    // Rotation
    if (effect.rotation !== undefined) {
        transforms.push(`rotate(${effect.rotation}deg)`);
    }

    // Custom transform matrix
    if (effect.transform !== undefined) {
        const { a, b, c, d, tx, ty } = effect.transform;
        transforms.push(`matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`);
    }

    if (transforms.length > 0) {
        style.transform = transforms.join(' ');
    }

    return style;
}

interface VisualEffectModifierProps {
    handlerId?: string;
    environmentId?: string;
    children: React.ReactNode[];
}

/**
 * VisualEffectModifier - applies visual effects based on geometry
 * 
 * Similar to SwiftUI's `.visualEffect` modifier, this component:
 * 1. Measures its container size
 * 2. Calls the callback with a VisualEffectBuilder and GeometryProxy
 * 3. Applies the accumulated effects directly to a wrapper div (bypassing React renders for scroll)
 */
export function VisualEffectModifier(props: VisualEffectModifierProps): React.ReactNode {
    const { handlerId, environmentId, children } = props;

    const rendererContext = useRendererContext();
    const functionCallback = rendererContext.functionCallback;

    // Get parent scroll view context
    const scrollViewInfo = useScrollView();

    const containerRef = useRef<HTMLDivElement>(null);
    const effectRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useReducer(
        (_: { width: number; height: number }, next: { width: number; height: number }) => next,
        { width: 0, height: 0 }
    );

    // Perform layout calculation
    const layout = useLayout({ children }, VisualEffectModifier);

    // Create GeometryProxy with scroll view support
    const createGeometryProxy = (
        width: number,
        height: number,
        scrollRef: React.RefObject<HTMLDivElement> | null,
        scrollAxis: 'vertical' | 'horizontal' | 'both' | null
    ): GeometryProxy => {
        return {
            size: { width, height },
            safeAreaInsets: {
                top: 0,
                leading: 0,
                bottom: 0,
                trailing: 0
            },
            frame: (coordinateSpace: string) => {
                // Local/global coordinate space
                if (coordinateSpace === 'local' || coordinateSpace === 'global') {
                    return createGeometryRect(0, 0, width, height);
                }

                // ScrollView coordinate space
                if (coordinateSpace === 'scrollView' ||
                    coordinateSpace === 'scrollView.horizontal' ||
                    coordinateSpace === 'scrollView.vertical') {

                    if (!containerRef.current) {
                        return createGeometryRect(0, 0, width, height);
                    }

                    // If we have a scroll ref, use it
                    if (scrollRef?.current) {
                        const scrollRect = scrollRef.current.getBoundingClientRect();
                        const elementRect = containerRef.current.getBoundingClientRect();

                        // Position relative to scroll view's visible area
                        const relativeX = elementRect.left - scrollRect.left;
                        const relativeY = elementRect.top - scrollRect.top;

                        return createGeometryRect(relativeX, relativeY, width, height);
                    }

                    // Fallback to document/viewport scrolling
                    // Position relative to the viewport (which acts as the scroll container)
                    const elementRect = containerRef.current.getBoundingClientRect();
                    return createGeometryRect(elementRect.left, elementRect.top, width, height);
                }

                // Default to local
                return createGeometryRect(0, 0, width, height);
            },
            bounds: (coordinateSpace: string) => {
                // ScrollView bounds
                if (coordinateSpace === 'scrollView' ||
                    coordinateSpace === 'scrollView.horizontal' ||
                    coordinateSpace === 'scrollView.vertical') {

                    // If we have a scroll ref, use its bounds
                    if (scrollRef?.current) {
                        const scrollRect = scrollRef.current.getBoundingClientRect();
                        return createGeometryRect(0, 0, scrollRect.width, scrollRect.height);
                    }

                    // Fallback to viewport bounds for document scrolling
                    return createGeometryRect(0, 0, window.innerWidth, window.innerHeight);
                }

                // Local bounds
                return createGeometryRect(0, 0, width, height);
            }
        };
    };

    // Apply effect styles directly to the effect wrapper div
    const applyEffectStyles = useCallback(() => {
        const effectEl = effectRef.current;
        if (!effectEl || !handlerId || !functionCallback) {
            return;
        }

        // Measure current size from ref
        let s = size;
        if (s.width === 0 && s.height === 0) {
            const rect = containerRef.current?.getBoundingClientRect();
            s = { width: rect?.width ?? 0, height: rect?.height ?? 0 };
        }

        try {
            // Get the callback function
            const effectCallback = functionCallback(handlerId, environmentId);

            if (effectCallback && typeof effectCallback === 'function') {
                // Create builder and geometry proxy
                const geometry = createGeometryProxy(
                    s.width,
                    s.height,
                    scrollViewInfo?.ref ?? null,
                    scrollViewInfo?.axis ?? null
                );

                // Call the callback - it returns the builder with accumulated effects
                const builderResult = effectCallback(geometry);

                // Convert result to CSS and apply directly to DOM
                const style = visualEffectToCSS(builderResult);

                // Apply styles directly to the effect element
                Object.assign(effectEl.style, {
                    transform: style.transform ?? '',
                    opacity: style.opacity !== undefined ? String(style.opacity) : '',
                    filter: style.filter ?? '',
                });
            }
        } catch (error) {
            console.error('VisualEffectModifier: Error executing callback', error);
        }
    }, [size, handlerId, environmentId, functionCallback, scrollViewInfo?.ref, scrollViewInfo?.axis]);

    // Apply initial effect styles when dependencies change
    useEffect(() => {
        applyEffectStyles();
    }, [applyEffectStyles, rendererContext?.renderVersion]);

    // Observe size changes using ResizeObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (size.width !== width || size.height !== height) {
                    setSize({ width, height });
                }
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

    // Listen to scroll events and update styles directly via RAF
    useEffect(() => {
        const scrollEl = scrollViewInfo?.ref?.current;

        let rafId: number | null = null;

        const handleScroll = () => {
            // Cancel any pending frame to avoid stale updates
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            // Schedule style update on next animation frame
            rafId = requestAnimationFrame(() => {
                applyEffectStyles();
                rafId = null;
            });
        };

        // If we have a parent scroll view, listen to its scroll events
        if (scrollEl) {
            scrollEl.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                scrollEl.removeEventListener('scroll', handleScroll);
                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                }
            };
        }

        // Otherwise, fall back to document/window scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [scrollViewInfo?.ref, applyEffectStyles]);

    const style = {
        ...layoutStyle(layout)
    }

    // Render with effect wrapper div for direct DOM manipulation
    return (
        <div ref={containerRef} style={style}>
            <div ref={effectRef} style={style}>
                <LayoutNodeChildren layout={layout}>
                    {children}
                </LayoutNodeChildren>
            </div>
        </div>
    );
}


const sizeThatFits = ({ proposal, props, children, environment }): LayoutMeasurement => {
    var reportedSize = measureMaxChild({ children, proposal, environment: environment, nodeEnvironment: {} });
    return {
        frame: reportedSize
    }
}

layoutRegistry.register(
    VisualEffectModifier,
    sizeThatFits
);
