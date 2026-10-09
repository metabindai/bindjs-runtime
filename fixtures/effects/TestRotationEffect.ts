const metadata = {
    title: "TestRotationEffect",
    description: "Exercises .rotationEffect(degrees): three labeled rectangles rotated 0deg (level), 45deg (diagonal) and 180deg (label upside down) about their centers."
};

const body = () => (
    VStack({ spacing: 50 }, [
        LabeledRectangle({ text: "0deg" }).rotationEffect(0),
        LabeledRectangle({ text: "45deg" }).rotationEffect(45),
        LabeledRectangle({ text: "180deg" }).rotationEffect(180)
    ])
);

export default defineComponent({ metadata, body });
