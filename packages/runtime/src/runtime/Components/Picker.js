import { processChildren } from './GenericComponent.js';

export function Picker({ args }) {
    const [label, selection, children] = args;

    const setFunction = selection[1] ?? (() => { });

    const id = this.currentPathId('Picker')    
    const environmentId = this.storeEnvironment(id)
    const setFunctionId = this.storeFunction(setFunction, id)
    const dataId = this.storeData(selection[0], id)

    const childrenAST = processChildren.bind(this)(children ?? []);

    return { 
        props: { label, selection, currentValueId: dataId, setterId: setFunctionId, environmentId }, 
        children: childrenAST
    }
    
}
