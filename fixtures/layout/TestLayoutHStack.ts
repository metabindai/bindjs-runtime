const metadata = {
    title: "TestLayoutHStack",
    description: "Interactive HStack explorer: a \"HStack Layout Explorer\" title and a tab bar (selected tab blue with white text); each tab is also a preview. It opens on \"Nested Stacks\" (three gradient-circle cards and a 300pt segmented progress bar); other tabs show mixed content, spacing 32/16/8/0 rows, bottom/center/top alignment rows, fixed-size children on a red 400x150 band, and aspectRatio / scaled-image rows whose expected sizes are printed under their headings (blue = row frame, red = HStack bounds, green = content)."
};

const TABS = [
    "Nested Stacks",
    "Mixed Content",
    "Spacing Variations",
    "Alignments",
    "Basic Layout",
    "Aspect Ratio",
    "Scaled Images"
];

const properties = {
    tab: { type: "enum", title: "Tab", options: TABS, defaultValue: "Nested Stacks" }
} satisfies ComponentProperties;

const LANDSCAPE: AssetMedia = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg",
    dimensions: { width: 613, height: 287 }
};

const PORTRAIT: AssetMedia = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/9279cab9-3f77-4b85-9cac-e7225f6ef208/assets/b54f4fec-f4fc-4626-ade4-6fba67a2a38b/iClarified-iOS26-LockScreen-Dark.jpg",
    dimensions: { width: 1290, height: 2796 }
};

// ─── Body ─────────────────────────────────────────────────

const body = (props: InferProps<typeof properties>) => {
    // null until a tab is tapped, so each preview opens on its own `tab` prop.
    const [selected, setSelected] = useState<string | null>(null);
    const current = selected ?? props.tab;

    const testSelector = (
        HStack({ spacing: 8 }, [
            ForEach(TABS, (tab) => {
                const isSelected = tab === current;
                const label = (
                    Text(tab)
                        .font("caption")
                        .foregroundStyle(isSelected ? Color("white") : Color("primary"))
                );
                return (
                    Button(label, () => setSelected(tab))
                        .padding(["horizontal"], 12)
                        .padding(["vertical"], 6)
                        .background(isSelected ? Color("blue") : Color("gray").opacity(0.2))
                        .cornerRadius(8)
                );
            })
        ])
    );

    return (
        VStack({ spacing: 20 }, [
            Text("HStack Layout Explorer").font("title2").bold(),
            testSelector,
            Divider(),
            TabContent(current),
            Spacer()
        ])
            .padding(20)
    );
};

const TabContent = (tab: string) => {
    switch (tab) {
        case "Mixed Content": return MixedContentTest();
        case "Spacing Variations": return SpacingTest();
        case "Alignments": return AlignmentTest();
        case "Basic Layout": return BasicHStackTest();
        case "Aspect Ratio": return AspectRatioTest();
        case "Scaled Images": return ScaledImagesTest();
        default: return NestedStacksTest();
    }
};

// ─── Lockups ─────────────────────────────────────────────

const NestedStacksTest = () => {
    const cards = (
        HStack({ spacing: 16 }, [
            GradientCard({ title: "Ship", colors: [Color("green"), Color("mint")] }),
            GradientCard({ title: "Code", colors: [Color("orange"), Color("red")] }),
            GradientCard({ title: "Design", colors: [Color("purple"), Color("pink")] })
        ])
    );

    const progressBar = (
        HStack({ spacing: 4 }, [
            ProgressSegment({ color: Color("gray").opacity(0.3) }),
            ProgressSegment({ color: Color("green") }),
            ProgressSegment({ color: Color("green") })
        ])
            .frame({ width: 300 })
    );

    return (
        VStack({ spacing: 16 }, [
            Text("Nested Stack Layouts").font("headline"),
            cards,
            progressBar
        ])
    );
};

const GradientCard = (props: { title: string, colors: Color[] }) => (
    VStack({ spacing: 8 }, [
        Circle()
            .fill(LinearGradient({ colors: props.colors, startPoint: "topLeading", endPoint: "bottomTrailing" }))
            .frame({ width: 60, height: 60 }),
        Text(props.title).font("caption").bold()
    ])
        .padding(16)
        .background(Color("gray").opacity(0.1))
        .cornerRadius(12)
);

const ProgressSegment = (props: { color: Color }) => (
    Rectangle()
        .fill(props.color)
        .frame({ height: 8 })
        .cornerRadius(4)
);

const MixedContentTest = () => {
    const actionButton = (
        Capsule()
            .fill(Color("green"))
            .frame({ width: 80, height: 36 })
            .overlay(
                Text("Action")
                    .font("caption")
                    .bold()
                    .foregroundStyle(Color("white"))
            )
    );

    const textBlock = (
        VStack({ alignment: "trailing", spacing: 4 }, [
            Text("Hello, HStack!").font("headline"),
            Text("Mixed content layout demo").font("caption").foregroundStyle(Color("secondary"))
        ])
    );

    const iconCircle = (
        ZStack([
            Circle().fill(Color("blue")),
            Text("👋").font("title2")
        ])
            .frame({ width: 50, height: 50 })
    );

    const heroRow = (
        HStack({ spacing: 16, alignment: "center" }, [
            actionButton,
            Spacer(),
            textBlock,
            iconCircle
        ])
            .padding(16)
            .background(Color("gray").opacity(0.1))
            .cornerRadius(12)
            .frame({ width: 350 })
    );

    const favoritesRow = (
        HStack({ spacing: 12 }, [
            Image({ systemName: "chevron.left" }).foregroundStyle(Color("gray")),
            Text("12").font("body").foregroundStyle(Color("secondary")),
            Spacer(),
            Text("Favorites").font("body"),
            Image({ systemName: "star.fill" }).foregroundStyle(Color("yellow"))
        ])
            .padding(16)
            .background(Color("white"))
            .cornerRadius(10)
            .shadow({ radius: 2, y: 1 })
            .frame({ width: 300 })
    );

    return (
        VStack({ spacing: 16 }, [
            Text("Mixed Content Types").font("headline"),
            heroRow,
            favoritesRow
        ])
    );
};

const SpacingTest = () => (
    VStack({ spacing: 16 }, [
        Text("Spacing Variations").font("headline"),
        ForEach([32, 16, 8, 0], (spacing) => (
            VStack({ spacing: 4 }, [
                Text(`spacing: ${spacing}`).font("caption").foregroundStyle(Color("secondary")),
                HStack({ spacing }, [
                    Circle().fill(Color("blue")).frame({ width: 40, height: 40 }),
                    Circle().fill(Color("teal")).frame({ width: 40, height: 40 }),
                    Circle().fill(Color("cyan")).frame({ width: 40, height: 40 }),
                    Circle().fill(Color("mint")).frame({ width: 40, height: 40 })
                ])
                    .padding(8)
                    .background(Color("gray").opacity(0.1))
                    .cornerRadius(8)
            ])
        ))
    ])
);

const AlignmentTest = () => (
    VStack({ spacing: 16 }, [
        Text("Vertical Alignment Options").font("headline"),
        AlignmentRow({ alignment: "bottom" }),
        AlignmentRow({ alignment: "center" }),
        AlignmentRow({ alignment: "top" })
    ])
);

const AlignmentRow = (props: { alignment: VerticalAlignment }) => (
    VStack({ spacing: 4 }, [
        Text(props.alignment).font("caption").foregroundStyle(Color("secondary")),
        HStack({ spacing: 12, alignment: props.alignment }, [
            Capsule().fill(Color("blue")).frame({ width: 40, height: 25 }),
            Rectangle().fill(Color("green")).frame({ width: 50, height: 60 }),
            Circle().fill(Color("red")).frame({ width: 30, height: 30 })
        ])
            .padding(12)
            .background(Color("gray").opacity(0.1))
            .cornerRadius(8)
    ])
);

const BasicHStackTest = () => {
    const fixedRow = (
        HStack({ spacing: 20 }, [
            Rectangle().fill(Color("purple")).frame({ width: 60, height: 75 }),
            Rectangle().fill(Color("orange")).frame({ width: 120, height: 50 }),
            Rectangle().fill(Color("green")).frame({ width: 80, height: 100 })
        ])
            .background(Color("red").opacity(0.3))
            .frame({ width: 400, height: 150 })
            .background(Color("blue").opacity(0.1))
            .cornerRadius(12)
    );

    return (
        VStack({ spacing: 16 }, [
            Text("Fixed-size children in HStack").font("headline"),
            Text("Red background shows HStack bounds").font("caption").foregroundStyle(Color("secondary")),
            fixedRow
        ])
    );
};

const Heading = (title: string, expected: string) => (
    VStack({ spacing: 4 }, [
        Text(title).font("headline"),
        Text(expected)
            .font("caption")
            .foregroundStyle(Color("secondary"))
            .multilineTextAlignment("center")
            .frame({ maxWidth: 480 })
    ])
);

// An HStack (red) framed to a fixed 400x120 row (blue), with a label above.
const Row = (label: string, stack: Component, clipped = false) => {
    const framed = (
        stack
            .background(Color("red").opacity(0.3))
            .frame({ width: 400, height: 120 })
            .background(Color("blue").opacity(0.1))
    );
    return (
        VStack({ alignment: "leading", spacing: 4 }, [
            Text(label).font("caption2").foregroundStyle(Color("secondary")),
            clipped ? framed.clipped() : framed
        ])
    );
};

/**
 * HStack gives its fixed children their width first, then splits what's left
 * between flexible ones; aspectRatio then picks the largest (fit) or smallest
 * covering (fill) size of that ratio within the offer.
 */
const AspectRatioTest = () => {
    const bar = Rectangle().fill(Color("orange")).frame({ width: 100, height: 40 });

    return (
        VStack({ spacing: 12 }, [
            Heading("aspectRatio inside an HStack", "Rows are 400x120. 1:1 fit + bar: a 120x120 square (height-limited). Two 1:1 fit: two 120x120 squares. 2:1 fit + bar: green 240x120. 1:1 fill: green grows to ~290x290 and is clipped to the row, filling it left of the bar."),
            Row("1:1 fit + bar", HStack({ spacing: 10 }, [
                Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 1, contentMode: "fit" }),
                bar
            ])),
            Row("two 1:1 fit", HStack({ spacing: 10 }, [
                Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 1, contentMode: "fit" }),
                Rectangle().fill(Color("teal")).aspectRatio({ aspectRatio: 1, contentMode: "fit" })
            ])),
            Row("2:1 fit + bar", HStack({ spacing: 10 }, [
                Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 2, contentMode: "fit" }),
                bar
            ])),
            Row("1:1 fill + bar, clipped", HStack({ spacing: 10 }, [
                Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 1, contentMode: "fill" }),
                bar
            ]), true)
        ])
    );
};

const ScaledImagesTest = () => {
    const label = (text: string) => Text(text).font("caption").foregroundStyle(Color("secondary"));

    const thumbnail = (image: AssetMedia) => (
        Image(image)
            .resizable()
            .scaledToFill()
            .frame({ width: 100, height: 100 })
            .clipped()
    );

    return (
        VStack({ spacing: 12 }, [
            Heading("Scaled images inside an HStack", "Rows are 400x120. Landscape fit: whole photo ~256x120 beside its label. Portrait fit: whole photo ~55x120. Fill thumbnails: two 100x100 crops. Unclipped fill: the landscape photo spills past its 100x100 frame to ~214x100."),
            Row("scaledToFit landscape", HStack({ spacing: 10 }, [
                Image(LANDSCAPE).resizable().scaledToFit(),
                label("613x287")
            ])),
            Row("scaledToFit portrait", HStack({ spacing: 10 }, [
                Image(PORTRAIT).resizable().scaledToFit(),
                label("1290x2796")
            ])),
            Row("scaledToFill + clipped", HStack({ spacing: 10 }, [
                thumbnail(LANDSCAPE),
                thumbnail(PORTRAIT)
            ])),
            Row("scaledToFill, no clip", HStack({ spacing: 10 }, [
                Image(LANDSCAPE)
                    .resizable()
                    .scaledToFill()
                    .frame({ width: 100, height: 100 }),
                label("overflows")
            ]))
        ])
    );
};

// ─── Previews ────────────────────────────────────────────

const previews = TABS.map((tab) => Self({ tab }).previewName(tab));

export default defineComponent({ metadata, properties, body, previews });
