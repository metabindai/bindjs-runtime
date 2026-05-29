export function makeComponent (component) {

    // Pass body directly or in dictionary
    let body = component.body ? component.body : component

    // As the name isnt passed in, generate one from the call order
    const componentIndex = this.hookState.makeComponentIndex++

    //console.log('registerCallback - makeComponent ', component, componentIndex)

    // Create body function
    let f = (props, children) =>   
        this.makeComponent((props, children) => body(props, children), props, children, componentIndex)  
    
    f._component = true

    return f
}