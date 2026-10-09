const metadata = {
    title: "TestPadding",
    description: "Padding edge variants on a 40pt black square over a blue background: default, 20pt all round, horizontal, vertical, leading, trailing, top, bottom, and stacked leading/trailing (5+15) — the blue shows exactly the padded edges of each square."
};

const body = () => (
    VStack([
        DefaultPadding(),
        FullPadding(),
        HorizontalPadding(),
        VerticalPadding(),
        LeadingPadding(),
        TrailingPadding(),
        TopPadding(),
        BottomPadding(),
        MixedPadding()
    ])
        .frame({ maxWidth: Infinity, maxHeight: Infinity })
);

const PaddingContent = () => Rectangle().frame({ width: 40, height: 40 });

const DefaultPadding = () => PaddingContent().padding().background(Color("blue"));
const FullPadding = () => PaddingContent().padding(20).background(Color("blue"));
const HorizontalPadding = () => PaddingContent().padding("horizontal", 20).background(Color("blue"));
const VerticalPadding = () => PaddingContent().padding("vertical", 20).background(Color("blue"));
const LeadingPadding = () => PaddingContent().padding("leading", 20).background(Color("blue"));
const TrailingPadding = () => PaddingContent().padding("trailing", 20).background(Color("blue"));
const TopPadding = () => PaddingContent().padding("top", 20).background(Color("blue"));
const BottomPadding = () => PaddingContent().padding("bottom", 20).background(Color("blue"));

const MixedPadding = () => (
    PaddingContent()
        .padding("leading", 5)
        .padding("leading", 15)
        .padding("trailing", 5)
        .padding("trailing", 15)
        .background(Color("blue"))
);

const thumbnail = () => FullPadding();

export default defineComponent({ metadata, body, thumbnail });
