import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderableChildren } from './YapUIDecoderChildren';

describe('renderableChildren', () => {
    it('replaces untyped plain objects with null', () => {
        expect(renderableChildren({})).toBeNull();
        expect(renderableChildren({ title: 'Streaming…' })).toBeNull();
    });

    it('cleans arrays item by item, keeping positions', () => {
        const text = { type: 'Text', props: { rawValue: 'Hi' } };
        expect(renderableChildren([text, {}, 'label'])).toEqual([text, null, 'label']);
    });

    it('cleans nested arrays', () => {
        expect(renderableChildren([[{}, 'a'], {}])).toEqual([[null, 'a'], null]);
    });

    it('keeps React elements', () => {
        const element = createElement('div');
        expect(renderableChildren(element)).toBe(element);
        expect(renderableChildren([element])).toEqual([element]);
    });

    it('keeps typed JSON nodes, e.g. those chart collectors read', () => {
        const mark = { type: 'BarMark', props: { x: { value: 'Jan' }, y: { value: 12 } } };
        expect(renderableChildren(mark)).toBe(mark);
    });

    it('passes primitives and empty values through unchanged', () => {
        expect(renderableChildren('text')).toBe('text');
        expect(renderableChildren(0)).toBe(0);
        expect(renderableChildren(false)).toBe(false);
        expect(renderableChildren(null)).toBeNull();
        expect(renderableChildren(undefined)).toBeUndefined();
        expect(renderableChildren([])).toEqual([]);
    });
});
