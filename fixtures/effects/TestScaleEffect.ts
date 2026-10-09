const metadata = {
    title: "TestScaleEffect",
    description: "Exercises .scaleEffect(number): three labeled rectangles scaled 0.5x, 1x and 1.5x about their centers without affecting layout spacing."
};

const VALUES = [0.5, 1.0, 1.5];

const body = () => {
    const items = VALUES.map((value) => LabeledRectangle({ text: String(value) }).scaleEffect(value));

    return VStack({ spacing: 40 }, items);
};

export default defineComponent({ metadata, body });
