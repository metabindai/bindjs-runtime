const metadata = {
    title: "TestTextField",
    description: "Three inputs, each with a caption mirroring its value live: a pill-shaped TextField (\"TextField\", submit label \"go\"), a SecureField (\"1234\", masked as dots), and a rounded-border number-pad TextField (\"1234\"). Pressing return in the number field flips \"Not submitted\" to \"Submitted\"; the \"Focus number field\" button moves keyboard focus into it."
};

const body = () => {
    const [text, setText] = useState("TextField");
    const [secureText, setSecureText] = useState("1234");
    const [numberText, setNumberText] = useState("1234");
    const [isFocused, setIsFocused] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const plainField = (
        TextField({ text, setText, placeholder: "Write some text.." })
            .padding(8)
            .submitLabel("go")
            .background(Color("primary").opacity(0.1))
            .cornerRadius(20)
    );

    const secureField = (
        SecureField({ text: secureText, setText: setSecureText, placeholder: "Write some text.." })
            .padding(8)
            .background(Color("primary").opacity(0.1))
            .cornerRadius(20)
    );

    const numberField = (
        TextField({ text: numberText, setText: setNumberText, placeholder: "Write some text.." })
            .focused({ isFocused, setIsFocused })
            .padding(8)
            .keyboardType("numberPad")
            .textFieldStyle("roundedBorder")
            .onSubmit(() => setSubmitted(true))
    );

    return (
        VStack({ spacing: 12 }, [
            plainField,
            Caption(text),
            Divider().padding("vertical", 20),
            secureField,
            Caption(secureText),
            Divider().padding("vertical", 20),
            numberField,
            Caption(numberText),
            Text(submitted ? "Submitted" : "Not submitted"),
            Button("Focus number field", () => setIsFocused(true))
        ])
            .padding(20)
    );
};

const Caption = (value: string) => (
    Text(value)
        .font("caption")
        .frame({ maxWidth: Infinity, alignment: "leading" })
);

export default defineComponent({ metadata, body });
