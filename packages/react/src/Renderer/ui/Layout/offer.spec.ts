import { describe, expect, it } from 'vitest';
import { frameLength, insetLength, offeredHeight, offeredWidth, sharedLength, getOffer, ROOT_OFFER } from './offer';

describe('layout offers', () => {
    it('a node offers its own known length', () => {
        expect(offeredWidth(120, 'fill')).toBe(120);
        expect(offeredHeight(80, null)).toBe(80);
    });

    it('a content-sized node passes its width through but leaves its height unspecified', () => {
        // SwiftUI passes the proposal through; CSS resolves a percentage width
        // against a shrink-to-fit box, but not a percentage height against an auto one.
        expect(offeredWidth(null, 'fill')).toBe('fill');
        expect(offeredWidth(null, 300)).toBe(300);
        expect(offeredHeight(null, 'fill')).toBeNull();
        expect(offeredHeight(null, 300)).toBeNull();
    });

    it('a node that fills its parent offers the parent offer', () => {
        expect(offeredWidth(Infinity, 300)).toBe(300);
        expect(offeredHeight(Infinity, 'fill')).toBe('fill');
        expect(offeredHeight(Infinity, null)).toBeNull();
    });

    it('a stack shares a definite main axis', () => {
        expect(sharedLength(300)).toBe('fill');
        expect(sharedLength('fill')).toBe('fill');
        expect(sharedLength(null)).toBeNull();
    });

    it('a frame offers its exact length, or the parent offer clamped to its max', () => {
        expect(frameLength(100, undefined, 'fill')).toBe(100);
        expect(frameLength(0, undefined, 'fill')).toBe(0);
        expect(frameLength(undefined, 120, 300)).toBe(120);
        expect(frameLength(undefined, 120, 80)).toBe(80);
        // An unspecified offer clamped to a max is the max, as in SwiftUI.
        expect(frameLength(undefined, 120, null)).toBe(120);
        expect(frameLength(undefined, 120, 'fill')).toBe('fill');
        // maxWidth: Infinity does not cap.
        expect(frameLength(undefined, Infinity, 300)).toBe(300);
        expect(frameLength(undefined, undefined, null)).toBeNull();
    });

    it('padding shrinks a known offer', () => {
        expect(insetLength(200, 40)).toBe(160);
        expect(insetLength(20, 40)).toBe(0);
        expect(insetLength('fill', 40)).toBe('fill');
        expect(insetLength(null, 40)).toBeNull();
    });

    it('the root is as wide as its container with no height', () => {
        expect(getOffer(undefined)).toEqual(ROOT_OFFER);
        expect(ROOT_OFFER).toEqual({ width: 'fill', height: null });
        expect(getOffer({ proposal: { width: 10, height: 20 } })).toEqual({ width: 10, height: 20 });
    });
});
