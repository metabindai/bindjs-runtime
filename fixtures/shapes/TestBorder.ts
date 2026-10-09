const metadata = {
    title: "TestBorder",
    description: "Three blue 125x50 LabeledRectangle fixtures stacked with 10pt spacing, exercising the .border() overloads: no arguments (thin default border), a width-only number (4pt default-colour border), and { style, width } (6pt red border). Borders are drawn around the square frame, not the rounded corners."
};

const body = () => {
    return (
        VStack({ spacing: 10 }, [
            LabeledRectangle({ text: "Border 2" }).border(),
            LabeledRectangle({ text: "Border 2" }).border(4),
            LabeledRectangle({ text: "Red Border 4" }).border({ style: Color("red"), width: 6 })
        ])
    );
};

export default defineComponent({ metadata, body });
