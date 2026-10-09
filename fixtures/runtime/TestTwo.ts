const metadata = {
    title: "TestTwo",
    description: "Composes another registered fixture (TestDefineComponent, with props) and a file-local defineComponent; expect TestDefineComponent's two lines (\"Hello abasbasdf 1234 Hello there\" and the green \"My Other Thing Hello 1234\") followed by \"ABCD 1234\"."
};

const body = () => {
    return (
        VStack([
            TestDefineComponent({ title: "Hello there", type: "Things", someNumber: 4 }),
            NewThing()
        ])
    );
};

const NewThing = defineComponent({
    body: () => Text("ABCD 1234")
});

export default defineComponent({ metadata, body });
