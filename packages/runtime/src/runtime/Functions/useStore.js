export function useStore(key, defaultValue, scope) {
    if (defaultValue === null || typeof defaultValue !== "object") {
        throw new Error(
            `useStore("${key}") defaultValue must be an object (Zustand-style).`
        );
    }

    const fullKey = scope ? `${scope}:${key}` : key;

    const rerenderCallback = this.needsRerender;
    const rendererId = this.rendererId;

    // Read or fallback to default
    const stateObj = this.appState[fullKey] ?? defaultValue;

    // Zustand-style setter
    const set = (value) => {
        const next =
            typeof value === "function"
                ? value(stateObj)
                : value;

        if (!next || typeof next !== "object") {
            throw new Error(
                `useStore("${key}") set() must return an object`
            );
        }

        this.updatedAppState(
            fullKey,
            next,
            (prevState) => {
                const prev = prevState[fullKey] ?? defaultValue;
                if (prev !== next) {
                    return { ...prevState, [fullKey]: next };
                }
                return prevState; // unchanged
            },
            () => rerenderCallback(rendererId)
        );
    };

    // Flattened store object
    const store = {
        set
    };

    // Add state fields directly onto the store object
    for (const field of Object.keys(stateObj)) {
        store[field] = stateObj[field];

        const cap =
            field.charAt(0).toUpperCase() + field.slice(1);
        const setterName = `set${cap}`;

        store[setterName] = (val) => {
            set((prev) => ({
                ...prev,
                [field]:
                    typeof val === "function"
                        ? val(prev[field])
                        : val
            }));
        };
    }

    return store;
}