const metadata = {
    title: "TestLayoutVStack",
    description: "VStack sizing cases, one per preview (green = children, red = VStack bounds, blue = parent frame). The default render is the parent-proposal case: 100x50 and 150x60 green boxes stacked 10pt apart on a red box sized to the content (150x120), centred in a faint blue column 400pt wide that fills the available height."
};

// Which case `body` renders; every case also has its own preview.
const ACTIVE_TEST_INDEX = 1;

// ─── Body ─────────────────────────────────────────────────

const body = () => {
    const tests = VStackTests();
    const test = tests[ACTIVE_TEST_INDEX < tests.length ? ACTIVE_TEST_INDEX : 0];
    return Group(test.view);
};

const VStackTests = () => [
    { name: "Baseline", view: VStackBaseline() },
    { name: "Parent Proposal", view: VStackParentProposal() },
    { name: "Mixed Child Sizes", view: VStackMixedChildSizes() },
    { name: "Intrinsic Text", view: VStackIntrinsicText() },
    { name: "Nested Frame", view: VStackNestedFrame() },
    { name: "Alignment Test", view: VStackAlignmentTest() },
    { name: "Spacing Edge Cases", view: VStackSpacingEdgeCases() },
    { name: "Flexible Child", view: VStackFlexibleChild() },
    { name: "Aspect Ratio", view: VStackAspectRatio() },
    { name: "Nested Stacks", view: VStackNestedStacks() },
    { name: "Background Order", view: VStackBackgroundOrder() }
];

// ─── Lockups ─────────────────────────────────────────────

/**
 * Basic stacking: VStack width = widest child, height = sum of child heights
 * plus spacing. Red wraps the three rectangles (200x220) and is centred in the
 * 400x400 blue frame.
 */
const VStackBaseline = () => (
    VStack({ spacing: 10 }, [
        Rectangle().fill(Color("blue")).frame({ width: 100, height: 25 }),
        Rectangle().fill(Color("green")).frame({ width: 150, height: 100 }),
        Rectangle().fill(Color("green")).frame({ width: 200, height: 75 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: 400 })
        .background(Color("blue").opacity(0.1))
);

/**
 * How VStack answers a parent proposal. Layout is a negotiation: the parent
 * proposes a size (finite or infinite) and the child reports the size it wants
 * within it.
 *
 * Here the outer frame is `{ width: 400, height: Infinity }`: the VStack still
 * sizes to its content (red, 150 x (50 + 10 + 60)), while the blue frame is
 * 400 wide and takes all the height offered.
 *
 * Try other proposals to compare:
 * - `{ width: Infinity, height: 400 }` - intrinsic width, height clamped.
 * - `{ width: Infinity, height: Infinity }` - fills the offered space.
 */
const VStackParentProposal = () => (
    VStack({ spacing: 10 }, [
        Rectangle().fill(Color("green")).frame({ width: 100, height: 50 }),
        Rectangle().fill(Color("green")).frame({ width: 150, height: 60 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: Infinity })
        .background(Color("blue").opacity(0.1))
);

/**
 * Width = widest child, height = sum + spacing: red is 300 x (40 + 20 + 80),
 * centred in the 400x300 blue frame.
 */
const VStackMixedChildSizes = () => (
    VStack({ spacing: 20 }, [
        Rectangle().fill(Color("green")).frame({ width: 50, height: 40 }),
        Rectangle().fill(Color("green")).frame({ width: 300, height: 80 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: 300 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Intrinsic text size propagates up: each Text reports its natural size, the
 * VStack takes the widest line and sums the heights plus spacing. Red hugs
 * both green-backed lines; blue shows the 300x200 frame around them.
 */
const VStackIntrinsicText = () => (
    VStack({ spacing: 20 }, [
        Text("Short").background(Color("green")),
        Text("A much longer line of text").background(Color("green"))
    ])
        .background(Color("red").opacity(0.5))
        .id("red")
        .frame({ width: 300, height: 200 })
        .background(Color("blue").opacity(0.1))
);

/**
 * A VStack with its own fixed frame wrapped in another frame: children
 * (100x50, 200x50) overflow the 150x150 red frame horizontally; blue fills
 * that 150x150 frame, which is centred in an unpainted 300x300 frame.
 */
const VStackNestedFrame = () => (
    VStack({ spacing: 20 }, [
        Rectangle().fill(Color("green")).frame({ width: 100, height: 50 }),
        Rectangle().fill(Color("green")).frame({ width: 200, height: 50 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 150, height: 150 })
        .background(Color("blue").opacity(0.1))
        .frame({ width: 300, height: 300 })
);

/**
 * Alignment affects positioning, not measurement: the VStack is still as wide
 * as its widest child (100), and the narrower 50pt child hugs the trailing edge.
 */
const VStackAlignmentTest = () => (
    VStack({ spacing: 20, alignment: "trailing" }, [
        Rectangle().fill(Color("green")).frame({ width: 50, height: 30 }),
        Rectangle().fill(Color("green")).frame({ width: 100, height: 30 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 150, height: 120 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Negative spacing overlaps children: the two 100x40 rectangles overlap by
 * 10pt and red is 100x70.
 */
const VStackSpacingEdgeCases = () => (
    VStack({ spacing: -10 }, [
        Rectangle().fill(Color("green")).frame({ width: 100, height: 40 }),
        Rectangle().fill(Color("green")).frame({ width: 100, height: 40 })
    ])
        .background(Color("red").opacity(0.5))
);

/**
 * A flexible-height child takes the remaining space of a finite parent: the
 * first rectangle grows to 240 (300 - 50 - 10) so the stack fills the
 * 300-high frame.
 */
const VStackFlexibleChild = () => (
    VStack({ spacing: 10 }, [
        Rectangle().fill(Color("green")).frame({ width: 100, height: Infinity }),
        Rectangle().fill(Color("green")).frame({ width: 200, height: 50 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ height: 300 })
        .background(Color("blue").opacity(0.1))
);

/**
 * aspectRatio does not distort stack measurement: the first child is 100x100
 * (1:1), so the stack is 200 x (100 + 10 + 50).
 */
const VStackAspectRatio = () => (
    VStack({ spacing: 10 }, [
        Rectangle()
            .fill(Color("green"))
            .aspectRatio({ aspectRatio: 1 })
            .frame({ width: 100 }),
        Rectangle().fill(Color("green")).frame({ width: 200, height: 50 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 300 })
        .background(Color("blue").opacity(0.1))
);

/**
 * Nested VStacks size independently: the inner red stack is
 * 120 x (40 + 10 + 60); the outer stack's blue background hugs it, centred in
 * an unpainted 300x300 frame.
 */
const VStackNestedStacks = () => (
    VStack({ spacing: 10 }, [
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("green")).frame({ width: 80, height: 40 }),
            Rectangle().fill(Color("green")).frame({ width: 120, height: 60 })
        ])
            .background(Color("red").opacity(0.5))
    ])
        .background(Color("blue").opacity(0.1))
        .frame({ width: 300, height: 300 })
);

/**
 * Background layering follows modifier order: faint green content and yellow
 * at 100x100, red at 200x200, blue at 400x400, each centred in the next.
 */
const VStackBackgroundOrder = () => (
    VStack({ spacing: 10 }, [
        Rectangle()
            .fill(Color("green").opacity(0.2))
            .frame({ width: 100, height: 100 })
    ])
        .background(Color("yellow").opacity(0.5))
        .frame({ width: 200, height: 200 })
        .background(Color("red").opacity(0.3))
        .frame({ width: 400, height: 400 })
        .background(Color("blue").opacity(0.1))
);

// ─── Previews ────────────────────────────────────────────

const previews = () => [
    Self().previewName("Default"),
    ...VStackTests().map((test) => test.view.previewName(test.name))
];

export default defineComponent({ metadata, body, previews });
