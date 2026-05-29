
export const getComponentData = (child) => {
    let ast = child()
    let data = findComponentDataInAST(ast)
    return data ?? { name: null, props: {}  }
}

const findComponentDataInAST = (node) => {
    if (!node) return null;

    // Base case: If this node is not one of the excluded types, return its type/name
    if (node.type !== "ModifiedComponent" && node.type !== "DOMIdentifable") {
        // For ComponentCall nodes, prefer props.name (since "type" would just be "ComponentCall")
        if (node.type === "ComponentCall") {
            return {
                name: node.name ?? node.props?.name ?? null,
                props: node.props?.props ?? {}
            }
        } else {
            return {
                name: node.type,
                props: node.props ?? {}
            }
        }
    }

    // Otherwise, explore its children or content recursively
    const children =
        node.props?.children ??
        node.content ??
        node.props?.content ?? // current iOS implementation.
        (node.modifier?.props?.children ?? []);

    if (Array.isArray(children)) {
        for (const child of children) {
            const result = findComponentDataInAST(child);
            if (result) return result;
        }
    } else if (children) {
        return findComponentDataInAST(children);
    }

    // Also look into modifier content if present
    if (Array.isArray(node.content)) {
        for (const child of node.content) {
            const result = findComponentDataInAST(child);
            if (result) return result;
        }
    }

    return null;
}