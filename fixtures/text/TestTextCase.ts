const metadata = {
    title: "TestTextCase",
    description: "Two lines transformed by `.textCase`: \"UPPERCASE TEXT\" (source is lowercase) and \"lowercase text\" (source is uppercase)."
};

const body = () => (
    VStack([
        Text("uppercase text").textCase("uppercase"),
        Text("LOWERCASE TEXT").textCase("lowercase")
    ])
);

export default defineComponent({ metadata, body });
