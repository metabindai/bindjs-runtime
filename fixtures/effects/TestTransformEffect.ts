const metadata = {
    title: "TestTransformEffect",
    description: "Exercises .transformEffect(affine matrix): three labeled rectangles - scaled up, skewed vertically, and skewed + scaled + translated."
};

const body = () => (
    VStack({ spacing: 40 }, [
        LabeledRectangle({ text: "Scale" })
            .transformEffect({ a: 1.5, b: 0, c: 0, d: 1.52, tx: 0, ty: 0 }),
        LabeledRectangle({ text: "Skew" })
            .transformEffect({ a: 1, b: 0.3, c: 0, d: 1, tx: 0, ty: 0 }),
        LabeledRectangle({ text: "Skew & Scale" })
            .transformEffect({ a: 1.5, b: 0.2, c: 0.1, d: 1.2, tx: 10, ty: 5 })
    ])
);

export default defineComponent({ metadata, body });
