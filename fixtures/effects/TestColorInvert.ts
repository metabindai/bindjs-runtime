const metadata = {
    title: "TestColorInvert",
    description: "Exercises .colorInvert(): a normal blue labeled rectangle above an inverted copy (yellow/orange fill with black label)."
};

const body = () => (
    VStack({ spacing: 10 }, [
        LabeledRectangle({ text: "Normal" }),
        LabeledRectangle({ text: "Inverted" }).colorInvert()
    ])
);

export default defineComponent({ metadata, body });
