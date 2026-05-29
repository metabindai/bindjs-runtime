/**
 * BindJS Data Source & Fetch API
 *
 * Type definitions for authoring BindJS data sources and tools. Include this
 * file alongside `metabind.d.ts` when the editor context supports data source
 * authoring (via the `'data'` definition set).
 *
 * This file provides:
 * - `defineDataSource` and related types
 * - `PropertySchema` / `PropertySchemaField` (data-only property subset)
 * - `InferSchemaProps` / `InferSchemaField` (type inference for schemas)
 * - Fetch API (`fetch`, `Request`, `Response`, `Headers`, etc.)
 */

// =============================================================================
// MARK: - Property Schema Types (Data-Only)
// =============================================================================
//
// Schema fields are the data-only subset of property fields — they represent
// basic JSON types without component-specific types (component, asset, content).
// Used by `defineDataSource` for typed input/output schemas.
//

/** Property types that can be used as the item type of a schema array (data-only). */
type ArraySchemaFieldOptions = PropertyString | PropertyBoolean | PropertyEnum | PropertyNumber | PropertyInteger | PropertyDate | PropertySchemaGroup;

/** Options for a schema array field (data-only item types). */
interface PropertySchemaArrayOptions extends BaseField {
    /** The property type definition for each item in the array. */
    valueType: ArraySchemaFieldOptions;
    defaultValue?: (string | number | boolean)[];
    validation?: {
        minItems?: number;
        maxItems?: number;
    };
}

interface PropertySchemaArray extends PropertySchemaArrayOptions {
    type: "array";
}

/** Options for a schema group property. Nests data-only properties under a section. */
interface PropertySchemaGroupOptions extends BaseField {
    /** The nested schema fields within this group. */
    properties: Record<string, PropertySchemaField>;
}

interface PropertySchemaGroup extends PropertySchemaGroupOptions {
    type: "group";
}

/**
 * Union of property field types that represent basic JSON data types.
 * These are the data-only subset — no component, asset, or content references.
 * Used by `defineDataSource` for input/output schemas.
 */
type PropertySchemaField =
    | PropertyString
    | PropertyBoolean
    | PropertyEnum
    | PropertyNumber
    | PropertyInteger
    | PropertySchemaArray
    | PropertyDate
    | PropertySchemaGroup;

/** A record of schema field definitions representing structured data shapes. */
type PropertySchema = Record<string, PropertySchemaField>;

/**
 * Constructor for a schema array field. Use this in `defineDataSource` schemas
 * so the value type-checks as a `PropertySchemaField` (the component-side
 * `PropertyArray()` constructor returns a broader type that fails this union).
 *
 * ```js
 * output: {
 *   results: PropertySchemaArray({
 *     valueType: PropertySchemaGroup({
 *       properties: { id: PropertyString({}), title: PropertyString({}) }
 *     })
 *   })
 * }
 * ```
 */
declare function PropertySchemaArray(options: PropertySchemaArrayOptions): PropertySchemaArray;

/**
 * Constructor for a schema group field. Use this in `defineDataSource` schemas
 * so the value type-checks as a `PropertySchemaField`.
 */
declare function PropertySchemaGroup(options: PropertySchemaGroupOptions): PropertySchemaGroup;

// =============================================================================
// MARK: - Schema Type Inference
// =============================================================================

/**
 * Infers the runtime types from a `PropertySchema` definition.
 * Maps each PropertySchemaField to its corresponding runtime value type.
 */
type InferSchemaProps<T> =
    T extends (...args: any[]) => infer R
    ? R extends PropertySchema
    ? { [K in keyof R]: InferSchemaField<R[K]> }
    : never
    : T extends PropertySchema
    ? { [K in keyof T]: InferSchemaField<T[K]> }
    : never;

/** Maps a PropertySchemaField type to its runtime value type. */
type InferSchemaField<T> =
    T extends { type: "string" } ? string
    : T extends { type: "boolean" } ? boolean
    : T extends { type: "enum"; defaultValue?: infer V } ? V extends string | number ? V : string | number
    : T extends { type: "number" } ? number
    : T extends { type: "integer" } ? number
    : T extends { type: "date" } ? string
    : T extends { type: "array"; valueType: infer V } ? InferSchemaField<V>[]
    : T extends { type: "group"; properties: infer G }
    ? G extends PropertySchema
    ? InferSchemaProps<G>
    : never
    : never;

// =============================================================================
// MARK: - Data Source Definition
// =============================================================================

/** MCP tool annotations for data source behaviour hints. */
interface DataSourceAnnotations {
    /** Whether the data source only reads data (no mutations). Default: true for data sources. */
    readOnlyHint?: boolean;
    /** Whether the data source may perform destructive operations. */
    destructiveHint?: boolean;
    /** Whether the data source accesses external/open-world resources. */
    openWorldHint?: boolean;
    /** Whether the data source operation is idempotent. */
    idempotentHint?: boolean;
}

/** Metadata for a data source, used in MCP tool registration and the Composer. */
interface DataSourceMetadata {
    /** Human-readable title shown in the Composer and documentation. */
    title?: string;
    /** Brief description of what this data source provides. */
    description?: string;
}

/**
 * Defines a data source — a BindJS primitive that maps typed input to structured output.
 *
 * Data sources are one of three BindJS primitives:
 * - `defineComponent`:  properties → UI
 * - `defineDataSource`: properties → structured data
 * - `defineTool`:       properties → side effect
 *
 * The `properties` field defines input parameters (compiled to MCP `inputSchema`).
 * The `output` field defines the return shape (compiled to MCP `outputSchema`).
 * Both use `PropertySchema` — the data-only subset of property types.
 *
 * ```js
 * const properties = {
 *   query: PropertyString({ title: "Search query" }),
 *   limit: PropertyNumber({ defaultValue: 10 })
 * }
 *
 * const output = {
 *   results: PropertyArray({ valueType: PropertyGroup({
 *     properties: {
 *       id: PropertyString({}),
 *       title: PropertyString({}),
 *       score: PropertyNumber({})
 *     }
 *   })}),
 *   total: PropertyNumber({})
 * }
 *
 * exports.default = defineDataSource({
 *   metadata: { title: "Search", description: "Full-text search" },
 *   properties,
 *   output,
 *   annotations: { readOnlyHint: true },
 *   handler: async (props, env) => {
 *     const results = await fetchResults(props.query, props.limit)
 *     return { results, total: results.length }
 *   }
 * })
 * ```
 */
type DefineDataSource = <
    const P extends PropertySchema | (() => PropertySchema),
    const O extends PropertySchema | (() => PropertySchema) | undefined = undefined
>(
    config: {
        metadata: DataSourceMetadata;
        properties?: P;
        output?: O;
        annotations?: DataSourceAnnotations;
        handler: (
            props: InferSchemaProps<P extends (...args: any[]) => infer R ? R : P>,
            env: DataSourceEnvironment
        ) => Promise<
            O extends undefined
                ? unknown
                : InferSchemaProps<O extends (...args: any[]) => infer R ? R : O>
        >;
    }
) => DataSourceDefinition<
    InferSchemaProps<P extends (...args: any[]) => infer R ? R : P>,
    O extends undefined
        ? unknown
        : InferSchemaProps<O extends (...args: any[]) => infer R ? R : O>
>;

declare const defineDataSource: DefineDataSource;

/** The return type of `defineDataSource`. Carries metadata, schemas, and the execution body. */
interface DataSourceDefinition<TInput extends Record<string, any>, TOutput> {
    _dataSource: true;
    metadata: DataSourceMetadata;
    properties?: PropertySchema;
    output?: PropertySchema;
    annotations?: DataSourceAnnotations;
    handler: (props: TInput, env: DataSourceEnvironment) => Promise<TOutput>;
}

// =============================================================================
// MARK: - Data Source Environment
// =============================================================================

/** Environment values available in data source bodies via `useEnvironment()`. */
interface DataSourceEnvironment {
    /** The current org identifier */
    organizationId?: string;
    /** The current org slug */
    organizationSlug?: string;
    /** The current project identifier. */
    projectId?: string;
    /** The current project slug */
    projectSlug?: string;
    /** Base URL for the project's API. */
    apiBaseURL?: string;
    /** Secret values injected by the host (API keys, tokens, etc.). */
    secrets?: Record<string, string>;
    /** The current locale identifier (e.g. "en_US"). */
    locale?: string;
    /** Additional host-provided values. */
    [key: string]: any;
}

/**
 * Reads environment values injected by the host into the data source context.
 *
 * ```js
 * const env = useEnvironment()
 * const apiKey = env.secrets?.OPENAI_API_KEY
 * ```
 */
declare function useEnvironment(): DataSourceEnvironment;

// =============================================================================
// MARK: - Console
// =============================================================================

interface Console {
    log(...data: unknown[]): void;
    error(...data: unknown[]): void;
    warn(...data: unknown[]): void;
    info(...data: unknown[]): void;
    debug(...data: unknown[]): void;
}
declare const console: Console;

// =============================================================================
// MARK: - Fetch API
// =============================================================================

/** HTTP request methods. */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

/** Mode for cross-origin requests. */
type RequestMode = "cors" | "no-cors" | "same-origin" | "navigate";

/** Credentials policy for requests. */
type RequestCredentials = "omit" | "same-origin" | "include";

/** Cache mode for requests. */
type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";

/** Redirect handling policy. */
type RequestRedirect = "follow" | "error" | "manual";

/** Response type classification. */
type ResponseType = "basic" | "cors" | "default" | "error" | "opaque" | "opaqueredirect";

/** A key-value pair for headers initialisation. */
type HeadersInit = Record<string, string> | [string, string][] | Headers;

/** Body content types that can be sent with a request. */
type BodyInit = string | Blob | ArrayBuffer | FormData | URLSearchParams | ReadableStream;

/**
 * Utility for constructing and manipulating URL query strings.
 *
 * ```js
 * const params = new URLSearchParams({ query: "hello", limit: "10" })
 * params.append("page", "1")
 * const url = `https://api.example.com/search?${params.toString()}`
 * ```
 */
interface URLSearchParams {
    /** Appends a new key-value pair. */
    append(name: string, value: string): void;
    /** Deletes all values for the given key. */
    delete(name: string): void;
    /** Returns the first value for the given key, or null. */
    get(name: string): string | null;
    /** Returns all values for the given key. */
    getAll(name: string): string[];
    /** Returns whether the given key exists. */
    has(name: string): boolean;
    /** Sets the value for the given key, replacing any existing values. */
    set(name: string, value: string): void;
    /** Sorts all key-value pairs by key name. */
    sort(): void;
    /** Returns the query string representation. */
    toString(): string;
    forEach(callback: (value: string, name: string, parent: URLSearchParams) => void): void;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
}

declare var URLSearchParams: {
    new(init?: Record<string, string> | string | [string, string][] | URLSearchParams): URLSearchParams;
};

/**
 * HTTP headers. Provides methods to inspect and mutate the header set.
 *
 * ```js
 * const headers = new Headers({ "Content-Type": "application/json" })
 * headers.set("Authorization", "Bearer token")
 * ```
 */
interface Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    forEach(callback: (value: string, name: string, parent: Headers) => void): void;
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
}

declare var Headers: {
    new(init?: HeadersInit): Headers;
};

/** Options for constructing a `Request` or passing to `fetch()`. */
interface RequestInit {
    /** HTTP method. Default: "GET". */
    method?: HttpMethod | string;
    /** Request headers. */
    headers?: HeadersInit;
    /** Request body. Not allowed for GET or HEAD requests. */
    body?: BodyInit | null;
    /** Cross-origin mode. */
    mode?: RequestMode;
    /** Credentials policy. */
    credentials?: RequestCredentials;
    /** Cache mode. */
    cache?: RequestCache;
    /** Redirect handling. */
    redirect?: RequestRedirect;
    /** Referrer URL or empty string. */
    referrer?: string;
    /** Signal to abort the request. */
    signal?: AbortSignal;
}

/**
 * Represents an HTTP request. Can be passed directly to `fetch()`.
 *
 * ```js
 * const req = new Request("https://api.example.com/data", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ query: "hello" })
 * })
 * const res = await fetch(req)
 * ```
 */
interface Request {
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
    readonly body: ReadableStream | null;
    readonly bodyUsed: boolean;
    readonly mode: RequestMode;
    readonly credentials: RequestCredentials;
    readonly cache: RequestCache;
    readonly redirect: RequestRedirect;
    readonly referrer: string;
    readonly signal: AbortSignal;
    clone(): Request;
    json(): Promise<any>;
    text(): Promise<string>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
}

declare var Request: {
    new(input: string | Request, init?: RequestInit): Request;
};

/**
 * Represents an HTTP response returned by `fetch()`.
 *
 * ```js
 * const res = await fetch("https://api.example.com/data")
 * if (res.ok) {
 *   const data = await res.json()
 * }
 * ```
 */
interface Response {
    /** Whether the response status is in the 200–299 range. */
    readonly ok: boolean;
    /** HTTP status code. */
    readonly status: number;
    /** HTTP status text. */
    readonly statusText: string;
    /** Response headers. */
    readonly headers: Headers;
    /** The URL of the response (after any redirects). */
    readonly url: string;
    /** The response type. */
    readonly type: ResponseType;
    /** Whether the response body has been consumed. */
    readonly bodyUsed: boolean;
    /** The response body as a readable stream. */
    readonly body: ReadableStream | null;
    /** Whether the response was redirected. */
    readonly redirected: boolean;

    /** Parses the body as JSON. */
    json(): Promise<any>;
    /** Reads the body as a UTF-8 string. */
    text(): Promise<string>;
    /** Reads the body as an ArrayBuffer. */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** Reads the body as a Blob. */
    blob(): Promise<Blob>;
    /** Reads the body as FormData. */
    formData(): Promise<FormData>;
    /** Creates a copy of the response. */
    clone(): Response;
}

declare var Response: {
    new(body?: BodyInit | null, init?: { status?: number; statusText?: string; headers?: HeadersInit }): Response;
    /** Creates a `Response` representing a network error. */
    error(): Response;
    /** Creates a redirect `Response`. */
    redirect(url: string, status?: number): Response;
    /** Creates a `Response` from JSON, automatically setting Content-Type. */
    json(data: any, init?: { status?: number; statusText?: string; headers?: HeadersInit }): Response;
};

/**
 * Fetches a resource from the network. Returns a `Promise` that resolves to a `Response`.
 *
 * ```js
 * // Simple GET
 * const res = await fetch("https://api.example.com/items")
 * const items = await res.json()
 *
 * // POST with JSON body
 * const res = await fetch("https://api.example.com/items", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ name: "New item" })
 * })
 * ```
 */
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

/**
 * An `AbortController` that can be used to cancel fetch requests.
 *
 * ```js
 * const controller = new AbortController()
 * setTimeout(() => controller.abort(), 5000)
 * const res = await fetch(url, { signal: controller.signal })
 * ```
 */
interface AbortController {
    /** The signal associated with this controller. */
    readonly signal: AbortSignal;
    /** Aborts the associated signal, causing any linked fetch to reject. */
    abort(reason?: any): void;
}

declare var AbortController: {
    new(): AbortController;
};

/** A signal that communicates abort state to fetch and other async operations. */
interface AbortSignal {
    /** Whether the signal has been aborted. */
    readonly aborted: boolean;
    /** The reason the signal was aborted. */
    readonly reason: any;
    /** Throws if the signal has been aborted. */
    throwIfAborted(): void;
}
