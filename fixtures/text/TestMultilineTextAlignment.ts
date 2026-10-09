const metadata = {
    title: "TestMultilineTextAlignment",
    description: "Three labels in an 80pt-wide column, each wrapping over several lines: the first left-aligned, the second centered, the third right-aligned, via `.multilineTextAlignment`."
};

const body = () => (
    VStack({ spacing: 20 }, [
        Text("Left aligned multiline text").multilineTextAlignment("leading"),
        Text("Center aligned multiline text").multilineTextAlignment("center"),
        Text("Right aligned multiline text").multilineTextAlignment("trailing")
    ])
        .frame({ width: 80 })
);

const thumbnail = () => Text("Right aligned multiline text").multilineTextAlignment("trailing");

export default defineComponent({ metadata, body, thumbnail });
