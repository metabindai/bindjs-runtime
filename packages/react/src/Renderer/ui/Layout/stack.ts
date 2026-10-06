import React from 'react';
import type { LayoutFrameType, LayoutMeasurement, LayoutSize } from './LayoutTypes';
import type { Offer, OfferedLength } from './offer';
import { measureElement } from './utils';

/** The spacing a stack puts between its children: its own, or SwiftUI's default of 8. */
export function stackSpacing(spacing: number | null | undefined): number {
    return spacing ?? 8;
}

/** The length a stack lays its children out along. */
export type StackAxis = 'width' | 'height';

export interface StackDistribution {
    /** Each child's measurement at its offer, with its length along the stack resolved. */
    measurements: LayoutMeasurement[];
    /** What the stack offers each child where it places it: the length the child took. */
    offers: Offer[];
    /** The stack's length along its axis: its children's lengths and the spacing between them. */
    length: number;
}

const BOUNDS: Record<StackAxis, [keyof LayoutFrameType, keyof LayoutFrameType]> = {
    width: ['minWidth', 'maxWidth'],
    height: ['minHeight', 'maxHeight'],
};

/**
 * A child's length along the stack when offered `offered`: its own when it has
 * one, the offer within its bounds when it takes what it is offered, or null
 * when the layout pass doesn't know it (CSS sizes text).
 */
function lengthAt(measurement: LayoutMeasurement, axis: StackAxis, offered: number): number | null {
    const length = measurement.frame[axis];
    if (typeof length === 'number' && Number.isFinite(length)) return length;
    if (length !== Infinity) return null;
    const [minKey, maxKey] = BOUNDS[axis];
    const min = measurement.frame[minKey];
    const max = measurement.frame[maxKey];
    let resolved = offered;
    if (typeof max === 'number' && max > 0) resolved = Math.min(resolved, max);
    if (typeof min === 'number' && Number.isFinite(min)) resolved = Math.max(resolved, min);
    return resolved;
}

/**
 * SwiftUI's stack layout along a stack's axis, for a stack offered `length`
 * points.
 *
 * A child's flexibility is the difference between its length when offered
 * nothing and when offered unlimited room. The least flexible child is offered
 * an equal share of the length first, then each next child an equal share of
 * what the ones before it left. So a fixed child takes its own length and an
 * aspect box is offered the rest. The stack is as long as its children and the
 * spacing: shorter than `length` when they hug, longer when they overflow.
 *
 * `children` are the stack's direct children and `measured` their usual
 * measurement, with a share only CSS knows. A child with a length of its own
 * there keeps it; any other is measured at points. Returns null when a child's length isn't
 * known in the layout pass (text, or anything holding it); the stack then
 * keeps sharing its length through CSS.
 */
export function distributeStack({ children, measured, axis, length, cross, spacing, proposal, environment }: {
    children: React.ReactElement[];
    measured: LayoutMeasurement[];
    axis: StackAxis;
    length: number;
    cross: OfferedLength;
    spacing: number;
    proposal: LayoutSize;
    environment: Record<string, any>;
}): StackDistribution | null {
    if (children.length === 0 || children.length !== measured.length) return null;

    const offerAt = (offered: number): Offer => (axis === 'height' ? { width: cross, height: offered } : { width: offered, height: cross });

    const entries = children.map((child, index) => {
        const usual = measured[index];
        const own = usual.frame[axis];
        // Flexible at a CSS share doesn't mean flexible at points: an aspect box
        // around a color reports the color's size until it is offered points.
        const dependsOnOffer = !(typeof own === 'number' && Number.isFinite(own));
        const props = child.props as any;
        const at = (offered: number): LayoutMeasurement => dependsOnOffer
            ? measureElement(child, { proposal, props, children: props.children, environment: { ...environment, proposal: offerAt(offered) } })
            : usual;
        return { at, least: lengthAt(at(0), axis, 0), most: lengthAt(at(Infinity), axis, Infinity) };
    });
    if (entries.some((entry) => entry.least === null || entry.most === null)) return null;

    const flexibility = (index: number) => {
        const difference = (entries[index].most as number) - (entries[index].least as number);
        return Number.isNaN(difference) ? Infinity : difference;
    };
    const order = entries.map((_, index) => index).sort((a, b) => flexibility(a) - flexibility(b));

    const measurements: LayoutMeasurement[] = new Array(children.length);
    const offers: Offer[] = new Array(children.length);
    let remaining = length - spacing * (children.length - 1);
    let total = spacing * (children.length - 1);
    for (const [position, index] of order.entries()) {
        const offered = Math.max(0, remaining / (children.length - position));
        const measurement = entries[index].at(offered);
        const resolved = lengthAt(measurement, axis, offered);
        if (resolved === null) return null;
        // SwiftUI places each child with the length it took, which its content
        // then sees: a card held wider than its share by its content's minimum
        // offers that content the card's width, not the share.
        offers[index] = offerAt(resolved);
        measurements[index] = { ...measurement, frame: { ...measurement.frame, [axis]: resolved } };
        remaining -= resolved;
        total += resolved;
    }

    return { measurements, offers, length: total };
}

/** A stack's offers per child: one per view, and a ForEach's offers for its rows (see stackElements). */
export function groupOffers(offers: Offer[], shape: (number | null)[]): (Offer | Offer[])[] {
    let index = 0;
    return shape.map((rows) => (rows === null ? offers[index++] : offers.slice(index, (index += rows))));
}
