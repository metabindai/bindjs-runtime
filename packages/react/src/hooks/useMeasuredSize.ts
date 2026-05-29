import { RefObject, useEffect, useLayoutEffect, useState } from 'react';

export type MeasuredSize = { width: number; height: number };

/**
 * Measures an element synchronously on mount (avoiding a wrong-size paint)
 * and tracks subsequent resizes via ResizeObserver. Returns `null` until the
 * first successful measurement, so callers can defer expensive rendering
 * until real dimensions are known.
 */
export function useMeasuredSize(
    ref: RefObject<HTMLElement>,
    minWidth: number,
    minHeight: number
): MeasuredSize | null {
    const [size, setSize] = useState<MeasuredSize | null>(null);

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        if (rect.width > 0) {
            setSize({
                width: Math.max(minWidth, Math.floor(rect.width)),
                height: Math.max(minHeight, Math.floor(rect.height || minHeight)),
            });
        }
    }, []);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect || rect.width <= 0) return;
            setSize({
                width: Math.max(minWidth, Math.floor(rect.width)),
                height: Math.max(minHeight, Math.floor(rect.height || minHeight)),
            });
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return size;
}
