const metadata = {
    title: "TestQuickLook",
    description: "quickLookPreview modifier bound to state: tapping \"TestQuickLook\" sets the URL to the Apple style guide PDF, which should open a Quick Look preview (native only) and show \"URL <pdf url>\"; before tapping it reads \"No URL set.\"."
};

const URLS = [
    "https://cdn.metabind.ai/99f55fa7-ce68-4870-a983-08aa61d451a5/1RvBm8v1vA6SOlHzXhTr/assets/JaIU9q4g9Hf560xn5FYO/distortus_rex2.usdz",
    "https://help.apple.com/pdf/applestyleguide/en_US/apple-style-guide.pdf",
    "https://cdn-dev.metabind.ai/213236ac-f3a9-416a-b371-d13bee51593e/bSxSS25yiIRLSytQin9f/assets/FKdY2x1NepKQ1sR4iIZK/sample-1.m4a"
];

const body = () => {
    const [quickLookURL, setQuickLookURL] = useState<string | undefined>(undefined);
    const [loading, setIsLoading] = useState(false);

    const trigger = (
        Text(loading ? "Loading" : "TestQuickLook")
            .onTapGesture(() => {
                setQuickLookURL(URLS[1]);
            })
    );

    const status = quickLookURL ? Text("URL " + quickLookURL) : Text("No URL set.");

    return (
        VStack([
            trigger,
            status
        ])
            .quickLookPreview({
                url: quickLookURL,
                setURL: setQuickLookURL,
                onLoadingChanged: setIsLoading,
                urls: URLS
            })
    );
};

export default defineComponent({ metadata, body });
