import getComponentAST from '../Util/getComponentAST.js';

export function FontModifier({ args, content }) {
    const [arg] = args;

    // FontCustom currently for backward compatiblity.
    let customFont = getComponentAST(arg, 'CustomFont') || getComponentAST(arg, 'FontCustom');
    if (customFont) {
        customFont.type = 'CustomFont';
    }

    let options = {};
    if (customFont) {
        options = { custom: customFont.props, rawValue: customFont };
    } else {
        options = { rawValue: arg };
    }

    return {
        props: options,
        children: content,
    };
}
