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
/**
 * The elements a stack lays out, after unwrapping a single Group, when they are
 * its direct children. Null when a `ForEach` or `Group` among them renders
 * several, so they can't be matched one to one with what the stack measures.
 */
export function stackElements(children: React.ReactNode): React.ReactElement[] | null {
    const elements = React.Children.toArray(unwrapGroupChildren(children)).filter(React.isValidElement) as React.ReactElement[];
    return elements.some((element) => element.type === Group || (element.props as any)?._type === 'ForEach') ? null : elements;
}
