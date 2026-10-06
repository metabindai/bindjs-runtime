/**
 * What a layout node offers its children along each axis, in the sense of
 * SwiftUI's proposed size:
 *
 * - a number: a known size in points (an explicit frame, or a max size capping
 *   an unspecified offer)
 * - 'fill': a definite size that only CSS knows (a percentage of a definite
 *   ancestor, or a stack's share of one)
 * - null: unspecified; the node sizes to its content (SwiftUI's nil proposal)
 *
 * Views whose size depends on the offer (aspectRatio, a resizable Image) read
 * it from the layout environment. Nodes compute it in useLayout; a node whose
 * offer differs from its own size (Frame, Padding, stacks, ScrollView) returns
 * an `offer` in its measurement environment.
 */
export type OfferedLength = number | 'fill' | null;

export interface Offer {
    width: OfferedLength;
    height: OfferedLength;
}

/**
 * The renderer root: as wide as its container, height unspecified. In an MCP
 * host the iframe is sized to the content, so the root height is never known.
 */
export const ROOT_OFFER: Offer = { width: 'fill', height: null };

export function isKnownLength(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * The width a node offers its children: its own when known, otherwise its
 * parent's. A content-sized node still passes its proposal through, as SwiftUI
 * does, and CSS resolves a percentage width against a shrink-to-fit box.
 */
export function offeredWidth(own: number | null | undefined, parent: OfferedLength): OfferedLength {
    if (isKnownLength(own) && own > 0) return own;
    return parent;
}

/**
 * The height a node offers its children: its own when known, otherwise its
 * parent's, except that a content-sized node cannot pass on a height only CSS
 * knows: CSS does not resolve a percentage height against an auto one.
 */
export function offeredHeight(own: number | null | undefined, parent: OfferedLength): OfferedLength {
    if (isKnownLength(own) && own > 0) return own;
    if (own === Infinity || typeof parent === 'number') return parent;
    return null;
}

/**
 * A stack splits its main axis between its children, so a definite length
 * becomes a share that only CSS knows.
 */
export function sharedLength(length: OfferedLength): OfferedLength {
    return length === null ? null : 'fill';
}

/**
 * A frame proposes its fixed size, or its parent's offer clamped to its max.
 * An unspecified offer clamped to a max is the max, as in SwiftUI.
 */
export function frameLength(exact: unknown, max: unknown, parent: OfferedLength): OfferedLength {
    if (isKnownLength(exact)) return exact;
    if (isKnownLength(max)) {
        if (typeof parent === 'number') return Math.min(parent, max);
        if (parent === null) return max;
        return 'fill';
    }
    return parent;
}

export function insetLength(length: OfferedLength, inset: number): OfferedLength {
    return typeof length === 'number' ? Math.max(0, length - inset) : length;
}

/**
 * The layout an overlay or background gives its content: the base view's size,
 * which CSS knows (the content is positioned over the base at 100% × 100%).
 */
export const BASE_SIZE_LAYOUT = { frame: {}, environment: { proposal: { width: 'fill', height: 'fill' } as Offer } };

export function getOffer(environment?: Record<string, any> | null): Offer {
    return environment?.proposal ?? ROOT_OFFER;
}
