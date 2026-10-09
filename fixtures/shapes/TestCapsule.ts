const metadata = {
    title: "TestCapsule",
    description: "Capsules stacked vertically: a 200x100 default (black) capsule, a blue one, a blue-to-black linear gradient one, then a blue capsule sized to a 200x100 parent and one sized to a 100x200 (vertical) parent, each with a 1pt black frame border and centered white \"Size to parent\" text."
};

const body = () => {
    const linearGradient = LinearGradient({
        colors: [Color("blue"), Color("black")]
    });

    return (
        VStack([
            Capsule()
                .frame({ width: 200, height: 100 }),
            Capsule()
                .fill(Color("blue"))
                .frame({ width: 200, height: 100 }),
            Capsule()
                .fill(linearGradient)
                .frame({ width: 200, height: 100 }),
            ZStack([
                Capsule().fill(Color("blue")),
                Text("Size to parent")
            ])
                .frame({ width: 200, height: 100 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white")),
            ZStack([
                Capsule().fill(Color("blue")),
                Text("Size to parent").multilineTextAlignment("center")
            ])
                .frame({ width: 100, height: 200 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white"))
        ])
    );
};

const thumbnail = () => (
    Capsule()
        .fill(Color("blue"))
        .frame({ width: 200, height: 100 })
);

export default defineComponent({ metadata, body, thumbnail });
