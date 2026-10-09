const metadata = {
    title: "TestForegroundStyle",
    description: "Exercises .foregroundStyle() with colours, semantic colours, gradients and a dark colorScheme: red, secondary and purple-to-red gradient text; red, secondary and gradient bars; and a red bar, green dot and grey label over a clipped wallpaper photo."
};

const WALLPAPER_URL = "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/9279cab9-3f77-4b85-9cac-e7225f6ef208/assets/b54f4fec-f4fc-4626-ade4-6fba67a2a38b/iClarified-iOS26-LockScreen-Dark.jpg";

const body = () => (
    VStack({ spacing: 20 }, [
        TestTextForeground(),
        TestShapeForeground(),
        TestMaterialForeground()
    ])
        .font(28)
        .padding(20)
);

const TestTextForeground = () => (
    VStack([
        Text("TestForegroundStyle").foregroundStyle(Color("red")),
        Text("TestForegroundStyle")
            .foregroundStyle(Color("secondary"))
            .colorScheme("dark"),
        Text("TestForegroundStyle").foregroundStyle(LinearGradient({ colors: [Color("purple"), Color("red")] }))
    ])
);

const TestShapeForeground = defineComponent({
    body: () => (
        VStack([
            RoundedRectangle().frame({ height: 20 }).foregroundStyle(Color("red")),
            RoundedRectangle().frame({ height: 20 }).foregroundStyle(Color("secondary")),
            RoundedRectangle()
                .frame({ height: 20 })
                .foregroundStyle(LinearGradient({ colors: [Color("purple"), Color("red")] }))
        ])
    )
});

const TestMaterialForeground = () => {
    const wallpaper = (
        Image({ url: WALLPAPER_URL })
            .resizable()
            .aspectRatio({ contentMode: "fill" })
    );

    return (
        VStack([
            RoundedRectangle().frame({ height: 20 }).foregroundStyle(Color("red")),
            Circle().frame({ width: 20, height: 20 }).foregroundStyle(Color("green")),
            Text("TestForegroundStyle").foregroundStyle(Color("gray"))
        ])
            .padding(20)
            .background(wallpaper)
            .frame({ height: 200 })
            .clipped()
    );
};

const thumbnail = () => TestTextForeground();

export default defineComponent({ metadata, body, thumbnail });
