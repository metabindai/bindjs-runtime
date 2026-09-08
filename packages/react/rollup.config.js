// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
export default {
    input: 'src/Runtime/JSRuntime.js',        // your entry point
    output: {
        file: 'dist-runtime/runtime.js',     // where to write
        //format: 'esm',              // 'cjs', 'iife', 'umd', etc.
        //format: 'esm',              // 'cjs', 'iife', 'umd', etc.
        sourcemap: false,            // include a .map for debugging
    },
    plugins: [
        resolve({ extensions: ['.js', '.ts'] }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.runtime.json' }),
    ],
};