import { Renderer } from '@metabindai/bindjs-react'
import styled from 'styled-components'

interface PreviewProps {
    runtime: unknown
    componentName: string
    /** Bumped on every recompile to force the renderer to re-evaluate. */
    version: number
    /** Whether the component exposed `previews` to step through. */
    usePreviews: boolean
    previewIndex: number
    colorScheme: 'light' | 'dark'
}

const Surface = styled.div<{ $scheme: 'light' | 'dark' }>`
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    align-items: stretch;
    background: ${(p) => (p.$scheme === 'dark' ? '#1a1a1a' : '#ffffff')};
    color: ${(p) => (p.$scheme === 'dark' ? '#f5f5f5' : '#111111')};
`

export function Preview({
    runtime,
    componentName,
    version,
    usePreviews,
    previewIndex,
    colorScheme,
}: PreviewProps) {
    return (
        <Surface $scheme={colorScheme}>
            <Renderer
                runtime={runtime}
                componentName={componentName}
                version={version}
                usePreviews={usePreviews}
                previewIndex={previewIndex}
                resetState
                environment={{
                    colorScheme
                }}
            />
        </Surface>
    )
}
