const metadata = {
    title: "TestMonospaced",
    description: "A single line \"Monospaced text\" rendered in a fixed-width font via `.monospaced()`."
};

const body = () => Text("Monospaced text").monospaced();

export default defineComponent({ metadata, body });
