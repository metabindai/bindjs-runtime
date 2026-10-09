import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { bindjsFixtures } from './fixtures-plugin'

// The two BindJS packages ship plain ESM in their dist/ folders and are linked
// from the workspace. They don't need pre-bundling, but Monaco does — so we let
// Vite optimize everything except the workspace packages we want to read live.
export default defineConfig({
    plugins: [react(), bindjsFixtures('../../fixtures')],
    optimizeDeps: {
        // Keep the local workspace packages out of the dep optimizer so edits to
        // their dist/ are picked up without clearing Vite's cache.
        exclude: ['@metabindai/bindjs-react', '@metabindai/bindjs-runtime'],
    },
    server: {
        port: 5180,
    },
})
