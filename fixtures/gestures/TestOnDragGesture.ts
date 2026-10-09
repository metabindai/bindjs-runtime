const metadata = {
    title: "TestOnDragGesture",
    description: "A column of five emoji (two rainbows, a leaf, a sun, a football), each independently draggable with onDragGesture({ minimumDistance: 0 }): dragging moves the emoji with the pointer and it stays where dropped; tapping one rotates it 90 degrees with a bouncy spring."
};

const body = () => {
    const images = [
        Text("⚽️").frame({ width: 122, height: 50 }),
        Text("🍁").frame({ width: 122, height: 50 }),
        Text("☀️").frame({ width: 122, height: 50 }),
        Text("🌈").frame({ width: 122, height: 50 }).font(60)
    ];

    return (
        VStack({ spacing: 32 }, [
            DraggableContent({ rotation: 0 }, [images[3]]),
            DraggableContent({ rotation: 0 }, [images[3]]),
            DraggableContent({ rotation: 0 }, [images[1]]),
            DraggableContent({ rotation: 0 }, [images[2]]),
            DraggableContent({ rotation: 0 }, [images[0]])
        ])
            .foregroundStyle(Color("primary"))
            .font(80)
    );
};

const DraggableContent = defineComponent({
    properties: {
        rotation: { type: "number" }
    },
    body: (props, children) => {
        const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
        const [offset, setOffset] = useState({ x: 0, y: 0 });
        const [rotation, setRotation] = useState(props.rotation ?? 0);

        return (
            ZStack(Group(children))
                .rotationEffect(rotation)
                .onDragGesture({ minimumDistance: 0 }, (state) => {
                    switch (state.phase) {
                        case "began": {
                            setStartOffset(offset);
                            setOffset({
                                x: offset.x + state.translation.x,
                                y: offset.y + state.translation.y
                            });
                            break;
                        }
                        case "changed": {
                            setOffset({
                                x: startOffset.x + state.translation.x,
                                y: startOffset.y + state.translation.y
                            });
                            break;
                        }
                    }
                })
                .onTapGesture(() => {
                    withAnimation(Spring({ dampingFraction: 0.25 }), () => {
                        setRotation(rotation + 90);
                    });
                })
                .offset({ x: offset.x, y: offset.y })
        );
    }
});

export default defineComponent({ metadata, body });
