// Deliberately binds the config fields to consts that are NOT named
// metadata/properties/body, to check the runtime accepts any identifier.
// `metabind validate` only resolves a const literally named `body`, so it
// reports BODY_NOT_FUNCTION here; the runtime renders it fine.
const someMetadata = {
    title: "TestDefineComponentAlt",
    description: "defineComponent with metadata/properties/body passed as differently-named consts (someMetadata, someProperties, someBody); renders the text \"TestTemplate 1234\"."
};

const someProperties = {} satisfies ComponentProperties;

const someBody = () => {
    return VStack([
        Text("TestTemplate 1234")
    ]);
};

export default defineComponent({
    metadata: someMetadata,
    properties: someProperties,
    body: someBody
});
