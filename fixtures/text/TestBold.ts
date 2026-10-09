const metadata = {
    title: "TestBold",
    description: "Two stacked lines: \"Not Bold\" in regular weight and \"Is Bold\" visibly bold via `.bold()`."
};

const body = () => (
    VStack([
        Text("Not Bold"),
        Text("Is Bold").bold()
    ])
);

export default defineComponent({ metadata, body });
