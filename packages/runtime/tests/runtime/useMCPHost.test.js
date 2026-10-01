import { describe, it, expect, vi } from 'vitest';
import { BindJSRuntime } from '../../src/runtime/BindJSRuntime.js';

describe('useMCPHost', () => {
    it('returns null without a host', () => {
        const runtime = new BindJSRuntime();
        expect(runtime.getComponent('useMCPHost')()).toBeNull();
    });
    it('preserves the host object, context and subscription methods', () => {
        const runtime = new BindJSRuntime();
        const listeners = new Set();
        const host = {
            hostContext: { displayMode: 'fullscreen', containerDimensions: { width: 800 } },
            openedWithEmptyInput: true,
            subscribeHostContext(listener) {
                listeners.add(listener);
                return () => listeners.delete(listener);
            },
        };
        runtime.mcpHost = host;
        const useMCPHost = runtime.getComponent('useMCPHost');
        expect(useMCPHost()).toBe(host);
        expect(useMCPHost().openedWithEmptyInput).toBe(true);
        const changed = vi.fn();
        const unsubscribe = useMCPHost().subscribeHostContext(changed);
        host.hostContext = { ...host.hostContext, displayMode: 'inline' };
        listeners.forEach(listener => listener(host.hostContext));
        expect(useMCPHost().hostContext.displayMode).toBe('inline');
        expect(changed).toHaveBeenCalledWith(host.hostContext);
        unsubscribe();
        expect(listeners.size).toBe(0);
    });
});
