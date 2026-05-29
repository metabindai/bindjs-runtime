import { useRef } from 'react';

// @ts-ignore
import { BindJSRuntime } from "@metabindai/bindjs-runtime";

export function useBindJSRuntime(id?: string): BindJSRuntime {

    let reservedComponents = ['Self']

    const ref = useRef<BindJSRuntime>()
    if (ref.current == null) {
        ref.current = new BindJSRuntime({ expandForEach: true })
        ref.current.registerASTComponents(reservedComponents)

    }
    const lastIdRef = useRef(id)
    const runtime = ref.current

    if (lastIdRef.current !== id) {
        console.log('useYapJSRuntime: reset storage')
        ref.current.resetStorage()
        ref.current.resetState()
        ref.current.registerASTComponents(reservedComponents)
        lastIdRef.current = id
    }

    return runtime
}
