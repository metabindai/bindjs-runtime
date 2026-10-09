const metadata = {
    title: "TestLayoutVStackExplorer",
    description: "VStack counterpart of TestLayoutHStack: a \"VStack Layout Explorer\" title and a tab bar; each tab is also a preview. Columns are framed so sizes are checkable: blue = the column's frame, red = the VStack's bounds, green = content. Each tab's expected result is printed under its heading."
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

    const tabBar = (
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
            Text("VStack Layout Explorer").font("title2").bold(),
            tabBar,
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
        case "Basic Layout": return BasicLayoutTest();
        case "Aspect Ratio": return AspectRatioTest();
        case "Scaled Images": return ScaledImagesTest();
        default: return NestedStacksTest();
    }
};

// ─── Lockups ─────────────────────────────────────────────

const Heading = (title: string, expected: string) => (
    VStack({ spacing: 4 }, [
        Text(title).font("headline"),
        Text(expected)
            .font("caption")
            .foregroundStyle(Color("secondary"))
            .multilineTextAlignment("center")
            .frame({ maxWidth: 520 })
    ])
);

const CaseLabel = (text: string) => (
    Text(text)
        .font("caption2")
        .foregroundStyle(Color("secondary"))
);

// A VStack (red) framed to a fixed column (blue), with a label underneath.
const Column = (label: string, width: number, height: number, stack: Component, clipped = false) => {
    const framed = (
        stack
            .background(Color("red").opacity(0.3))
            .frame({ width, height })
            .background(Color("blue").opacity(0.1))
    );
    return (
        VStack({ spacing: 6 }, [
            clipped ? framed.clipped() : framed,
            CaseLabel(label)
        ])
    );
};

const NestedStacksTest = () => {
    const rows = (
        VStack({ alignment: "leading", spacing: 12 }, [
            ListRow({ title: "Ship", subtitle: "3 releases", colors: [Color("green"), Color("mint")] }),
            ListRow({ title: "Code", subtitle: "12 pull requests", colors: [Color("orange"), Color("red")] }),
            ListRow({ title: "Design", subtitle: "5 reviews", colors: [Color("purple"), Color("pink")] })
        ])
            .padding(16)
            .background(Color("gray").opacity(0.1))
            .cornerRadius(12)
    );

    const progress = (
        VStack({ spacing: 4 }, [
            ProgressSegment({ color: Color("gray").opacity(0.3) }),
            ProgressSegment({ color: Color("green") }),
            ProgressSegment({ color: Color("green") })
        ])
            .frame({ width: 8, height: 200 })
    );

    return (
        VStack({ spacing: 16 }, [
            Heading("Nested Stack Layouts", "Three leading-aligned rows (gradient circle + two-line text) in a grey card, beside an 8x200 vertical progress bar: one grey segment above two green, each ~64pt tall."),
            HStack({ spacing: 24 }, [rows, progress])
        ])
    );
};

const ListRow = (props: { title: string, subtitle: string, colors: Color[] }) => (
    HStack({ spacing: 12 }, [
        Circle()
            .fill(LinearGradient({ colors: props.colors, startPoint: "topLeading", endPoint: "bottomTrailing" }))
            .frame({ width: 40, height: 40 }),
        VStack({ alignment: "leading", spacing: 2 }, [
            Text(props.title).font("body").bold(),
            Text(props.subtitle).font("caption").foregroundStyle(Color("secondary"))
        ])
    ])
);

// Flexible height: VStack divides the 200pt column between the three segments.
const ProgressSegment = (props: { color: Color }) => (
    Rectangle()
        .fill(props.color)
        .frame({ width: 8 })
        .cornerRadius(4)
);

const MixedContentTest = () => {
    const profileCard = (
        VStack({ spacing: 8 }, [
            ZStack([
                Circle().fill(Color("blue")),
                Text("👋").font("title")
            ])
                .frame({ width: 64, height: 64 }),
            Text("Hello, VStack!").font("headline"),
            Text("Mixed content layout demo").font("caption").foregroundStyle(Color("secondary")),
            Capsule()
                .fill(Color("green"))
                .frame({ width: 100, height: 36 })
                .overlay(
                    Text("Action")
                        .font("caption")
                        .bold()
                        .foregroundStyle(Color("white"))
                )
        ])
            .padding(20)
            .background(Color("gray").opacity(0.1))
            .cornerRadius(12)
    );

    const sidebar = (
        VStack({ alignment: "leading", spacing: 12 }, [
            Text("Favorites").font("body").bold(),
            HStack({ spacing: 8 }, [
                Image({ systemName: "star.fill" }).foregroundStyle(Color("yellow")),
                Text("Starred").font("body")
            ]),
            HStack({ spacing: 8 }, [
                Image({ systemName: "clock" }).foregroundStyle(Color("gray")),
                Text("Recent").font("body")
            ]),
            Spacer(),
            Text("12 items").font("caption").foregroundStyle(Color("secondary"))
        ])
            .padding(16)
            .frame({ width: 160, height: 220, alignment: "topLeading" })
            .background(Color("white"))
            .cornerRadius(10)
            .shadow({ radius: 2, y: 1 })
    );

    return (
        VStack({ spacing: 16 }, [
            Heading("Mixed Content Types", "Left: a centred card (blue emoji circle, title, caption, green Action capsule). Right: a 160x220 sidebar with rows at the top and \"12 items\" pushed to the bottom by a Spacer."),
            HStack({ spacing: 24, alignment: "top" }, [profileCard, sidebar])
        ])
    );
};

const SpacingTest = () => (
    VStack({ spacing: 16 }, [
        Heading("Spacing Variations", "Four columns of four 40pt circles, spacing 32 / 16 / 8 / 0: the columns get shorter left to right and the last one's circles touch."),
        HStack({ spacing: 24, alignment: "top" }, [
            ForEach([32, 16, 8, 0], (spacing) => (
                VStack({ spacing: 4 }, [
                    VStack({ spacing }, [
                        Circle().fill(Color("blue")).frame({ width: 40, height: 40 }),
                        Circle().fill(Color("teal")).frame({ width: 40, height: 40 }),
                        Circle().fill(Color("cyan")).frame({ width: 40, height: 40 }),
                        Circle().fill(Color("mint")).frame({ width: 40, height: 40 })
                    ])
                        .padding(8)
                        .background(Color("gray").opacity(0.1))
                        .cornerRadius(8),
                    CaseLabel(`spacing: ${spacing}`)
                ])
            ))
        ])
    ])
);

const AlignmentTest = () => (
    VStack({ spacing: 16 }, [
        Heading("Horizontal Alignment Options", "Three columns, each a capsule (40x25), rectangle (80x30) and circle (30): the narrow children hug the left edge, the centre line, then the right edge of the 80pt-wide red stack."),
        HStack({ spacing: 24, alignment: "top" }, [
            AlignmentColumn({ alignment: "leading" }),
            AlignmentColumn({ alignment: "center" }),
            AlignmentColumn({ alignment: "trailing" })
        ])
    ])
);

const AlignmentColumn = (props: { alignment: HorizontalAlignment }) => (
    VStack({ spacing: 4 }, [
        VStack({ spacing: 12, alignment: props.alignment }, [
            Capsule().fill(Color("blue")).frame({ width: 40, height: 25 }),
            Rectangle().fill(Color("green")).frame({ width: 80, height: 30 }),
            Circle().fill(Color("red")).frame({ width: 30, height: 30 })
        ])
            .background(Color("red").opacity(0.15))
            .padding(12)
            .background(Color("gray").opacity(0.1))
            .cornerRadius(8),
        CaseLabel(props.alignment)
    ])
);

const BasicLayoutTest = () => {
    const column = (
        VStack({ spacing: 20 }, [
            Rectangle().fill(Color("purple")).frame({ width: 75, height: 60 }),
            Rectangle().fill(Color("orange")).frame({ width: 50, height: 120 }),
            Rectangle().fill(Color("green")).frame({ width: 100, height: 80 })
        ])
            .background(Color("red").opacity(0.3))
            .frame({ width: 150, height: 400 })
            .background(Color("blue").opacity(0.1))
            .cornerRadius(12)
    );

    return (
        VStack({ spacing: 16 }, [
            Heading("Fixed-size children in VStack", "Red (the VStack) is 100x300: as wide as the widest child, as tall as 60+120+80 plus two 20pt gaps. It sits centred in the 150x400 blue frame, children centred horizontally."),
            column
        ])
    );
};

/**
 * VStack gives its fixed children their height first, then splits what's
 * left between flexible ones; aspectRatio then picks the largest (fit) or
 * smallest covering (fill) size of that ratio within the offer.
 */
const AspectRatioTest = () => {
    const bar = Rectangle().fill(Color("orange")).frame({ width: 120, height: 30 });

    const fitWithBar = (
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 2, contentMode: "fit" }),
            bar
        ])
    );

    const twoSquares = (
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 1, contentMode: "fit" }),
            Rectangle().fill(Color("teal")).aspectRatio({ aspectRatio: 1, contentMode: "fit" })
        ])
    );

    const tallFit = (
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 0.5, contentMode: "fit" }),
            bar
        ])
    );

    const fillClipped = (
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("green")).aspectRatio({ aspectRatio: 2, contentMode: "fill" }),
            bar
        ])
    );

    return (
        VStack({ spacing: 16 }, [
            Heading("aspectRatio inside a VStack", "Columns are 120x300. 2:1 fit: green 120x60 above the orange bar. Two 1:1 fit: two 120x120 squares. 1:2 fit: green 120x240 (width-limited; 260pt of height is left after the bar). 2:1 fill: green overflows to ~520x260 and is clipped to the column, so it fills the top 260pt."),
            HStack({ spacing: 16, alignment: "top" }, [
                Column("2:1 fit + bar", 120, 300, fitWithBar),
                Column("two 1:1 fit", 120, 300, twoSquares),
                Column("1:2 fit + bar", 120, 300, tallFit),
                Column("2:1 fill, clipped", 120, 300, fillClipped, true)
            ])
        ])
    );
};

const ScaledImagesTest = () => {
    const fitLandscape = (
        VStack({ spacing: 10 }, [
            Image(LANDSCAPE).resizable().scaledToFit(),
            CaseLabel("613x287")
        ])
    );

    const fitPortrait = (
        VStack({ spacing: 10 }, [
            Image(PORTRAIT).resizable().scaledToFit(),
            CaseLabel("1290x2796")
        ])
    );

    const fillCards = (
        VStack({ spacing: 10 }, [
            Image(LANDSCAPE)
                .resizable()
                .scaledToFill()
                .frame({ width: 120, height: 80 })
                .clipped(),
            Image(PORTRAIT)
                .resizable()
                .scaledToFill()
                .frame({ width: 120, height: 80 })
                .clipped()
        ])
    );

    const fillUnclipped = (
        VStack({ spacing: 10 }, [
            Image(LANDSCAPE)
                .resizable()
                .scaledToFill()
                .frame({ width: 120, height: 80 }),
            CaseLabel("overflows")
        ])
    );

    return (
        VStack({ spacing: 16 }, [
            Heading("Scaled images inside a VStack", "Columns are 120x300. Landscape fit: whole photo 120x~56 above its label. Portrait fit: whole photo at 120x~260, never cropped. Fill cards: two 120x80 crops, sides/top-bottom cut. Unclipped fill: the landscape photo spills past its 120x80 frame to ~171x80."),
            HStack({ spacing: 16, alignment: "top" }, [
                Column("scaledToFit landscape", 120, 300, fitLandscape),
                Column("scaledToFit portrait", 120, 300, fitPortrait),
                Column("scaledToFill + clipped", 120, 300, fillCards),
                Column("scaledToFill, no clip", 120, 300, fillUnclipped)
            ])
        ])
    );
};

// ─── Previews ────────────────────────────────────────────

const previews = TABS.map((tab) => Self({ tab }).previewName(tab));

export default defineComponent({ metadata, properties, body, previews });
