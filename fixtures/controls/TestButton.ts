const metadata = {
    title: "TestButton",
    description: "Four Button forms separated by dividers: a { action, label } button (white \"Press Me\" on a blue rounded, shadowed background) that toggles to green \"Pressed!\" when tapped; a button with a Text label on a green background; a plain string-label button; and a button styled with the shared ButtonStyleTest (blue glossy pill)."
};

const body = () => {
    const [pressed, setPressed] = useState(false);

    const toggleButton = (
        Button({
            action: () => {
                setPressed(!pressed);
            },
            label: Text(pressed ? "Pressed!" : "Press Me")
        })
            .foregroundStyle(Color("white"))
            .padding(10)
            .background(pressed ? Color("green") : Color("blue"))
            .cornerRadius(12)
            .shadow()
    );

    const textLabelButton = Button(Text("Simple Button").background(Color("green")), () => {});

    const stringLabelButton = Button("Simple Button ABCD", () => {});

    const styledButton = (
        Button("Button Style 1234", () => {})
            .buttonStyle(ButtonStyleTest())
    );

    return (
        VStack([
            toggleButton,
            Divider(),
            textLabelButton,
            Divider(),
            stringLabelButton,
            Divider(),
            styledButton
        ])
    );
};

export default defineComponent({ metadata, body });
