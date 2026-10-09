const metadata = {
    title: "TestShadow",
    description: "Exercises .shadow(): a labeled rectangle with a soft blue drop shadow, a row of three blue circles with the default shadow, and blue title text with a black shadow offset downward."
};

const body = () => {
    const dot = () => Circle().fill(Color("blue")).frame({ width: 30, height: 30 });

    const shadowedRectangle = (
        LabeledRectangle({ text: "Shadow" })
            .shadow({ radius: 10, y: 5, color: Color("#0041E7").opacity(0.65) })
    );

    const shadowedRow = (
        HStack({ spacing: 10 }, [
            Spacer(),
            dot(),
            Spacer(),
            dot(),
            Spacer(),
            dot(),
            Spacer()
        ])
            .shadow()
    );

    const shadowedText = (
        Text("Shadow")
            .foregroundStyle(Color("blue"))
            .font("title3")
            .shadow({ color: Color("black").opacity(0.5), y: 4, radius: 5 })
    );

    return (
        VStack({ spacing: 20 }, [
            shadowedRectangle,
            shadowedRow,
            shadowedText
        ])
    );
};

export default defineComponent({ metadata, body });
