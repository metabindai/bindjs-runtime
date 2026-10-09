import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { BindJSRuntime } from '@metabindai/bindjs-runtime'
import styled from 'styled-components'

import { CodeEditor, modelUri, type CodeEditorHandle, type CompileResult } from './components/CodeEditor'
import { Preview } from './components/Preview'
import { Sidebar } from './components/Sidebar'
import { findFixture, FIXTURES, SCRATCH } from './lib/fixtures'

interface PreviewMeta {
    title: string
}

// Fixtures call each other by name (e.g. `LabeledRectangle(...)`), and the
// runtime registers them all as globals — tell the editor about them too.
const FIXTURE_DECLARATIONS = FIXTURES.map((f) => {
    const type = /export\s+default\s+defineButtonStyle\b/.test(f.source) ? 'ButtonStyleComponent' : 'Component'
    return `declare function ${f.name}(props?: Record<string, any>, children?: Component[]): ${type};`
}).join('\n')

function idFromHash(): string {
    return decodeURIComponent(window.location.hash.replace(/^#\/?/, '')) || SCRATCH.id
}

export function App() {
    // Runtime errors are caught and logged inside the runtime (a broken
    // component renders nothing), so route them into the UI as well.
    const [runtimeErrors, setRuntimeErrors] = useState<string[]>([])
    const pendingErrors = useRef<string[]>([])

    // One runtime instance for the lifetime of the app, with every fixture
    // registered up front so cross-fixture calls resolve before either is opened.
    const runtime = useMemo(() => {
        const rt = new BindJSRuntime({
            logger: {
                error: (...args: unknown[]) => {
                    console.error(...args)
                    pendingErrors.current.push(args.map(formatLogArg).join(' '))
                    // Errors arrive mid-render; flush them after it.
                    queueMicrotask(() => {
                        if (pendingErrors.current.length === 0) return
                        const next = pendingErrors.current
                        pendingErrors.current = []
                        setRuntimeErrors((prev) => [...new Set([...prev, ...next])])
                    })
                },
            },
        })
        for (const f of FIXTURES) rt.registerComponent(f.name, f.js)
        return rt
    }, [])

    const [selectedId, setSelectedId] = useState(idFromHash)
    const fixture = findFixture(selectedId)

    const [version, setVersion] = useState(0)
    const [previews, setPreviews] = useState<PreviewMeta[]>([])
    const [previewIndex, setPreviewIndex] = useState(0)
    const [description, setDescription] = useState<string | null>(null)
    const [compileError, setCompileError] = useState<string | null>(null)
    const [modifiedIds, setModifiedIds] = useState<Set<string>>(() => new Set())
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')

    const editorRef = useRef<CodeEditorHandle | null>(null)
    // Avoid re-registering identical JS per component (the editor fires onChange generously).
    const lastJsRef = useRef<Record<string, string>>({})

    useEffect(() => {
        const onHashChange = () => setSelectedId(idFromHash())
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const select = useCallback((id: string) => {
        window.location.hash = `/${id}`
    }, [])

    // Re-read metadata and previews for the current registration of a component.
    const refresh = useCallback(
        (name: string) => {
            const metas: PreviewMeta[] =
                runtime.getComponentPreviewsWithMetadata?.(name)?.map(
                    (p: { title?: string }, i: number) => ({
                        title: p?.title?.trim() || `Preview ${i + 1}`,
                    }),
                ) ?? []
            const metadata = runtime.getComponentMetadata?.(name)

            setPreviews(metas)
            setPreviewIndex((prev) => (prev >= metas.length ? 0 : prev))
            setDescription(typeof metadata?.description === 'string' ? metadata.description : null)
            setRuntimeErrors([])
            setVersion((v) => v + 1)
        },
        [runtime],
    )

    // Switching fixtures shows the registered version immediately; the editor's
    // compile of the opened model follows and only re-registers if it differs.
    useEffect(() => {
        setPreviewIndex(0)
        setCompileError(null)
        if (fixture !== SCRATCH) refresh(fixture.name)
    }, [fixture, refresh])

    const handleCompile = useCallback(
        ({ path, typescript, javascript }: CompileResult) => {
            // Drop results for a document that's no longer open.
            if (path !== modelUri(fixture.id)) return

            if (fixture !== SCRATCH) {
                setModifiedIds((prev) => {
                    const modified = typescript !== fixture.source
                    if (modified === prev.has(fixture.id)) return prev
                    const next = new Set(prev)
                    if (modified) next.add(fixture.id)
                    else next.delete(fixture.id)
                    return next
                })
            }

            if (javascript === lastJsRef.current[fixture.name]) return
            lastJsRef.current[fixture.name] = javascript

            try {
                runtime.registerComponent(fixture.name, javascript)
                setCompileError(null)
                refresh(fixture.name)
            } catch (err) {
                setCompileError(err instanceof Error ? err.message : String(err))
            }
        },
        [fixture, runtime, refresh],
    )

    const isModified = modifiedIds.has(fixture.id)
    const errors = compileError ? [compileError] : runtimeErrors

    return (
        <Shell>
            <Header>
                <Brand>
                    BindJS <Dim>Playground</Dim>
                </Brand>

                <Controls>
                    {previews.length > 1 && (
                        <Select
                            value={previewIndex}
                            onChange={(e) => setPreviewIndex(Number(e.target.value))}
                            title="Preview variant"
                        >
                            {previews.map((p, i) => (
                                <option key={i} value={i}>
                                    {p.title}
                                </option>
                            ))}
                        </Select>
                    )}

                    <Toggle
                        onClick={() =>
                            setColorScheme((s) => (s === 'light' ? 'dark' : 'light'))
                        }
                        title="Toggle preview color scheme"
                    >
                        {colorScheme === 'light' ? '☀ Light' : '☾ Dark'}
                    </Toggle>
                </Controls>
            </Header>

            <Body>
                <PanelGroup direction="horizontal" autoSaveId="bindjs-playground-catalog">
                    <Panel defaultSize={16} minSize={10}>
                        <Sidebar
                            fixtures={FIXTURES}
                            selectedId={fixture.id}
                            modifiedIds={modifiedIds}
                            onSelect={select}
                        />
                    </Panel>

                    <Handle />

                    <Panel defaultSize={42} minSize={20}>
                        <PaneFill>
                            <CodeEditor
                                ref={editorRef}
                                path={fixture.id}
                                initialValue={fixture.source}
                                extraDeclarations={FIXTURE_DECLARATIONS}
                                onCompile={handleCompile}
                            />
                        </PaneFill>
                    </Panel>

                    <Handle />

                    <Panel defaultSize={42} minSize={20}>
                        <PaneFill>
                            {fixture !== SCRATCH && (
                                <Notes>
                                    <NotesText>
                                        <NotesTitle>{fixture.id}</NotesTitle>
                                        {description && <div>{description}</div>}
                                    </NotesText>
                                    {isModified && (
                                        <Toggle
                                            onClick={() => editorRef.current?.setValue(fixture.source)}
                                            title="Discard edits and restore the fixture file"
                                        >
                                            Reset
                                        </Toggle>
                                    )}
                                </Notes>
                            )}
                            <Preview
                                runtime={runtime}
                                componentName={fixture.name}
                                version={version}
                                usePreviews={previews.length > 0}
                                previewIndex={previewIndex}
                                colorScheme={colorScheme}
                            />
                            {errors.length > 0 && <ErrorBar>⚠ {errors.join('\n')}</ErrorBar>}
                        </PaneFill>
                    </Panel>
                </PanelGroup>
            </Body>
        </Shell>
    )
}

function formatLogArg(arg: unknown): string {
    if (arg instanceof Error) return arg.message
    if (typeof arg === 'string') return arg
    try {
        return JSON.stringify(arg)
    } catch {
        return String(arg)
    }
}

const Shell = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #ffffff;
    color: #1a1a1a;
`

const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 48px;
    flex: 0 0 auto;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
`

const Brand = styled.div`
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.2px;
`

const Dim = styled.span`
    opacity: 0.5;
    font-weight: 400;
`

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`

const controlStyles = `
    height: 30px;
    border-radius: 6px;
    border: 1px solid #d0d0d0;
    background: #ffffff;
    color: #1a1a1a;
    font-size: 13px;
    padding: 0 10px;
    cursor: pointer;
`

const Select = styled.select`
    ${controlStyles}
`

const Toggle = styled.button`
    ${controlStyles}
`

const Body = styled.div`
    flex: 1;
    min-height: 0;
`

const PaneFill = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
`

const Handle = styled(PanelResizeHandle)`
    /* Wide grab area, but only a 1px line is painted. */
    width: 9px;
    background: transparent;
    position: relative;
    cursor: col-resize;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 1px;
        background: #d0d0d0;
        transition: background 0.15s;
    }
    &[data-resize-handle-active]::before {
        background: #4a90d9;
    }
`

const Notes = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    flex: 0 0 auto;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
    font-size: 12px;
    line-height: 1.45;
    color: #555555;
`

const NotesText = styled.div`
    flex: 1;
    min-width: 0;
`

const NotesTitle = styled.div`
    font-family: ui-monospace, monospace;
    font-weight: 600;
    color: #1a1a1a;
`

const ErrorBar = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px 14px;
    font-size: 12px;
    font-family: ui-monospace, monospace;
    background: #3a1414;
    color: #ffb3b3;
    border-top: 1px solid #5a1f1f;
    white-space: pre-wrap;
`
