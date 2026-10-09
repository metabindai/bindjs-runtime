const metadata = {
    title: "TestItalic",
    description: "One 44pt row: \"Italic, \" slanted via `.italic()`, followed by \"Not Italic\" upright because `.italic(false)` turns the style off; the second label does not wrap."
};

const body = () => (
    HStack([
        Text("Italic, ")
            .italic()
            .font(44),
        Text("Not Italic")
            .italic(false)
            .font(44)
            .fixedSize({ horizontal: true })
    ])
);

export default defineComponent({ metadata, body });
