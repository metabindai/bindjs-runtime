// Must run before any Monaco usage so the editor loads from the local package
// and its language workers are wired up.
import './monaco-setup'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createGlobalStyle } from 'styled-components'

import { App } from './App'

const GlobalStyle = createGlobalStyle`
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin: 0; height: 100%; }
    body { background: #ffffff; }
`

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GlobalStyle />
        <App />
    </StrictMode>,
)
