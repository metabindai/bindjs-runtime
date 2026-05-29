// Wire Monaco to load from the local `monaco-editor` package (instead of a CDN)
// and to spin up its language workers via Vite's `?worker` imports. Without this
// the TypeScript worker — which we rely on to transpile TS → JS — won't be
// available and `getEmitOutput()` would return nothing.
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker()
        }
        return new editorWorker()
    },
}

loader.config({ monaco })
