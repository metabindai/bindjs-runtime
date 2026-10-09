const metadata = {
    title: "TestScaleToFit",
    description: "scaledToFit on resizable images: rows are frame shapes (160x160 square, 240x100 wide, 100x240 tall, blue), columns are landscape / portrait / square images. Every image is shown whole, as large as fits, centred, never cropped or distorted. Square frame: 160x75 / 74x160 / 160x160. Wide: 214x100 / 46x100 / 100x100. Tall: 100x47 / 100x217 / 100x100. One preview per frame shape."
};

const IMAGES = [
    {
        name: "landscape 613x287",
        media: {
            url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg",
            dimensions: { width: 613, height: 287 }
        }
    },
    {
        name: "portrait 1290x2796",
        media: {
            url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/9279cab9-3f77-4b85-9cac-e7225f6ef208/assets/b54f4fec-f4fc-4626-ade4-6fba67a2a38b/iClarified-iOS26-LockScreen-Dark.jpg",
            dimensions: { width: 1290, height: 2796 }
        }
    },
    {
        name: "square 1024x1024",
        media: {
            url: "https://cdn.metabind.ai/N9qb1ir3Fst1ree94WHW/FbAs1nDGM5lioi2hjNRR/assets/TUCBWff2SsFBsn14GQwj/Content-Lawn-Inspection-2.jpg",
            dimensions: { width: 1024, height: 1024 }
        }
    }
];

const FRAMES = [
    { name: "Square frame", width: 160, height: 160 },
    { name: "Wide frame", width: 240, height: 100 },
    { name: "Tall frame", width: 100, height: 240 }
];

// ─── Body ─────────────────────────────────────────────────

const body = () => (
    VStack({ alignment: "leading", spacing: 24 }, [
        ForEach(FRAMES, (frame) => FrameRow(frame))
    ])
        .padding(24)
);

// ─── Lockups ─────────────────────────────────────────────

// One frame shape, with each image scaled into it.
const FrameRow = (frame: { name: string, width: number, height: number }) => (
    VStack({ alignment: "leading", spacing: 8 }, [
        Text(`${frame.name} ${frame.width}x${frame.height}`).font("headline"),
        HStack({ spacing: 24, alignment: "top" }, [
            ForEach(IMAGES, (image) => (
                VStack({ alignment: "leading", spacing: 4 }, [
                    Cell(image.media, frame),
                    Text(image.name)
                        .font("caption2")
                        .foregroundStyle(Color("secondary"))
                ])
            ))
        ])
    ])
);

const Cell = (media: AssetMedia, frame: { width: number, height: number }) => (
    Image(media)
        .resizable()
        .scaledToFit()
        .frame({ width: frame.width, height: frame.height })
        .background(Color("blue").opacity(0.15))
);

// ─── Previews ────────────────────────────────────────────

const previews = [
    Self().previewName("All frames"),
    ...FRAMES.map((frame) => FrameRow(frame).padding(24).previewName(frame.name))
];

export default defineComponent({ metadata, body, previews });
