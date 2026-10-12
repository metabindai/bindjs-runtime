import AST from "../AST.js";

/**
 * Modifier that supports content as a first or second argument.
 * If two arguments are provided, the first is treated as props and the second as content.
 * 
 * Used for modifiers like background and overlay.
 */
export function ContentModifier({ args, content, name, position }) {

    var modifierContent = null
    var props = {}

    if (args.length == 2) {
        modifierContent = args[1];
        props = args[0];
    } else if (args.length == 1) {
        modifierContent = args[0];
    }

    modifierContent = this.buildModifierContent(name, position, () => {
        // Single component
        if (typeof modifierContent == 'function') {
            return this.unwrapComponentAST(modifierContent);

            // Convert array of components to Group
        } else if (Array.isArray(modifierContent)) {
            const items = modifierContent.map((item, index) => {
                if (typeof item == 'function') {
                    this.hookState.childIndex = index;
                    return this.unwrapComponentAST(item);
                } else {
                    return item;
                }
            });
            return AST.Directive('Group', {}, items);
        }
        return modifierContent;
    });

    return {
        props: { ...props, content: modifierContent },
    }
}