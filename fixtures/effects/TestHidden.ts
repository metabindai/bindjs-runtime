const metadata = {
    title: "TestHidden",
    description: "Exercises .hidden(): shows \"Above Hidden\" and \"Below Hidden\" with an empty gap between them where the hidden text still occupies layout space."
};

const body = () => (
    VStack([
        Text("Above Hidden"),
        Text("Hidden").hidden(),
        Text("Below Hidden")
    ])
);

export default defineComponent({ metadata, body });
