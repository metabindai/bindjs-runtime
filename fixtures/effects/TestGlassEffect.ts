const metadata = {
    title: "TestGlassEffect",
    description: "Exercises .glassEffect(): a \"TestGlassEffect\" label on a translucent glass capsule over a purple-to-orange gradient, with the gradient visible through the glass."
};

const body = () => (
    ZStack([
        LinearGradient({ colors: [Color("purple"), Color("orange")] }),
        Text("TestGlassEffect")
            .padding(20)
            .glassEffect()
    ])
        .frame({ width: 300, height: 200 })
);

export default defineComponent({ metadata, body });
