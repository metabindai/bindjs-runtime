const metadata = {
    title: "TestModel3D",
    description: "Model3D with a fixed .glb URL (a dinosaur model on the Metabind dev CDN), camera controls and auto-rotate on; the model should load and slowly spin."
};

const body = () => {
    return (
        Model3D({
            url: "https://cdn-dev.metabind.ai/213236ac-f3a9-416a-b371-d13bee51593e/bSxSS25yiIRLSytQin9f/components/cV4i4p5ksldMc8oI9xdN/latest/assets/lhK7Bbz4D8Z6MWb1njih/distortus_rex2-25P.glb",
            cameraControls: true,
            autoRotate: true
        })
    );
};

export default defineComponent({ metadata, body });
