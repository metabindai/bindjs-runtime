const metadata = {
    title: "TestThree",
    description: "Image card driven by asset/string properties written as plain { type } literals; the preview shows a 160pt-tall picsum photo with rounded corners, a bold \"Beautiful Landscasdfpe\" headline and a gray subtitle on a white, shadowed card.",
    category: "Display",
    public: true
};

const properties = {
    asset: {
        type: "asset",
        title: "Image",
        assetTypes: ["image"],
        description: "The main image displayed in the card"
    },
    title: {
        type: "string",
        title: "Title",
        inspector: {
            placeholder: "Enter title",
            control: "singleline"
        }
    },
    subtitle: {
        type: "string",
        title: "Subtitle",
        inspector: {
            placeholder: "Enter subtitle",
            control: "singleline"
        }
    }
} satisfies ComponentProperties;

const body = (props: InferProps<typeof properties>) => {
    const image = props.asset
        ? Image(props.asset.image)
            .resizable()
            .frame({ height: 160 })
            .frame({ maxWidth: Infinity })
            .cornerRadius(8)
        : Empty();

    const titleText = Text(props.title ?? "Title").font("headline").fontWeight("bold");
    const subtitleText = Text(props.subtitle).font("subheadline").foregroundStyle(Color("gray"));

    return (
        VStack({ spacing: 8, alignment: "leading" }, [
            image,
            titleText,
            subtitleText
        ])
            .padding(16)
            .background(Color("white"))
            .cornerRadius(12)
            .shadow({ radius: 24, y: 2, color: Color("black").opacity(0.1) })
            .padding(20)
    );
};

const previews = [
    Self({
        title: "Beautiful Landscasdfpe",
        subtitle: "A peaceful nature scene!!!",
        asset: { image: { url: "https://picsum.photos/400/240" } }
    }).previewName("Default Card")
];

export default defineComponent({ metadata, properties, body, previews });
