const metadata = {
    title: "TestSpacer",
    description: "Placeholder stub with no Spacer cases yet: renders only the text \"TestSpacer\" centred in a VStack."
};

const body = () => (
    VStack([
        Text("TestSpacer")
    ])
);

export default defineComponent({ metadata, body });
