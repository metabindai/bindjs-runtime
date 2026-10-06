import React from 'react';
import { describe, expect, it } from 'vitest';
import { distributeStack, groupOffers } from './stack';
import { inSizingPass, measureElement } from './utils';
import { layoutRegistry } from './LayoutRegistry';
import { getOffer } from './offer';
import type { LayoutMeasurement } from './LayoutTypes';

// Stand-ins for views, measured along a vertical stack's height.
function Fixed(_: { length: number }) { return null; }
function Fit(_: { ratio: number }) { return null; }
function Flexible(_: { max?: number }) { return null; }
function Unmeasured() { return null; }

layoutRegistry.register(Fixed, ({ props }) => ({ frame: { width: 100, height: props.length } }));
// An aspect box: sized from an offer in points, and reporting its content's
// (a color's) flexible size when the offer is a share only CSS knows.
layoutRegistry.register(Fit, ({ props, environment }) => {
    const { width, height } = getOffer(environment);
    if (typeof width !== 'number' || typeof height !== 'number') return { frame: { width: Infinity, height: Infinity } };
    const boxWidth = Math.min(width, height * props.ratio);
    return { frame: { width: boxWidth, height: boxWidth / props.ratio } };
});
layoutRegistry.register(Flexible, ({ props }) => ({ frame: { width: Infinity, height: Infinity, maxHeight: props.max } }));
// Text: CSS sizes it, so the layout pass doesn't know its length.
layoutRegistry.register(Unmeasured, () => ({ frame: { width: null, height: null } }));

const share = { width: 100, height: 'fill' as const };

function distribute(children: React.ReactElement[], length: number, spacing = 0) {
    const environment = { layout: 'vstack', proposal: share };
    const measured: LayoutMeasurement[] = children.map((child) =>
        layoutRegistry.get(child.type as React.ElementType)!.sizingFn({ proposal: { width: null, height: null }, props: child.props, environment }));
    return distributeStack({ children, measured, axis: 'height', length, cross: 100, spacing, proposal: { width: null, height: null }, environment });
}

const heights = (distribution: ReturnType<typeof distribute>) => distribution?.measurements.map((m) => m.frame.height);

// Expected lengths are SwiftUI's for the same stacks (the parity cases sd1–sd8).
describe('stack distribution', () => {
    it('sizes the fixed child first and offers the aspect box what it leaves', () => {
        // VStack { Color.aspectRatio(1, .fit); Color.frame(height: 20) }.frame(width: 100, height: 300)
        const distribution = distribute([React.createElement(Fit, { ratio: 1 }), React.createElement(Fixed, { length: 20 })], 300);
        expect(heights(distribution)).toEqual([100, 20]);
        expect(distribution?.length).toBe(120);
        // Each child is placed with the length it took.
        expect(distribution?.offers).toEqual([{ width: 100, height: 100 }, { width: 100, height: 20 }]);
    });

    it('offers the less flexible aspect box first', () => {
        // A 2:1 box (at most 50 tall) before a square (at most 100).
        const distribution = distribute([React.createElement(Fit, { ratio: 1 }), React.createElement(Fit, { ratio: 2 })], 300);
        expect(heights(distribution)).toEqual([100, 50]);
        expect(distribution?.length).toBe(150);
    });

    it('gives a flexible child what the others leave', () => {
        const distribution = distribute([React.createElement(Flexible, {}), React.createElement(Fixed, { length: 100 }), React.createElement(Fit, { ratio: 1 })], 360);
        expect(heights(distribution)).toEqual([160, 100, 100]);
        expect(distribution?.length).toBe(360);
    });

    it('holds a flexible child to its maximum, so the stack hugs', () => {
        const distribution = distribute([React.createElement(Flexible, { max: 100 }), React.createElement(Fixed, { length: 20 })], 300);
        expect(heights(distribution)).toEqual([100, 20]);
        expect(distribution?.length).toBe(120);
    });

    it('takes the spacing out before sharing', () => {
        const distribution = distribute([React.createElement(Fixed, { length: 20 }), React.createElement(Fit, { ratio: 1 })], 300, 8);
        expect(distribution?.offers[1]).toEqual({ width: 100, height: 100 });
        expect(distribution?.length).toBe(128);
    });

    it('overflows when its children are longer than it is offered', () => {
        const distribution = distribute([React.createElement(Fixed, { length: 200 }), React.createElement(Fixed, { length: 200 })], 300);
        expect(distribution?.length).toBe(400);
    });

    it('leaves a stack with a child it cannot measure to CSS', () => {
        expect(distribute([React.createElement(Unmeasured), React.createElement(Fit, { ratio: 1 })], 300)).toBeNull();
    });

    it('leaves the stack to CSS when its children and measurements do not match', () => {
        const children = [React.createElement(Fixed, { length: 20 })];
        expect(distributeStack({ children, measured: [], axis: 'height', length: 300, cross: 100, spacing: 0, proposal: { width: null, height: null }, environment: {} })).toBeNull();
    });
});

describe('stack offers per child', () => {
    it('groups a ForEach\'s rows under it', () => {
        const a = { width: 100, height: 10 }, b = { width: 100, height: 20 }, c = { width: 100, height: 30 };
        expect(groupOffers([a, b, c], [null, 2])).toEqual([a, [b, c]]);
        expect(groupOffers([a, b, c], [2, null])).toEqual([[a, b], c]);
    });
});

describe('sizing pass', () => {
    it('measures an element once per offer within a pass', () => {
        let calls = 0;
        function Counted() { return null; }
        layoutRegistry.register(Counted, () => { calls++; return { frame: { width: 10, height: 10 } }; });
        const element = React.createElement(Counted);
        const at = (height: number) => measureElement(element, { proposal: { width: null, height: null }, props: element.props, environment: { proposal: { width: 100, height } } });
        inSizingPass(() => { at(50); at(50); at(80); });
        expect(calls).toBe(2);
        // Outside a pass nothing is kept, so a later render measures afresh.
        at(50);
        at(50);
        expect(calls).toBe(4);
    });

    it('hands out a copy, so a caller adjusting it leaves the next one alone', () => {
        function Sized() { return null; }
        layoutRegistry.register(Sized, () => ({ frame: { width: 10, height: 10 } }));
        const element = React.createElement(Sized);
        const options = { proposal: { width: null, height: null }, props: element.props, environment: { proposal: { width: 100, height: 50 } } };
        inSizingPass(() => {
            measureElement(element, options).frame.height = 99;
            expect(measureElement(element, options).frame.height).toBe(10);
        });
    });
});

describe('stack spacing', () => {
    it('measures the default spacing a stack draws', async () => {
        const { VStack } = await import('../Views/VStack');
        const { HStack } = await import('../Views/HStack');
        const bars = [React.createElement(Fixed, { length: 20 }), React.createElement(Fixed, { length: 20 })];
        const measure = (type: React.ElementType, props: Record<string, unknown>) =>
            layoutRegistry.get(type)!.sizingFn({ proposal: { width: null, height: null }, props: { ...props, children: bars }, children: bars, environment: {} });
        // VStack { bar; bar } is 20 + 8 + 20 tall, as SwiftUI and the CSS gap draw it.
        expect(measure(VStack, {}).frame.height).toBe(48);
        expect(measure(VStack, { spacing: 0 }).frame.height).toBe(40);
        expect(measure(HStack, {}).frame.width).toBe(208);
    });
});
