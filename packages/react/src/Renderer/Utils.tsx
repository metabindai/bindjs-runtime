import React, { ReactNode, ReactElement } from 'react';

type ComponentMapping = {
    [key: string]: ReactElement;
};

export function px(value: string | null | undefined | number): string {
    if (value == null) {
        return ''
    }
    if (typeof value === 'number') {
        return `${value}px`;
    } else if (String(value).endsWith('px')) {
        return value;
    } else {
        return `${value}px`;
    }
}

export function pxnull(value?: string | null | undefined): string | null {
    if (value == null) {
        return null
    }
    if (String(value ?? "").endsWith('px')) {
        return value;
    } else {
        return `${value}px`;
    }
}

export function pt(value: string | null | undefined): string {
    if (value == null) {
        return ''
    }
    if (String(value).endsWith('pt')) {
        return value;
    } else {
        return `${value}pt`;
    }
}

export function asNumber(value: string | null | undefined | number): number {
    if (value == null) {
        return 0
    } else if (typeof value === 'number') {
        return value
    } else if (typeof value === 'string') {
        return parseFloat(value)
    }
    return 0
}

function isFunction(variable) {
    return typeof variable === 'function';
}

export function nodeString(node): string | null {
    if (node == null || node.props == null) {
        if (typeof node === 'string') {
            return node
        } else {
            return null
        }
    }

    /** Extract string content only */
    let stringContent = React.Children.toArray(node.props.children).filter((item) => { return typeof item === 'string' }).join("\n");
    return stringContent
}

function containsKey(dictionary, keysArray) {
    // First, check if the dictionary is a valid object
    if (typeof dictionary !== 'object' || dictionary === null || Array.isArray(dictionary)) {
        return false;
    }

    // Iterate through the array of keys
    for (let key of keysArray) {
        // Check if the dictionary contains the current key
        if (dictionary.hasOwnProperty(key)) {
            return true;
        }
    }
    // If none of the keys were found, return false
    return false;
}

function remapChildren(
    children: ReactNode[],
    mapping: ComponentMapping
): ReactNode {
    return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const mappedType = mapping[child.type as string] || mapping[child.props._type as string];

            // If the child's type is in the mapping, replace it with the mapped component
            if (mappedType) {
                return React.cloneElement(mappedType, { ...child.props });
            }

            // Recursively remap the children of this child if it has any
            // if (child.props && child.props.children) {
            //     return React.cloneElement(child, {
            //     }, remapChildren([...(child.props?.children ?? [])], mapping));
            // }
        }

        // Return the child unchanged if it doesn't match the mapping or doesn't have children
        return child;
    });
}

function containsNodeOfType(
    children: ReactNode,
    type: React.JSXElementConstructor<any>,
    recursive: Boolean = false
): boolean {
    let found = false;

    React.Children.forEach(children, (child) => {
        if (found) return;

        if (React.isValidElement(child)) {
            // Check if the child is of the specified type
            //console.log(child.type.name)
            const childTypeName = (child.type as React.JSXElementConstructor<any>).name;
            const targetTypeName = type.name;

            if (childTypeName == targetTypeName) {
                found = true;
                return
            }

            // Recursively check the children of this child if it has any
            if (child.props && child.props.children && recursive) {
                found = containsNodeOfType(child.props.children, type) || found;
            }
        }
    });

    return found;
}

export function nodeOfType(
    children: ReactNode,
    type: React.JSXElementConstructor<any>,
    recursive: Boolean = false
): any | null {
    let found: any | null = null;

    if (React.isValidElement(children)) {
        if (children.type === type) {
            return children;
        }
    }

    React.Children.forEach(children, (child) => {
        if (found) return;

        if (React.isValidElement(child)) {
            if (child.type === type) {
                found = child;
            }

            // Recursively check the children of this child if it has any
            if (child.props && child.props.children && recursive) {
                found = nodeOfType(child.props.children, type) || found;
            }
        }
    });

    return found;
}

export function nodeOfTypeWithParent(
    children: ReactNode,
    type: React.JSXElementConstructor<any>,
    recursive: Boolean = false,
    parent?: ReactNode
): any | null {
    let found: any | null = null;
    let foundParent: any | null = parent;

    if (React.isValidElement(children)) {
        if (children.type === type) {
            return { node: children, parent: parent };
        }
    }

    React.Children.forEach(children, (child) => {
        if (found) return;

        if (React.isValidElement(child)) {
            if (child.type === type) {
                found = child;
            }

            // Recursively check the children of this child if it has any
            if (child.props && child.props.children && recursive) {
                let element = nodeOfTypeWithParent(child.props.children, type, recursive, child);
                if (element.node) {
                    found = element.node;
                    foundParent = element.parent;
                }
            }
        }
    });

    return { node: found, parent: foundParent };
}

function replaceChildrenForNodeType(
    node: ReactNode,
    //type: React.JSXElementConstructor<any>,
    typeName: string,
    newChildren: ReactNode
) {
    // Find child of type in node and replace it's children with the provided children, recursively
    if (!React.isValidElement(node)) {
        return node;
    }

    if (nodeName(node) === typeName) {
        return React.cloneElement(node, node.props, newChildren);
    }

    if (node.props && node.props.children) {
        const updatedChildren = React.Children.map(node.props.children, (child) =>
            replaceChildrenForNodeType(child, typeName, newChildren)
        );
        return React.cloneElement(node, node.props, updatedChildren);
    }

    return node;
}

function nodeName(node) {
    if (node == null) { return null }

    // Nodes coming from yapui have _type in the props.
    // Issue is minified code can mess up the type names.
    if (node && node.props && node.props._type) {
        return node.props._type
    }

    const type = node.type
    if (type == null) { return "" }
    const nodeName = typeof type === 'string' ? type : type.displayName || type.name || 'Unknown'
    return nodeName
}


// export function evalCaptureFunctions(code) {
//     const customScope = {}; // Custom scope object to hold the functions

//     // Rewrite the code to ensure functions are assigned to the custom scope object
//     const rewrittenCode = `
//       (function(scope) {
//         ${code
//           .replace(/function\s+([a-zA-Z0-9_]+)/g, (match, fnName) => `scope.${fnName} = function`)
//         }
//       })(customScope);
//     `;

//     // Evaluate the rewritten code
//     eval(rewrittenCode);

//     // Return the customScope as a dictionary (object in JavaScript)
//     return customScope;
// }

export const getDomEvents = (props) => {
    var domEvents = {}
    for (var key in props) {
        if (key.startsWith('on') && key != 'onASTUpdate') {
            domEvents[key] = props[key]
        }
    }
    return domEvents
}
