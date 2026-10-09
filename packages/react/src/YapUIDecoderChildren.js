// A plain object with no `type` isn't a view and React can't render it. Streaming tool input
// can deliver one in place of a child before it becomes a component (e.g. `{}` for a block
// whose fields haven't arrived yet), which would throw "Objects are not valid as a React
// child". Render nothing in its place. Objects with a `type` (React elements, retained JSON
// nodes that chart collectors read) are left alone.
export function renderableChildren(children) {
    if (Array.isArray(children)) return children.map(renderableChildren);
    if (children != null && typeof children === 'object' && children.type == null) return null;
    return children;
}
