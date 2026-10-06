import React from 'react';
import { LayoutFrameType, LayoutMeasurement, LayoutSize, LayoutSizingFunction } from './LayoutTypes';
import { layoutRegistry } from './LayoutRegistry';

/**
 * Measurements made during one sizing pass (a node's sizing function at render
 * and everything it measures), by element and offer. Stacks and aspect boxes
 * measure a child at several offers, and their ancestors measure them at
 * several in turn: without this, nested stacks cost exponential time.
 */
let pass: WeakMap<object, Map<string, LayoutMeasurement>> | null = null;

/** Runs `measure` as one sizing pass, or inside the pass already running. */
export function inSizingPass<T>(measure: () => T): T {
    if (pass) return measure();
    pass = new WeakMap();
    try {
        return measure();
    } finally {
        pass = null;
    }
}

/** An element's measurement under `options`, measured once per offer within a sizing pass. */
export function measureElement(child: React.ReactElement, options: Parameters<LayoutSizingFunction>[0]): LayoutMeasurement {
    const sizeFunction = getSizingFunctionForType(child) ?? defaultSizingFunction;
    const props = child.props as object;
    if (!pass || !props) return sizeFunction(options);
    const offer = options.environment?.proposal;
    const key = `${offer?.width}|${offer?.height}|${options.environment?.layout ?? ''}|${options.proposal?.width}|${options.proposal?.height}`;
    let byOffer = pass.get(props);
    if (!byOffer) pass.set(props, (byOffer = new Map()));
    let measurement = byOffer.get(key);
    if (!measurement) byOffer.set(key, (measurement = sizeFunction(options)));
    // Callers may adjust what they are given; the cached measurement stays as measured.
    return { ...measurement, frame: { ...measurement.frame } };
}

function getSizingFunctionForType(child: React.ReactNode): LayoutSizingFunction | null {
    if (!React.isValidElement(child)) return null;
    
    const childType = child.type;
    if (!childType || typeof childType === 'string') return null;
    
    const layoutInfo = layoutRegistry.get(childType);
    return layoutInfo?.sizingFn ?? null;
}

// Default sizing function
// Returns max child size or if no children, will return proposal size.
export const defaultSizingFunction: LayoutSizingFunction = ({ proposal, props, children, context, environment }) => {  
    let childCount = React.Children.count(children);
    if (childCount == 0) {

        // If no children, return proposed size.
        return {
            frame: proposal
        }

    } else if (childCount == 1) {
        
        // If only one child, use its size
        let child = React.Children.toArray(children)[0];

        if (React.isValidElement(child)) {
            const childProps = child.props as any;
            const measurement = measureElement(child, { proposal, props: childProps, children: childProps.children, context, environment });
            // The child's offer is what it offers its own children; a node
            // passing its child's size through offers what it was offered.
            if (measurement.environment && 'offer' in measurement.environment) {
                const { offer, ...rest } = measurement.environment;
                return { ...measurement, environment: rest };
            }
            return measurement;
        } else {
            return {
                frame: proposal
            }
        }

    } else {
        // More than one child, measure the maximum size
        return {
            frame: measureMaxChild({ children, proposal, environment: environment ?? {} })
        };
    }
}

/**
 * The least a child takes along an axis: its size when known, or the minimum
 * a flexible child reported. SwiftUI never sizes a view smaller than a child
 * of known size, so containers that take their children's size carry it up.
 */
export function knownMinimum(size: LayoutFrameType, axis: 'width' | 'height'): number {
    const length = size[axis];
    const min = size[axis === 'width' ? 'minWidth' : 'minHeight'];
    const known = typeof length === 'number' && Number.isFinite(length) ? length : 0;
    return Math.max(known, typeof min === 'number' && Number.isFinite(min) ? min : 0);
}

export function measureChildren(children, proposedSize: LayoutSize, environment: Record<string, any>, nodeEnvironment?: Record<string, any>): LayoutMeasurement[] {
    var childrenWithSizes: LayoutMeasurement[] = []

    function mapChildren(children) {

        React.Children.forEach(children, (child) => {   

            // A ForEach's items are its parent's children. A lazy one is built
            // here, through the renderer, so the parent measures them.
            if (child && child.props && child.props._type == 'ForEach') {
                mapChildren(environment?.expandForEach ? environment.expandForEach(child.props) : child.props.children)
                return
            }

            if (React.isValidElement(child) && child.type) {
                const childProps = child.props as any;
                const size = measureElement(child, { proposal: proposedSize, props: childProps, children: childProps.children, environment: { ...environment, ...nodeEnvironment ?? {} } });
                childrenWithSizes.push(size)
            }

        });
    }

    try {
        mapChildren(children)
    } catch (e) {
        
    }

    return childrenWithSizes
}

export function measureMaxChild({ proposal, children, environment, nodeEnvironment } : { proposal: LayoutSize, children: React.ReactNode, environment: Record<string, any>, nodeEnvironment?: Record<string, any> }): LayoutFrameType {
    let v: LayoutFrameType = { ...proposal }

    let sizesOfChildren = measureChildren(children, proposal, environment, nodeEnvironment)

    var sizedChildrenHeight = 0
    var sizedChildrenWidth = 0
    sizesOfChildren.forEach((measurment) => {
        const size = measurment.frame;

        // A zero length is a known length (a zero frame, or a box offered nothing).
        if (size.width != null) {
            v.width = Math.max((v.width ?? 0), size.width)
            sizedChildrenWidth += 1
        }
        if (size.height != null) {
            v.height = Math.max((v.height ?? 0), size.height)
            sizedChildrenHeight += 1
        }
        if (size.maxWidth) {
            v.maxWidth = size.maxWidth
        }
        if (size.maxHeight) {
            v.maxHeight = size.maxHeight
        }
        if (size.minWidth) {
            v.minWidth = Math.max(v.minWidth ?? 0, size.minWidth)
        }
        if (size.minHeight) {
            v.minHeight = Math.max(v.minHeight ?? 0, size.minHeight)
        }
    })

    // Clamp to proposed width
    if (proposal.width && v.width && v.width > proposal.width) {
        v.width = proposal.width
    }

    // Clamp to proposed height
    if (proposal.height && v.height && v.height > proposal.height) {
        v.height = proposal.height
    }
    
    // If a child has no defined height, then dont clamp to sized one.
    if (sizedChildrenHeight != sizesOfChildren.length && v.height != Infinity) {
        v.height = null
    }

    if (sizedChildrenWidth != sizesOfChildren.length && v.width != Infinity) {  
        v.width = null
    }

    return v
}