const metadata = {
    title: "TestStrikethrough",
    description: "A single line \"Crossed out text\" with a horizontal line struck through it via `.strikethrough()`."
};

const body = () => (
    VStack([
        Text("Crossed out text").strikethrough()
    ])
);

export default defineComponent({ metadata, body });
