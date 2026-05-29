export function GenericComponent({ args }) {
    var { props, children } = processComponentArgs(args[0], args[1])

    // If props isnt a dictionary contain within value
    if (typeof props != 'object' || typeof props == 'function') {
        props = { rawValue: props }
    }

    // Expand functions in props 
    props = this.processProps(props)

    /**
     * Execute children
     */
    const childrenAST = processChildren.bind(this)(children);

    return { props, children: childrenAST }
}

export function processChildren(children) {
    if (!children) {
        return [];
    }

    /**
     * Execute children
     */
    const childrenAST = (children ?? []).flatMap((child, index) => {
        this.hookState.childIndex = index

        let content = typeof child === 'function' ? child() : child
        if (typeof content === 'function') {
            content = content()
        }
        return content
    })

    // Reset
    this.hookState.childIndex = 0

    return childrenAST
}

export function processComponentArgs(arg1, arg2) {
    // Allow children to be passed as the first argument, including as a single component (function)
    const childrenFirstArg = arg1 != null && arg2 == null && Array.isArray(arg1);
    const singleComponentChild = arg1 != null && arg2 == null && typeof arg1 === 'function' && arg1._component;
    const rawValueFirstArg = typeof arg1 != 'object' && !childrenFirstArg && !singleComponentChild;

    const props =
        rawValueFirstArg ? { rawValue: arg1 }
            : childrenFirstArg ? {}
                : singleComponentChild ? {}
                    : arg1;

    const children =
        childrenFirstArg ? arg1
            : singleComponentChild ? [arg1]
                : arg2;

    return { props, children };
}