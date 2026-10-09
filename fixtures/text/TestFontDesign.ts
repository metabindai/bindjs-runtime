const metadata = {
    title: "TestFontDesign",
    description: "Three 24pt lines rendered with `.fontDesign()`: \"Monospaced\" in a fixed-width face, \"Rounded\" in a rounded sans, and \"Serif\" in a serif face."
};

const body = () => (
    VStack([
        Text("Monospaced").fontDesign("monospaced"),
        Text("Rounded").fontDesign("rounded"),
        Text("Serif").fontDesign("serif")
    ])
        .font(24)
);

export default defineComponent({ metadata, body });
