const metadata = {
    title: "TestToggle",
    description: "A row with text on the left and a Toggle on the right, initially off with text \"is off false\"; switching the toggle on changes the text to \"is on true\"."
};

const body = () => {
    const [isOn, setIsOn] = useState(false);

    return (
        HStack([
            Text(isOn ? `is on ${isOn}` : `is off ${isOn}`),
            Spacer(),
            Toggle({
                isOn,
                setIsOn: (newValue) => {
                    setIsOn(newValue);
                }
            })
        ])
            .padding(20)
    );
};

export default defineComponent({ metadata, body });
