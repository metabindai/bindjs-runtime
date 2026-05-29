import { BindJSRuntime } from "@metabindai/bindjs-runtime";

let runtime = new BindJSRuntime();

runtime.needsRerender = function () {
    console.log('Needs Rerender')
}

let components = runtime.context;

export default { ...components, runtime: runtime, restoreFunction: runtime.restoreFunction };
