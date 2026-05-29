import React from 'react';

export function styleUserSelect(select: boolean, style?: React.CSSProperties | null): React.CSSProperties {
    let s: React.CSSProperties = style ?? {}
    s.userSelect = select ? "auto" : "none";
    s.WebkitUserSelect = select ? "auto" : "none";
    if (select) {
        s.cursor = "text";
    }
    return s;
}
