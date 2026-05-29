import { useCallback, useMemo, useRef, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { BindJSRuntime } from '@metabindai/bindjs-runtime'
import styled from 'styled-components'

import { CodeEditor, type CompileResult } from './components/CodeEditor'
import { Preview } from './components/Preview'
import { SAMPLE_COMPONENT } from './lib/sample'

const COMPONENT_NAME = '_playground'

interface PreviewMeta {
    title: string
}

export function App() {
    // One runtime instance for the lifetime of the app. The constructor already
    // registers all the built-in components/modifiers, so it's ready to use.
    const runtime = useMemo(() => new BindJSRuntime(), [])

    const [version, setVersion] = useState(0)
    const [previews, setPreviews] = useState<PreviewMeta[]>([])
    const [previewIndex, setPreviewIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')

    // Avoid re-registering identical JS (the editor fires onChange generously).
    const lastJsRef = useRef<string | null>(null)

    const handleCompile = useCallback(
        ({ javascript }: CompileResult) => {
            if (javascript === lastJsRef.current) return
            lastJsRef.current = javascript

            try {
                runtime.registerComponent(COMPONENT_NAME, javascript)

                const metas: PreviewMeta[] =
                    runtime.getComponentPreviewsWithMetadata?.(COMPONENT_NAME)?.map(
                        (p: { title?: string }, i: number) => ({
                            title: p?.title ?? `Preview ${i + 1}`,
                        }),
                    ) ?? []

                setPreviews(metas)
                setPreviewIndex((prev) => (prev >= metas.length ? 0 : prev))
                setError(null)
                setVersion((v) => v + 1)
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
            }
        },
        [runtime],
    )

    const usePreviews = previews.length > 0

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
                <PanelGroup direction="horizontal" autoSaveId="bindjs-playground">
                    <Panel defaultSize={50} minSize={25}>
                        <PaneFill>
                            <CodeEditor
                                initialValue={SAMPLE_COMPONENT}
                                onCompile={handleCompile}
                            />
                        </PaneFill>
                    </Panel>

                    <Handle />

                    <Panel defaultSize={50} minSize={25}>
                        <PaneFill>
                            <Preview
                                runtime={runtime}
                                componentName={COMPONENT_NAME}
                                version={version}
                                usePreviews={usePreviews}
                                previewIndex={previewIndex}
                                colorScheme={colorScheme}
                            />
                            {error && <ErrorBar>⚠ {error}</ErrorBar>}
                        </PaneFill>
                    </Panel>
                </PanelGroup>
            </Body>
        </Shell>
    )
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
