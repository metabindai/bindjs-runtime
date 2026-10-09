const metadata = {
    title: "TestFixedSize",
    description: "Placeholder stub with no FixedSize cases yet: renders only the text \"TestFixedSize\" centred in a VStack."
};

const body = () => (
    VStack([
        Text("TestFixedSize")
    ])
);

export default defineComponent({ metadata, body });
