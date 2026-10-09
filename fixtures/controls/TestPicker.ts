const metadata = {
    title: "TestPicker",
    description: "A \"Size\" Picker bound to state with Small/Medium/Large options tagged s/m/l, initially Medium; below it a Text reads \"Selected: m\" and updates when another option is chosen."
};

const body = () => {
    const [size, setSize] = useState("m");

    return (
        VStack([
            Picker("Size", [size, setSize], [
                Text("Small").tag("s"),
                Text("Medium").tag("m"),
                Text("Large").tag("l")
            ]),
            Text(`Selected: ${size}`)
        ])
    );
};

export default defineComponent({ metadata, body });
