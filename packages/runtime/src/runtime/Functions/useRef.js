export function useRef(initialValue) {

    // Sanity check
    if (this.hookState.currentComponent == null) {
        return { current: initialValue }
    }

    // Get current state
    var hooks = this.hookState.currentComponent.hookStorage ?? []
    const hookIndex = this.hookState.currentComponent.hookIndex

    // Initialise the ref object once. Subsequent renders return the same object reference,
    // so mutations to `.current` persist without triggering re-renders.
    if (hooks[hookIndex] == null) {
        hooks[hookIndex] = { current: initialValue }
    }

    return hooks[this.hookState.currentComponent.hookIndex++]
}
