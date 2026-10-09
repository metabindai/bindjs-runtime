const metadata = {
    title: "TestProperties",
    description: "Exercises the property inspector: string, boolean, a string field that is only visible while the Boolean is on, an asset picker, and a group with a nested string. The preview just shows \"TestProperties\" and \"Body\" (from a local sub-component that receives the asset prop); the real check is in the Composer inspector."
};

const properties = {
    title: {
        type: "string",
        title: "String"
    },
    booleanProperty: {
        type: "boolean",
        title: "Boolean"
    },
    visibleProperty: {
        type: "string",
        title: "Visibility Test",
        inspector: {
            visible: (props) => props.booleanProperty == true
        }
    },
    asset: {
        type: "asset",
        title: "Asset Property"
    },
    group: {
        type: "group",
        title: "Group Property",
        properties: {
            title: {
                title: "Group String",
                type: "string"
            }
        }
    }
} satisfies ComponentProperties;

const body = (props: InferProps<typeof properties>) => (
    VStack([
        Text("TestProperties"),
        OtherComponent({
            title: "Test",
            asset: props.asset
        })
    ])
);

const OtherComponent = defineComponent({
    properties: {
        title: {
            type: "string"
        },
        asset: {
            type: "asset",
            title: "Asset Property"
        }
    },
    body: () => Text("Body")
});

export default defineComponent({ metadata, properties, body });
