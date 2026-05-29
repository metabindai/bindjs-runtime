export function useAppState(key, defaultValue) {
    const rerenderCallback = this.needsRerender
    const rendererId = this.rendererId

    const set = (newValue) => {

        // Update the app state with the new value
        this.updatedAppState(key, newValue, (prevState) => {
            // Check if the value has changed
            if (prevState[key] !== newValue) {
                return { ...prevState, [key]: newValue };
            }
            return prevState;  // No change, return previous state
        }, () => {
            // Trigger a re-render if the state has changed
            rerenderCallback(rendererId);
        });
    }

    return [this.appState[key] ?? defaultValue, set];
}