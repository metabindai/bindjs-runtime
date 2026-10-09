const metadata = {
    title: "TestAspectRatio",
    description: "aspectRatio on its own: each case is a 160x160 frame (blue) holding green content, labelled with what correct looks like. Fit picks the largest size of the ratio inside the frame, fill the smallest that covers it; without a ratio, a resizable image uses its own. The default render shows every clipped case in a grid; \"16:9 fill, unclipped\" is preview-only because it spills over its neighbours."
};

const LANDSCAPE: AssetMedia = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg",
    dimensions: { width: 613, height: 287 }
};

const green = () => Rectangle().fill(Color("green"));

const CASES = [
    {
        name: "16:9 fit",
        expected: "160x90, centred",
        view: () => green().aspectRatio({ aspectRatio: 16 / 9, contentMode: "fit" })
    },
    {
        name: "1:2 fit",
        expected: "80x160, centred",
        view: () => green().aspectRatio({ aspectRatio: 0.5, contentMode: "fit" })
    },
    {
        name: "16:9 fill, clipped",
        expected: "fills the frame (284x160 cropped)",
        clipped: true,
        view: () => green().aspectRatio({ aspectRatio: 16 / 9, contentMode: "fill" })
    },
    {
        name: "1:2 fill, clipped",
        expected: "fills the frame (160x320 cropped)",
        clipped: true,
        view: () => green().aspectRatio({ aspectRatio: 0.5, contentMode: "fill" })
    },
    {
        name: "2:1, width-only frame",
        expected: "160x80 (fit is the default)",
        view: () => green().aspectRatio({ aspectRatio: 2 }).frame({ width: 160 })
    },
    {
        name: "2:1, height-only frame",
        expected: "80x40",
        view: () => green().aspectRatio({ aspectRatio: 2 }).frame({ height: 40 })
    },
    {
        name: "1:1 on a fixed frame",
        expected: "stays 120x40: a fixed frame ignores the proposal",
        view: () => green().frame({ width: 120, height: 40 }).aspectRatio({ aspectRatio: 1 })
    },
    {
        name: "image, own ratio, fit",
        expected: "whole photo at 160x~75",
        view: () => Image(LANDSCAPE).resizable().aspectRatio({ contentMode: "fit" })
    },
    {
        name: "image forced 1:1",
        expected: "160x160, photo squashed (an explicit ratio stretches a resizable image)",
        view: () => Image(LANDSCAPE).resizable().aspectRatio({ aspectRatio: 1, contentMode: "fit" })
    },
    {
        name: "16:9 fill, unclipped",
        expected: "284x160: spills ~62pt past the frame on both sides",
        previewOnly: true,
        view: () => green().opacity(0.6).aspectRatio({ aspectRatio: 16 / 9, contentMode: "fill" })
    }
];

// ─── Body ─────────────────────────────────────────────────

const body = () => {
    const gridCases = CASES.filter((c) => !c.previewOnly);
    const rows = [0, 3, 6].map((start) => gridCases.slice(start, start + 3));

    return (
        VStack({ spacing: 24 }, [
            ForEach(rows, (row) => (
                HStack({ spacing: 24, alignment: "top" }, [
                    ForEach(row, (c) => Case(c))
                ])
            ))
        ])
            .padding(24)
    );
};

// ─── Lockups ─────────────────────────────────────────────

const Case = (c: { name: string, expected: string, clipped?: boolean, view: () => Component }) => {
    const framed = (
        c.view()
            .frame({ width: 160, height: 160 })
            .background(Color("blue").opacity(0.15))
    );

    return (
        VStack({ alignment: "leading", spacing: 4 }, [
            c.clipped ? framed.clipped() : framed,
            Text(c.name).font("caption").bold(),
            Text(c.expected)
                .font("caption2")
                .foregroundStyle(Color("secondary"))
                .frame({ width: 160, alignment: "leading" })
        ])
    );
};

// ─── Previews ────────────────────────────────────────────

const previews = [
    Self().previewName("All cases"),
    ...CASES.map((c) => Case(c).padding(80).previewName(c.name))
];

export default defineComponent({ metadata, body, previews });
