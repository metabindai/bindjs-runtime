const metadata = {
    title: "TestLayoutStacks",
    description: "Flexible children sharing space in nested stacks: two full-width blue/red bands, three 25pt yellow bars at fixed widths 400/420/460, then two rows where unframed green rectangles, a nested VStack and (first row) a fit and a fill engine image split the width evenly and grow to fill the remaining height."
};

const ENGINE_IMAGE = {
    url: "https://cdn-dev.metabind.com/213236ac-f3a9-416a-b371-d13bee51593e/0205c6f5-2d89-4ccf-963a-01c8ee7215b6/assets/3520NpDVpU0AsIJ9Rj1T/ExploreEngine%20(1).jpg"
};

const body = () => {
    const mixedRow = (
        HStack({ spacing: 10 }, [
            Rectangle().fill(Color("#34C759")),
            Rectangle().fill(Color("#34C759")),
            Rectangle().fill(Color("#34C759")),
            Image({ ...ENGINE_IMAGE, contentMode: "fit" }).resizable(),
            Image({ ...ENGINE_IMAGE, contentMode: "fill" }).resizable(),
            Rectangle().fill(Color("#34C759")),
            Rectangle().fill(Color("#1B8A34")),
            VStack({ spacing: 10 }, [
                Rectangle().fill(Color("#34C759")),
                Rectangle().fill(Color("#1B8A34"))
            ])
        ])
    );

    const shapeRow = (
        HStack({ spacing: 10 }, [
            Rectangle().fill(Color("#34C759")),
            Rectangle().fill(Color("#28B746")),
            Rectangle().fill(Color("#1B8A34")),
            VStack({ spacing: 10 }, [
                Rectangle().fill(Color("#34C759")),
                Rectangle().fill(Color("#28B746")),
                Rectangle().fill(Color("#1B8A34"))
            ])
        ])
    );

    return (
        VStack({ spacing: 10 }, [
            Rectangle().fill(Color("#007AFF")),
            Rectangle().fill(Color("#FF3B30")),
            Rectangle()
                .fill(Color("#FFCC00"))
                .frame({ width: 400, height: 25, alignment: "leading" }),
            Rectangle()
                .fill(Color("#FFCC44"))
                .frame({ width: 420, height: 25 }),
            Rectangle()
                .fill(Color("#FFCC88"))
                .frame({ width: 460, height: 25, alignment: "trailing" }),
            mixedRow,
            shapeRow
        ])
    );
};

export default defineComponent({ metadata, body });
