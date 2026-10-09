const metadata = {
    title: "TestTag",
    description: "A Text \"Tagged text\" carrying .tag(\"important\") outside of any Picker; the tag has no visual effect, so it should render as plain text with no error."
};

const body = () => {
    return (
        VStack([
            Text("Tagged text").tag("important")
        ])
    );
};

export default defineComponent({ metadata, body });
