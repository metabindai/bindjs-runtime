const metadata = {
    title: "TestGeometryReader",
    description: "GeometryReader filling the preview: shows a bold title, the proxy's width and height, and its local frame as JSON; tapping the title toggles the second boolean in the title text and the reported size must stay the same."
};

const body = () => {
    const [state, setState] = useState(false);
    const [state1, setState1] = useState(false);

    return (
        GeometryReader((proxy) => (
            VStack([
                Text("My Geometry Reader " + state + " " + state1)
                    .bold()
                    .onTapGesture(() => {
                        setState1(!state1);
                    }),
                Text(`Width ${proxy.size.width}`),
                Text(`Height ${proxy.size.height}`),
                Text(`Frame ${JSON.stringify(proxy.frame("local"))}`)
            ])
                .frame({ maxWidth: Infinity, maxHeight: Infinity })
        ))
    );
};

export default defineComponent({ metadata, body });
