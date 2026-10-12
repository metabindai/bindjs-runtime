import React from 'react';

// Text is selectable by default, as on any web page; .textSelection('disabled') turns it off.
export function styleUserSelect(textSelection: 'enabled' | 'disabled' | null | undefined, style?: React.CSSProperties | null): React.CSSProperties {
    let s: React.CSSProperties = style ?? {}
    if (textSelection === 'disabled') {
        s.userSelect = "none";
        s.WebkitUserSelect = "none";
    } else if (textSelection === 'enabled') {
        s.userSelect = "auto";
        s.WebkitUserSelect = "auto";
        s.cursor = "text";
    }
    return s;
}
