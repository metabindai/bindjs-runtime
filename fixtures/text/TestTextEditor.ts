const metadata = {
    title: "TestTextEditor",
    description: "A multi-line TextEditor (tinted rounded background, max 400 tall) prefilled with \"Hello World\", above a divider and a caption that mirrors the editor's contents live as you type."
};

const body = () => {
    const [textValue, setTextValue] = useState("Hello World");

    return (
        VStack([
            TextEditor({ text: textValue, setText: setTextValue })
                .padding(8)
                .background(Color("primary").opacity(0.1))
                .scrollContentBackground("hidden")
                .cornerRadius(10)
                .padding(20)
                .frame({ maxHeight: 400 }),
            Divider(),
            Text(textValue)
                .font("caption")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .padding(20)
        ])
            .padding("top", 20)
    );
};

export default defineComponent({ metadata, body });
