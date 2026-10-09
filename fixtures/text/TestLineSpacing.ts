const metadata = {
    title: "TestLineSpacing",
    description: "The same 200pt-wide lorem paragraph three times, separated by dividers, with `.lineSpacing` of -4 (lines tighter than default), 0 (default) and 12 (clearly airier)."
};

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";

const body = () => (
    VStack({ spacing: 10 }, [
        Text(LOREM)
            .frame({ width: 200 })
            .lineSpacing(-4),
        Divider(),
        Text(LOREM)
            .frame({ width: 200 })
            .lineSpacing(0),
        Divider(),
        Text(LOREM)
            .frame({ width: 200 })
            .lineSpacing(12)
    ])
);

const thumbnail = () => (
    Text(LOREM)
        .frame({ width: 200 })
        .lineSpacing(12)
);

export default defineComponent({ metadata, body, thumbnail });
