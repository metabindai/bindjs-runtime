import { useRendererContext } from '../../RendererContext';    

export function ForEach({ dataId, functionId , environmentId, children }) {
    const rendererContext = useRendererContext();

    if (children) {
        
        return children;

    } else {

        // Restore data
        let data = rendererContext.dataCallback(dataId);

        // Restore environment
        rendererContext.restoreEnvironmentCallback(environmentId);

        if (data == null) { return "no data" }  

        let content = data.map((item, index) => { 
            rendererContext.setForEachId(index)

            try {
                let ast = rendererContext.forEachCallback(functionId, item, index)
                let decode = rendererContext.decodeViewCallback(ast)
                return decode
            } catch (e) {
                console.log(e)
                return null
            }
        })

        rendererContext.setForEachId(null)

        return content
    }
}
