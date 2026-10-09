const metadata = {
    title: "TestCornerRadius",
    description: "Three 100x100 blue squares with .cornerRadius() 5, 26 and 50: slightly rounded, clearly rounded, and the last one a full circle."
};

const body = () => {
    return (
        VStack({ spacing: 10 }, [
            Rectangle()
                .fill(Color("blue"))
                .frame({ width: 100, height: 100 })
                .cornerRadius(5),
            Rectangle()
                .fill(Color("blue"))
                .frame({ width: 100, height: 100 })
                .cornerRadius(26),
            Rectangle()
                .fill(Color("blue"))
                .frame({ width: 100, height: 100 })
                .cornerRadius(50)
        ])
    );
};

export default defineComponent({ metadata, body });
