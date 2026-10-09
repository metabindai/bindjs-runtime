const metadata = {
    title: "TestTemplate",
    description: "Bare-minimum component template; renders the single line of text \"TestTemplate\"."
};

const body = () => {
    return VStack([
        Text("TestTemplate")
    ]);
};

export default defineComponent({ metadata, body });
