// The BindJS runtime evaluates a component as a CommonJS-ish module: the code is
// run with `var exports = {}` in scope and the runtime reads `exports.default`.
// Authors write idiomatic `export default defineComponent({...})`, so we rewrite
// that single token after Monaco transpiles TS → JS. This mirrors the
// `processComponentJs` helper used by the full Composer.
export function processComponentJs(js: string): string {
    return js.replace(/export\s+default\s+/g, 'exports.default = ')
}

// Inverse: turn stored `exports.default = ` back into `export default ` so the
// editor shows the idiomatic form. Used when seeding the editor from a sample.
export function unprocessComponentTs(ts: string): string {
    return ts.replace(/exports\.default\s*=\s*/g, 'export default ')
}
