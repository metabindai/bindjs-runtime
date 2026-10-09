const metadata = {
    title: "TestEllipse",
    description: "Ellipses stacked vertically: a 100x100 default (black) ellipse (a circle), a 200x100 one (wide oval), a blue one, a blue-to-black linear gradient one, then blue ellipses filling a 200x100 and a 100x200 parent, each with a 1pt black frame border and centered \"Size to parent\" text."
};

const body = () => {
    const linearGradient = LinearGradient({
        colors: [Color("blue"), Color("black")]
    });

    return (
        VStack([
            Ellipse()
                .frame({ width: 100, height: 100 }),
            Ellipse()
                .frame({ width: 200, height: 100 }),
            Ellipse()
                .fill(Color("blue"))
                .frame({ width: 100, height: 100 }),
            Ellipse()
                .fill(linearGradient)
                .frame({ width: 100, height: 100 }),
            ZStack([
                Ellipse().fill(Color("blue")),
                Text("Size to parent")
            ])
                .frame({ width: 200, height: 100 })
                .border({ style: Color("black"), width: 1 }),
            ZStack([
                Ellipse().fill(Color("blue")),
                Text("Size to parent").multilineTextAlignment("center")
            ])
                .frame({ width: 100, height: 200 })
                .border({ style: Color("black"), width: 1 })
        ])
    );
};

const thumbnail = () => (
    Ellipse()
        .fill(Color("blue"))
        .frame({ width: 200, height: 100 })
);

export default defineComponent({ metadata, body, thumbnail });
