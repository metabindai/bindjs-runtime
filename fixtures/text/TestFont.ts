const metadata = {
    title: "TestFont",
    description: "Three groups of leading-aligned lines, each pair regular then semibold: Roboto Slab (Google woff2, 24pt), CheltenhamStd-BoldCond (OTF, 24pt) defined locally, and the same OTF font supplied by the CheltenhamStdBoldCond fixture component. All lines should render in the custom typeface, not the system font."
};

const CustomGoogleFont = CustomFont({
    url: "https://fonts.gstatic.com/s/robotoslab/v36/BngMUXZYTXPIvIBgJJSb6ufN5qWr4xCC.woff2",
    family: "Roboto Slab",
    relativeToTextStyle: "largeTitle",
    size: 24
});

const CustomOTFFont = CustomFont({
    family: "CheltenhamStd-BoldCond",
    size: 24,
    url: "https://firebasestorage.googleapis.com/v0/b/content-builder-aa1f5.appspot.com/o/Statue%20of%20Liberty%2FCheltenhamStd-BoldCond.otf?alt=media&token=3e183679-e2f2-42ba-b8be-b768c58b047f"
});

const body = () => (
    VStack({ spacing: 32 }, [
        VStack({ spacing: 8 }, [
            Text("Custom Google Font")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CustomGoogleFont),
            Text("Custom Google Font Semibold")
                .fontWeight("semibold")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CustomGoogleFont)
        ]),
        VStack({ spacing: 8 }, [
            Text("Custom OTF Font")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CustomOTFFont),
            Text("Custom OTF Font Semibold")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CustomOTFFont)
                .fontWeight("semibold")
        ]),
        VStack({ spacing: 8 }, [
            Text("Custom OTF Font (External Component)")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CheltenhamStdBoldCond()),
            Text("Custom OTF Font Semibold (External Component)")
                .frame({ maxWidth: Infinity, alignment: "leading" })
                .font(CheltenhamStdBoldCond())
                .fontWeight("semibold")
        ])
    ])
);

export default defineComponent({ metadata, body });
