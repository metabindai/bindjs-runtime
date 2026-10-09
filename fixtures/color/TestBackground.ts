const metadata = {
    title: "TestBackground",
    description: "Exercises .background() with colors, shapes, text, images and gradients: a scrolling column of tinted shapes and labels, each showing its background content (bold text, green tint, black circle, red/green pills, rotated green bar, photo, default gradient) behind the foreground."
};

const TEST_IMAGE = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg",
    dimensions: { width: 613, height: 287 }
};

const body = () => {
    const textBehindShape = (
        RoundedRectangle()
            .fill(Color("blue").opacity(0.5))
            .background(Text("Background Text").bold())
            .foregroundStyle(Color("black"))
            .frame({ width: 200, height: 200 })
    );

    const colorBehindShape = (
        RoundedRectangle()
            .fill(Color("blue").opacity(0.5))
            .background(Color("green").opacity(0.2))
            .foregroundStyle(Color("black"))
            .frame({ width: 200, height: 50 })
    );

    const circleBehindShape = (
        RoundedRectangle()
            .fill(Color("blue").opacity(0.25))
            .background(Circle().fill(Color("black")))
            .foregroundStyle(Color("black"))
            .frame({ width: 200, height: 50 })
    );

    const colorBehindText = (
        Text("Background Color")
            .padding(10)
            .background(Color("red"))
    );

    const shapeBehindText = (
        Text("Background Element")
            .padding(8)
            .background(RoundedRectangle().fill(Color("green")))
    );

    const rotatedBar = (
        RoundedRectangle()
            .fill(Color("green"))
            .frame({ width: 20, height: 80 })
            .rotationEffect(40)
    );

    const barBehindCircle = (
        Circle()
            .fill(Color("black"))
            .frame({ width: 50, height: 50 })
            .padding(8)
            .background(rotatedBar)
    );

    const imageBehindRectangle = (
        Rectangle()
            .fill(Color("blue").opacity(0.4))
            .frame({ width: 150, height: 150 })
            .background(Image(TEST_IMAGE).resizable())
    );

    const gradientBehindBlendedRectangle = (
        Rectangle()
            .fill(Color("blue").opacity(0.4))
            .blendMode("overlay")
            .frame({ width: 150, height: 150 })
            .background(LinearGradient())
    );

    return (
        ScrollView([
            VStack([
                textBehindShape,
                colorBehindShape,
                circleBehindShape,
                colorBehindText,
                shapeBehindText,
                barBehindCircle,
                imageBehindRectangle,
                gradientBehindBlendedRectangle
            ])
        ])
    );
};

export default defineComponent({ metadata, body });
