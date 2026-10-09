const metadata = {
    title: "TestLayoutImage",
    description: "Catalog of Image layout cases, one per preview (intrinsic size, resizable, fill/fit in fixed frames, images in H/VStacks, modifier order, circular clip). The main view shows case 8 (VStack fit): four product images scaledToFit stacked with no spacing in a 200×550 column. Each preview's expected result is documented above its function in the source."
};

const TEST_IMAGE = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/8a8ba7ac-2570-4b97-a5be-000455bc8399/Research.jpg",
    dimensions: { width: 613, height: 287 }
};

const STACK_IMAGE_URLS = [
    "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/2f2a2d30-f894-43f9-a2b5-17569b90fbf8/assets/00b83b5d-73d5-479c-b276-9590f751f82a/1.2-C.png",
    "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/2f2a2d30-f894-43f9-a2b5-17569b90fbf8/assets/42b52fa7-e943-4ec4-bafb-14c27db28464/1.5-C-3.png",
    "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/2f2a2d30-f894-43f9-a2b5-17569b90fbf8/assets/42b52fa7-e943-4ec4-bafb-14c27db28464/1.5-C-3.png",
    "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/2f2a2d30-f894-43f9-a2b5-17569b90fbf8/assets/055ac835-c09d-4ceb-8f9e-e04ed5632a20/1.6-C.png"
];

const TRIANGLE_URL = "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/3a73ea8a-98f9-41df-9ad6-f413d1c5ea9e/assets/53e9b73d-89ae-443c-a91b-1b6c461c3f45/triangle%402x.png";

// Index of the case the main body renders; every case also has its own preview.
const BODY_TEST_INDEX = 8;

// ─── Body ────────────────────────────────────────────────

const body = () => {
    const tests = imageTests();
    const test = tests[BODY_TEST_INDEX < tests.length ? BODY_TEST_INDEX : 0];
    return Group(test.view);
};

// ─── Test cases ──────────────────────────────────────────

const imageTests = () => [
    { name: "0 Intrinsic size", view: ImageIntrinsicSizeTest() },
    { name: "1 Resizable scale", view: ImageResizableScaleTest() },
    { name: "2 Fill extends width", view: ImageResizableFillWidthTest() },
    { name: "3 Fill extends height", view: ImageResizableFillHeightTest() },
    { name: "4 Resizable fit", view: ImageResizableFitTest() },
    { name: "5 Image as background", view: ImageResizableBackgroundFillTest() },
    { name: "6 HStack fit", view: ImageHStackFitTest() },
    { name: "7 HStack fill", view: ImageHStackFillTest() },
    { name: "8 VStack fit", view: ImageVStackFitTest() },
    { name: "9 VStack fit (contentMode)", view: ImageVStackFitTest2() },
    { name: "10 VStack fit (triangles)", view: ImageVStackFitTest3() },
    { name: "11 VStack fill", view: ImageVStackFillTest() },
    { name: "12 Frame order", view: ImageFrameOrderTest() },
    { name: "13 Inside stack", view: ImageInsideStackTest() },
    { name: "14 Aspect ratio edge case", view: ImageAspectRatioEdgeCaseTest() },
    { name: "15 Fill and clip", view: ImageFillAndClipTest() }
];

/**
 * ImageIntrinsicSizeTest
 *
 * Goal: an unmodified Image uses its intrinsic (native) pixel size when no
 * .resizable() or .frame() is applied.
 *
 * 1. Image(TEST_IMAGE)                  intrinsic size (613×287)
 * 2. .padding(4)                        4pt around the image so the red shows
 * 3. .background(red)                   red = intrinsic bounds + padding
 * 4. .frame({ width: 400, height: 400 }) outer layout space; image stays intrinsic, centered
 * 5. .background(blue)                  blue fills the 400×400 frame
 *
 * Expected: blue 400×400 square; red-backed image at its intrinsic size
 * centered inside it (wider than the frame, since 613 > 400).
 */
const ImageIntrinsicSizeTest = () => {
    return (
        Image(TEST_IMAGE)
            .opacity(1.0)
            .padding(4)
            .background(Color("red").opacity(0.5))
            .frame({ width: 400, height: 400 })
            .background(Color("blue").opacity(0.1))
    );
};

// Expected: the resizable image stretches (ignoring aspect) to fill 400×400.
const ImageResizableScaleTest = () => {
    return (
        VStack([
            Image(TEST_IMAGE).resizable()
        ])
            .frame({ width: 400, height: 400 })
    );
};

// Expected: four images side by side, each fit to its share of a 150pt-tall row.
const ImageHStackFitTest = () => {
    const items = STACK_IMAGE_URLS.map(url => Image({ url, contentMode: "fit" }).resizable());
    return HStack(items).frame({ height: 150 });
};

// Expected: four images side by side, each filling its share of a 100pt-tall row.
const ImageHStackFillTest = () => {
    const items = STACK_IMAGE_URLS.map(url => Image({ url, contentMode: "fill" }).resizable());
    return (
        HStack(items)
            .frame({ height: 100 })
            .frame({ maxHeight: 200 })
    );
};

// Expected: four images scaledToFill stacked in a narrow 100×600 column.
const ImageVStackFillTest = () => {
    const items = STACK_IMAGE_URLS.map(url => Image({ url }).resizable().scaledToFill());
    return VStack(items).frame({ width: 100, height: 600 });
};

// Expected: four images scaledToFit stacked with no spacing in a 200×550 column.
const ImageVStackFitTest = () => {
    const items = STACK_IMAGE_URLS.map(url => Image({ url }).resizable().scaledToFit());
    return VStack({ spacing: 0 }, items).frame({ height: 550, width: 200 });
};

// Same as ImageVStackFitTest but via contentMode "fit", in a red 50×700 column.
const ImageVStackFitTest2 = () => {
    const items = STACK_IMAGE_URLS.map(url => Image({ url, contentMode: "fit" }).resizable());
    return (
        VStack({ spacing: 0 }, items)
            .frame({ height: 700, width: 50 })
            .background(Color("red"))
    );
};

// Expected: three triangles fit to equal thirds of a 400×400 light-red square.
const ImageVStackFitTest3 = () => {
    return (
        VStack([
            Image({ contentMode: "fit", url: TRIANGLE_URL }).resizable(),
            Image({ contentMode: "fit", url: TRIANGLE_URL }).resizable(),
            Image({ contentMode: "fit", url: TRIANGLE_URL }).resizable()
        ])
            .frame({ height: 400, width: 400 })
            .background(Color("red").opacity(0.2))
    );
};

/**
 * ImageResizableFill{Width,Height}Test
 *
 * Goal: contentMode "fill" + .resizable() fills its frame entirely, keeping
 * aspect ratio and overflowing (not letterboxing) when aspect ratios differ.
 *
 * Expected (width): 200×200 red square; image fills it, overflowing left/right.
 */
const ImageResizableFillWidthTest = () => {
    return (
        Image({ ...TEST_IMAGE, contentMode: "fill" })
            .resizable()
            .opacity(0.5)
            .frame({ width: 200, height: 200 })
            .background(Color("red").opacity(0.5))
    );
};

// Expected: 400×100 red strip; image fills it, overflowing top/bottom.
const ImageResizableFillHeightTest = () => {
    return (
        Image({ ...TEST_IMAGE, contentMode: "fill" })
            .resizable()
            .opacity(0.5)
            .frame({ width: 400, height: 100 })
            .background(Color("red").opacity(0.5))
    );
};

// Expected: a 250×200 light-red rectangle with the stretched image behind it.
const ImageResizableBackgroundFillTest = () => {
    return (
        Rectangle()
            .fill(Color("red").opacity(0.2))
            .background(Image(TEST_IMAGE).resizable().opacity(0.5))
            .frame({ width: 250, height: 200 })
    );
};

/**
 * ImageResizableFitTest
 *
 * Goal: contentMode "fit" + .resizable() keeps aspect ratio and fits within the frame.
 *
 * 1. Image(TEST_IMAGE)                   intrinsic ratio ~2.1:1
 * 2. .resizable() (fit)                  scales proportionally, no cropping
 * 3. .frame({ width: 300, height: 200 }) bounding box; image letterboxes
 * 4. .background(red)                    red = 300×200 frame
 *
 * Expected: image fully visible, with red bands above and below.
 */
const ImageResizableFitTest = () => {
    return (
        Image({ ...TEST_IMAGE, contentMode: "fit" })
            .resizable()
            .frame({ width: 300, height: 200 })
            .background(Color("red").opacity(0.5))
    );
};

/**
 * ImageFrameOrderTest
 *
 * Goal: modifier order matters (background before frame vs after).
 *
 * 1. Image(TEST_IMAGE)                   intrinsic size
 * 2. .background(red)                    red fills the intrinsic bounds
 * 3. .frame({ width: 400, height: 400 }) expands layout to 400×400
 * 4. .background(blue)                   blue fills the outer frame
 *
 * Expected: red = intrinsic image area, centered within a blue 400×400 frame.
 */
const ImageFrameOrderTest = () => {
    return (
        Image(TEST_IMAGE)
            .background(Color("red").opacity(0.5))
            .frame({ width: 400, height: 400 })
            .background(Color("blue").opacity(0.1))
    );
};

/**
 * ImageInsideStackTest
 *
 * Goal: images participate in parent VStack layout correctly.
 *
 * 1. VStack (spacing 10)                 measures children
 * 2. fit image framed 250×100
 * 3. fit image framed 250×150
 * 4. VStack.background(red)              red = combined content height + spacing
 * 5. .frame({ width: 400 }) + blue       outer area
 *
 * Expected: two images stacked vertically; red box wraps both, inside a 400pt-wide blue band.
 */
const ImageInsideStackTest = () => {
    return (
        VStack({ spacing: 10 }, [
            Image({ ...TEST_IMAGE, contentMode: "fit" }).resizable().frame({ height: 100, width: 250 }),
            Image({ ...TEST_IMAGE, contentMode: "fit" }).resizable().frame({ height: 150, width: 250 })
        ])
            .background(Color("red").opacity(0.5))
            .frame({ width: 400 })
            .background(Color("blue").opacity(0.1))
    );
};

/**
 * ImageAspectRatioEdgeCaseTest
 *
 * Goal: fit logic handles a non-square image in a square frame.
 *
 * Expected: image centered inside a red 300×300 square, aspect preserved,
 * letterboxed above and below.
 */
const ImageAspectRatioEdgeCaseTest = () => {
    return (
        Image({ ...TEST_IMAGE, contentMode: "fit" })
            .resizable()
            .frame({ width: 300, height: 300 })
            .background(Color("red").opacity(0.5))
    );
};

/**
 * ImageFillAndClipTest
 *
 * Goal: contentMode "fill" combined with .clipShape() for clipping.
 *
 * 1. fill + .resizable()                 scales beyond frame bounds
 * 2. .frame({ width: 200, height: 200 }) clipping region
 * 3. .clipShape(Circle())                circular mask
 * 4. .overlay(Circle().stroke(...))      white 5pt ring
 *
 * Expected: cropped circular image exactly filling 200×200 with a white ring,
 * red visible only in the corners.
 */
const ImageFillAndClipTest = () => {
    return (
        Image({ ...TEST_IMAGE, contentMode: "fill" })
            .resizable()
            .frame({ width: 200, height: 200 })
            .clipShape(Circle())
            .overlay(Circle().stroke({ style: Color("white"), lineWidth: 5 }))
            .background(Color("red").opacity(0.5))
    );
};

// ─── Previews ────────────────────────────────────────────

const previews = [
    Self().previewName("Default (case 8)"),
    ...imageTests().map(test => test.view.previewName(test.name))
];

export default defineComponent({ metadata, body, previews });
