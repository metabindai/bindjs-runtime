import { defineConfig } from 'vitest/config'

// `tsc -b` emits the suite to dist/tests, and vitest 4 no longer excludes
// dist by default, so without this every test is collected twice.
export default defineConfig({
    test: {
        exclude: ['**/node_modules/**', '**/dist/**'],
    },
})
