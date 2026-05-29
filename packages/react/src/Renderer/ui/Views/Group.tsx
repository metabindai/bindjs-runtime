import React, { useState, useEffect } from 'react';
import {LayoutNodeChildren, layoutRegistry, useLayout } from '../Layout';
import { measureMaxChild } from '../Layout/utils';

export function Group({ children }) {
    const layout = useLayout({ children }, Group);

    let filteredChildren = children.filter((child) => {
        return React.isValidElement(child) == true;
    });

    return (
        <LayoutNodeChildren layout={layout}>
            {filteredChildren}
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