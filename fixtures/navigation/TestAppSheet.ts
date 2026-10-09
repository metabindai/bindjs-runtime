const metadata = {
    title: "TestAppSheet",
    description: "A hand-built bottom sheet using overlay + offset + glassEffect: tapping \"Show\" springs a 300pt rounded glass panel titled \"My Sheet\" up from below the bottom edge and the label changes to \"Hide\"; tapping again springs it back off-screen."
};

const body = () => {
    const [showSheet, setShowSheet] = useState(false);

    const toggle = (
        Text(showSheet ? "Hide" : "Show")
            .onTapGesture(() => {
                withAnimation(Spring(), () => {
                    setShowSheet(!showSheet);
                });
            })
    );

    return (
        VStack([toggle])
            .frame({ maxWidth: Infinity, maxHeight: Infinity })
            .overlay({ alignment: "bottom" }, MySheet({ show: showSheet }))
    );
};

const MySheet = (props: { show: boolean }) => (
    Sheet({ show: props.show }, [
        VStack([
            Text("My Sheet").font("headline").bold()
        ])
            .padding(30)
    ])
);

const Sheet = (props: { show: boolean }, children: Component[]) => (
    ZStack({ alignment: "topLeading" }, [
        RoundedRectangle({ cornerRadius: 30 })
            .glassEffect("normal")
            .frame({ maxWidth: Infinity, maxHeight: Infinity }),
        Group(children)
    ])
        .padding(20)
        .frame({ height: 300 })
        .frame({ maxWidth: Infinity })
        .offset({ y: props.show ? -20 : 400 })
);

export default defineComponent({ metadata, body });
