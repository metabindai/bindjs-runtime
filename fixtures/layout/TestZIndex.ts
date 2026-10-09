const metadata = {
    title: "TestZIndex",
    description: "zIndex overriding ZStack order: a full blue rectangle (z 1) behind a 300pt white circle (z 2), with the black \"Front\" text (z 3) drawn on top in the centre even though it is declared first."
};

const body = () => (
    ZStack([
        Text("Front").foregroundStyle(Color("black")).zIndex(3),
        Rectangle().fill(Color("blue")).zIndex(1),
        Circle()
            .fill(Color("white"))
            .frame({ width: 300, height: 300 })
            .zIndex(2)
    ])
);

export default defineComponent({ metadata, body });
