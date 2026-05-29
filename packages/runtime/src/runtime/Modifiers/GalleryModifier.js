export function GalleryModifier({ args, name }) {
    let detailCallback;
    let zoomEnabled = true;

    if (typeof args[0] === 'function') {
        detailCallback = args[0];
    } else if (args[0] && typeof args[0] === 'object') {
        zoomEnabled = args[0].zoomEnabled !== false;
        detailCallback = args[1];
    }

    if (!detailCallback || typeof detailCallback !== 'function') {
        return { props: { detailHandlerId: null, zoomEnabled } };
    }

    const detailHandler = (id) => {
        let result = detailCallback(id);
        return this.unwrapComponentAST(result);
    };

    return {
        props: {
            detailHandlerId: this.storeFunction(detailHandler, this.currentPathId(name + '_detail')),
            zoomEnabled
        }
    }
}
