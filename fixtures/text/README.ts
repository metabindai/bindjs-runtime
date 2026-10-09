const metadata = {
    title: "README",
    description: "Markdown and i18n rendering: a white rounded card (max 800 wide, soft shadow) inside a scroll view, showing a Japanese H1 heading, a horizontal rule, two paragraphs and a two-item bullet list, with the Japanese glyphs rendered correctly and 5pt extra line spacing."
};

const markdown = `
# Metabind テストスイートへようこそ

---

このプロジェクトを使用して、さまざまなBindJS機能をテストしてください。
これはいくつかのテキストです。

こんにちは。

* これは箇条書きです。
* これは別の箇条書きポイントです。

`;

const body = () => (
    ScrollView([
        Text({ markdown })
            .padding(50)
            .lineSpacing(5)
    ])
        .background(Color("white"))
        .cornerRadius(20)
        .padding(30)
        .frame({ maxWidth: 800 })
        .shadow({ y: 10, radius: 20, color: Color("black").opacity(0.1) })
);

export default defineComponent({ metadata, body });
