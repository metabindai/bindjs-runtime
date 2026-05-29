const propertyNameMap = {
    'PropertyString'  : 'string',
    'PropertyNumber'  : 'number',
    'PropertyInteger' : 'integer',
    'PropertyBoolean' : 'boolean',
    'PropertyEnum'    : 'enum',
    'PropertyDate'    : 'date',
    'PropertyArray'   : 'array',
    'PropertyAsset'   : 'asset',
    'PropertyGroup'   : 'group',
    'PropertyContent' : 'content',
    'PropertyComponent': 'component',
    'PropertyComponentList': 'componentList',
    'PropertyChildren' : 'children',
}

export function PropertyComponent({ args, name }) {
    const props = args?.[0] || {};

    const result = {
        type: propertyNameMap[name] || 'unknown',
        ...props,
    }
    
    return result;
}
