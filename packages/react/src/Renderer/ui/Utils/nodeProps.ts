import React from 'react';

export function nodeProps<T>(
    node: React.ReactNode,
    ComponentType: React.ElementType
): T | null {
    if (!React.isValidElement(node)) {
        return null;
    }

    // If it's a Fragment, unwrap a single child
    if (node.type === React.Fragment && React.Children.count(node.props.children) === 1) {
        const child = node.props.children[0];
        if (React.isValidElement(child)) {
            node = child;
        }
    }

    // Check if the unwrapped node matches the given component type
    if (node.type === ComponentType) {
        return node.props as T;
    }

    return null;
}