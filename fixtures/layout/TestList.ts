const metadata = {
    title: "TestList",
    description: "List with selection bound to useState via .tag(): shows three rows \"Hello 1\"-\"Hello 3\" with the first row selected initially; tapping a row moves the selection highlight to it."
};

const body = () => {
    const [selection, setSelection] = useState(0);

    return (
        List({ selection, setSelection }, [
            Text("Hello 1").tag(0),
            Text("Hello 2").tag(1),
            Text("Hello 3").tag(2)
        ])
    );
};

export default defineComponent({ metadata, body });
