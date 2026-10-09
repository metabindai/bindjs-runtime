const metadata = {
    title: "TestOnChange",
    description: "Shows \"Has Not Changed\" above \"Change a\"; tapping \"Change a\" sets the state to \"b\", so the text becomes \"Change b\" and the .onChange handler flips the first line to \"Has Changed\" (and logs the old and new values)."
};

const body = () => {
    const [state, setState] = useState("a");
    const [hasChanged, setHasChanged] = useState(false);

    return (
        VStack([
            Text(hasChanged ? "Has Changed" : "Has Not Changed"),
            Text("Change " + state)
                .onTapGesture(() => {
                    setState("b");
                })
        ])
            .onChange(state, ([oldValue, newValue]) => {
                console.log("Old Value ", oldValue);
                console.log("New Value ", newValue);
                setHasChanged(true);
            })
    );
};

export default defineComponent({ metadata, body });
