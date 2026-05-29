export function OnHandler({ args, name }) {

    // If arg is a function, store it and return handler id
    // If arg is props, process them and return props
    const processArg = (arg) => {
        if (arg == null) {
            return {}
        }

        // Arg is a handler function
        if (typeof arg === 'function') {

            return { handlerId: this.storeFunction(arg, this.currentPathId(name)) }

            // Arg is a dictionary of props
        } else if (typeof arg === 'object' && !Array.isArray(arg)) {

            return arg

        } else {
            return { value: arg }
        }

    }

    // An 'on' handler can take either one or two arguments.
    // First or second may be a function or an object.
    // Second argument is optional but would be a function if present.
    return {
        props: {
            ...processArg(args[0]),
            ...processArg(args[1])
        },
    }
}   
