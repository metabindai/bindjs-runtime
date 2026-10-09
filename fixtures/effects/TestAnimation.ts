const metadata = {
    title: "TestAnimation",
    description: "Exercises the .animation modifier with a repeating Spring bound to a state value: tapping the text toggles its scale, which springs between 1x and 1.5x and keeps repeating."
};

const body = () => {
    const [enabled, setEnabled] = useState(false);

    return (
        VStack([
            Text("TestAnimation")
        ])
            .scaleEffect(enabled ? 1.5 : 1.0)
            .animation({
                animation: Spring().repeatCount(2).repeatForever(true),
                value: enabled
            })
            .onTapGesture(() => setEnabled(!enabled))
    );
};

export default defineComponent({ metadata, body });
