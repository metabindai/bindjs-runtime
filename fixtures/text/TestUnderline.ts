const metadata = {
    title: "TestUnderline",
    description: "A single line \"Underlined text\" with an underline via `.underline()`."
};

const body = () => (
    VStack([
        Text("Underlined text").underline()
    ])
);

export default defineComponent({ metadata, body });
