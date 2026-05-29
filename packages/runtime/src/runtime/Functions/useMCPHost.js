/**
 * Returns the MCP host interface, or null if not running in an MCP context.
 * The host provides methods for tool calls, messaging, context updates, etc.
 *
 * The host object is set by the renderer via `runtime.mcpHost = { ... }`.
 */
export function useMCPHost() {
    return this.mcpHost ?? null
}
