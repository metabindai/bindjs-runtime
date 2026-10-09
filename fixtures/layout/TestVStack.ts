const metadata = {
    title: "TestVStack",
    description: "A fixed 404x800 VStack with 48pt corner radius: a translucent green rounded panel with the text \"TestVStack\" (on a translucent red background) centred inside it."
};

const CONTENT_WIDTH = 404;
const CONTENT_HEIGHT = 800;

const body = () => (
    VStack([
        Text("TestVStack").background(Color("red").opacity(0.5))
    ])
        .frame({ width: CONTENT_WIDTH, height: CONTENT_HEIGHT })
        .background(Color("green").opacity(0.5))
        .cornerRadius(48)
);

export default defineComponent({ metadata, body });
