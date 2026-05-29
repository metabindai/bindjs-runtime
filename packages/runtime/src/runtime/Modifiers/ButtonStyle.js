export function ButtonStyle({ args, name }) {

    // If arg is a function, store it and return handler id
    // If arg is props, process them and return props
    const processArg = (arg) => {
        if (arg == null) {
            return {}
        }

        // Arg is a handler function
        if (arg._buttonStyle) {
            let unwrapped = arg()
            return { props: unwrapped.buttonStyleProps, handlerId: unwrapped.handlerId, environmentId: unwrapped.environmentId }
        } else {
            return {}
        }

    }

    // An 'on' handler can take either one or two arguments.
    // First or second may be a function or an object.
    // Second argument is optional but would be a function if present.
    let props = {
        props: {
            ...processArg(args[0])
        },
    }

    return props
}   
