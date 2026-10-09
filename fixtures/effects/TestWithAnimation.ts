const metadata = {
    title: "TestWithAnimation",
    description: "Exercises withAnimation() with Spring and EaseInOut curves: tapping each shape animates it - circle springs right and rotates, square bounces to a larger red rotated square, third circle fades/slides back and forth forever, the concentric circles spring outward, and the small bar spins and grows."
};

const body = () => {
    const [animate, setAnimate] = useState(false);
    const [animate2, setAnimate2] = useState(false);
    const [animate3, setAnimate3] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const springCircle = (
        Circle()
            .frame({ width: 100, height: 100 })
            .rotationEffect(animate ? 180 : 0)
            .offset({ x: animate ? 100 : 0 })
            .onTapGesture(() => {
                withAnimation(Spring({ response: 0.5, dampingFraction: 0.25 }), () => {
                    setAnimate(!animate);
                });
            })
    );

    const springSquare = (
        RoundedRectangle()
            .fill(animate2 ? Color("red") : Color("green"))
            .frame({ width: 100, height: 100 })
            .rotationEffect(animate2 ? 180 : 0)
            .scaleEffect(animate2 ? 1.5 : 1.0)
            .onTapGesture(() => {
                withAnimation(Spring({ response: 1, dampingFraction: 0.25 }), () => {
                    setAnimate2(!animate2);
                });
            })
    );

    const repeatingCircle = (
        Circle()
            .frame({ width: 100, height: 100 })
            .rotationEffect(animate3 ? 180 : 0)
            .opacity(animate3 ? 0.0 : 1.0)
            .offset({ x: animate3 ? 100 : 0 })
            .onTapGesture(() => {
                if (animate3) {
                    return;
                }
                withAnimation(EaseInOut({ duration: 1.0 }).repeatForever({ autoreverses: true }), () => {
                    setAnimate3(true);
                });
            })
    );

    const spinningBar = (
        RoundedRectangle()
            .frame({ width: 50, height: 20 })
            .scaleEffect(isHovering ? 1.5 : 1.0)
            .rotationEffect(isHovering ? 180 : 0)
            .onTapGesture(() => {
                withAnimation(Spring(), () => {
                    setIsHovering(!isHovering);
                });
            })
    );

    return (
        VStack({ spacing: 20 }, [
            springCircle,
            springSquare,
            repeatingCircle,
            ConcentricCircles(),
            spinningBar
        ])
    );
};

const ConcentricCircles = defineComponent({
    body: () => {
        const [animate, setAnimate] = useState(false);
        const outerSize = animate ? 350 : 250;

        return (
            ZStack({ alignment: "center" }, [
                Circle().fill(Color("green")).frame({ width: outerSize, height: outerSize }),
                Circle()
                    .fill(Color("purple"))
                    .frame({ width: 200, height: 200 })
                    .scaleEffect(animate ? 1.4 : 1.0),
                Circle()
                    .fill(Color("blue"))
                    .frame({ width: 100, height: 100 })
                    .scaleEffect(animate ? 2.5 : 1.0)
            ])
                .frame({ width: 300, height: 300 })
                .onTapGesture(() => {
                    withAnimation(Spring({ dampingFraction: 0.15 }), () => {
                        setAnimate(!animate);
                    });
                })
        );
    }
});

export default defineComponent({ metadata, body });
