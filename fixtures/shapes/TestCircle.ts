const metadata = {
    title: "TestCircle",
    description: "Circles stacked vertically: a 100pt default (black) circle; 50x100 and 100x50 frames, which still draw 50pt circles (a circle fits the shorter side); a blue circle; a blue-to-black linear gradient circle; then blue circles sized to a 200x100 and a 100x200 parent, each with a 1pt black frame border and centered white \"Size to parent\" text."
};

const body = () => {
    const linearGradient = LinearGradient({
        colors: [Color("blue"), Color("black")]
    });

    return (
        VStack([
            Circle()
                .frame({ width: 100, height: 100 }),
            Circle()
                .frame({ width: 50, height: 100 }),
            Circle()
                .frame({ width: 100, height: 50 }),
            Circle()
                .fill(Color("blue"))
                .frame({ width: 100, height: 100 }),
            Circle()
                .fill(linearGradient)
                .frame({ width: 100, height: 100 }),
            ZStack([
                Circle().fill(Color("blue")),
                Text("Size to parent")
            ])
                .frame({ width: 200, height: 100 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white")),
            ZStack([
                Circle().fill(Color("blue")),
                Text("Size to parent").multilineTextAlignment("center")
            ])
                .frame({ width: 100, height: 200 })
                .border({ style: Color("black"), width: 1 })
                .foregroundStyle(Color("white"))
        ])
    );
};

const thumbnail = () => (
    Circle()
        .fill(Color("blue"))
        .frame({ width: 200, height: 100 })
);

const previews = [
    Self().previewName("All circles"),
    Circle().fill(Color("black")).previewName("Black circle"),
    ZStack([
        Circle().fill(Color("red"))
    ])
        .previewName("Red circle in ZStack")
];

export default defineComponent({ metadata, body, previews, thumbnail });
