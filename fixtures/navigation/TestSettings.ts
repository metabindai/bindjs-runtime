const metadata = {
    title: "TestSettings",
    description: "A grouped settings screen in a NavigationStack titled \"Settings\": General (an \"About\" link that pushes a list titled \"About\", and \"Software Update\" / \"None\"), Connectivity (Wi-Fi toggle on, Notifications toggle off) and Account (red \"Sign Out\").",
    category: "Navigation",
    public: true
};

const body = () => {
    const [wifiEnabled, setWifiEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const generalSection = (
        Section({ header: Text("General") }, [
            NavigationLink(
                HStack({ alignment: "center" }, [
                    Text("About").font("body")
                ]),
                About
            ),
            HStack({ alignment: "center" }, [
                Text("Software Update"),
                Spacer(),
                Text("None").foregroundStyle(Color("secondary"))
            ])
        ])
    );

    const connectivitySection = (
        Section({ header: Text("Connectivity") }, [
            Toggle({
                label: "Wi-Fi",
                isOn: wifiEnabled,
                setIsOn: setWifiEnabled
            }),
            Toggle({
                label: "Notifications",
                isOn: notificationsEnabled,
                setIsOn: setNotificationsEnabled
            })
        ])
    );

    const accountSection = (
        Section({ header: Text("Account") }, [
            HStack([
                Text("Sign Out").foregroundStyle(Color("red")),
                Spacer()
            ])
                .onTapGesture(() => {
                    // Sign-out is intentionally a no-op in this fixture.
                })
        ])
    );

    return (
        NavigationStack([
            List([
                generalSection,
                connectivitySection,
                accountSection
            ])
                .navigationTitle("Settings")
        ])
    );
};

const About = () => (
    List([
        Text("About")
    ])
        .navigationTitle("About")
);

const previews = [
    Self().previewName("Default Settings Screen")
];

export default defineComponent({ metadata, body, previews });
