const metadata = {
    title: "TestRectangle",
    description: "Rectangles stacked vertically: a 200x100 default (black) rectangle, a blue one, a blue-to-black linear gradient one, then blue rectangles filling a 200x100 and a 100x200 parent, each with a 1pt black border and centered white \"Size to parent\" text."
};

const body = () => {
    const linearGradient = LinearGradient({
        colors: [Color("blue"), Color("black")]
    });

    return (
        VStack([
            Rectangle()
                .frame({ width: 200, height: 100 }),
            Rectangle()
                .fill(Color("blue"))
                .frame({ width: 200, height: 100 }),
            Rectangle()
                .fill(linearGradient)
                .frame({ width: 200, height: 100 }),
            ZStack([
                Rectangle().fill(Color("blue")),
                Text("Size to parent")
            ])
                .frame({ width: 200, height: 100 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white")),
            ZStack([
                Rectangle().fill(Color("blue")),
                Text("Size to parent").multilineTextAlignment("center")
            ])
                .frame({ width: 100, height: 200 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white"))
        ])
    );
};

const thumbnail = () => (
    Rectangle()
        .fill(Color("blue"))
        .frame({ width: 200, height: 100 })
);

export default defineComponent({ metadata, body, thumbnail });
