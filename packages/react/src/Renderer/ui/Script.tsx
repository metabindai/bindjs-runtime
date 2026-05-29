
import React from 'react';
import { useFunctions } from './Function';
import { nodeString } from '../Utils';
import { v4 as uuid } from 'uuid';

export function Script({ name, args, children }) {
    const { scripts } = useFunctions();
    const [id] = React.useState(() => uuid());

    let content = nodeString(<>{children}</>)

    if (scripts && id && content) {
        scripts[id] = content;
    }
    return <></>
}
