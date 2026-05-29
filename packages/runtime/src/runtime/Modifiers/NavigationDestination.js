export function NavigationDestinationModifier({ args, name }) {

    // Assume args[0] contains the props
    const props = args[0] ?? { isPresented: false };

    // Extract isPresented value
    const isPresented = props.isPresented;

    // setIsPresented is already processed by processProps into setIsPresentedId
    const setIsPresentedHandlerId = props.setIsPresentedId ?? null;

    const destination = props.destination;

    // Return AST representation when destination handler is called.
    const destinationHandler = destination ? () => {
        // Execute handler, then AST function.
        return destination()();
    } : () => {
        return null;
    };

    return {
        props: {
            isPresented: isPresented,
            setIsPresentedHandlerId: setIsPresentedHandlerId,
            destinationHandlerId: this.storeFunction(destinationHandler, this.currentPathId(name + '_destination')),
        }
    }
}