const metadata = {
    title: "TestRoundedRectangle",
    description: "Rounded rectangles stacked vertically: a 200x100 default (black) one with the default corner radius, a blue one and a blue-to-black gradient one with 36pt corners, then default-radius blue ones filling a 200x100 and a 100x200 parent, each with a 1pt black frame border and centered white \"Size to parent\" text."
};

const body = () => {
    const linearGradient = LinearGradient({
        colors: [Color("blue"), Color("black")]
    });

    return (
        VStack([
            RoundedRectangle()
                .frame({ width: 200, height: 100 }),
            RoundedRectangle({ cornerRadius: 36 })
                .fill(Color("blue"))
                .frame({ width: 200, height: 100 }),
            RoundedRectangle({ cornerRadius: 36 })
                .fill(linearGradient)
                .frame({ width: 200, height: 100 }),
            ZStack([
                RoundedRectangle().fill(Color("blue")),
                Text("Size to parent")
            ])
                .frame({ width: 200, height: 100 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white")),
            ZStack([
                RoundedRectangle().fill(Color("blue")),
                Text("Size to parent").multilineTextAlignment("center")
            ])
                .frame({ width: 100, height: 200 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white"))
        ])
    );
};

const thumbnail = () => (
    RoundedRectangle({ cornerRadius: 36 })
        .fill(Color("blue"))
        .frame({ width: 200, height: 100 })
);

export default defineComponent({ metadata, body, thumbnail });
