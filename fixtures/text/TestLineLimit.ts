const metadata = {
    title: "TestLineLimit",
    description: "A 200pt-wide paragraph capped at three lines with `.lineLimit(3)`: exactly three lines show and the third ends in an ellipsis."
};

const body = () => (
    VStack([
        Text("This is a longer text that can span up to three lines before being truncated. This should be truncated from here possibly.")
            .frame({ width: 200 })
            .lineLimit(3)
    ])
);

export default defineComponent({ metadata, body });
