const metadata = {
    title: "TestImage",
    description: "Image sizing modes side by side in 80×80 boxes: intrinsic size (overflowing), resizable (stretched), contentMode fill and fit, then fill and fit again with .clipped(), then a 100×200 black-bordered box holding a fill image above \"Hello\". The \"Card\" preview shows a card mixing a resizable image, an image used as a background, and a fixed-height title."
};

const IMAGE_SIZE = 80;

const TEST_IMAGE_URL = "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg";

const TEST_IMAGE = { url: TEST_IMAGE_URL, dimensions: { width: 613, height: 287 } };

const body = () => {
    const borderedBox = (
        VStack([
            ScaleToFillImage(),
            Text("Hello")
        ])
            .frame({ height: 200, width: 100 })
            .border({ style: Color("black") })
    );

    return (
        VStack([
            DefaultImage(),
            ResizeableImage(),
            ScaleToFillImage(),
            ScaleToFitImage(),
            ScaleToFillImage().clipped(),
            ScaleToFitImage().clipped(),
            borderedBox
        ])
            .frame({ height: 600 })
    );
};

const LargeCardItem = (props: { title?: string }) => {
    const titleText = (
        Text(props.title ?? "ArticleCard")
            .fontWeight("semibold")
            .padding("horizontal", 20)
            .padding("vertical", 16)
            .frame({ minHeight: 80, alignment: "top" })
            .frame({ height: 80 })
    );

    return (
        VStack({ spacing: 0 }, [
            RoundedRectangle().frame({ width: 50, height: 50 }),
            Image(TEST_IMAGE).resizable().frame({ width: 100, height: 100 }),
            Rectangle()
                .fill(Color("blue").opacity(0.4))
                .frame({ width: 150, height: 150 })
                .background(Image(TEST_IMAGE).resizable().scaledToFill()),
            titleText
        ])
    );
};

const DefaultImage = () => (
    ZStack([
        Image({ url: TEST_IMAGE_URL })
    ])
        .frame({ width: IMAGE_SIZE, height: IMAGE_SIZE })
);

const ResizeableImage = () => (
    ZStack([
        Image({ url: TEST_IMAGE_URL }).resizable()
    ])
        .frame({ width: IMAGE_SIZE, height: IMAGE_SIZE })
);

const ScaleToFillImage = () => (
    ZStack([
        Image({ url: TEST_IMAGE_URL, contentMode: "fill" }).resizable()
    ])
        .frame({ width: IMAGE_SIZE, height: IMAGE_SIZE })
);

const ScaleToFitImage = () => (
    ZStack([
        Image({ url: TEST_IMAGE_URL, contentMode: "fit" }).resizable()
    ])
        .frame({ width: IMAGE_SIZE, height: IMAGE_SIZE })
);

const previews = [
    Self().previewName("Sizing Modes"),
    VStack([
        LargeCardItem({ title: "Card" })
    ]).previewName("Card")
];

export default defineComponent({ metadata, body, previews });
