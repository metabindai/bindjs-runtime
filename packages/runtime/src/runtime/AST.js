const AST = {}

AST.Directive = (name, args = {}, children) => {
    var props = { ...args }
    props['children'] = children ?? []

    return {
        'type': name,
        'props': props
    }
}

AST.ModifiedContent = (modifier, component) => {

    const content = (Array.isArray(component) ? component : [component]);

    return {
        'type': 'ModifiedComponent',
        'props': {
            'modifier': { ...modifier },
            'content': content
        }
    }
};

AST.ForEach = (dataId, functionId, count, environmentId, children) => {
    return {
        'type': 'ForEach',
        'props': {
            'dataId': dataId,
            'functionId': functionId,
            'count': count,
            'environmentId': environmentId,
            'children': children
        }
    }
};

AST.Representable = (functionId, environmentId) => {
    return {
        'type': 'Representable',
        'props': {
            'functionId': functionId,
            'environmentId': environmentId
        }
    }
};

export default AST