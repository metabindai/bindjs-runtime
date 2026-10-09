import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

import { processComponentJs } from '../lib/processComponent'

// BindJS ships its component API as raw `.d.ts` files inside the published
// package. We load them into Monaco as "extra libs" so authoring gets full
// IntelliSense for the global `defineComponent`, views, modifiers and hooks.
// The `?raw` query (typed by vite/client) returns the file contents as a string.
import METABIND_TYPES from '@metabindai/bindjs-react/types/metabind.d.ts?raw'
import BROWSER_GLOBALS from '@metabindai/bindjs-react/types/browser-globals.d.ts?raw'

export interface CompileResult {
    /** The model path the source came from, so stale async results can be dropped. */
    path: string
    typescript: string
    javascript: string
}

export interface CodeEditorHandle {
    /** Replace the current model's source, e.g. to reset a fixture. */
    setValue: (value: string) => void
}

interface CodeEditorProps {
    /**
     * Identifies the document. Each path gets its own Monaco model, so edits
     * and cursor position survive switching away and back.
     */
    path: string
    /** Source to seed a path's model with the first time it's opened. */
    initialValue: string
    /** Extra global declarations, e.g. for fixtures other fixtures can call. */
    extraDeclarations?: string
    /** Fired whenever the source changes, and on opening a path, with the transpiled JS. */
    onCompile: (result: CompileResult) => void
}

function configureMonaco(monaco: Monaco, extraDeclarations?: string) {
    const ts = monaco.languages.typescript

    ts.typescriptDefaults.setCompilerOptions({
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        // No 'dom' lib on purpose: lib.dom.d.ts declares globals like `Text`,
        // `Image`, `Color` that would shadow the BindJS view functions in
        // IntelliSense. BindJS supplies its own globals via browser-globals.d.ts.
        lib: ['es2020', 'es2020.json', 'es2020.math'],
        allowJs: true,
        allowNonTsExtensions: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        noEmitOnError: false, // still emit JS even when there are type errors
        strict: false,
    })

    ts.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        // Quieten "unused variable / import" noise for in-progress editing.
        diagnosticCodesToIgnore: [6133, 6196, 6192],
    })

    ts.typescriptDefaults.setEagerModelSync(true)

    // Register the type definitions (idempotent — Monaco dedupes by uri).
    ts.typescriptDefaults.addExtraLib(METABIND_TYPES, 'ts:metabind-core.d.ts')
    ts.typescriptDefaults.addExtraLib(BROWSER_GLOBALS, 'ts:browser-globals.d.ts')
    if (extraDeclarations) {
        ts.typescriptDefaults.addExtraLib(extraDeclarations, 'ts:extra-globals.d.ts')
    }
}

// Ask Monaco's TypeScript worker to transpile the current model to JavaScript.
async function emitJavaScript(
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
): Promise<string> {
    const model = editorInstance.getModel()
    if (!model) return ''

    const getWorker = await monaco.languages.typescript.getTypeScriptWorker()
    const client = await getWorker(model.uri)
    const output = await client.getEmitOutput(model.uri.toString())

    const jsFile = output.outputFiles.find((f) => f.name.endsWith('.js'))
    return jsFile?.text ?? ''
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
    { path, initialValue, extraDeclarations, onCompile },
    ref,
) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<Monaco | null>(null)

    const compile = useCallback(async () => {
        const ed = editorRef.current
        const monaco = monacoRef.current
        const model = ed?.getModel()
        if (!ed || !monaco || !model) return

        const modelPath = model.uri.toString()
        const typescript = model.getValue()
        const javascript = await emitJavaScript(ed, monaco)
        onCompile({
            path: modelPath,
            typescript,
            javascript: processComponentJs(javascript),
        })
    }, [onCompile])

    useImperativeHandle(ref, () => ({
        setValue: (value: string) => editorRef.current?.getModel()?.setValue(value),
    }))

    // The Editor child swaps models in its own effect, which runs before this
    // one, so the new path's model is current by the time we compile.
    useEffect(() => {
        void compile()
    }, [path, compile])

    const handleMount: OnMount = (ed, monaco) => {
        editorRef.current = ed
        monacoRef.current = monaco
        configureMonaco(monaco, extraDeclarations)
        // Initial compile once the worker has the model.
        void compile()
    }

    return (
        <Editor
            theme="vs"
            language="typescript"
            path={modelUri(path)}
            defaultValue={initialValue}
            onMount={handleMount}
            onChange={() => void compile()}
            options={{
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                minimap: { enabled: false },
                tabSize: 4,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
            }}
        />
    )
})

/** The Monaco model URI for a document path; matches `CompileResult.path`. */
export function modelUri(path: string): string {
    return `file:///${path}.tsx`
}
