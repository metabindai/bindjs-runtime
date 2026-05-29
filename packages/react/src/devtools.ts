/**
 * Injectable devtools logger.
 *
 * bindjs-react emits diagnostic events while decoding/rendering, but it must
 * not depend on the host's devtools package — that would couple the renderer
 * to the host UI (and drag @metabind/ui into this package). Instead the host
 * injects a logger via setDevTools(); until then every call is a no-op, so the
 * renderer works standalone.
 */
export interface DevToolsLogger {
    event(view: string, eventName: string, group?: string): void;
    log(...args: any[]): void;
    object(key: string, value: any, onEdited?: (newValue: any) => void): void;
}

const noopLogger: DevToolsLogger = {
    event: () => {},
    log: () => {},
    object: () => {},
};

let current: DevToolsLogger = noopLogger;

export function setDevTools(logger: DevToolsLogger | null | undefined): void {
    current = logger ?? noopLogger;
}

export const devTools: DevToolsLogger = {
    event: (view, eventName, group) => current.event(view, eventName, group),
    log: (...args) => current.log(...args),
    object: (key, value, onEdited) => current.object(key, value, onEdited),
};
