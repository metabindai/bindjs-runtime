const metadata = {
    title: "TestGrayscale",
    description: "Exercises .grayscale(): three labeled blue rectangles - fully grey (no argument), half desaturated (0.5) and fully blue (0)."
};

const body = () => (
    VStack({ spacing: 10 }, [
        LabeledRectangle({ text: "Full" }).grayscale(),
        LabeledRectangle({ text: "Partial" }).grayscale(0.5),
        LabeledRectangle({ text: "None" }).grayscale(0.0)
    ])
);

export default defineComponent({ metadata, body });
