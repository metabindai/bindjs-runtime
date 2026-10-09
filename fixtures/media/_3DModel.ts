const metadata = {
    title: "_3DModel",
    description: "Property-driven Model3D: by default loads the Khronos 2CylinderEngine .glb with camera controls on and auto-rotate off, so the engine model should appear and respond to drag/zoom."
};

const properties = {
    url: PropertyString({
        title: "Model URL",
        description: "URL to the 3D model file (.glb or .usdz)",
        defaultValue: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb"
    }),
    description: PropertyString({
        title: "Description",
        description: "Accessibility description for the 3D model",
        defaultValue: "A 3D model"
    }),
    cameraControls: PropertyBoolean({
        title: "Camera Controls",
        description: "Allow user to rotate and zoom the model",
        defaultValue: true
    }),
    autoRotate: PropertyBoolean({
        title: "Auto Rotate",
        description: "Automatically rotate the model",
        defaultValue: false
    })
} satisfies ComponentProperties;

const body = (props: InferProps<typeof properties>) => {
    return (
        Model3D({
            url: props.url,
            description: props.description,
            cameraControls: props.cameraControls,
            autoRotate: props.autoRotate
        })
    );
};

export default defineComponent({ metadata, properties, body });
