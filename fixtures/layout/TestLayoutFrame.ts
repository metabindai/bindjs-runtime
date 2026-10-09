const metadata = {
    title: "TestLayoutFrame",
    description: "Frame/background ordering cases, one per preview. The default render is the padding case: a 200x200 translucent red square (over faint blue) with a green rectangle inset 20pt on every side. In every case, a background applied before a frame paints the inner bounds and one applied after paints the outer frame."
};

// Which case `body` renders; every case also has its own preview.
const ACTIVE_TEST_INDEX = 6;

// ─── Body ─────────────────────────────────────────────────

const body = () => {
    const tests = FrameTests();
    const test = tests[ACTIVE_TEST_INDEX < tests.length ? ACTIVE_TEST_INDEX : 0];
    return Group(test.view);
};

const FrameTests = () => [
    { name: "Baseline", view: FrameTestBaseline() },
    { name: "Min / Max", view: FrameMinMaxTest() },
    { name: "Unbounded Expansion", view: FrameUnboundedExpansionTest() },
    { name: "Background Before / After Frame", view: FrameBeforeAfterBackgroundTest() },
    { name: "Aspect Ratio", view: FrameAspectRatioTest() },
    { name: "Nested Centering", view: FrameNestedCenteringTest() },
    { name: "Padding Interaction", view: FramePaddingInteractionTest() }
];

// ─── Lockups ─────────────────────────────────────────────

/**
 * Each background paints behind the view's layout bounds at the moment it is
 * applied: the circle is fixed at 200x150, so red (on the VStack) is 200x150;
 * the outer 400x800 frame centres it and blue fills the full 400x800.
 */
const FrameTestBaseline = () => (
    VStack([
        Circle()
            .fill(Color("green").opacity(0.5))
            .frame({ width: 200, height: 150 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: 800 })
        .background(Color("blue").opacity(0.1))
);

/**
 * A min/max frame clamps its child: the padded rectangle is flexible, so it
 * grows to the 200x120 maximum (red), centred in a 300x200 blue frame.
 */
const FrameMinMaxTest = () => (
    Rectangle()
        .fill(Color("green").opacity(0.45))
        .padding(10)
        .frame({ minWidth: 100, maxWidth: 200, minHeight: 80, maxHeight: 120 })
        .background(Color("red").opacity(0.5))
        .frame({ width: 300, height: 200 })
        .background(Color("blue").opacity(0.1))
);

/**
 * A fixed frame of Infinity inside a finite parent: the green rectangle
 * expands to fill the whole 300x200 blue region.
 */
const FrameUnboundedExpansionTest = () => (
    VStack([
        Rectangle()
            .fill(Color("green").opacity(0.5))
            .frame({ width: Infinity, height: Infinity })
    ])
        .frame({ width: 300, height: 200 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Background before vs after a frame: red is applied to the bare rectangle
 * (so it is hidden under the green fill), blue is applied after the 200x100
 * frame and fills it.
 */
const FrameBeforeAfterBackgroundTest = () => (
    Rectangle()
        .fill(Color("green"))
        .background(Color("red").opacity(0.5))
        .frame({ width: 200, height: 100 })
        .background(Color("blue").opacity(0.1))
);

/**
 * aspectRatio(16/9) with a 320 width frame: red is the frame's bounds, the
 * green 16:9 rectangle sits inside it, centred in a 400x300 blue frame.
 */
const FrameAspectRatioTest = () => (
    Rectangle()
        .fill(Color("green"))
        .aspectRatio({ aspectRatio: 16 / 9 })
        .frame({ width: 320 })
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: 300 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Nested fixed frames centre their content: a 100x100 green/red box centred
 * within a 300x200 blue frame.
 */
const FrameNestedCenteringTest = () => (
    Rectangle()
        .fill(Color("green"))
        .frame({ width: 100, height: 100 })
        .background(Color("red").opacity(0.5))
        .frame({ width: 300, height: 200 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Padding shrinks the size proposed to the content before the frame applies:
 * the flexible green rectangle fills the 200x200 frame minus 20pt of padding
 * on every side, with red showing in the padded band and blue behind it all.
 */
const FramePaddingInteractionTest = () => (
    Rectangle()
        .fill(Color("green"))
        .padding(20)
        .background(Color("red").opacity(0.5))
        .frame({ width: 200, height: 200 })
        .background(Color("blue").opacity(0.1))
);

// ─── Previews ────────────────────────────────────────────

const previews = () => [
    Self().previewName("Default"),
    ...FrameTests().map((test) => test.view.previewName(test.name))
];

export default defineComponent({ metadata, body, previews });
