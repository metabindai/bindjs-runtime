import AST from '../AST.js'

export function ForEach({ args }) {

    const [data, callback] = args

    const expand = this.options.expandForEach
    const count = Array.isArray(data) ? data.length : 0

    var ast = null  

    if (expand) {
        const children = data.map((element, index) => {
            this.setForEachElementId(index)
            let result = callback(element, index)
            while (result && result._component) {
                result = result()
            }
            return result
        })
        ast = AST.ForEach(null, null, count, null, children)
    } else {
        const id = this.currentPathId('ForEach')    
        const environmentId = this.storeEnvironment(id)
        const functionId = this.storeFunction(callback, id)
        const dataId = this.storeData(data, id)

        ast = AST.ForEach(dataId, functionId, count, environmentId)
    }

    return { ast }
}