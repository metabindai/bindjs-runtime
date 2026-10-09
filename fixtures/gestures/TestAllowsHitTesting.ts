const metadata = {
    title: "TestAllowsHitTesting",
    description: "Three 150x80 tap targets: (1) blue \"Enabled\" with allowsHitTesting(true) toggles green on tap; (2) faded blue \"Disabled\" with allowsHitTesting(false) never reacts (turning red would be a failure); (3) an \"Enabled\" target under a half-transparent black rectangle with allowsHitTesting(false) still toggles green, because taps pass through the overlay."
};

const body = () => {
    const [tapped, setTapped] = useState(false);
    const [tapped2, setTapped2] = useState(false);
    const [tapped3, setTapped3] = useState(false);

    const enabledTarget = (
        TestTarget({ canHit: true, tapped })
            .onTapGesture(() => {
                setTapped(!tapped);
            })
            .allowsHitTesting(true)
    );

    const disabledTarget = (
        TestTarget({ canHit: false, tapped: tapped2 })
            .onTapGesture(() => {
                setTapped2(!tapped2);
            })
            .allowsHitTesting(false)
    );

    // Taps must pass through the overlay rectangle to reach the target beneath it.
    const passThroughTarget = (
        ZStack([
            TestTarget({ canHit: true, tapped: tapped3 })
                .onTapGesture(() => {
                    setTapped3(!tapped3);
                }),
            Rectangle()
                .frame({ width: 150, height: 80 })
                .opacity(0.5)
                .allowsHitTesting(false)
        ])
    );

    return (
        VStack({ spacing: 10 }, [
            enabledTarget,
            disabledTarget,
            passThroughTarget
        ])
    );
};

const TestTarget = ({ canHit, tapped }: { canHit: boolean, tapped: boolean }) => {
    let color = Color("blue");
    if (tapped) {
        color = canHit ? Color("green") : Color("red");
    }

    return (
        ZStack([
            RoundedRectangle().fill(canHit ? color : color.opacity(0.5)),
            Text(canHit ? "Enabled" : "Disabled")
        ])
            .frame({ width: 150, height: 80 })
            .foregroundStyle(Color("white"))
            .bold()
    );
};

export default defineComponent({ metadata, body });
