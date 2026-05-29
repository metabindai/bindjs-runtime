import React, { useLayoutEffect, useRef, useState, useMemo, ReactNode } from 'react';

/**
 * FitToParent
 * A responsive wrapper that sizes itself based on the parent’s bounding box.
 * Sizes its content to the smaller of its parent's width or height.
 * Skips any parents with `display: contents` (or no layout box).

 * - Ignores `display: contents` parents (finds nearest measurable ancestor)
 * - Scales responsively to fit within parent bounds
 * - Maintains an optional aspect ratio (default 1:1)
 * Example usage:
 * <FitToParent>
 *   <div style={{ borderRadius: "50%", background: "dodgerblue" }} />
 * </FitToParent>* 
 */
type Size = { width: number; height: number };

export function FitToParent({
    children,
    aspectRatio = 1, // width / height
    onResize,
    style,
    debug = false,
}: {
    children: ReactNode;
    aspectRatio?: number;
    onResize?: (width: number, height: number) => void;
    style?: React.CSSProperties;
    debug?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<Size | null>(null);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const parent = findMeasurableParent(ref.current);
        if (!parent) return;

        const update = (rawWidth: number, rawHeight: number) => {
            if (rawWidth <= 0 || rawHeight <= 0 || aspectRatio <= 0) return;

            let finalW = rawWidth;
            let finalH = rawHeight;

            // Contain within parent while maintaining aspect ratio
            if (rawWidth / rawHeight > aspectRatio) {
                // parent wider than target ratio → limit by height
                finalH = rawHeight;
                finalW = rawHeight * aspectRatio;
            } else {
                // parent taller → limit by width
                finalW = rawWidth;
                finalH = rawWidth / aspectRatio;
            }

            setSize({ width: finalW, height: finalH });
            onResize?.(finalW, finalH);
        };

        const ro = new ResizeObserver((entries) => {
            // Use the observed parent’s **pre-transform** box from the entry
            const entry = entries[entries.length - 1];
            if (entry) {
                const { width, height } = entry.contentRect;
                update(width, height);
            } else {
                // Fallback (also pre-transform): clientWidth/Height (no transforms)
                update(parent.clientWidth, parent.clientHeight);
            }
        });

        // Observe the **parent** with border-box gives a stable outer reference
        try {
            // @ts-ignore older TS lib may not know options
            ro.observe(parent, { box: "border-box" });
        } catch {
            ro.observe(parent as Element);
        }

        // Initial sync (pre-transform via client sizes)
        update(parent.clientWidth, parent.clientHeight);

        return () => ro.disconnect();
    }, [aspectRatio, onResize]);

    const wrapperStyle = useMemo<React.CSSProperties>(
        () => ({
            width: size?.width ?? 0,
            height: size?.height ?? 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...(debug ? { outline: "1px dashed red" } : {}),
            ...style,
        }),
        [size, style, debug]
    );

    return (
        <div ref={ref} style={wrapperStyle}>
            {children}
        </div>
    );
}


// Helper: find the nearest ancestor with a layout box
const findMeasurableParent = (el: HTMLElement | null): HTMLElement | null => {
    let current: HTMLElement | null = el?.parentElement || null;
    while (current) {
        const style = getComputedStyle(current);
        if (style.display !== "contents" && style.display !== "none") {
            return current;
        }
        current = current.parentElement;
    }
    return null;
};