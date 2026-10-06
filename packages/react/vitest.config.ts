import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Some renderer sources are .js files with JSX (YapUIDecoder.js, Renderer.js).
    esbuild: {
        include: /src\/.*\.[jt]sx?$/,
        exclude: [],
        loader: 'tsx',
    },
});
