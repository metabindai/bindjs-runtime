const metadata = {
    title: "TestBrightness",
    description: "Exercises .brightness(): three labeled blue rectangles stacked vertically, darkened (-0.5), unchanged (0) and brightened (0.5)."
};

const body = () => (
    VStack({ spacing: 10 }, [
        LabeledRectangle({ text: "Darkened" }).brightness(-0.5),
        LabeledRectangle({ text: "Normal" }).brightness(0.0),
        LabeledRectangle({ text: "Brightened" }).brightness(0.5)
    ])
);

export default defineComponent({ metadata, body });
