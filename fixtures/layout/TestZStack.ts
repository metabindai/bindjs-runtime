const metadata = {
    title: "TestZStack",
    description: "Placeholder stub with no ZStack cases yet: renders only the text \"TestZStack\" centred in a VStack."
};

const body = () => (
    VStack([
        Text("TestZStack")
    ])
);

export default defineComponent({ metadata, body });
