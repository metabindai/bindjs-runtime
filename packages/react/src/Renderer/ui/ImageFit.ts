import { createContext, useContext, useEffect, useState } from 'react';

/**
 * How a resizable Image draws inside the box an aspectRatio modifier sized
 * for it. With no explicit ratio the box takes the image's own ratio, and the
 * image fits or fills it. With an explicit ratio SwiftUI stretches the image to
 * the box, so it draws at 100% 100%.
 *
 * Provided by AspectRatio to its direct content; ClearStyle resets it, so it
 * stops at the next element, like modifier styles.
 */
export interface ImageFit {
    contentMode: 'fit' | 'fill';
    intrinsic: boolean;
}

export const ImageFitContext = createContext<ImageFit | null>(null);

export function useImageFit(): ImageFit | null {
    return useContext(ImageFitContext);
}

export interface NaturalSize {
    width: number;
    height: number;
}

const naturalSizes = new Map<string, NaturalSize>();

/**
 * The pixel size of an image, from known asset dimensions or by loading it.
 * Null until it loads, or when it has no size (an SVG without dimensions).
 */
export function useImageNaturalSize(url?: string | null, known?: NaturalSize | null): NaturalSize | null {
    const knownSize = known && known.width > 0 && known.height > 0 ? known : null;
    const [loaded, setLoaded] = useState<NaturalSize | null>(() => (url ? naturalSizes.get(url) ?? null : null));

    useEffect(() => {
        if (knownSize || !url || typeof window === 'undefined') return;
        const cached = naturalSizes.get(url);
        if (cached) {
            setLoaded(cached);
            return;
        }
        let cancelled = false;
        const image = new window.Image();
        image.onload = () => {
            const size = { width: image.naturalWidth, height: image.naturalHeight };
            if (size.width > 0 && size.height > 0) naturalSizes.set(url, size);
            if (!cancelled) setLoaded(size.width > 0 && size.height > 0 ? size : null);
        };
        image.src = url;
        return () => {
            cancelled = true;
        };
    }, [url, knownSize?.width, knownSize?.height]);

    return knownSize ?? (url ? loaded : null);
}

/** The size of an image already loaded, for the synchronous layout pass. */
export function cachedNaturalSize(url?: string | null, known?: NaturalSize | null): NaturalSize | null {
    if (known && known.width > 0 && known.height > 0) return known;
    return url ? naturalSizes.get(url) ?? null : null;
}

export function svgDataURL(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
