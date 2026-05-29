import React from 'react';
import { LayoutFrameType, LayoutMeasurement, LayoutSize, LayoutSizingFunction } from './LayoutTypes';
import { layoutRegistry } from './LayoutRegistry';

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

        let measurementFunction = getSizingFunctionForType(child) ?? defaultSizingFunction;
        
        if (React.isValidElement(child) && measurementFunction) {
            return measurementFunction({ proposal, props: child.props, children: child.props.children, context, environment });
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

export function measureChildren(children, proposedSize: LayoutSize, environment: Record<string, any>, nodeEnvironment?: Record<string, any>): LayoutMeasurement[] {
    var childrenWithSizes: LayoutMeasurement[] = []

    function mapChildren(children) {

        React.Children.forEach(children, (child) => {   

            // TODO: Handle this better
            if (child && child.props && child.props._type == 'ForEach') {
                mapChildren(child.props.children)
                return
            }

            let sizeFunction = getSizingFunctionForType(child) ?? defaultSizingFunction;

            if (child && child.type && sizeFunction) {
                const size = sizeFunction({ proposal: proposedSize, props: child.props, children: child.props.children, environment: { ...environment, ...nodeEnvironment ?? {} } });
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

        if (size.width) {
            v.width = Math.max((v.width ?? 0), size.width)
            sizedChildrenWidth += 1
        }
        if (size.height) {
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
            v.minWidth = size.minWidth
        }
        if (size.minHeight) {
            v.minHeight = size.minHeight
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