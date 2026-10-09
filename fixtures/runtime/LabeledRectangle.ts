const metadata = {
    title: "LabeledRectangle",
    description: "Shared helper used by the effect fixtures: a 125×50 rounded rectangle (blue unless `fill` is passed) with a white caption label (\"Rectangle\" unless `text` is passed) centered on it."
};

// Called by other fixtures as LabeledRectangle({ text, fill }); `fill` is a Color,
// which has no Property* equivalent, so the props are typed directly.
const body = (props: { text?: string, fill?: Color }) => {
    return (
        ZStack([
            RoundedRectangle().fill(props.fill ?? Color("blue")),
            Text(props.text ?? "Rectangle").font("caption").foregroundStyle(Color("white"))
        ])
            .frame({ width: 125, height: 50 })
    );
};

export default defineComponent({ metadata, body });
