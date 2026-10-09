const metadata = {
    title: "TestText",
    description: "A scroll view repeating the same block (Latin text, digits, emoji incl. ZWJ flags, bullets and geometric glyphs) once per semantic text style, largest to smallest: largeTitle (on a light grey background), title, title2, title3, headline, body, callout, subheadline, footnote, caption, caption2. Each block should be visibly smaller than the previous one and all emoji/glyphs should render without tofu boxes."
};

const SAMPLE_TEXT = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

1234567890
👋 👍 👎
🫠 🫡 🫨
🏳️‍🌈 🏴‍☠️ 🏳️‍⚧️
🩵 🩶 🩷
🪿 🦭 🐿️
• ‣ ⁃ ◦
⦿ ⬤ ● ○
⚫ ⚪ ⬛ ⬜
▲ ▼ △ ▽
---`;

const body = () => {
    const content = (
        VStack({ alignment: "leading", spacing: 0 }, [
            Text(SAMPLE_TEXT)
                .font("largeTitle")
                .background(Color("black").opacity(0.1)),
            Text(SAMPLE_TEXT).font("title"),
            Text(SAMPLE_TEXT).font("title2"),
            Text(SAMPLE_TEXT).font("title3"),
            Text(SAMPLE_TEXT).font("headline"),
            Text(SAMPLE_TEXT).font("body"),
            Text(SAMPLE_TEXT).font("callout"),
            Text(SAMPLE_TEXT).font("subheadline"),
            Text(SAMPLE_TEXT).font("footnote"),
            Text(SAMPLE_TEXT).font("caption"),
            Text(SAMPLE_TEXT).font("caption2")
        ])
            .multilineTextAlignment("leading")
            .lineSpacing(4)
    );

    return ScrollView(content);
};

const thumbnail = () => (
    Text("👋 👍 👎")
        .font("largeTitle")
        .multilineTextAlignment("leading")
        .lineSpacing(4)
        .frame({ maxWidth: Infinity })
        .padding(12)
);

export default defineComponent({ metadata, body, thumbnail });
