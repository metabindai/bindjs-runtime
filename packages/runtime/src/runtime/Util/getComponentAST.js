
// Helper: Recursively checks if a node or its children matches the given type
function getComponentAST(node, typeName) {
    var ast = node;

    // Unwrap component function if it is a component
    while (typeof ast === 'function' && ast._component) {
        ast = ast();
    }

    if (typeof ast === 'object' && ast !== null && typeName != null) {
        if (ast?.type === typeName && typeof ast.props === 'object') {
            return ast
        }

        // Recurse into children if they exist
        const astChildren = ast?.props?.children;
        if (astChildren) {
            const children = Array.isArray(astChildren) ? astChildren : [astChildren];
            for (const child of children) {
                const result = getComponentAST(child, typeName);
                if (result) return result;
            }
        }
    }
    return null;
}

export default getComponentAST;