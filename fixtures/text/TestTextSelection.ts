const metadata = {
    title: "TestTextSelection",
    description: "Two lines: the first can be selected/copied with the pointer (`.textSelection(\"enabled\")`), the second cannot (`.textSelection(\"disabled\")`)."
};

const body = () => (
    VStack({ spacing: 20 }, [
        Text("This text can be selected").textSelection("enabled"),
        Text("This text cannot be selected").textSelection("disabled")
    ])
);

export default defineComponent({ metadata, body });
