const metadata = {
    title: "TestVideo",
    description: "Placeholder carried over from the legacy project: renders only the text \"TestVideo\" (no Video component is exercised yet)."
};

const body = () => {
    return VStack([
        Text("TestVideo")
    ]);
};

export default defineComponent({ metadata, body });
