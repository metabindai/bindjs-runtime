const metadata = {
    title: "TestContrast",
    description: "Exercises .contrast(): three labeled blue rectangles at 500% (saturated, harsh), 100% (unchanged) and 20% (washed-out grey-blue) contrast."
};

const body = () => (
    VStack({ spacing: 10 }, [
        LabeledRectangle({ text: "500%" }).contrast(5.0),
        LabeledRectangle({ text: "100%" }).contrast(1.0),
        LabeledRectangle({ text: "20%" }).contrast(0.2)
    ])
);

export default defineComponent({ metadata, body });
