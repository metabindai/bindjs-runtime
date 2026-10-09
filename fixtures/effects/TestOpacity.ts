const metadata = {
    title: "TestOpacity",
    description: "Exercises .opacity(): four labeled blue rectangles at 100%, 50% and 25% opacity, plus one with two chained 50% opacities that should look like 25%."
};

const body = () => (
    VStack({ spacing: 10 }, [
        LabeledRectangle({ text: "100%" }).opacity(1.0),
        LabeledRectangle({ text: "50%" }).opacity(0.5),
        LabeledRectangle({ text: "25%" }).opacity(0.25),
        LabeledRectangle({ text: "50% * 50%" }).opacity(0.5).opacity(0.5)
    ])
);

export default defineComponent({ metadata, body });
