const metadata = {
    title: "TestLayoutZStack",
    description: "ZStack sizing: three overlapping green rectangles (100x100, 150x75, 80x200) centred on a translucent red box of 150x200 (the max child width and height), itself centred in a faint blue 400x400 frame."
};

const body = () => (
    ZStack([
        Rectangle().fill(Color("green")).frame({ width: 100, height: 100 }),
        Rectangle().fill(Color("green")).frame({ width: 150, height: 75 }),
        Rectangle().fill(Color("green")).frame({ width: 80, height: 200 })
    ])
        .background(Color("red").opacity(0.5))
        .frame({ width: 400, height: 400 })
        .background(Color("blue").opacity(0.1))
);

export default defineComponent({ metadata, body });
