const metadata = {
    title: "TestFrame",
    description: "Placeholder stub with no Frame cases yet: renders only the text \"TestFrame\" centred in a VStack."
};

const body = () => (
    VStack([
        Text("TestFrame")
    ])
);

export default defineComponent({ metadata, body });
