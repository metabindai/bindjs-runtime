const metadata = {
    title: "TestVisualEffect2",
    description: "Exercises .visualEffect() with global and scrollView geometry: a 400x400 rounded photo inside a tall scroll view; scrolling moves the photo inside its clip at a slower rate (parallax) and zooms it in once the offset would expose the edges."
};

const IMAGE_URL = "https://cdn.metabind.ai/N9qb1ir3Fst1ree94WHW/FbAs1nDGM5lioi2hjNRR/assets/TUCBWff2SsFBsn14GQwj/Content-Lawn-Inspection-2.jpg";

const body = () => {
    const parallaxImage = (
        VStack([
            ParallaxImageEffect({}, [
                Image({ url: IMAGE_URL })
                    .resizable()
                    .frame({ maxWidth: Infinity, maxHeight: Infinity })
            ])
        ])
            .frame({ width: 400, height: 400, alignment: "center" })
            .clipShape(RoundedRectangle())
    );

    return (
        ScrollView([
            VStack([
                parallaxImage,
                Spacer(),
                Text("Hi")
            ])
                .frame({ maxWidth: Infinity })
                .frame({ height: 1500 })
                .padding("top", 150)
        ])
    );
};

const ParallaxImageEffect = defineComponent({
    body: (props, children) => (
        ZStack(children)
            .visualEffect((effect, geometry) => {
                if (!geometry) {
                    return effect;
                }

                const localFrame = geometry.frame("global");
                const containerY = geometry.frame("scrollView").minY;
                const height = localFrame.height;
                const offset = (containerY - localFrame.minY) * 0.2;

                // Zoom in once the parallax offset would reveal the image's edges.
                let scale = 1.2;
                const heightDiff = ((height * scale) - height) / 2;
                if ((offset * scale) >= heightDiff) {
                    const overshoot = (offset * scale) - heightDiff;
                    scale += (overshoot / height) * 4;
                }

                return effect
                    .scale(scale)
                    .offset({ x: 0, y: -offset });
            })
    )
});

export default defineComponent({ metadata, body });
