const metadata = {
    title: "TestNavigationDestination",
    description: "navigationDestination driven by isPresented state: tapping the \"Show\" button pushes a destination that is a solid green rectangle filling the screen (ignoring safe areas)."
};

const body = () => {
    const [isPresented, setIsPresented] = useState(false);

    return (
        VStack([
            Button("Show", () => {
                setIsPresented(true);
            })
        ])
            .navigationDestination({
                isPresented,
                setIsPresented,
                destination: () => Rectangle().fill(Color("green")).ignoresSafeArea()
            })
    );
};

export default defineComponent({ metadata, body });
