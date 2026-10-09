const metadata = {
    title: "TestSheet",
    description: "The .sheet() modifier with a fractional detent: tapping \"TestSheet false\" presents a sheet at 60% height containing a padded purple rounded rectangle, the label reads \"TestSheet true\", and dismissing it logs \"did dismiss...\" and resets the label."
};

const body = () => {
    const [isPresented, setPresented] = useState(false);

    return (
        VStack([
            Text("TestSheet " + isPresented)
                .onTapGesture(() => {
                    setPresented(true);
                })
        ])
            .sheet({
                isPresented,
                setIsPresented: setPresented,
                onDismiss: () => {
                    console.log("did dismiss...");
                },
                content: () => (
                    RoundedRectangle()
                        .fill(Color("purple"))
                        .padding(20)
                        .presentationDetents([Detent.fraction(0.6)])
                )
            })
    );
};

export default defineComponent({ metadata, body });
