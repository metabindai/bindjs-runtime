const metadata = {
    title: "TestOverlay",
    description: "Exercises stacked .overlay() calls and overlay alignment: a grey square with a purple circle face (two grey eyes with black pupils and a grey mouth), above a blue square with white \"Top Left\", \"Center\" and \"Bottom Trailing\" labels at those positions."
};

const body = () => (
    VStack([
        OverlayTestShape(),
        OverlayTestText()
    ])
);

const OverlayTestShape = () => {
    const greyDot = (size: number) => Circle().fill(Color("#e3e3e3")).frame({ width: size, height: size });
    const pupil = () => Circle().fill(Color("black")).frame({ width: 25, height: 25 });

    return (
        RoundedRectangle()
            .fill(Color("#e3e3e3"))
            .frame({ width: 200, height: 200 })
            .overlay(Circle().fill(Color("purple")))
            .overlay(greyDot(50).offset({ x: -40 }))
            .overlay(greyDot(50).offset({ x: 40 }))
            .overlay(greyDot(40).offset({ y: 60 }))
            .overlay(pupil().offset({ x: -40, y: 8 }))
            .overlay(pupil().offset({ x: 40, y: 8 }))
    );
};

const OverlayTestText = () => (
    RoundedRectangle()
        .fill(Color("blue"))
        .frame({ width: 200, height: 200 })
        .overlay({ alignment: "topLeading" }, Text("Top Left"))
        .overlay({ alignment: "center" }, Text("Center"))
        .overlay({ alignment: "bottomTrailing" }, Text("Bottom Trailing"))
        .foregroundStyle(Color("white"))
);

const thumbnail = () => OverlayTestText();

const previews = () => [
    Self().previewName("Both"),
    OverlayTestShape().previewName("Shape overlays"),
    OverlayTestText().previewName("Aligned text overlays")
];

export default defineComponent({ metadata, body, previews, thumbnail });
