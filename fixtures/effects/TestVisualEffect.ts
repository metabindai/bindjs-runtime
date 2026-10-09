const metadata = {
    title: "TestVisualEffect",
    description: "Exercises .visualEffect() with scrollView geometry: a large banner background with product cards layered on top; when scrolled, cards with a parallax factor drift vertically at different speeds relative to the background."
};

const ASSET_BASE = "https://cdn-dev.metabind.ai/213236ac-f3a9-416a-b371-d13bee51593e/bSxSS25yiIRLSytQin9f/components/iyHmqobAMqxj0YBhqFhd/latest/assets";

const BACKGROUND_URL = `${ASSET_BASE}/zaLcsCRkFf02rHAWvIyc/banner-image-bg.png`;

const BACKGROUND_DIMENSIONS = { width: 2298, height: 1972 };

// Card artwork is @2x, so dimensions are halved. Cards without `parallax` stay fixed.
const IMAGES = [
    {
        url: `${ASSET_BASE}/2cD31tyYULffMw4aU72b/image-center.png`,
        offset: { x: 936, y: 505 },
        dimensions: { width: 430, height: 879 },
        parallax: { y: 0.35 }
    },
    {
        url: `${ASSET_BASE}/ypzcvByhy0vkBFmGuv9b/card-published.png`,
        offset: { x: 535, y: 430 },
        dimensions: { width: 820 / 2, height: 590 / 2 },
        parallax: { y: 0.1 }
    },
    {
        url: `${ASSET_BASE}/bg59Ob0T4HhyPISH8ss4/card-preview.png`,
        offset: { x: 1390, y: 528 },
        dimensions: { width: 818 / 2, height: 358 / 2 },
        parallax: { y: 0.2 }
    },
    {
        url: `${ASSET_BASE}/0ECwjByxtJXb1TXwK07Y/card-buy.png`,
        offset: { x: 517 - 40, y: 781 - 40 },
        dimensions: { width: 828 / 2, height: 1094 / 2 }
    },
    {
        url: `${ASSET_BASE}/iGwf2wZF7qo4wTN1fiVI/card-feature.png`,
        offset: { x: 1485, y: 663 + 40 },
        dimensions: { width: 750 / 2, height: 820 / 2 },
        parallax: { y: 0.1 }
    },
    {
        url: `${ASSET_BASE}/Op2TVJFa0NfwV1QaN4GD/card-brand-color.png`,
        offset: { x: 657, y: 1294 },
        dimensions: { width: 592 / 2, height: 536 / 2 },
        parallax: { y: 0.1 }
    },
    {
        url: `${ASSET_BASE}/dHXtRz9AHaTm36ugxu8d/card-details.png`,
        offset: { x: 1409, y: 1373 },
        dimensions: { width: 812 / 2, height: 990 / 2 },
        parallax: { y: 0.5 }
    }
];

type CardImage = (typeof IMAGES)[number];

const body = () => {
    const cards = IMAGES.map(ParallaxCard);

    return GeometryReader((geo) => (
        ZStack({ alignment: "topLeading" }, [
            Image({ url: BACKGROUND_URL }).resizable(),
            ...cards
        ])
            // Constrain to the background's size, then center it horizontally.
            .frame({ width: BACKGROUND_DIMENSIONS.width, height: BACKGROUND_DIMENSIONS.height })
            .offset({ x: (geo.size.width - BACKGROUND_DIMENSIONS.width) / 2 })
    ));
};

const ParallaxCard = (image: CardImage) => {
    const card = (
        Image({ url: image.url })
            .resizable()
            .frame({ width: image.dimensions.width, height: image.dimensions.height })
            .offset({ x: image.offset.x, y: image.offset.y })
    );

    const factor = image.parallax?.y;
    if (!factor) {
        return card;
    }

    return card.visualEffect((builder, geo) => (
        builder.offset({ x: 0, y: factor * geo.frame("scrollView").minY })
    ));
};

const previews = [
    ScrollView([
        Self()
    ])
        .previewName("Scrolling")
];

export default defineComponent({ metadata, body, previews });
