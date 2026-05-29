/**
 * BindJSDataRuntime
 *
 * A lightweight runtime for executing BindJS data sources.
 * This is a stripped-down version of BindJSRuntime that only supports:
 *   - defineDataSource
 *   - useEnvironment
 *   - Property constructors (data-only subset)
 *   - fetch (injected by the host)
 *
 * No component rendering, modifiers, AST, hooks, or animation support.
 *
 * Usage:
 *   const runtime = new BindJSDataRuntime()
 *   runtime.registerEnvironment({ projectId: '...', secrets: { API_KEY: '...' } })
 *   runtime.registerDataSource('search', sourceCode)
 *   const result = await runtime.executeDataSource('search', { query: 'hello' })
 */

// Data-only property name map (no component, asset, content, children).
// Both PropertyArray/PropertyGroup and PropertySchemaArray/PropertySchemaGroup
// resolve to the same descriptor types — the schema-prefixed names exist so
// data-source authors can write type-safe constructor calls that match the
// PropertySchemaField union (which references the schema-prefixed types).
const propertyNameMap = {
    'PropertyString': 'string',
    'PropertyNumber': 'number',
    'PropertyInteger': 'integer',
    'PropertyBoolean': 'boolean',
    'PropertyEnum': 'enum',
    'PropertyDate': 'date',
    'PropertyArray': 'array',
    'PropertyGroup': 'group',
    'PropertySchemaArray': 'array',
    'PropertySchemaGroup': 'group',
}

/**
 * Creates a property descriptor from constructor arguments.
 * Shared across all Property* constructors.
 */
function createProperty(name, options = {}) {
    return {
        type: propertyNameMap[name] || 'unknown',
        ...options,
    }
}

/**
 * Optional logger injected by the runtime owner. Mirrors the BindJSRuntime
 * logger shape — any subset of console-style methods, missing methods fall
 * back to console. Also drives the `console` proxy that data source code sees
 * inside its execution context, so the same policy applies to user-emitted
 * log lines.
 *
 * @typedef {Object} BindJSDataLogger
 * @property {(...args: unknown[]) => void} [log]
 * @property {(...args: unknown[]) => void} [info]
 * @property {(...args: unknown[]) => void} [warn]
 * @property {(...args: unknown[]) => void} [error]
 * @property {(...args: unknown[]) => void} [debug]
 */

/**
 * @typedef {Object} BindJSDataRuntimeOptions
 * @property {BindJSDataLogger} [logger]
 */

function resolveLogger(logger) {
    if (!logger) return console
    return {
        log: logger.log ?? console.log,
        info: logger.info ?? logger.log ?? console.info,
        warn: logger.warn ?? console.warn,
        error: logger.error ?? console.error,
        debug: logger.debug ?? logger.log ?? console.debug,
    }
}

export class BindJSDataRuntime {
    /** @param {BindJSDataRuntimeOptions} [options] */
    constructor(options) {
        this.dataSources = {}
        this.environment = {}
        this.context = {}
        this.functionCache = {}
        this.fetch = (...args) => fetch(...args)
        this.logger = resolveLogger(options?.logger)
        this.#registerBuiltInContext()
    }

    // =========================================================================
    // MARK: - Context Registration
    // =========================================================================

    /**
     * Registers the minimal set of globals available to data source code.
     * @private
     */
    #registerBuiltInContext() {
        // useEnvironment — returns the current environment values
        this.context.useEnvironment = () => this.environment

        // defineDataSource — packages a data source definition
        this.context.defineDataSource = (config) => this.#defineDataSource(config)

        // Property constructors (data-only subset)
        for (const name of Object.keys(propertyNameMap)) {
            this.context[name] = (options) => createProperty(name, options)
        }

        // console — pass through to the injected logger so data-source-emitted
        // log lines honour the same policy as runtime-emitted ones.
        this.context.console = {
            log: (...args) => this.logger.log(...args),
            error: (...args) => this.logger.error(...args),
            warn: (...args) => this.logger.warn(...args),
            info: (...args) => this.logger.info(...args),
            debug: (...args) => this.logger.debug(...args),
        }

        // Fetch — late-binding wrapper so `runtime.fetch = custom` propagates
        this.context.fetch = (...args) => this.fetch(...args)

    }

    // =========================================================================
    // MARK: - defineDataSource
    // =========================================================================

    /**
     * Packages a data source definition. Called from within data source code
     * via `exports.default = defineDataSource({ ... })`.
     *
     * @param {object} config
     * @param {object} config.metadata - Name, title, description
     * @param {object} [config.properties] - Input schema (PropertySchema)
     * @param {object} [config.output] - Output schema (PropertySchema)
     * @param {object} [config.annotations] - MCP tool annotations
     * @param {Function} config.handler - Async execution function
     * @returns {object} The data source definition
     * @private
     */
    #defineDataSource(config) {
        const { metadata, properties, output, handler } = config

        return {
            _dataSource: true,
            metadata: metadata ?? {},
            properties: properties ?? {},
            output: output ?? {},
            handler,
        }
    }

    // =========================================================================
    // MARK: - Environment
    // =========================================================================

    /**
     * Sets environment values available to data sources via `useEnvironment()`.
     *
     * @param {object} environment - Key-value pairs (projectId, baseURL, secrets, etc.)
     */
    registerEnvironment(environment = {}) {
        this.environment = { ...this.environment, ...environment }
    }

    // =========================================================================
    // MARK: - Registration
    // =========================================================================

    /**
     * Registers a data source from its JavaScript source code.
     * The code must export a `defineDataSource(...)` via `exports.default`.
     *
     * @param {string} name - Unique name for this data source
     * @param {string} code - JavaScript source code of the data source
     */
    registerDataSource(name, code) {
        this.dataSources[name] = code
        // Invalidate cached exports
        delete this.functionCache[name]
    }

    /**
     * Registers multiple data sources at once.
     *
     * @param {Record<string, string>} sources - Map of name → source code
     */
    registerDataSources(sources) {
        for (const [name, code] of Object.entries(sources)) {
            this.registerDataSource(name, code)
        }
    }

    // =========================================================================
    // MARK: - Export Resolution
    // =========================================================================

    /**
     * Evaluates a data source's code and returns its default export.
     * Results are cached per data source name.
     *
     * @param {string} name - Data source name
     * @returns {object|null} The data source definition, or null on error
     * @private
     */
    #getExport(name) {
        if (this.functionCache[name]) {
            return this.functionCache[name]
        }

        const code = this.dataSources[name]
        if (!code) {
            this.logger.error(`Data source "${name}" not registered`)
            return null
        }

        const contextKeys = Object.keys(this.context)
        const functionList = contextKeys.join(', ')

        try {
            const fn = new Function(
                `{ ${functionList} }`,
                `var exports = {}; ${code}; return exports.default;`
            )
            const result = fn(this.context)
            this.functionCache[name] = result
            return result
        } catch (error) {
            this.logger.error(`Error evaluating data source "${name}":`, error)
            return null
        }
    }

    // =========================================================================
    // MARK: - Execution
    // =========================================================================

    /**
     * Executes a registered data source with the given input props.
     *
     * @param {string} name - Data source name
     * @param {object} [props={}] - Input properties matching the data source's schema
     * @returns {Promise<object>} The data source output
     * @throws {Error} If the data source is not registered or execution fails
     */
    async executeDataSource(name, props = {}) {
        const definition = this.#getExport(name)

        if (!definition) {
            throw new Error(`Data source "${name}" not found or failed to load`)
        }

        if (!definition._dataSource) {
            throw new Error(`"${name}" is not a data source definition`)
        }

        if (typeof definition.handler !== 'function') {
            throw new Error(`Data source "${name}" has no handler function`)
        }

        return await definition.handler(props, this.environment)
    }

    // =========================================================================
    // MARK: - Introspection
    // =========================================================================

    /**
     * Returns the metadata for a registered data source.
     *
     * @param {string} name - Data source name
     * @returns {object|null} Metadata object, or null if not found
     */
    getMetadata(name) {
        this.logger.log('getMetadata ', name)
        return this.#getExport(name)?.metadata ?? null
    }

    /**
     * Returns the input property schema for a registered data source.
     *
     * @param {string} name - Data source name
     * @returns {object|null} Properties schema, or null if not found
     */
    getProperties(name) {
        return this.#getExport(name)?.properties ?? null
    }

    /**
     * Returns the output schema for a registered data source.
     *
     * @param {string} name - Data source name
     * @returns {object|null} Output schema, or null if not found
     */
    getOutput(name) {
        return this.#getExport(name)?.output ?? null
    }

    /**
     * Returns the full definition for a registered data source.
     *
     * @param {string} name - Data source name
     * @returns {object|null} Full definition, or null if not found
     */
    getDefinition(name) {
        return this.#getExport(name) ?? null
    }

    /**
     * Returns the names of all registered data sources.
     *
     * @returns {string[]}
     */
    getRegisteredNames() {
        return Object.keys(this.dataSources)
    }
}
