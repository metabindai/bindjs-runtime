import { processChildren } from './GenericComponent.js';

export function List({ args }) {
    var { props, children } = processComponentArgs(args[0], args[1])

    if (props.setSelection) {
        props.setSelectionId = this.storeFunction(props.setSelection, this.currentPathId('List'));
        delete props.setSelection;
    }

    /**
     * Execute children
     */
    const childrenAST = processChildren.bind(this)(children);

    return { props, children: childrenAST };
}