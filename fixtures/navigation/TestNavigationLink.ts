const metadata = {
    title: "TestNavigationLink",
    description: "Both NavigationLink signatures: a plain text line, then a string-label link \"Navigation Link 1234\" and a { destination, label } link \"Navigation Link\"; tapping either pushes a full blue rectangle."
};

const body = () => (
    VStack([
        Text("This is a link Hello World"),
        NavigationLink("Navigation Link 1234", () => Rectangle().fill(Color("blue"))),
        NavigationLink({
            destination: () => Rectangle().fill(Color("blue")),
            label: Text("Navigation Link")
        })
    ])
);

export default defineComponent({ metadata, body });
