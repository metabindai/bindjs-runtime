const metadata = {
    title: "TestScaledToFill",
    description: "scaledToFill on resizable images: rows are frame shapes (160x160 square, 240x100 wide, 100x240 tall), columns are landscape / portrait / square images. Clipped, every frame is filled edge to edge with no blue showing: the landscape photo loses its sides in the square and tall frames, the portrait one its top and bottom in the square and wide frames. Nothing is distorted. The \"Unclipped\" preview shows the landscape photo spilling past a faint 160x160 frame to 342x160."
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
        .scaledToFill()
        .frame({ width: frame.width, height: frame.height })
        .clipped()
        .background(Color("blue").opacity(0.15))
);

// Without clipping, fill overflows its frame; the image is faded so the
// frame's red border shows through.
const Unclipped = () => (
    Image(IMAGES[0].media)
        .resizable()
        .scaledToFill()
        .opacity(0.4)
        .frame({ width: 160, height: 160 })
        .border({ style: Color("red"), width: 2 })
        .padding(120)
);

// ─── Previews ────────────────────────────────────────────

const previews = [
    Self().previewName("All frames"),
    ...FRAMES.map((frame) => FrameRow(frame).padding(24).previewName(frame.name)),
    Unclipped().previewName("Unclipped")
];

export default defineComponent({ metadata, body, previews });
