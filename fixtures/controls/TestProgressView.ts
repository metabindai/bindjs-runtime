const metadata = {
    title: "TestProgressView",
    description: "A ProgressView with no value, which renders as an indeterminate spinning activity indicator."
};

const body = () => {
    return (
        VStack([
            ProgressView()
        ])
    );
};

export default defineComponent({ metadata, body });
