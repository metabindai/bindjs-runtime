import React from 'react'

/**
 * Lets a host coordinate against WebGL <Shader> views without coupling to the
 * shader's internals or baking any visual behavior into the shader itself.
 *
 * A <Shader> down the tree registers when it mounts (so the host can tell the
 * page contains one) and reports once it has drawn its first frame. The host
 * renders a <ShaderReadyProvider> above the content and reacts via `onChange`
 * — e.g. to hold a reveal until the shader has actually painted, instead of
 * showing an empty canvas during GL warm-up. Entirely inert when no provider is
 * present, so the shader behaves exactly as before outside a coordinating host.
 */
export interface ShaderCoordinator {
    /** A shader mounted. */
    register: (id: string) => void
    /** A shader unmounted. */
    unregister: (id: string) => void
    /** A shader drew its first frame. */
    reportFirstFrame: (id: string) => void
}

export const ShaderContext = React.createContext<ShaderCoordinator | null>(null)

export interface ShaderReadiness {
    /** Shaders currently mounted in the subtree. */
    count: number
    /** How many of them have drawn their first frame. */
    ready: number
    /** True once at least one shader is mounted and all mounted shaders are ready. */
    allReady: boolean
}

/**
 * Tracks the <Shader> views rendered beneath it and reports readiness changes
 * via `onChange`. Note: a shader only reports its first frame once it actually
 * draws, which for a below-the-fold shader is when it scrolls into view — so a
 * host that gates an initial reveal on `allReady` should pair it with a fallback
 * timeout. For an above-the-fold hero shader, `allReady` flips as soon as it
 * paints.
 */
export function ShaderReadyProvider({
    children,
    onChange,
}: {
    children: React.ReactNode
    onChange?: (readiness: ShaderReadiness) => void
}): React.ReactElement {
    const registered = React.useRef<Set<string>>(new Set())
    const ready = React.useRef<Set<string>>(new Set())
    const onChangeRef = React.useRef(onChange)
    onChangeRef.current = onChange

    const emit = React.useCallback(() => {
        const count = registered.current.size
        const readyCount = ready.current.size
        onChangeRef.current?.({
            count,
            ready: readyCount,
            allReady: count > 0 && readyCount >= count,
        })
    }, [])

    const coordinator = React.useMemo<ShaderCoordinator>(() => ({
        register: (id) => { registered.current.add(id); emit() },
        unregister: (id) => { registered.current.delete(id); ready.current.delete(id); emit() },
        reportFirstFrame: (id) => { ready.current.add(id); emit() },
    }), [emit])

    return <ShaderContext.Provider value={coordinator}>{children}</ShaderContext.Provider>
}
