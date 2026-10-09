const metadata = {
    title: "TestSaturation",
    description: "Exercises .saturation(): five labeled blue rectangles at saturation 5, 1, 0.5, 0.25 and 0, going from vivid blue down to grey."
};

const VALUES = [5.0, 1.0, 0.5, 0.25, 0.0];

const body = () => {
    const items = VALUES.map((value) => LabeledRectangle({ text: String(value) }).saturation(value));

    return VStack({ spacing: 10 }, items);
};

export default defineComponent({ metadata, body });
