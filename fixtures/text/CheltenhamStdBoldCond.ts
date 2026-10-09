const metadata = {
    title: "CheltenhamStdBoldCond",
    description: "A font-only component: its body returns a CustomFont (CheltenhamStd-BoldCond OTF, 24pt) so other fixtures can pass `CheltenhamStdBoldCond()` to `.font()`. Rendered on its own it shows nothing; see TestFont for the font applied to text."
};

const body = () => (
    CustomFont({
        family: "CheltenhamStd-BoldCond",
        size: 24,
        url: "https://firebasestorage.googleapis.com/v0/b/content-builder-aa1f5.appspot.com/o/Statue%20of%20Liberty%2FCheltenhamStd-BoldCond.otf?alt=media&token=3e183679-e2f2-42ba-b8be-b768c58b047f"
    })
);

export default defineComponent({ metadata, body });
