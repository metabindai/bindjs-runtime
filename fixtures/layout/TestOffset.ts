const metadata = {
    title: "TestOffset",
    description: "Three 50pt circles in a ZStack shifted with .offset(): red 30pt up, green 30pt down-right and blue 30pt down-left, forming a triangle around the centre."
};

const OFFSET = 30;

const body = () => (
    ZStack([
        Circle()
            .fill(Color("red"))
            .frame({ width: 50, height: 50 })
            .offset({ y: -OFFSET }),
        Circle()
            .fill(Color("green"))
            .frame({ width: 50, height: 50 })
            .offset({ x: OFFSET, y: OFFSET }),
        Circle()
            .fill(Color("blue"))
            .frame({ width: 50, height: 50 })
            .offset({ x: -OFFSET, y: OFFSET })
    ])
);

export default defineComponent({ metadata, body });
