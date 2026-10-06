import { describe, expect, it } from 'vitest';
import { boxLayout } from './AspectRatio';

const boxStyle = (...args: Parameters<typeof boxLayout>) => boxLayout(...args).style;

// Expected sizes are SwiftUI's for the same proposal (checked with ImageRenderer).
describe('aspectRatio box', () => {
    it('both lengths known: exact points, fit picks the smaller and fill the larger', () => {
        // .aspectRatio(1) in a 300×100 frame: fit 100×100, fill 300×300.
        expect(boxStyle({ width: 300, height: 100 }, 1, 'fit')).toMatchObject({ width: '100px', height: '100px' });
        expect(boxStyle({ width: 300, height: 100 }, 1, 'fill')).toMatchObject({ width: '300px', height: '300px' });
        // 2:1 in a 100×100 frame: fit is width-limited, 100×50.
        expect(boxStyle({ width: 100, height: 100 }, 2, 'fit')).toMatchObject({ width: '100px', height: '50px' });
    });

    it('height known, width from CSS: fit hugs height × ratio up to the full width', () => {
        expect(boxLayout({ width: 'fill', height: 100 }, 2, 'fit')).toMatchObject({ style: { display: 'grid', minWidth: 0, aspectRatio: '2' }, strut: { width: 200, compressible: true } });
        // Fill holds its column at least height × ratio wide, as SwiftUI's frame(maxWidth: .infinity) does.
        expect(boxLayout({ width: 'fill', height: 100 }, 2, 'fill')).toMatchObject({ style: { display: 'grid', minWidth: '100%', flexShrink: 0, aspectRatio: '2' }, strut: { width: 200, compressible: false } });
    });

    it('height known, width unspecified (a horizontal carousel): height × ratio', () => {
        expect(boxStyle({ width: null, height: 90 }, 16 / 9, 'fit')).toMatchObject({ width: '160px', height: '90px' });
    });

    it('height definite only in CSS: the box takes the height and its width follows', () => {
        expect(boxStyle({ width: 'fill', height: 'fill' }, 1, 'fit')).toEqual({ height: '100%', maxWidth: '100%', aspectRatio: '1' });
        expect(boxStyle({ width: 'fill', height: 'fill' }, 1, 'fill')).toEqual({ height: '100%', minWidth: '100%', aspectRatio: '1' });
    });

    it('height unspecified (content-sized, as in an MCP host): width-driven', () => {
        expect(boxStyle({ width: 'fill', height: null }, 2, 'fit')).toEqual({ width: '100%', aspectRatio: '2' });
        expect(boxStyle({ width: 360, height: null }, 2, 'fill')).toMatchObject({ width: '360px', height: '180px' });
    });

    it('nothing offered: the content ideal size', () => {
        expect(boxStyle({ width: null, height: null }, 2, 'fit', { width: 400, height: 200 })).toMatchObject({ width: '400px', height: '200px' });
        // SwiftUI's ideal size for a shape is 10×10.
        expect(boxStyle({ width: null, height: null }, 1, 'fit')).toMatchObject({ width: '10px', height: '10px' });
    });
});
