const metadata = {
    title: "TestError",
    description: "Deliberately broken: references an undefined identifier at module scope, so registering it throws. A correct result is an error message surfaced in the preview (\"thisHasAnError is not defined\"), not a blank pane or a crash."
};

const body = () => {
    return VStack([
        Text("TestError")
    ]);
};

// @ts-expect-error intentional: exercises runtime error reporting
thisHasAnError;

export default defineComponent({ metadata, body });
