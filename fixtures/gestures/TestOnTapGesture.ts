const metadata = {
    title: "TestOnTapGesture",
    description: "A rounded, shadowed card (max 300pt wide) reading \"Tap Count\", a divider, a blue rounded-design counter starting at 0, and grey \"Taps\"; each tap anywhere on the card increments the counter and makes the card hop up 20pt and spring back down."
};

const body = () => {
    const [counter, setCounter] = useState(0);
    const [jump, setJump] = useState(false);

    return (
        VStack({ alignment: "leading" }, [
            Text("Tap Count").font("title2"),
            Divider().padding("bottom", 20),
            Text(`${counter}`).fontDesign("rounded").foregroundStyle(Color("blue")),
            Text("Taps").foregroundStyle(Color("secondary")).font("headline")
        ])
            .padding(20)
            .frame({ maxWidth: 300 })
            .background(Color("background"))
            .cornerRadius(20)
            .shadow({ radius: 20, color: Color("black").opacity(0.1) })
            .font("largeTitle")
            .bold()
            .multilineTextAlignment("leading")
            .offset({ y: jump ? -20 : 0 })
            .onTapGesture(() => {
                setCounter(counter + 1);
                withAnimation(Spring({ response: 0.35 }), () => {
                    setJump(true);
                });
                setTimeout(() => {
                    withAnimation(Spring({ response: 0.2, dampingFraction: 0.535 }), () => {
                        setJump(false);
                    });
                }, 200);
            })
    );
};

export default defineComponent({ metadata, body });
