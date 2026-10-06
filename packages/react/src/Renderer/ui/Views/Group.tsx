import React, { useState, useEffect } from 'react';
import {LayoutNodeChildren, layoutRegistry, useLayout } from '../Layout';
import { measureMaxChild } from '../Layout/utils';
import { ClearTextInputPadding } from '../Utils/textInputPadding';

export function Group({ children }) {
    const layout = useLayout({ children }, Group);

    let filteredChildren = children.filter((child) => {
        return React.isValidElement(child) == true;
    });

    return (
        <LayoutNodeChildren layout={layout}>
            <ClearTextInputPadding>
                {filteredChildren}
            </ClearTextInputPadding>
        </LayoutNodeChildren>
    );
}

const sizeThatFits = ({ proposal, props, children, environment }) => {
    return {
        frame: measureMaxChild({ proposal, children, environment })
    }
}

layoutRegistry.register(
    Group,
    sizeThatFits
);

/**
 * Unwraps any children contained in a 'Group' component.
 * Avoids extra hierarchy and is important for sizing children.
 * @param children 
 * @returns 
 */
export function unwrapGroupChildren(children: React.ReactNode): React.ReactNode {
    if (!children) {
        return children;
    }
    if (React.Children.count(children) === 1) {
        const onlyChild = Array.isArray(children) ? children[0] as React.ReactNode : React.Children.only(children);

        if (React.isValidElement(onlyChild) && onlyChild.type === Group) {
            return onlyChild.props.children;
        }
    }
    return children;
}
export interface StackElements {
    /** The views the stack lays out, a ForEach's rows in its place, in the order the stack measures them. */
    items: React.ReactElement[];
    /** Per child of the stack: null for a view, or how many rows a ForEach contributes. */
    shape: (number | null)[];
}

const isForEach = (element: React.ReactElement) => (element.props as any)?._type === 'ForEach';

/**
 * The views a stack lays out, after unwrapping a single Group, with each
 * ForEach's rows (`expand` builds a lazy one's). Null when a nested Group, or a
 * ForEach or Group among a ForEach's rows, renders several views the stack
 * can't match one to one with what it measures.
 */
export function stackElements(children: React.ReactNode, expand?: (props: Record<string, any>) => React.ReactNode): StackElements | null {
    const items: React.ReactElement[] = [];
    const shape: (number | null)[] = [];
    for (const element of React.Children.toArray(unwrapGroupChildren(children)).filter(React.isValidElement) as React.ReactElement[]) {
        if (element.type === Group) return null;
        if (!isForEach(element)) {
            items.push(element);
            shape.push(null);
            continue;
        }
        const props = element.props as any;
        const rows = React.Children.toArray(expand ? expand(props) : props.children).filter(React.isValidElement) as React.ReactElement[];
        if (rows.some((row) => row.type === Group || isForEach(row))) return null;
        items.push(...rows);
        shape.push(rows.length);
    }
    return { items, shape };
}
