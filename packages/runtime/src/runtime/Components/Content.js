export function Content({ args }) {

    const id = this.currentPathId('Content')    
    const environmentId = this.storeEnvironment(id)

    const contentId = typeof args[0] === 'object' ? args[0]?._content : args[0]

    const props = { 
        environmentId,
        id: contentId
    }
    return { props } 
}