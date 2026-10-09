const metadata = {
    title: "TestTracking",
    description: "Three lines with `.tracking` of -2 (letters crowded together), 0 (normal) and 4 (letters spread apart)."
};

const body = () => (
    VStack([
        Text("Tight spacing").tracking(-2),
        Text("Normal spacing").tracking(0),
        Text("Loose spacing").tracking(4)
    ])
);

export default defineComponent({ metadata, body });
