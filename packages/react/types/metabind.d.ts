/**
 * BindJS Component API
 *
 * Type definitions for authoring BindJS components. BindJS is a SwiftUI-inspired
 * declarative UI framework that renders natively on iOS, Android, and web.
 *
 * Components are defined using `defineComponent` and exported as the default export:
 *
 * ```js
 * const body = (props) => Text(props.greeting)
 * const properties = { greeting: PropertyString({ defaultValue: "Hello" }) }
 * exports.default = defineComponent({ body, properties })
 * ```
 */

// =============================================================================
// MARK: - Component Definition
// =============================================================================

/** The body function that defines a component's UI. Receives resolved props and child components. */
type Body = (props: ComponentProps, children: Component[]) => Component;

/** Resolved component props as a key-value record. */
type ComponentProps = Record<string, any>;

/** A record of property field definitions that describe a component's configurable inputs. */
type Properties = Record<string, PropertyField>;

/** Component metadata displayed in the Composer, galleries, and documentation. */
interface Metadata {
    /** Display name shown in the Composer and component galleries. */
    title?: string;
    /** Brief description of the component's purpose. */
    description?: string;
    /** Grouping category for organizing components (e.g. "Layout", "Controls"). */
    category?: string;
    /** Whether the component is publicly visible in the catalog. */
    public?: boolean;
}

/**
 * Defines a component with its body, metadata, properties, previews, and thumbnail.
 * This is the primary way to create and export BindJS components.
 *
 * ```js
 * const body = (props) => {
 *   return VStack([
 *     Text(props.title).font("headline"),
 *     Text(props.subtitle).foregroundStyle(Color("secondary"))
 *   ])
 * }
 *
 * const properties = {
 *   title: PropertyString({ defaultValue: "Hello" }),
 *   subtitle: PropertyString({ defaultValue: "World" })
 * }
 *
 * const previews = [
 *   Self({ title: "Welcome", subtitle: "Back" }).previewName("Default"),
 *   Self({ title: "Error", subtitle: "Something went wrong" }).previewName("Error State")
 * ]
 *
 * exports.default = defineComponent({ body, properties, previews })
 * ```
 */
interface ComponentDefinition {
    /** The render function that returns the component's UI tree. */
    body: (props: any, children: Component[]) => Component;
    /** Optional metadata for the Composer and documentation. */
    metadata?: Record<string, any> | (() => Record<string, any>);
    /** Optional property schema defining the component's configurable inputs. */
    properties?: Record<string, any> | (() => Record<string, any>);
    /** Optional preview instances shown in galleries and documentation. */
    previews?: Component[] | (() => Component[]);
    /** Optional thumbnail as an SVG string or a render function. */
    thumbnail?: string | ((props: any, children: Component[]) => Component);
    /** Optional icon name string for lightweight identification in menus and context menus. */
    icon?: string;
}

type DefineComponent = <
    const T extends ComponentProperties | ((ctx: any) => ComponentProperties)
>(
    config: {
        metadata?: Metadata;
        properties?: T;
        body: (
            props: InferProps<T extends (...args: any[]) => infer R ? R : T>,
            children: Component[]
        ) => Component;
        thumbnail?: string | Component;
        icon?: string;
        previews?: (() => Component[]) | Component[];
    }
) => ComponentCallable<InferProps<T extends (...args: any[]) => infer R ? R : T>>;

declare const defineComponent: DefineComponent;

type ComponentCallable<P extends Record<string, any>> = Component & {
    (props: P, children?: Component[]): Component;
    metadata?: Metadata;
    properties?: ComponentProperties;
    thumbnail?: string | Component;
    icon?: string;
    previews?: (() => Component[]) | Component[];
};

// =============================================================================
// MARK: - Button Style Definition
// =============================================================================

/** Configuration passed to a button style's body function. */
interface ButtonStyleConfiguration {
    /** The label component to render inside the button. */
    label: Component;
    /** Whether the button is currently being pressed. */
    isPressed: boolean;
}

/** Options for defining a custom button style. */
interface ButtonStyleDefinition {
    /** The body function that returns the styled button UI. */
    body: (configuration: ButtonStyleConfiguration, props?: Record<string, any>) => Component;
    /** Optional metadata about the button style. */
    metadata?: Record<string, any> | (() => Record<string, any>);
}

/**
 * A button style that can be applied via the `.buttonStyle()` modifier.
 * Button styles do not support view modifiers — they only style button appearances.
 */
interface ButtonStyleComponent {
    (props?: Record<string, any>): ButtonStyleComponent;
    body: (configuration: ButtonStyleConfiguration, props?: Record<string, any>) => Component;
}

/**
 * Defines a custom button style. Apply it to buttons with `.buttonStyle()`.
 *
 * ```js
 * const body = (configuration, props) => {
 *   return Capsule()
 *     .fill(Color(props?.color || "blue"))
 *     .overlay(configuration.label)
 *     .frame({ height: 44 })
 * }
 *
 * exports.default = defineButtonStyle({ body })
 * ```
 */
declare function defineButtonStyle(definition: ButtonStyleDefinition): ButtonStyleComponent;

// =============================================================================
// MARK: - Property Schema Types
// =============================================================================
//
// Property fields define the configurable inputs for a component. They appear
// as form controls in the Composer and drive typed prop resolution at runtime.
//

/** Inspector options shared by all property types. Controls how the field appears in the Composer. */
interface BaseInspector {
    /** Whether to show the field label. Default: true. */
    showLabel?: boolean;
    /** Whether to show a divider below this field. */
    showDivider?: boolean;
    /** Dynamic visibility callback — return false to hide this field based on other prop values. */
    visible?: (props: Record<string, any>) => boolean;
    /** Help text shown as a tooltip or info icon in the Composer. */
    helpDescription?: string;
}

/** Base options shared by all property field types. */
interface BaseField {
    /** Display label for the field in the Composer. */
    title?: string;
    /** Brief description shown below the field label. */
    description?: string;
    /** Whether the field must have a value. */
    required?: boolean;
    /** Composer inspector configuration. */
    inspector?: BaseInspector;
}

// -- String --

interface StringInspector extends BaseInspector {
    /** Placeholder text shown when the field is empty. */
    placeholder?: string;
    /** Input control type. Default: "singleline". */
    control?: "singleline" | "multiline" | "code";
    /** Enable markdown formatting toolbar. */
    markdown?: boolean;
    /** Number of visible lines for multiline fields. */
    numberOfLines?: number;
}

/** Options for a string property field. */
interface PropertyStringOptions extends BaseField {
    defaultValue?: string;
    /** Example values shown as suggestions in the Composer. */
    examples?: string[];
    inspector?: StringInspector;
    validation?: {
        minLength?: number;
        maxLength?: number;
        /** Regex pattern the value must match. */
        pattern?: string;
        format?: "text" | "email" | "url";
    };
}

interface PropertyString extends PropertyStringOptions { type: "string" }

// -- Boolean --

/** Options for a boolean property field. Renders as a toggle in the Composer. */
interface PropertyBooleanOptions extends BaseField {
    defaultValue?: boolean;
}

interface PropertyBoolean extends PropertyBooleanOptions {
    type: "boolean";
}

// -- Enum --

interface EnumInspector extends BaseInspector {
    /** Control type: "segmented" for inline buttons, "dropdown" for a select menu. */
    control?: "segmented" | "dropdown";
}

/** Options for an enum (select) property field. */
interface PropertyEnumOptions extends BaseField {
    /** The available options. Can be simple values or label/icon objects. */
    options:
    | string[]
    | number[]
    | { value: string | number; label: string }[]
    | { value: string | number; icon: string }[];
    inspector?: EnumInspector;
    defaultValue?: string | number;
}

interface PropertyEnum extends PropertyEnumOptions {
    type: "enum";
}

// -- Number --

interface NumberInspector extends BaseInspector {
    placeholder?: number;
    /** Control type: "slider" for a range slider, "input" for a number input. */
    control?: "slider" | "input";
    /** Step increment for slider or stepper controls. */
    step?: number;
}

/** Options for a number property field. */
interface PropertyNumberOptions extends BaseField {
    defaultValue?: number;
    inspector?: NumberInspector;
    validation?: {
        min?: number;
        max?: number;
    };
}

interface PropertyNumber extends PropertyNumberOptions {
    type: "number";
}

// -- Integer --

/** Options for an integer property field. Same shape as number, but restricted
 *  to integer values. Emitted as `{type: "integer"}` in JSON Schema for MCP
 *  tool schemas — e.g. OpenAPI path params declared as `type: integer`. */
interface PropertyIntegerOptions extends BaseField {
    defaultValue?: number;
    inspector?: NumberInspector;
    validation?: {
        min?: number;
        max?: number;
    };
}

interface PropertyInteger extends PropertyIntegerOptions {
    type: "integer";
}

// -- Date --

interface DateInspector extends BaseInspector {
    placeholder?: string;
}

/** Options for a date property field. Values are ISO 8601 date strings. */
interface PropertyDateOptions extends BaseField {
    /** Default value as an ISO date string. */
    defaultValue?: string;
    inspector?: DateInspector;
    validation?: {
        /** Earliest allowed date (ISO string). */
        minDate?: string;
        /** Latest allowed date (ISO string). */
        maxDate?: string;
    };
}

interface PropertyDate extends PropertyDateOptions {
    type: "date";
}

// -- Array --

/** Property types that can be used as the item type of an array property. */
type ArrayPropertyFieldOptions = PropertyString | PropertyBoolean | PropertyEnum | PropertyNumber | PropertyInteger | PropertyDate | PropertyAsset | PropertyComponent | PropertyGroup | PropertyContent;

/** Options for an array property field. Renders as a repeatable list in the Composer. */
interface PropertyArrayOptions extends BaseField {
    /** The property type definition for each item in the array. */
    valueType: ArrayPropertyFieldOptions;
    defaultValue?: (string | number | boolean)[];
    validation?: {
        minItems?: number;
        maxItems?: number;
    };
}

interface PropertyArray extends PropertyArrayOptions {
    type: "array";
}

// -- Component --

/** Options for a component slot property. Allows embedding child components. */
interface PropertyComponentOptions extends BaseField {
    /** Environment values passed to the embedded component. */
    environment?: Record<string, any>;
    /** Restrict which component types can be placed in this slot. */
    allowedComponents?: string[];
}

interface PropertyComponent extends PropertyComponentOptions {
    type: "component";
}

// -- Asset --

/** Supported asset media types. */
type AssetType = "image" | "video" | "audio" | "model" | "model/usdz" | "model/glb";

/** Options for an asset property field. Opens the asset picker in the Composer. */
interface PropertyAssetOptions extends BaseField {
    /** Restrict which asset types can be selected. Default: all types. */
    assetTypes?: AssetType[];
}

interface PropertyAsset extends PropertyAssetOptions {
    type: "asset";
}

// -- Content --

/** Options for a content reference property. Links to a content item by ID. */
interface PropertyContentOptions extends BaseField { }

interface PropertyContent extends PropertyContentOptions {
    type: "content";
}

// -- Group --

/** Options for a group property. Nests multiple properties under a collapsible section. */
interface PropertyGroupOptions extends BaseField {
    /** The nested property fields within this group. */
    properties: Record<string, PropertyField>;
}

interface PropertyGroup extends PropertyGroupOptions {
    type: "group";
}

/** Union of all property field types. */
type PropertyField =
    | PropertyString
    | PropertyBoolean
    | PropertyEnum
    | PropertyNumber
    | PropertyInteger
    | PropertyArray
    | PropertyDate
    | PropertyComponent
    | PropertyAsset
    | PropertyContent
    | PropertyGroup;

type ComponentProperties = Record<string, PropertyField>;

// -- Property Constructor Functions --

/** Creates a string property definition. */
declare function PropertyString(options: PropertyStringOptions): PropertyString;
/** Creates a boolean property definition. */
declare function PropertyBoolean(options: PropertyBooleanOptions): PropertyBoolean;
/** Creates an enum (select) property definition. */
declare function PropertyEnum(options: PropertyEnumOptions): PropertyEnum;
/** Creates a number property definition. */
declare function PropertyNumber(options: PropertyNumberOptions): PropertyNumber;
/** Creates an integer property definition. Same shape as number but emits
 *  `{type: "integer"}` in JSON Schema. */
declare function PropertyInteger(options: PropertyIntegerOptions): PropertyInteger;
/** Creates an array property definition. */
declare function PropertyArray(options: PropertyArrayOptions): PropertyArray;
/** Creates a component slot property definition. */
declare function PropertyComponent(options?: PropertyComponentOptions): PropertyComponent;
/** Creates an asset property definition. */
declare function PropertyAsset(options: PropertyAssetOptions): PropertyAsset;
/** Creates a content reference property definition. */
declare function PropertyContent(options: PropertyContentOptions): PropertyContent;
/** Creates a group property definition with nested fields. */
declare function PropertyGroup(options: PropertyGroupOptions): PropertyGroup;
/** Creates a date property definition. */
declare function PropertyDate(options: PropertyDateOptions): PropertyDate;

// =============================================================================
// MARK: - Composer Components
// =============================================================================

/** Options for ComposerGroup, which defines named content slots in the Composer. */
interface ComposerGroupOptions {
    /** The named group/slot to read children from. */
    group?: string;
    /** Component to display when the slot is empty. */
    empty?: Component
}

/**
 * Defines a named content slot for the Composer's visual editor.
 * Children are read from the content's layout props for the given group name.
 * On native platforms, acts as a transparent pass-through.
 *
 * ```js
 * // Named slot
 * ComposerGroup("sidebar", [children])
 *
 * // With options
 * ComposerGroup({ group: "cards", empty: Text("No cards") }, [children])
 *
 * // Unnamed (default children)
 * ComposerGroup([children])
 * ```
 */
declare function ComposerGroup(options: ComposerGroupOptions | string | null, children: Component[]): Component;
declare function ComposerGroup(children: Component[]): Component;

/** Options for the ComposerAdd button. */
interface ComposerAddOptions {
    /** Button label text. */
    title?: string;
    /** The property/slot name this button adds components to. */
    property: string;
}

/**
 * Renders an "add component" button in the Composer for a given content slot.
 * Only visible in the Composer editing UI.
 */
declare function ComposerAdd(options?: ComposerAddOptions): Component;

// =============================================================================
// MARK: - Hooks
// =============================================================================

/**
 * Component-local state. Each component instance maintains its own state across re-renders.
 *
 * ```js
 * const [count, setCount] = useState(0)
 * ```
 */
declare function useState<T>(initialValue: T): [T, (value: T) => void];

/**
 * Component-local mutable ref. Returns the same `{ current }` object across re-renders.
 * Mutating `.current` does not trigger a re-render.
 *
 * ```js
 * const timer = useRef(null)
 * timer.current = setTimeout(...)
 * ```
 */
declare function useRef<T>(initialValue: T): { current: T };

/**
 * Reads the current environment values (color scheme, display scale, locale, screen size, etc.).
 *
 * ```js
 * const env = useEnvironment()
 * const isDark = env.colorScheme === "dark"
 * ```
 */
declare function useEnvironment(): EnvironmentValues;

/**
 * Global app state shared across all components. Simpler predecessor to `useStore`.
 * Prefer `useStore` for new components.
 *
 * ```js
 * const [theme, setTheme] = useAppState("theme", "light")
 * ```
 */
declare function useAppState<T>(name: string, defaultValue: T): [T, (value: T) => void];

/**
 * Returns a navigation function for programmatic navigation.
 * The host app defines how navigation is handled.
 *
 * ```js
 * const navigate = useNavigate()
 * navigate({ to: "DetailView", props: { id: "123" } })
 * ```
 */
declare function useNavigate(): (options: { to: string; props?: Record<string, string> }) => void;

/**
 * Returns an action dispatch function for triggering host-app-defined actions.
 * Use this for side effects like analytics, deep links, or native integrations.
 *
 * ```js
 * const action = useAction()
 * action({ name: "addToCart", props: { productId: "abc" } })
 * ```
 */
declare function useAction(): (options: { name: string; props?: Record<string, string> }) => void;

// =============================================================================
// MARK: - MCP Host
// =============================================================================

/** Log severity levels for host-side logging. */
type LogLevel = 'debug' | 'info' | 'warning' | 'error';

/**
 * Interface for communicating with the MCP host from a BindJS component.
 * Only available when running in the context of an MCP server.
 *
 * Obtain via `useMCPHost()`:
 * ```js
 * const host = useMCPHost()
 * const result = await host.toolCall("search_products", { query: "shoes" })
 * // result is the structured data directly, e.g. { products: [...] }
 * ```
 */
interface MCPHost {
    // -- Transport (low-level) ------------------------------------------------

    /**
     * Send a JSON-RPC request to the host and await the response.
     * All other request methods use this under the hood.
     */
    sendRequest: (method: string, params?: any) => Promise<any>;

    /**
     * Fire-and-forget JSON-RPC notification to the host. No response expected.
     */
    sendNotification: (method: string, params?: any) => void;

    // -- Tool Calls -----------------------------------------------------------

    /**
     * Execute any MCP tool registered on the server and return the result data.
     * Returns the structured data directly (not the raw MCP envelope).
     * Throws on error.
     *
     * ```js
     * const { products } = await host.toolCall("search_products", { query: "shoes" })
     * ```
     */
    toolCall: (name: string, args?: Record<string, any>) => Promise<any>;

    // -- Messaging ------------------------------------------------------------

    /**
     * Inject a message into the host's chat as if the user typed it.
     * Triggers a full conversation turn — the LLM will see and respond.
     *
     * ```js
     * await host.sendMessage("Tell me more about this product")
     * ```
     */
    sendMessage: (message: string) => Promise<void>;

    // -- Model Context --------------------------------------------------------

    /**
     * Silently update the LLM's context for future turns without triggering
     * an immediate response.
     *
     * ```js
     * await host.updateModelContext({ selectedProduct: { id: 123, name: "..." } })
     * ```
     */
    updateModelContext: (content: Record<string, any>) => Promise<void>;

    // -- Size -----------------------------------------------------------------

    /**
     * Notify the host that the iframe content height changed so it can
     * resize the container.
     */
    sizeChanged: (height: number) => void;

    // -- Navigation -----------------------------------------------------------

    /**
     * Ask the host to open a URL. The iframe is sandboxed and can't navigate
     * directly — this delegates to the host.
     */
    openLink: (url: string) => Promise<void>;

    // -- Display --------------------------------------------------------------

    /**
     * Ask the host to change the display mode of the app's container.
     * Modes are host-defined (e.g., "fullscreen", "collapsed", "expanded").
     */
    requestDisplayMode: (mode: string) => Promise<void>;

    // -- Logging --------------------------------------------------------------

    /**
     * Send a log message to the host. Useful because console.log inside a
     * sandboxed iframe may not be visible in all hosts.
     */
    log: (level: LogLevel, message: string, data?: any) => void;
}

/**
 * Returns the MCP host interface for communicating with the MCP server.
 * Only available when running in the context of an MCP server — returns
 * `null` otherwise.
 *
 * ```js
 * const host = useMCPHost()
 * if (host) {
 *   const { products } = await host.toolCall("search_products", { query: "shoes" })
 * }
 * ```
 *
 * Fetch on mount and render — trigger the call inside `.onAppear()` and
 * store the result with `useState`:
 *
 * ```js
 * const host = useMCPHost()
 * const [data, setData] = useState(null)
 * const [err, setErr] = useState(null)
 * VStack([
 *   data ? Text(JSON.stringify(data))
 *     : err ? Text("Error: " + err.message)
 *     : Text("Loading…")
 * ]).onAppear(() => {
 *   if (!host) return
 *   host.toolCall("search_products", { query: "shoes" })
 *     .then(setData)
 *     .catch(setErr)
 * })
 * ```
 */
declare function useMCPHost(): MCPHost | null;

// =============================================================================
// MARK: - Component Utilities
// =============================================================================

/** Result of `getComponentData` containing the underlying component's name and props. */
interface ComponentData {
    /** The component name, or null if the AST node couldn't be resolved. */
    name: string | null;
    /** The component's props. */
    props: Record<string, any>;
}

/**
 * Extracts the underlying component name and props from a builder function.
 * Unwraps modifiers to find the core component.
 *
 * ```js
 * const data = getComponentData(() => Text("Hello"))
 * // { name: "Text", props: { text: "Hello" } }
 *
 * const data2 = getComponentData(() => MyCard({ title: "Hi" }).padding(10))
 * // { name: "MyCard", props: { title: "Hi" } }
 * ```
 */
declare function getComponentData(child: () => Component): ComponentData;

/**
 * Self-reference to the current component. Use inside a body function to
 * recursively render the same component with different props.
 *
 * ```js
 * const body = (props) => {
 *   return VStack([
 *     Text(props.label),
 *     ForEach(props.children, (child) =>
 *       Self({ label: child.label, children: child.children })
 *     )
 *   ])
 * }
 * ```
 *
 * Props are inferred from the component's own `properties` definition.
 */
declare function Self(props?: InferProps<typeof properties>, children?: Component[]): Component;

// =============================================================================
// MARK: - Animation
// =============================================================================

/**
 * Wraps a state mutation in an animation context so the resulting UI changes are animated.
 * Wraps state mutations in an animation context so the resulting UI changes animate.
 *
 * ```js
 * withAnimation(Spring({ response: 0.5 }), () => {
 *   setIsExpanded(!isExpanded)
 * })
 *
 * // Default spring animation
 * withAnimation(() => setCount(count + 1))
 * ```
 */
declare function withAnimation(body: () => void): Component;
declare function withAnimation(animation: Spring | InterpolatingSpring | EaseIn | EaseInOut | EaseOut | Bouncy | Snappy | Linear | AnimationComponent, body: () => void): Component;

/** An animation value with chainable timing modifiers. */
interface AnimationComponent {
    /** Delays the start of the animation. */
    delay(_: number): AnimationComponent;
    /** Multiplies the animation speed. */
    speed(_: number): AnimationComponent;
    /** Repeats the animation a fixed number of times. */
    repeatCount(_: number): AnimationComponent;
    /** Repeats the animation indefinitely. */
    repeatForever(_: boolean | { autoreverses: boolean }): AnimationComponent;
}

/** A spring animation with response and damping parameters. */
declare function Spring(options?: SpringAnimationOptions): AnimationComponent;
/** A spring animation defined by physical stiffness, damping, and mass. */
declare function InterpolatingSpring(options?: InterpolatingSpringAnimationOptions): AnimationComponent;
/** An ease-in timing curve (starts slow, ends fast). */
declare function EaseIn(options?: EaseAnimationOptions): AnimationComponent;
/** An ease-in-out timing curve (starts and ends slow). */
declare function EaseInOut(options?: EaseAnimationOptions): AnimationComponent;
/** An ease-out timing curve (starts fast, ends slow). */
declare function EaseOut(options?: EaseAnimationOptions): AnimationComponent;
/** A linear timing curve (constant speed). */
declare function Linear(options?: EaseAnimationOptions): AnimationComponent;
/** A spring with extra bounce. */
declare function Bouncy(options?: BouncyAnimationOptions): AnimationComponent;
/** A spring with snappy feel (higher damping). */
declare function Snappy(options?: SnappyAnimationOptions): AnimationComponent;

interface Spring extends SpringAnimationOptions { }

type SpringAnimationOptions = {
    /** Duration of the spring's settle time. Default: 0.55. */
    response?: number;
    /** 0 = no damping (infinite oscillation), 1 = critical damping (no bounce). Default: 0.825. */
    dampingFraction?: number;
    /** Duration for blending between animations. */
    blendDuration?: number;
};

interface InterpolatingSpring extends InterpolatingSpringAnimationOptions { }

type InterpolatingSpringAnimationOptions = {
    /** Spring stiffness coefficient. Higher = faster. */
    stiffness: number;
    /** Damping coefficient. Higher = less bounce. */
    damping: number;
    /** Mass of the spring. Higher = slower, more momentum. */
    mass: number;
};

interface Snappy extends SnappyAnimationOptions { }

type SnappyAnimationOptions = {
    response?: number;
    dampingFraction?: number;
    blendDuration?: number;
};

interface Bouncy extends BouncyAnimationOptions { }

type BouncyAnimationOptions = {
    duration?: number;
    /** Extra bounce amount (0 = no extra bounce, 1 = very bouncy). */
    extraBounce?: number;
};

interface EaseIn extends EaseAnimationOptions { }
interface EaseOut extends EaseAnimationOptions { }
interface EaseInOut extends EaseAnimationOptions { }
interface Linear extends EaseAnimationOptions { }

type EaseAnimationOptions = {
    /** Animation duration in seconds. */
    duration?: number;
};

type AnimationOption = Spring | InterpolatingSpring | EaseIn | EaseInOut | EaseOut | Bouncy | Snappy | Linear;

// =============================================================================
// MARK: - Environment
// =============================================================================

/** Environment values available to all components via `useEnvironment()`. */
interface EnvironmentValues {
    /** The current appearance mode. */
    colorScheme: "light" | "dark";
    /** The display pixel density (e.g. 2.0 for high-density displays). */
    displayScale: number;
    /** The user's preferred text size setting. */
    dynamicTypeSize: DynamicTypeSize;
    /** The current locale identifier (e.g. "en_US"). */
    locale: string;
    /** Text layout direction. */
    layoutDirection: LayoutDirection;
    /** Screen dimensions in points. */
    screen: { width: number; height: number; };
    /** The current platform (e.g. "iOS", "web"). */
    platform?: string;
    /** Opens a URL using the platform's default handler. */
    openURL: (url: string, resultCallback?: (success: boolean) => void) => void;
    /** Custom environment values set via `.environment()`. */
    [key: string]: any;
}

// =============================================================================
// MARK: - Component Interface
// =============================================================================

/** Picker display styles. */
type PickerStyle = "automatic" | "segmented" | "inline" | "menu" | "navigationlink" | "palette" | "radiogroup" | "wheel";

/** Builder for chaining visual effects in the `.visualEffect()` modifier. */
type VisualEffectBuilder = {
    blur(radius: number): VisualEffectBuilder;
    opacity(amount: number): VisualEffectBuilder;
    offset({ x, y }: { x: number; y: number }): VisualEffectBuilder;
    scale(value: number): VisualEffectBuilder;
    scale({ x, y }: { x: number; y: number }): VisualEffectBuilder;
    transform(matrix: { a: number; b: number; c: number; d: number; tx: number; ty: number }): VisualEffectBuilder;
    translation({ x, y }: { x: number; y: number }): VisualEffectBuilder;
    rotation(degrees: number): VisualEffectBuilder;
    rotation({ degrees }: { degrees: number }): VisualEffectBuilder;
    rotation({ radians }: { radians: number }): VisualEffectBuilder;
};

/** A rectangle with computed origin, size, and midpoint properties. */
interface GeometryRect {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    midX: number;
    midY: number;
}

/**
 * Coordinate space for geometry calculations.
 * - `"global"` — relative to the screen
 * - `"local"` — relative to the component itself
 * - `"scrollView"` — relative to the nearest scroll view
 * - Any custom string registered via `.coordinateSpace()`
 */
type CoordinateSpace = 'global' | 'local' | 'scrollView' | 'scrollView.horizontal' | 'scrollView.vertical' | string;

/** Provides layout information about a component's container. Received in `GeometryReader` and `.visualEffect()`. */
interface GeometryProxy {
    /** The container's size in points. */
    size: {
        width: number;
        height: number;
    };

    /** Safe area insets of the container. */
    safeAreaInsets: {
        top: number;
        leading: number;
        bottom: number;
        trailing: number;
    };

    /** Corner insets for rounded container shapes (e.g. device corners). */
    containerCornerInsets?: {
        topLeading: { width: number; height: number };
        topTrailing: { width: number; height: number };
        bottomLeading: { width: number; height: number };
        bottomTrailing: { width: number; height: number };
    };

    /** Returns the frame rectangle in the given coordinate space. */
    frame(coordinateSpace: CoordinateSpace): GeometryRect;

    /** Returns the bounds of a named coordinate space, or `{}` if unavailable. */
    bounds(coordinateSpace: CoordinateSpace): GeometryRect | {};
}

// =============================================================================
// MARK: - Charts
// =============================================================================

type ChartValue = string | number | boolean;
type ChartAxisValue = string | number;
type ChartChannelInput = ChartValue | { value: ChartValue; label?: string };
type ChartStacking = "standard" | "unstacked";
type ChartInterpolationMethod = "linear" | "monotone" | "cardinal" | "catmullRom" | "stepStart" | "stepCenter" | "stepEnd";
type ChartSymbolName = "circle" | "square" | "diamond" | "triangle" | "plus" | "cross";
type ChartForegroundStyleInput = string | Color | { color?: string | Color; by?: ChartChannelInput };
type ChartForegroundStyleScale = Record<string, string | Color>;
type ChartSymbolScale = Record<string, ChartSymbolName>;
type ChartAnnotationOptions = string | { text: string; position?: "top" | "bottom" | "leading" | "trailing" | "center" };
type ChartValueFormatter =
    | { style: "number"; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: "percent"; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: "currency"; currency: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
    | { style: "date"; dateStyle?: string; timeStyle?: string };
type ChartSelectionOptions = {
    value?: ChartAxisValue | null;
    onChange?: (value: ChartAxisValue | null) => void;
    onChangeId?: string;
};
type PieSelectionOptions = {
    value?: string | null;
    onChange?: (value: string | null) => void;
    onChangeId?: string;
};

interface ChartProps { }
interface PieChartProps {
    /** Normalized donut hole radius from 0 to 1. Omit or use 0 for a full pie. */
    innerRadius?: number;
}
interface ChartMarkProps {
    id?: string;
    x?: ChartChannelInput;
    y?: ChartChannelInput;
    x2?: ChartChannelInput;
    y2?: ChartChannelInput;
    stacking?: ChartStacking;
}
interface ChartRuleMarkProps {
    id?: string;
    x?: ChartChannelInput;
    y?: ChartChannelInput;
}
interface ChartRectangleMarkProps {
    id?: string;
    x: ChartChannelInput;
    y: ChartChannelInput;
    x2?: ChartChannelInput;
    y2?: ChartChannelInput;
}
interface PieSliceMarkProps {
    id?: string;
    value: number;
    label?: string;
}
interface ChartLineStyleOptions {
    width?: number;
    dash?: number[];
}
interface ChartAxisOptions {
    hidden?: boolean;
    visibility?: "automatic" | "visible" | "hidden";
    values?: "automatic" | ChartAxisValue[];
    position?: "bottom" | "top" | "leading" | "trailing";
    label?: string;
    labelsHidden?: boolean;
    ticksHidden?: boolean;
    gridHidden?: boolean;
    formatter?: ChartValueFormatter;
}
interface ChartScaleOptions {
    type?: "linear" | "date" | "category";
    domain?: ChartAxisValue[];
}
interface ChartLegendOptions {
    hidden?: boolean;
    visibility?: "automatic" | "visible" | "hidden";
    position?: string;
}

/**
 * The base type for all BindJS UI elements. Components are created by calling
 * view functions (e.g. `Text()`, `VStack()`) and customized by chaining modifiers.
 *
 * ```js
 * Text("Hello")
 *   .font("title")
 *   .foregroundStyle(Color("blue"))
 *   .padding(16)
 * ```
 */
interface Component {
    /** Call signature — components are callable for composition. */
    (): Component;

    /** Sets a stable identity for diffing and animations. */
    id(value: string | number): Component;

    /**
     * Sets a tag value for identifying this component in selection contexts (e.g. Picker).
     *
     * ```js
     * Picker("Size", selection, [
     *   Text("Small").tag("s"),
     *   Text("Medium").tag("m"),
     *   Text("Large").tag("l")
     * ])
     * ```
     */
    tag(value: any): Component;

    /**
     * Sets a display name for a component preview.
     *
     * ```js
     * const previews = [
     *   Self({ variant: "primary" }).previewName("Primary"),
     *   Self({ variant: "destructive" }).previewName("Destructive")
     * ]
     * ```
     */
    previewName(name: string): Component;

    // -- Lifecycle --

    /**
     * Runs an action when the component first appears on screen. The
     * canonical place for fetch-on-mount — see `useMCPHost` for the
     * combined pattern with `useState`.
     */
    onAppear(action: () => void): Component;
    /** Runs an action when the component is removed from the screen. */
    onDisappear(action: () => void): Component;

    // -- Environment --

    /**
     * Sets a value in this component's environment, inherited by all descendants.
     *
     * ```js
     * VStack([...]).environment("colorScheme", "dark")
     * ```
     */
    environment<K extends keyof EnvironmentValues>(key: K, value: EnvironmentValues[K]): Component;

    // -- Layout --

    /**
     * Sets an exact frame size. Use for fixed-size components.
     *
     * ```js
     * Color("blue").frame({ width: 100, height: 100 })
     * ```
     */
    frame(props: { width?: number; height?: number; alignment?: Alignment }): Component;
    /**
     * Sets flexible frame constraints with min/ideal/max dimensions.
     *
     * ```js
     * Text("Flexible").frame({ maxWidth: Infinity, alignment: "leading" })
     * ```
     */
    frame(props: { minWidth?: number; idealWidth?: number; maxWidth?: number; minHeight?: number; idealHeight?: number; maxHeight?: number; alignment?: Alignment }): Component;
    /**
     * Sizes the component relative to its nearest container.
     *
     * Simple form — fills the container along the given axes:
     * ```js
     * Color("blue").containerRelativeFrame("horizontal")
     * ```
     *
     * Grid form — divides the container into `count` columns/rows
     * with `spacing` between them, and this view spans `span` of them:
     * ```js
     * Image(url)
     *   .containerRelativeFrame({
     *     axes: "horizontal",
     *     count: 3,
     *     span: 2,
     *     spacing: 8
     *   })
     * ```
     *
     * Fractional form — sizes to a fraction of the container:
     * ```js
     * Text("80%").containerRelativeFrame({
     *   axes: "horizontal",
     *   fraction: 0.8
     * })
     * ```
     */
    containerRelativeFrame(axes: Axis): Component;
    containerRelativeFrame(props: { axes?: Axis; alignment?: Alignment; count: number; span?: number; spacing: number }): Component;
    containerRelativeFrame(props: { axes?: Axis; alignment?: Alignment; fraction: number }): Component;

    /**
     * Adds padding around the component.
     *
     * ```js
     * Text("Padded").padding(16)
     * Text("Horizontal only").padding("horizontal", 20)
     * ```
     */
    padding(edges?: EdgeSet, length?: number): Component;
    padding(length: number): Component;
    /** Offsets the component's position without affecting layout. */
    offset(_: { x?: number; y?: number }): Component;
    /** Controls stacking order in a ZStack. Higher values render on top. */
    zIndex(_: number): Component;
    /** Scales the component. Accepts a uniform number or per-axis values. */
    scaleEffect(_: { x?: number; y?: number, anchor?: UnitPoint } | number): Component;
    /** Rotates the component. Accepts degrees as a number or object. */
    rotationEffect(_: { degrees: number, anchor?: UnitPoint } | number): Component;
    /** Applies a 2D affine transform matrix. */
    transformEffect(_: { a: number; b: number; c: number; d: number; tx: number; ty: number }): Component;

    // -- Appearance --

    /** Sets the component's opacity (0 = invisible, 1 = fully opaque). */
    opacity(_: number): Component;

    /**
     * Sets the foreground style (text color, shape fill, etc.).
     * Accepts a Color, Gradient, or Material.
     *
     * ```js
     * Text("Blue text").foregroundStyle(Color("blue"))
     * Text("Gradient").foregroundStyle(LinearGradient({ colors: ["red", "blue"] }))
     * ```
     */
    foregroundStyle(_: Style): Component;
    /** Chart mark color or series binding. Valid on chart marks inside Chart. */
    foregroundStyle(_: ChartForegroundStyleInput): Component;
    /** Chart mark line width/dash. Valid on line, area, and rule marks inside Chart. */
    lineStyle(_: ChartLineStyleOptions): Component;
    /** Chart mark interpolation method. Valid on line and area marks inside Chart. */
    interpolationMethod(_: ChartInterpolationMethod): Component;
    /** Chart mark symbol. Valid on point marks inside Chart. */
    symbol(_: ChartSymbolName): Component;
    /** Chart mark symbol size. Valid on point marks inside Chart. */
    symbolSize(_: number): Component;
    /** Text annotation attached to a chart mark. */
    annotation(_: ChartAnnotationOptions): Component;

    /** Sets the tint color for interactive controls (buttons, toggles, links, etc.). */
    tint(_: Color): Component;

    /** Sets the picker display style. */
    pickerStyle(_: PickerStyle): Component;

    /** Applies a custom button style. */
    buttonStyle(_: ButtonStyleComponent): Component;

    /**
     * Sets the component's background. Accepts a Color, Gradient, Material, or Component.
     *
     * ```js
     * Text("Hello").background(Color("blue"))
     * Text("Hello").background(Material("thin"))
     * ```
     */
    background(style?: Style): Component;
    /** Adds a badge (count or text) to the component, typically for tab bars or list rows. */
    badge(_: number | string): Component;
    /** Chart x-axis options. Valid on Chart. */
    chartXAxis(_: ChartAxisOptions | "hidden"): Component;
    /** Chart y-axis options. Valid on Chart. */
    chartYAxis(_: ChartAxisOptions | "hidden"): Component;
    /** Chart x-scale options. Valid on Chart. */
    chartXScale(_: ChartScaleOptions): Component;
    /** Chart y-scale options. Valid on Chart. */
    chartYScale(_: ChartScaleOptions): Component;
    /** Maps series values to colors. Valid on Chart. */
    chartForegroundStyleScale(_: ChartForegroundStyleScale): Component;
    /** Enables slice selection. Valid on PieChart. */
    chartSelection(_: PieSelectionOptions): Component;
    /** Maps series values to finite symbols. Valid on Chart. */
    chartSymbolScale(_: ChartSymbolScale): Component;
    /** Enables x-axis selection. Valid on Chart. */
    chartXSelection(_: ChartSelectionOptions): Component;
    /** Enables y-axis selection. Valid on Chart. */
    chartYSelection(_: ChartSelectionOptions): Component;
    /** Chart legend options. Valid on Chart. */
    chartLegend(_: ChartLegendOptions | "hidden"): Component;
    /** Chart x-axis label. Valid on Chart. */
    chartXAxisLabel(_: string): Component;
    /** Chart y-axis label. Valid on Chart. */
    chartYAxisLabel(_: string): Component;
    /** Adds a border. Accepts a style with width, or just a color. */
    border(_?: { style: Style; width?: number; } | Style | number): Component;
    /** Rounds the component's corners. */
    cornerRadius(_: number): Component;
    /** Adds a drop shadow. */
    shadow(props?: { radius: number; x?: number; y?: number, color?: Color | ColorProps }): Component;
    /** Applies a Gaussian blur. */
    blur(radius: number): Component;
    /** Adjusts color saturation (0 = grayscale, 1 = original, >1 = oversaturated). */
    saturation(_: number): Component;
    /** Adjusts brightness (-1 to 1, where 0 is original). */
    brightness(_: number): Component;
    /** Adjusts contrast (0 = flat gray, 1 = original, >1 = higher contrast). */
    contrast(_: number): Component;
    /** Applies a grayscale filter (0 = full color, 1 = fully desaturated). */
    grayscale(_?: number): Component;
    /** Sets the blend mode for compositing with content behind this component. */
    blendMode(_: BlendMode): Component;
    /**
     * Controls how content changes are animated within a view.
     *
     * ```js
     * Text(String(count)).contentTransition("numericText")
     * ```
     */
    contentTransition(_: ContentTransitionType | { countsDown: boolean }): Component;
    /** Inverts all colors in the component. */
    colorInvert(): Component;
    /** Applies a Liquid Glass visual effect. */
    glassEffect(style?: string | { interactive?: boolean; tint?: Color }): Component;

    /** Forces a specific color scheme for this component subtree. */
    colorScheme(_: "light" | "dark"): Component;
    /**
     * Overrides the dynamic type size for this component subtree.
     * Default: "large".
     */
    dynamicTypeSize(_: DynamicTypeSize): Component;

    // -- Typography --

    /**
     * Sets the font. Accepts a semantic text style name, a point size number, or a CustomFont.
     *
     * ```js
     * Text("Title").font("title")
     * Text("Custom size").font(24)
     * Text("Custom font").font(CustomFont({ url: "...", family: "Inter", size: 16 }))
     * ```
     */
    font(_?: TextStyle | number | CustomFont): Component;
    /** Sets the font weight (e.g. "bold", "semibold", "light"). */
    fontWeight(_: FontWeight): Component;
    /** Sets the font design (e.g. "rounded", "monospaced", "serif"). */
    fontDesign(_: FontDesign): Component;
    /** Sets the font width (e.g. "condensed", "expanded"). */
    fontWidth(_: FontWidth): Component;
    /**
     * Limits text to a maximum number of lines. Excess text is truncated with an ellipsis.
     *
     * ```js
     * Text("Long text...").lineLimit(2)
     * ```
     */
    lineLimit(_?: number): Component;
    /** Sets horizontal text alignment within the component's frame. */
    multilineTextAlignment(_: TextAlignment): Component;
    /** Makes text bold. Pass `false` to disable. */
    bold(isActive?: boolean): Component;
    /** Makes text italic. Pass `false` to disable. */
    italic(isActive?: boolean): Component;
    /** Adds a strikethrough to text. */
    strikethrough(isActive?: boolean): Component;
    /** Adds an underline to text. */
    underline(isActive?: boolean): Component;
    /** Uses a monospaced font variant. */
    monospaced(isActive?: boolean): Component;
    /**
     * Adjusts letter spacing in milli-em units (1000 = 1em).
     *
     * ```js
     * Text("SPACED").tracking(500) // 0.5em letter spacing
     * ```
     */
    tracking(_: MilliEm): Component;
    /** Adjusts spacing between lines of text (in points). */
    lineSpacing(_: number): Component;
    /** Transforms text case: "uppercase" or "lowercase". */
    textCase(_: TextCase): Component;

    // -- Sizing --

    /**
     * Prevents the component from resizing along specified axes, using its ideal size instead.
     *
     * ```js
     * Text("Won't wrap").fixedSize({ horizontal: true, vertical: false })
     * ```
     */
    fixedSize(_: { horizontal?: boolean; vertical?: boolean }): Component;

    /**
     * Sets the aspect ratio for the component's content.
     *
     * ```js
     * Image({ url: "photo.jpg" }).resizable().aspectRatio(16/9, "fit")
     * ```
     *
     * @param aspectRatio The width-to-height ratio (e.g. 1.0 for square). Omit to use the content's intrinsic ratio.
     * @param contentMode How content fills the frame: "fit" (letterbox) or "fill" (crop).
     */
    aspectRatio(aspectRatio?: number, contentMode?: "fit" | "fill"): Component;

    /** Scales the content to fit within the frame, preserving aspect ratio. May letterbox. */
    scaledToFit(): Component;

    /** Scales the content to fill the frame, preserving aspect ratio. May crop. */
    scaledToFill(): Component;

    /**
     * The minimum scale factor for text before it truncates (0 to 1).
     *
     * ```js
     * Text("Auto-shrink").minimumScaleFactor(0.5) // Can shrink to 50%
     * ```
     */
    minimumScaleFactor(_: number): Component;

    /** Allows text to tighten character spacing to fit available space before truncating. */
    allowsTightening(isEnabled?: boolean): Component;

    /**
     * Sets layout priority. Higher values get preference for available space.
     * Default: 0.
     */
    layoutPriority(_: number): Component;

    // -- Overlays & Backgrounds --

    /** Layers content on top of this component. */
    overlay(content: Component): Component;
    /** Layers content on top with specific alignment. */
    overlay(props: { alignment: Alignment }, content: Component): Component;

    /**
     * Adds content to the safe area, pushing the main content inward.
     * Use for floating bottom bars, persistent toolbars, or banner overlays.
     */
    safeAreaInset(props: { edge: "top" | "bottom"; alignment?: "leading" | "center" | "trailing"; spacing?: number }, content: Component): Component;

    /** Sets a component as the background. */
    background(content: Component): Component;
    /** Sets a component as the background with specific alignment. */
    background(props: { alignment: Alignment }, content: Component): Component;

    // -- Clipping & Masking --

    /** Clips content to the component's bounds. */
    clipped(): Component;
    /**
     * Clips to a specific shape.
     *
     * ```js
     * Image({ url: "photo.jpg" }).clipShape(Circle())
     * ```
     */
    clipShape(_: Shape): Component;
    /**
     * Masks the component using an image. White areas show content, black areas hide it.
     */
    mask(image: Image): Component;
    /** Defines the hit-testing shape for tap gestures. */
    contentShape(_: Shape): Component;

    // -- Visibility & Interaction --

    /** Hides the component while preserving its layout space. */
    hidden(): Component;
    /** Controls whether the component receives touch/click events. */
    allowsHitTesting(_: boolean): Component;
    /** Disables interaction and dims the component. */
    disabled(_: boolean): Component;

    // -- Gestures --

    /** Runs an action on tap, with the tap location in the component's coordinate space. */
    onTapGesture(action: (locationInView: Point) => void): Component;
    /** Runs an action after the specified number of taps. */
    onTapGesture(props: { count: number }, action: (locationInView: Point) => void): Component;

    /** Tracks drag gestures with translation and velocity. */
    onDragGesture(action: (state: DragGestureState) => void): Component;
    onDragGesture(props: { minimumDistance?: number }, action: (state: DragGestureState) => void): Component;

    /** Tracks long press gestures. */
    onLongPressGesture(action: (state: GestureState) => void): Component;
    onLongPressGesture(props: { minimumDuration?: number; maximumDistance?: number }, action: (state: GestureState) => void): Component;

    /**
     * Fires when the pointer hovers over or leaves this component.
     *
     * ```js
     * Text("Hover me").onHover((isHovering) => setHovered(isHovering))
     * ```
     */
    onHover(action: (isHovering: boolean) => void): Component;

    // -- Visual Effects --

    /**
     * Applies geometry-aware visual effects using a builder pattern.
     *
     * ```js
     * Text("Scroll effect")
     *   .visualEffect((builder, proxy) =>
     *     builder
     *       .opacity(proxy.frame("scrollView").minY > 0 ? 1 : 0.5)
     *       .scale(0.8)
     *   )
     * ```
     */
    visualEffect(callback: (builder: VisualEffectBuilder, proxy: GeometryProxy) => VisualEffectBuilder): Component;

    /**
     * Assigns a named coordinate space for geometry calculations.
     * Other components can reference this name in `GeometryProxy.frame()`.
     */
    coordinateSpace(name: string): Component;

    // -- Presentation --

    /**
     * Presents a modal sheet.
     *
     * ```js
     * const [showSheet, setShowSheet] = useState(false)
     * VStack([
     *   Button("Open", () => setShowSheet(true))
     * ]).sheet({
     *   isPresented: showSheet,
     *   setIsPresented: setShowSheet,
     *   content: () => Text("Sheet content")
     * })
     * ```
     */
    sheet(props: { isPresented: boolean, setIsPresented: (value: boolean) => void, content: () => Component, onDismiss?: () => void }): Component;

    /** Presents a full-screen modal cover. Same API as `.sheet()`. */
    fullScreenCover(props: { isPresented: boolean, setIsPresented: (value: boolean) => void, content: () => Component, onDismiss?: () => void }): Component;

    /**
     * Wraps child views in a full-screen photo gallery with swipe paging.
     * Children register as gallery items via `.galleryItem(id)`.
     */
    gallery(detail: (id: string) => Component): Component;
    gallery(options: { zoomEnabled?: boolean }, detail: (id: string) => Component): Component;

    /** Registers this component as a gallery item. Must be inside a `.gallery()` modifier. */
    galleryItem(id: string): Component;

    /**
     * Programmatic navigation destination. Presents a view when `isPresented` becomes true.
     *
     * ```js
     * VStack([
     *   Button("Details", () => setShowDetail(true))
     * ]).navigationDestination({
     *   isPresented: showDetail,
     *   setIsPresented: setShowDetail,
     *   destination: () => DetailView()
     * })
     * ```
     */
    navigationDestination(props: { isPresented: boolean, setIsPresented: (value: boolean) => void, destination: () => Component }): Component;

    /** Sets the available sheet size detents (snap points). */
    presentationDetents(detents: PresentationDetents): Component;

    /** Presents a Quick Look preview for a file URL. */
    quickLookPreview(props: { url?: string; setURL?: (url: string | null) => void; urls?: string[]; onLoadingChanged?: (isLoading: boolean) => void }): Component;

    // -- Lists & Scroll Views --

    /** Controls the visibility of the scroll content background (e.g. list background). */
    scrollContentBackground(_: 'hidden' | 'visible'): Component;

    /** Sets the list style. */
    listStyle(_: 'automatic' | 'plain' | 'insetGrouped' | 'grouped' | 'inset' | 'sidebar'): Component;

    /** Sets the background view for a list row. Apply to content inside a List's ForEach. */
    listRowBackground(content: Component): Component;

    /** Controls list row separator visibility. */
    listRowSeparator(_: 'hidden' | 'visible'): Component;

    /**
     * Marks this container's children as scroll snap targets.
     * Use with `.scrollTargetBehavior()` on the parent ScrollView.
     *
     * ```js
     * ScrollView({ axis: "horizontal" }, [
     *   HStack({ spacing: 16 }, items.map(Card)).scrollTargetLayout()
     * ]).scrollTargetBehavior("viewAligned")
     * ```
     */
    scrollTargetLayout(isEnabled?: boolean): Component;

    /**
     * Sets scroll snapping behavior.
     * - `"viewAligned"` — snaps to child views marked with `.scrollTargetLayout()`
     * - `"paging"` — snaps to page boundaries
     */
    scrollTargetBehavior(_: 'viewAligned' | 'paging'): Component;

    /**
     * Tracks and controls scroll position by child view ID.
     *
     * ```js
     * const [scrollId, setScrollId] = useState(null)
     * ScrollView([
     *   ForEach(items, (item) => Text(item.name).id(item.id))
     * ]).scrollPosition({ id: scrollId, setId: setScrollId })
     * ```
     */
    scrollPosition(props: { id: string | null, setId: (value: string | null) => void }): Component;

    /** Hides the scroll edge bounce/stretch effect. */
    scrollEdgeEffectHidden(isHidden?: boolean): Component;

    /**
     * Sets the scroll edge effect style.
     *
     * @param style The edge effect style: "automatic", "soft" (subtle), or "hard" (sharp).
     * @param edges Which edges to apply the style to. Default: all edges.
     */
    scrollEdgeEffectStyle(props: { style?: "automatic" | "soft" | "hard"; edges?: EdgeSet }): Component;

    /**
     * Controls scroll indicator visibility.
     *
     * ```js
     * ScrollView([content]).scrollIndicators("hidden")
     * ScrollView([content]).scrollIndicators({
     *   visibility: "hidden",
     *   axes: "vertical"
     * })
     * ```
     *
     * @param visibility `"automatic"` (default), `"visible"`, `"hidden"`, or `"never"`.
     */
    scrollIndicators(visibility: 'automatic' | 'visible' | 'hidden' | 'never'): Component;
    scrollIndicators(props: { visibility?: 'automatic' | 'visible' | 'hidden' | 'never'; axes?: Axis }): Component;

    // -- Navigation & Toolbars --

    /** Sets the navigation bar title. */
    navigationTitle(_: string): Component;

    /** Hides the navigation back button. Defaults to true. */
    navigationBarBackButtonHidden(isHidden?: boolean): Component;

    /**
     * Sets the navigation bar title display mode.
     * - `"large"` — large, scrollable title
     * - `"inline"` — small, centered title
     * - `"automatic"` — inherits from the navigation context
     */
    navigationBarTitleDisplayMode(_: "large" | "inline" | "automatic"): Component;

    /** Populates the toolbar with items. */
    toolbar(content: ToolbarItem | ToolbarItemGroup | Group | (ToolbarItem | ToolbarItemGroup)[]): Component;

    /**
     * Controls visibility of system toolbars.
     *
     * @param visibility Whether the toolbar is visible, hidden, or automatic.
     * @param bars Which toolbars to affect (e.g. "navigationBar", "tabBar", "bottomBar"). Omit for all.
     */
    toolbarVisibility(visibility: "visible" | "hidden" | "automatic", bars?: ToolbarBarPlacement | ToolbarBarPlacement[]): Component;

    /** Adds a context menu shown on long press or right click. */
    contextMenu(content: Component | Component[]): Component;

    // -- Safe Area --

    /**
     * Extends the component into safe area regions.
     *
     * ```js
     * Color("blue").ignoresSafeArea("all", "all")
     * ```
     */
    ignoresSafeArea(regions?: SafeAreaRegions, edges?: EdgeSet): Component;

    // -- Grid Layout --

    /**
     * Makes a grid cell span multiple columns.
     *
     * ```js
     * GridRow([
     *   Text("Full width").gridCellColumns(3)
     * ])
     * ```
     */
    gridCellColumns(count: number): Component;

    /** Sets the anchor position for a grid cell within its allocated space. */
    gridCellAnchor(anchor: UnitPoint): Component;

    /** Overrides the horizontal alignment for an entire grid column. */
    gridColumnAlignment(guide: HorizontalAlignment): Component;

    /**
     * Opts a grid cell out of being sized along specified axes, using its ideal size instead.
     */
    gridCellUnsizedAxes(axes: Axis): Component;

    // -- Controls --

    /** Sets the size for controls like ProgressView. */
    controlSize(_: 'mini' | 'small' | 'regular' | 'large' | 'extraLarge'): Component;

    /** Enables or disables user text selection. */
    textSelection(_: 'enabled' | 'disabled'): Component;

    // -- Text Input --

    /** Sets the keyboard type for text input fields. */
    keyboardType(type: "default" | "asciiCapable" | "numbersAndPunctuation" | "URL" | "numberPad" | "phonePad" | "namePhonePad" | "emailAddress" | "decimalPad" | "twitter" | "webSearch" | "asciiCapableNumberPad"): Component;

    /**
     * Binds focus state for programmatic focus control.
     *
     * ```js
     * const [focused, setFocused] = useState(false)
     * TextField({ text, setText }).focused({ isFocused: focused, setIsFocused: setFocused })
     * ```
     */
    focused(props: { isFocused: boolean, setIsFocused: (value: boolean) => void }): Component;

    /** Runs an action when the user submits the text field (e.g. presses Return). */
    onSubmit(action: () => void): Component;

    /** Sets the text field visual style. */
    textFieldStyle(style: "roundedBorder" | "plain" | "automatic"): Component;

    /** Sets the keyboard return key label. */
    submitLabel(label: "done" | "go" | "send" | "join" | "route" | "search" | "next" | "continue" | "return"): Component;

    /**
     * Applies an animation to the component that triggers when the given value changes.
     *
     * This is the implicit animation modifier — the primary way to animate view changes in response
     * to state changes. When the observed value changes, SwiftUI animates any view properties that
     * depend on it using the specified animation curve.
     *
     * Pass `null` as the animation to explicitly disable animations for a value change.
     *
     * ```
     * const [expanded, setExpanded] = useState(false)
     * return Button("Toggle", () => setExpanded(!expanded))
     *   .frame({ width: expanded ? 200 : 100, height: 50 })
     *   .animation({
     *     animation: Spring({ response: 0.5 }),
     *     value: expanded,
     *   })
     * ```
     *
     * @param props.animation The animation to apply, or null to disable animations.
     * @param props.value The value to observe — animation triggers when this changes.
     * @returns A component with the animation applied.
     */
    animation(props: { animation: AnimationOption | AnimationComponent | null; value: string | number | boolean }): Component;

    /** Disables autocorrection for text input. */
    autocorrectionDisabled(isDisabled?: boolean): Component;

    // -- Value Observation --

    /**
     * Runs an action when a value changes. The callback receives `[newValue, oldValue]`.
     *
     * ```js
     * Text(name).onChange(name, ([newVal, oldVal]) => {
     *   console.log(`Changed from ${oldVal} to ${newVal}`)
     * })
     * ```
     */
    onChange<V>(value: V, action: (values: [V, V]) => void): Component;

    // -- Accessibility --

    /** Sets the VoiceOver label. */
    accessibilityLabel(_: string): Component;
    /** Sets a VoiceOver hint describing the result of interacting. */
    accessibilityHint(_: string): Component;
    /** Sets the current accessibility value (e.g. "50%" for a slider). */
    accessibilityValue(_: string): Component;
    /** Provides an alternative accessibility representation of this component. */
    accessibilityRepresentation(content: Component): Component;
    /** Hides the component from assistive technologies. */
    accessibilityHidden(isHidden?: boolean): Component;
    /** Adds accessibility traits (e.g. "isButton", "isHeader"). */
    accessibilityAddTraits(_: AccessibilityTraits | AccessibilityTraits[]): Component;
    /** Removes default accessibility traits. */
    accessibilityRemoveTraits(_: AccessibilityTraits | AccessibilityTraits[]): Component;

    // -- Transitions & Feedback --

    /**
     * Sets the insertion/removal transition animation.
     *
     * ```js
     * if (isVisible) Text("Hello").transition("opacity")
     * Text("Slide").transition({ move: "bottom" })
     * Text("Complex").transition({ asymmetric: { insertion: "slide", removal: "opacity" } })
     * ```
     */
    transition(_:
        | "opacity" | "slide" | "scale" | "identity" | "blurReplace"
        | { move: "top" | "bottom" | "leading" | "trailing" }
        | { push: "top" | "bottom" | "leading" | "trailing" }
        | { scale: number; anchor?: UnitPoint }
        | { offset: { x?: number; y?: number } }
        | { blurReplace: "downUp" | "upUp" }
        | { asymmetric: { insertion: SimpleTransition; removal: SimpleTransition } }
        | { combined: SimpleTransition[] }
    ): Component;

    /** Triggers haptic feedback when the trigger value changes. */
    sensoryFeedback(props: { feedback: "impact" | "selection" | "success" | "warning" | "error" | "light" | "medium" | "heavy" | "increase" | "decrease"; trigger: any }): Component;
}

// =============================================================================
// MARK: - Layout Components
// =============================================================================

/**
 * Iterates over data to produce components. Each item produces one child component.
 *
 * ```js
 * ForEach(items, (item, index) => Text(item.name))
 * ```
 *
 * Can also iterate over subviews for view decomposition:
 * ```js
 * ForEach(subviews, ({ subview }) => subview.padding(8))
 * ```
 */
declare function ForEach<T>(data: T[], content: (item: T, index: number) => Component): Component;
declare function ForEach<T>(subviews: Component, content: ({ subview: T }) => Component): Component;

/**
 * Groups multiple components without adding layout. Useful for conditional rendering
 * or applying modifiers to multiple components at once.
 *
 * With a `subviews` transform, enables view decomposition — inspecting and rearranging children:
 * ```js
 * Group(VStack([a, b, c]), (subviews) =>
 *   HStack([subviews[0], Spacer(), subviews[1]])
 * )
 * ```
 */
interface Group extends Component { }
declare function Group(children: Component): Group;
declare function Group(children: Component[]): Group;
declare function Group(subviews: Component, transform: (subviews: Component[]) => Component): Group;

/**
 * Vertical stack — arranges children top to bottom.
 *
 * ```js
 * VStack({ spacing: 8, alignment: "leading" }, [
 *   Text("Title").font("headline"),
 *   Text("Subtitle").foregroundStyle(Color("secondary"))
 * ])
 * ```
 */
declare function VStack(children: Component): Component;
declare function VStack(children: Component[]): Component;
declare function VStack(props: { spacing?: number, alignment?: HorizontalAlignment }, children: Component[]): Component;

/**
 * Horizontal stack — arranges children leading to trailing.
 *
 * ```js
 * HStack({ spacing: 12 }, [
 *   Image({ systemName: "star.fill" }),
 *   Text("Favorites")
 * ])
 * ```
 */
declare function HStack(children: Component): Component;
declare function HStack(children: Component[]): Component;
declare function HStack(props: { spacing?: number, alignment?: VerticalAlignment }, children: Component[]): Component;

/** Lazy vertical stack — only renders visible children. Use inside ScrollView for large lists. */
declare function LazyVStack(children: Component): Component;
declare function LazyVStack(children: Component[]): Component;
declare function LazyVStack(props: { spacing?: number, alignment?: HorizontalAlignment, pinnedViews?: PinnedScrollableViews }, children: Component[]): Component;

/** Lazy horizontal stack — only renders visible children. Use inside ScrollView for large lists. */
declare function LazyHStack(children: Component): Component;
declare function LazyHStack(children: Component[]): Component;
declare function LazyHStack(props: { spacing?: number, alignment?: VerticalAlignment, pinnedViews?: PinnedScrollableViews }, children: Component[]): Component;

/**
 * Overlay stack — layers children on top of each other. Last child renders on top.
 *
 * ```js
 * ZStack({ alignment: "bottomTrailing" }, [
 *   Image({ url: "photo.jpg" }),
 *   Text("Caption").padding(8)
 * ])
 * ```
 */
declare function ZStack(children: Component): Component;
declare function ZStack(children: Component[]): Component;
declare function ZStack(props: { alignment?: Alignment }, children: Component[]): Component;

/**
 * Two-dimensional grid layout. Children are aligned in rows and columns.
 *
 * ```js
 * Grid({ horizontalSpacing: 12, verticalSpacing: 8 }, [
 *   GridRow([Text("Name"), Text("Value")]),
 *   GridRow([Text("Width"), Text("100")]),
 * ])
 * ```
 */
declare function Grid(children: Component[]): Component;
declare function Grid(props: { alignment?: Alignment; horizontalSpacing?: number; verticalSpacing?: number }, children: Component[]): Component;

/**
 * A row within a Grid. Each child becomes a cell aligned with corresponding columns.
 *
 * ```js
 * GridRow({ alignment: "top" }, [
 *   Text("Cell 1"),
 *   Text("Cell 2").gridCellColumns(2) // spans 2 columns
 * ])
 * ```
 */
declare function GridRow(children: Component[]): Component;
declare function GridRow(props: { alignment?: VerticalAlignment }, children: Component[]): Component;

/**
 * Groups content with an optional header and footer. Used inside List and Form.
 *
 * ```js
 * Section({ header: Text("Settings") }, [
 *   Toggle({ label: "Dark Mode", isOn, setIsOn })
 * ])
 * ```
 */
declare function Section(children: Component): Component;
declare function Section(children: Component[]): Component;
declare function Section(props: { header?: Component, footer?: Component }, children: Component[]): Component;

/**
 * A scrollable container.
 *
 * ```js
 * ScrollView({ axis: "horizontal", showsIndicators: false }, [
 *   HStack({ spacing: 16 }, cards)
 * ])
 * ```
 */
declare function ScrollView(children: Component): Component;
declare function ScrollView(children: Component[]): Component;
declare function ScrollView(props: { axis?: Axis, showsIndicators?: boolean }, children: Component[]): Component;

/**
 * Picks the first child that fits in the available space. Useful for adaptive layouts.
 *
 * ```js
 * ViewThatFits([
 *   HStack([icon, label, description]),  // try wide layout first
 *   VStack([icon, label]),               // fall back to narrow layout
 * ])
 * ```
 */
declare function ViewThatFits(children: Component[]): Component;
declare function ViewThatFits(props: { axes?: Axis }, children: Component[]): Component;

/**
 * Provides the parent container's geometry to a content builder function.
 *
 * ```js
 * GeometryReader((geometry) =>
 *   Circle().frame({ width: geometry.size.width * 0.5 })
 * )
 * ```
 */
declare function GeometryReader(content: (geometry: GeometryProxy) => Component): Component;

/**
 * A scrollable list with optional selection tracking.
 *
 * ```js
 * List([
 *   ForEach(items, (item) => Text(item.name))
 * ])
 * ```
 */
type ListProps<V> = { selection: V; setSelection: (value: V) => void };
declare function List<V = string>(props: ListProps<V>, children: Component[]): Component;
declare function List(children: Component[]): Component;

// =============================================================================
// MARK: - Content Components
// =============================================================================

/**
 * Displays text. Supports plain strings and inline markdown.
 *
 * ```js
 * Text("Hello, world!")
 * Text({ markdown: "**Bold** and *italic*" })
 * ```
 */
declare function Text(_: string | { markdown: string }): Component;

/**
 * Renders markdown with full document formatting (headings, paragraphs, lists, code blocks).
 * Use `Text({ markdown })` for inline formatting only.
 *
 * ```js
 * Markdown("# Welcome\n\nThis is a **paragraph** with formatting.")
 * ```
 */
declare function Markdown(_: string): Component;

/** A multi-line text editing area. */
declare function TextEditor(props: { text: string; setText: (text: string) => void }): Component;

/** A single-line text input field. */
declare function TextField(props: { placeholder?: string; text: string; setText: (text: string) => void }): Component;

/** A text input that obscures its contents (for passwords). */
declare function SecureField(props: { placeholder?: string; text: string; setText: (text: string) => void }): Component;

/** A switch control for boolean values. */
declare function Toggle(props: { label?: string; isOn: boolean; setIsOn: (value: boolean) => void }): Component;

/**
 * A slider control for selecting a value from a bounded range.
 *
 * ```js
 * Slider({ value: volume, setValue: setVolume, range: [0, 100] })
 *
 * Slider({
 *   value: position,
 *   setValue: setPosition,
 *   range: [0, 10],
 *   step: 1,
 *   label: "Volume",
 *   minimumValueLabel: Text("0").font("caption"),
 *   maximumValueLabel: Text("10").font("caption"),
 * })
 * ```
 */
declare function Slider(props: {
    /** The current value of the slider. */
    value: number;
    /** Callback invoked when the slider value changes. */
    setValue: (value: number) => void;
    /** The range as [lowerBound, upperBound]. Overrides lowerBound/upperBound if provided. */
    range?: [number, number];
    /** The minimum value of the slider range. Defaults to 0. */
    lowerBound?: number;
    /** The maximum value of the slider range. Defaults to 1. */
    upperBound?: number;
    /** The step increment. When set, the slider snaps to discrete values. */
    step?: number | null;
    /** An accessible label describing the slider's purpose. */
    label?: string;
    /** A component displayed at the minimum end of the slider. */
    minimumValueLabel?: Component;
    /** A component displayed at the maximum end of the slider. */
    maximumValueLabel?: Component;
}): Component;

/**
 * Displays an image from a URL, asset name, system icon, or inline SVG.
 *
 * ```js
 * Image({ url: "https://example.com/photo.jpg" })
 * Image({ systemName: "star.fill" })
 * Image({ name: "hero-image" })  // asset name
 * Image({ svg: "<svg>...</svg>" })
 * ```
 */
declare function Image(_: ImageProps): Image;

/** Plays video from a URL or asset name. */
declare function Video(_: VideoProps): Component;

/** Displays a 3D model from a URL. */
declare function Model3D(_: Model3DProps): Component;

/**
 * Renders a native Cartesian chart from chart marks.
 *
 * ```js
 * Chart({}, [
 *   BarMark({ x: { value: "Jan" }, y: { value: 12 } }),
 *   RuleMark({ y: { value: 10 } }).foregroundStyle(Color("red"))
 * ]).chartYScale({ domain: [0, 20] })
 * ```
 */
declare function Chart(props?: ChartProps, children?: Component[]): Component;
declare function Chart(children: Component[]): Component;
/** Renders a portable pie or donut chart from PieSliceMark children. */
declare function PieChart(props?: PieChartProps, children?: Component[]): Component;
declare function PieChart(children: Component[]): Component;
/** Bar chart mark. Valid only as a child of Chart. */
declare function BarMark(_: ChartMarkProps): Component;
/** Line chart mark. Valid only as a child of Chart. */
declare function LineMark(_: ChartMarkProps): Component;
/** Area chart mark. Valid only as a child of Chart. */
declare function AreaMark(_: ChartMarkProps): Component;
/** Point chart mark. Valid only as a child of Chart. */
declare function PointMark(_: ChartMarkProps): Component;
/** Reference rule mark. Provide exactly one of x or y. */
declare function RuleMark(_: ChartRuleMarkProps): Component;
/** Rectangle/cell chart mark. Valid only as a child of Chart. */
declare function RectangleMark(_: ChartRectangleMarkProps): Component;
/** Pie slice mark. Valid only as a child of PieChart. */
declare function PieSliceMark(_: PieSliceMarkProps): Component;

/**
 * A tappable button.
 *
 * ```js
 * Button("Save", () => handleSave())
 * Button({ action: () => handleSave(), label: HStack([Image({ systemName: "checkmark" }), Text("Save")]) })
 * ```
 */
declare function Button(_: { action: () => void, label: Component }): Component;
declare function Button(label: string, action: () => void): Component;
declare function Button(label: Component, action: () => void): Component;

/**
 * A progress indicator. Indeterminate when no props are given,
 * determinate when `value` is provided.
 *
 * ```js
 * ProgressView()                          // spinning indicator
 * ProgressView({ value: 0.7, total: 1 }) // 70% progress bar
 * ```
 */
declare function ProgressView(props?: { value: number, total?: number }): Component;

/** A flexible space that expands along the major axis of its parent stack. */
declare function Spacer(props?: { minLength: number }): Component;

/** A thin line separator. Horizontal in VStack, vertical in HStack. */
declare function Divider(): Component;

/**
 * A bridge to native platform components. The host app registers native views
 * that are resolved by name at runtime.
 *
 * ```js
 * Placeholder({ name: "MapView", props: { latitude: 37.7749 } }, [
 *   Text("Map not available") // fallback when native component isn't registered
 * ])
 * ```
 */
declare function Placeholder(_: PlaceholderProps, children: Component[]): Component;

/**
 * Embeds another Metabind content item by its content ID, enabling
 * recursive content composition.
 *
 * ```js
 * MetabindView({ contentId: "abc123" })
 * ```
 */
declare function MetabindView(props: { contentId: string }): Component;

// =============================================================================
// MARK: - Navigation
// =============================================================================

/**
 * A container for hierarchical navigation. Manages a navigation stack
 * with push/pop transitions.
 *
 * ```js
 * NavigationStack([
 *   List([
 *     NavigationLink("Settings", () => SettingsView())
 *   ]).navigationTitle("Home")
 * ])
 * ```
 */
declare function NavigationStack(children: Component | Component[]): Component;

/**
 * A control that triggers navigation to a destination view when tapped.
 * Must be inside a NavigationStack.
 *
 * ```js
 * NavigationLink("Details", () => DetailView({ id: item.id }))
 * NavigationLink(Label({ title: "Settings", systemImage: "gear" }), () => SettingsView())
 * ```
 */
declare function NavigationLink(_: { destination: () => Component, label: Component }): Component;
declare function NavigationLink(label: string, destination: () => Component): Component;
declare function NavigationLink(label: Component, destination: () => Component): Component;

// =============================================================================
// MARK: - Menus & Labels
// =============================================================================

/**
 * A dropdown menu of actions.
 *
 * ```js
 * Menu({ label: Button("Options", () => {}) }, [
 *   Button("Edit", () => handleEdit()),
 *   Button("Delete", () => handleDelete())
 * ])
 * ```
 */
declare function Menu(props: { label: Component }, children: Component[]): Component;

/**
 * A standard label with a title and optional icon.
 *
 * ```js
 * Label({ title: "Favorites", systemImage: "star.fill" })
 * Label({ title: "Profile", icon: Image({ url: "avatar.png" }) })
 * ```
 */
declare function Label(props: { title: string | Component; icon?: Component; systemImage?: string }): Component;

/**
 * An empty state view with icon, title, description, and optional action buttons.
 *
 * ```js
 * ContentUnavailableView({
 *   title: "No Results",
 *   systemImage: "magnifyingglass",
 *   description: "Try a different search term."
 * })
 * ```
 */
declare function ContentUnavailableView(props: {
    title?: string | Component;
    systemImage?: string;
    description?: string | Component;
    label?: Component;
}): Component;
declare function ContentUnavailableView(props: {
    title?: string | Component;
    systemImage?: string;
    description?: string | Component;
    label?: Component;
}, children: Component[]): Component;

// =============================================================================
// MARK: - Picker
// =============================================================================

/** A two-element tuple representing a value and its setter, used by Picker and other controls. */
type Binding<V = string> = readonly [
    value: V,
    setValue: (value: V) => void
];

/** A hashable type usable as a selection value. */
type Hashable = string | number;

/**
 * A selection control. Style it with `.pickerStyle()`.
 *
 * ```js
 * const [size, setSize] = useState("m")
 * Picker("Size", [size, setSize], [
 *   Text("Small").tag("s"),
 *   Text("Medium").tag("m"),
 *   Text("Large").tag("l")
 * ])
 * ```
 */
declare function Picker<V extends Hashable = string>(label: string, selection: Binding<V>, children: Component[]): Component;

/**
 * An empty component that renders nothing. Use for conditional rendering.
 *
 * ```js
 * showContent ? Text("Hello") : Empty()
 * ```
 */
declare function Empty(): Component;

// =============================================================================
// MARK: - Map Components
// =============================================================================

interface MapProps {
    /** Center latitude. */
    latitude: number;
    /** Center longitude. */
    longitude: number;
    /** Camera distance in meters. Default: 1000. */
    distance?: number;
    /** Map style. Default: "standard". */
    style?: "standard" | "imagery" | "hybrid";
    /** Which interaction modes are enabled. Default: all. */
    interactionModes?: ("pan" | "zoom" | "rotate" | "pitch" | "all")[];
    /** Map controls to show. Omit for system defaults, `[]` to hide all. */
    controls?: ("compass" | "scale" | "userLocation" | "pitch")[];
    /** Show the user's location as a blue dot. */
    showsUserLocation?: boolean;
    /** Callback when the camera moves. */
    onCameraChange?: (camera: {
        latitude: number;
        longitude: number;
        distance: number;
        heading: number;
        pitch: number;
    }) => void;
    /** How often camera change fires. Default: "onEnd". */
    cameraChangeFrequency?: "onEnd" | "continuous";
    /** Callback when a tagged marker/annotation is selected (or null on deselect). */
    onSelect?: (tag: string | null) => void;
}

/**
 * An interactive map view.
 *
 * ```js
 * Map({ latitude: 37.7749, longitude: -122.4194, distance: 5000 }, [
 *   Marker({ latitude: 37.7749, longitude: -122.4194, title: "San Francisco" })
 * ])
 * ```
 */
declare function Map(props: MapProps, children?: Component[]): Component;

interface MarkerProps {
    latitude: number;
    longitude: number;
    title?: string;
    /** System icon name for the marker. */
    systemImage?: string;
    /** Tint color for the marker. */
    tint?: Component;
    /** Tag for identifying this marker in `onSelect` callbacks. */
    tag?: string;
}

/** A map pin marker at a specific coordinate. */
declare function Marker(props: MarkerProps): Component;

interface AnnotationProps {
    latitude: number;
    longitude: number;
    title?: string;
    /** Where the annotation is anchored relative to its coordinate. */
    anchor?: "center" | "top" | "bottom" | "leading" | "trailing"
    | "topLeading" | "topTrailing" | "bottomLeading" | "bottomTrailing";
    tag?: string;
}

/** A custom view annotation on the map. Children define the annotation's content. */
declare function Annotation(props: AnnotationProps, children?: Component[]): Component;

interface MapCircleProps {
    latitude: number;
    longitude: number;
    /** Radius in meters. */
    radius?: number;
    fill?: Component;
    fillOpacity?: number;
    stroke?: Component;
    lineWidth?: number;
}

/** A circle overlay on the map. */
declare function MapCircle(props: MapCircleProps): Component;

interface MapPolylineProps {
    coordinates: { latitude: number; longitude: number }[];
    stroke?: Component;
    lineWidth?: number;
}

/** A polyline overlay on the map connecting a series of coordinates. */
declare function MapPolyline(props: MapPolylineProps): Component;

interface MapPolygonProps {
    coordinates: { latitude: number; longitude: number }[];
    fill?: Component;
    fillOpacity?: number;
    stroke?: Component;
    lineWidth?: number;
}

/** A filled polygon overlay on the map. */
declare function MapPolygon(props: MapPolygonProps): Component;

// =============================================================================
// MARK: - Toolbar
// =============================================================================

/** A single toolbar item. */
interface ToolbarItem extends Component { }

/** Creates a toolbar item with specified placement. */
declare function ToolbarItem(props: { placement?: ToolbarItemPlacement }, content: Component[]): ToolbarItem;

/**
 * Groups multiple toolbar items with shared placement.
 *
 * ```js
 * VStack([...]).toolbar(
 *   ToolbarItemGroup({ placement: "topBarTrailing" }, [
 *     Button("Edit", () => {}),
 *     Button("Share", () => {})
 *   ])
 * )
 * ```
 */
interface ToolbarItemGroup extends Component { }
declare function ToolbarItemGroup(props: { placement?: ToolbarItemPlacement }, content: Component[]): ToolbarItemGroup;

// =============================================================================
// MARK: - Image
// =============================================================================

/** Extended Image component with image-specific modifiers. */
interface Image extends Component {
    /** Makes the image resizable to fill its frame. Required for `.frame()` to affect image size. */
    resizable(): Image;
    /** Controls how the image is rendered: "original" preserves colors, "template" uses foreground style. */
    renderingMode(_: "original" | "template"): Image;
    /** Sets the interpolation quality for scaled images. */
    interpolation(_: "none" | "low" | "medium" | "high"): Image;
    /** Enables or disables antialiasing on image edges. */
    antialiased(isAntialiased?: boolean): Image;
    /** Sets how multi-layer system symbols are rendered. */
    symbolRenderingMode(_: "monochrome" | "hierarchical" | "palette" | "multicolor"): Image;
    /** Sets the symbol scale relative to text. */
    imageScale(_: "small" | "medium" | "large"): Image;
}

// =============================================================================
// MARK: - Color
// =============================================================================

/**
 * A color value that can be used as a view or style. Supports named colors,
 * RGB, HSL, hex codes, and semantic system colors.
 *
 * ```js
 * Color("blue")                        // named color
 * Color({ r: 0.5, g: 0.3, b: 0.9 })  // RGB (0-1 range)
 * Color({ h: 240, s: 0.8, l: 0.5 })  // HSL
 * Color("#FF5500")                     // hex
 * Color("primary")                     // semantic (adapts to light/dark)
 * ```
 */
interface Color extends Component {
    /**
     * Returns a new color with the specified opacity.
     *
     * ```js
     * Color("blue").opacity(0.5) // semi-transparent blue
     * ```
     */
    opacity(_: number): Color;
}

/**
 * Creates a color from various formats.
 *
 * @param color Named color, RGB/HSL object, hex string, or ARGB integer.
 */
declare function Color(_?: ColorProps): Color;

// =============================================================================
// MARK: - Material
// =============================================================================

/**
 * A translucent blur effect similar to frosted glass. Used for backgrounds that
 * blend with content behind them.
 *
 * ```js
 * Text("Over blurred background")
 *   .background(Material("thin"))
 * ```
 */
interface Material extends Component { }

/**
 * Material thickness presets.
 * - `"ultraThin"` — most transparent
 * - `"thin"` — subtle
 * - `"regular"` — balanced (default)
 * - `"thick"` — more prominent
 * - `"bar"` — toolbar backgrounds
 * - `"chrome"` — menus and popups
 */
type MaterialType =
    | "regular"
    | "thick"
    | "thin"
    | "ultraThin"
    | "ultrathin"
    | "bar"
    | "chrome"
    | "titlebar"
    | "toolbarMaterial";

type MaterialProps = MaterialType | {
    type: MaterialType;
    opacity?: number;
    blurRadius?: number;
};

/** Creates a material blur effect. */
declare function Material(_?: MaterialProps): Material;

// =============================================================================
// MARK: - Gradients
// =============================================================================

/** A gradient that can be used as a fill, foreground, or background style. */
interface Gradient extends Component { }

/**
 * A linear gradient along a line between two points.
 *
 * ```js
 * LinearGradient({
 *   colors: [Color("blue"), Color("purple")],
 *   startPoint: "leading",
 *   endPoint: "trailing"
 * })
 * ```
 */
declare function LinearGradient(props?: { colors?: Color[]; startPoint?: UnitPoint; endPoint?: UnitPoint }): Gradient;

/** A gradient that sweeps around a center point. */
declare function AngularGradient(props?: { colors: Color[]; center?: UnitPoint; startAngle?: number; endAngle?: number }): Gradient;

/** A circular gradient radiating from a center point. */
declare function RadialGradient(props?: { colors: Color[]; center?: UnitPoint; startRadius?: number; endRadius?: number }): Gradient;

/** An elliptical gradient radiating from a center point. */
declare function EllipticalGradient(props?: { colors: Color[]; center?: UnitPoint; startRadius?: number; endRadius?: number }): Gradient;

// =============================================================================
// MARK: - Shapes
// =============================================================================

interface StrokeOptions {
    style: Style;
    lineWidth?: number;
}

/** A shape that can be filled, stroked, and used for clipping or masking. */
interface Shape extends Component {
    /**
     * Fills the shape interior.
     *
     * ```js
     * Circle().fill(Color("blue"))
     * RoundedRectangle({ cornerRadius: 10 }).fill(LinearGradient({ colors: [Color("red"), Color("orange")] }))
     * ```
     */
    fill(_: Style): Shape;

    /**
     * Draws the shape outline.
     *
     * ```js
     * Circle().stroke(Color("red"), 2)
     * RoundedRectangle({ cornerRadius: 5 }).stroke(Color("gray"))
     * ```
     */
    stroke(_: Style | StrokeOptions): Shape;
}

/** A circle shape centered in its frame. */
declare function Circle(): Shape;
/** An ellipse shape that fills its frame. */
declare function Ellipse(): Shape;
/** A capsule shape (rounded rectangle with maximum corner radius). */
declare function Capsule(): Shape;
/** A rectangle shape. */
declare function Rectangle(): Shape;
/** A rectangle with rounded corners. */
declare function RoundedRectangle(props?: { cornerRadius?: number }): Shape;

// =============================================================================
// MARK: - Path
// =============================================================================

/** Builder for constructing custom vector paths. */
interface PathBuilder {
    /** Begins a new subpath at the given point. */
    move(x: number, y: number): void;
    /** Adds a straight line from the current point. */
    line(x: number, y: number): void;
    /** Adds a quadratic Bezier curve. */
    quadCurve(x: number, y: number, controlX: number, controlY: number): void;
    /** Adds a cubic Bezier curve. */
    curve(x: number, y: number, control1X: number, control1Y: number, control2X: number, control2Y: number): void;
    /** Adds an arc. Angles in degrees. */
    arc(props: { centerX: number; centerY: number; radius: number; startAngle: number; endAngle: number; clockwise?: boolean }): void;
    /** Adds a rectangle subpath. */
    addRect(x: number, y: number, width: number, height: number): void;
    /** Adds a rounded rectangle subpath. */
    addRoundedRect(props: { x: number; y: number; width: number; height: number; cornerWidth: number; cornerHeight: number }): void;
    /** Adds an ellipse subpath. */
    addEllipse(x: number, y: number, width: number, height: number): void;
    /** Adds a polyline from an array of [x, y] points. */
    addLines(points: [number, number][]): void;
    /** Closes the current subpath. */
    close(): void;
}

/**
 * Creates a custom vector shape from path drawing commands.
 *
 * ```js
 * Path((path) => {
 *   path.move(50, 0)
 *   path.line(100, 100)
 *   path.line(0, 100)
 *   path.close()
 * }).fill(Color("blue"))
 * ```
 */
declare function Path(builder: (path: PathBuilder) => void): Shape;

/**
 * A shader component for custom GPU-rendered visual effects.
 *
 * ```js
 * Shader({
 *   fragmentShader: "void mainImage(out vec4 fragColor, in vec2 fragCoord) { ... }",
 *   uniforms: { speed: 1.0, color: [1.0, 0.5, 0.0] },
 *   timeEnabled: true
 * })
 * ```
 */
declare function Shader(props?: {
    /** Fragment shader source code. */
    fragmentShader?: string;
    /** Uniform values passed to the shader. */
    uniforms?: Record<string, number | number[] | boolean>;
    /** Whether to provide an auto-incrementing time uniform. */
    timeEnabled?: boolean;
    /** Whether to provide mouse/touch position uniforms. */
    mouseEnabled?: boolean;
    /** Update interval in milliseconds for animated shaders. */
    updateInterval?: number;
}): Component;

// =============================================================================
// MARK: - Gesture State
// =============================================================================

/** State provided to gesture callbacks. */
interface GestureState {
    /** Current gesture phase. */
    phase: "possible" | "began" | "changed" | "ended" | "cancelled";
    /** Touch/pointer location in the component's coordinate space. */
    locationInView: Point;
}

/** Extended state for drag gestures. */
interface DragGestureState extends GestureState {
    /** Cumulative translation from the drag start point. */
    translation: Point;
    /** Current drag velocity in points per second. */
    velocity: Point;
}

// =============================================================================
// MARK: - Prop Types for Components
// =============================================================================

type ImageContentMode = "fit" | "fill";
type BaseImageProps = { contentMode?: "fit" | "fill", loading?: "lazy" | "eager" };
type ImageProps = BaseImageProps & ({ name: string } | { systemName: string } | { url: string } | { image: string } | { svg: string });

type VideoContentMode = "fit" | "fill";
type BaseVideoProps = { autoplay?: boolean; muted?: boolean; controls?: boolean; loop?: boolean, contentMode?: VideoContentMode, poster?: string };
type VideoProps = (BaseVideoProps & { url: string }) | (BaseVideoProps & { video: string });
type Model3DProps = { url: string, iOSURL?: string, description?: string, cameraControls: boolean, autoRotate: boolean };

// =============================================================================
// MARK: - Layout & Typography Types
// =============================================================================

type HorizontalAlignment = "leading" | "trailing" | "center";
type VerticalAlignment = "top" | "bottom" | "center" | "firstTextBaseline" | "lastTextBaseline";

type Alignment =
    | "center"
    | "leading"
    | "trailing"
    | "top"
    | "bottom"
    | "topLeading"
    | "topTrailing"
    | "bottomLeading"
    | "bottomTrailing"

type FontWeight = "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
type FontWidth = "compressed" | "condensed" | "standard" | "expanded";
type FontDesign = "default" | "serif" | "rounded" | "monospaced";

/**
 * Semantic text styles that scale with Dynamic Type.
 * From smallest: caption2, caption, callout, footnote, body, subheadline, headline, title3, title2, title, largeTitle.
 */
type TextStyle = "caption2" | "caption" | "callout" | "footnote" | "body" | "subheadline" | "headline" | "title3" | "title2" | "title" | "largeTitle";
type TextAlignment = "leading" | "trailing" | "center";
type TextCase = "uppercase" | "lowercase";

/**
 * A point in the unit coordinate space (0-1) or a named position.
 * Used for anchors, gradient points, and alignment.
 */
type UnitPoint = { x: number; y: number } | "zero" | "center" | "top" | "bottom" | "leading" | "trailing" | "topLeading" | "topTrailing" | "bottomLeading" | "bottomTrailing";
type Point = { x: number; y: number };
type Axis = "horizontal" | "vertical" | "both";
type PinnedScrollableViews = "sectionHeaders" | "sectionFooters" | "all";
type Edge = "top" | "leading" | "bottom" | "trailing" | "horizontal" | "vertical" | "all";
type SimpleTransition = "opacity" | "slide" | "scale" | "identity";
type EdgeSet = Edge | Array<Edge>;

/**
 * Dynamic Type size settings, from smallest to largest.
 * Sizes prefixed with "accessibility" are for enhanced readability.
 */
type DynamicTypeSize = "xSmall" | "small" | "medium" | "large" | "xLarge" | "xxLarge" | "xxxLarge" | "accessibility1" | "accessibility2" | "accessibility3" | "accessibility4" | "accessibility5";
type LayoutDirection = "leftToRight" | "rightToLeft";

/**
 * Safe area regions.
 * - `"container"` — device bezel / notch insets
 * - `"keyboard"` — on-screen keyboard area
 * - `"all"` — all safe area regions
 */
type SafeAreaRegions = "container" | "keyboard" | "all";

/**
 * Accessibility traits that describe a component's behavior to assistive technologies.
 */
type AccessibilityTraits =
    | "isButton"
    | "isLink"
    | "isSearchField"
    | "isImage"
    | "isSelected"
    | "playsSound"
    | "isKeyboardKey"
    | "isStaticText"
    | "isSummaryElement"
    | "updatesFrequently"
    | "startsMediaSession"
    | "allowsDirectInteraction"
    | "causesPageTurn"
    | "isModal"
    | "isHeader";

// =============================================================================
// MARK: - Presentation Detents
// =============================================================================

/** A size configuration for sheet presentations. */
type PresentationDetent =
    | { detentType: 'height', value: number }
    | { detentType: 'fraction', value: number }
    | { detentType: 'medium' }
    | { detentType: 'large' };

type PresentationDetents = PresentationDetent[];

/**
 * Convenience constructors for presentation detents.
 *
 * ```js
 * .presentationDetents([Detent.medium, Detent.large])
 * .presentationDetents([Detent.fraction(0.25), Detent.height(300)])
 * ```
 */
declare const Detent: {
    medium: { detentType: 'medium' };
    large: { detentType: 'large' };
    /** A detent at a fraction of the screen height (0 to 1). */
    fraction(value: number): { detentType: 'fraction'; value: number };
    /** A detent at an exact height in points. */
    height(value: number): { detentType: 'height'; value: number };
};

// =============================================================================
// MARK: - Custom Font
// =============================================================================

interface FontComponent extends Component { }
interface CustomFont extends FontComponent { }

/**
 * Loads a custom font from a URL. Use with the `.font()` modifier.
 *
 * ```js
 * Text("Custom").font(CustomFont({
 *   url: "https://example.com/Inter-Regular.woff2",
 *   family: "Inter",
 *   size: 16,
 *   relativeToTextStyle: "body"
 * }))
 * ```
 */
declare function CustomFont(_?: CustomFontProps): FontComponent;

type CustomFontProps = {
    /** URL to the font file. */
    url: string;
    /** Font family name. */
    family: string;
    /** Font size in points. */
    size: number;
    /** Semantic text style for Dynamic Type scaling. */
    relativeToTextStyle?: string;
}

// =============================================================================
// MARK: - URL Handling
// =============================================================================

/**
 * Result of an OpenURLAction callback, determining how a URL is handled.
 * - `{ handled: true }` — the URL was handled, no further action needed
 * - `{ discarded: true }` — the URL should be ignored
 * - `{ systemAction: true }` — delegate to the platform's default URL handler
 * - `{ systemAction: { url, preferInApp } }` — open a (possibly rewritten) URL
 */
type OpenURLActionResult =
    | { handled: true }
    | { discarded: true }
    | { systemAction: true }
    | { systemAction: { url: string, preferInApp?: boolean } };

/**
 * Intercepts URL-opening requests for custom handling. Set as an environment value.
 *
 * ```js
 * VStack([
 *   Markdown(props.content)
 * ]).environment("openURL", OpenURLAction((url) => {
 *   if (url.startsWith("myapp://")) {
 *     navigate({ to: "deep-link", props: { url } })
 *     return { handled: true }
 *   }
 *   return { systemAction: { url, preferInApp: true } }
 * }))
 * ```
 */
declare function OpenURLAction(callback: (url: string) => OpenURLActionResult | void): Component;

// =============================================================================
// MARK: - Style & Color Types
// =============================================================================

/**
 * Tracking value in milli-em units. 1000 milli-em = 1em.
 * Example: 500 = 0.5em letter spacing.
 */
type MilliEm = number;

type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "colorDodge" | "colorBurn" | "softLight" | "hardLight" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity" | "sourceAtop" | "destinationOver" | "destinationOut" | "plusDarker" | "plusLighter";
type ContentTransitionType = "numericText" | "interpolate" | "opacity" | "identity";

/**
 * Color specification. Accepts:
 * - Named colors: "red", "blue", "primary", "background", etc.
 * - RGB object: `{ r: 0.5, g: 0.3, b: 0.9 }` (values 0-1)
 * - HSL object: `{ h: 240, s: 0.8, b: 0.5 }`
 * - Hex string: `"#FF5500"`
 * - ARGB integer
 */
type ColorProps = { r: number; g?: number; b?: number; a?: number } |
{ red?: number; green?: number; blue?: number; alpha?: number } |
{ h: number; s?: number; b?: number; a?: number } |
{ hue?: number; saturation?: number; brightness?: number; alpha?: number } |
    "clear" | "red" | "orange" | "yellow" | "green" | "mint" | "teal" | "cyan" | "blue" | "indigo" | "purple" | "pink" | "brown" | "black" | "white" | "gray" |
    "primary" | "secondary" | "tertiary" | "quaternary" | "accent" | "background" |
    "label" | "secondaryLabel" | "tertiaryLabel" | "quaternaryLabel" | "placeholderText" | "link" |
    "systemGray" | "systemGray2" | "systemGray3" | "systemGray4" | "systemGray5" | "systemGray6" |
    "systemBackground" | "secondarySystemBackground" | "tertiarySystemBackground" |
    "systemGroupedBackground" | "secondarySystemGroupedBackground" | "tertiarySystemGroupedBackground" |
    "systemFill" | "secondarySystemFill" | "tertiarySystemFill" | "quaternarySystemFill" |
    "separator" | "opaqueSeparator" |
    `#${string}` | number;

/** A visual style: Color, Gradient, or Material. Used with `.foregroundStyle()`, `.background()`, `.fill()`, etc. */
type Style = Color | Gradient | Material;

type Platform = "iOS" | "macOS" | "watchOS" | "tvOS" | "visionOS" | 'web' | 'android';

type PlaceholderProps = {
    /** Name used to resolve the native component from the host app's component registry. */
    name?: string;
    /** Props passed through to the native component. */
    props?: Record<string, any>;
    /** Display title shown in the web preview. */
    title?: string;
    /** Platforms that support this native component. */
    validPlatforms?: Platform[];
}

/**
 * Toolbar item placement.
 * Semantic placements (e.g. "primaryAction", "cancellationAction") adapt to the platform.
 * Positional placements (e.g. "topBarTrailing", "bottomBar") specify exact locations.
 */
type ToolbarItemPlacement =
    // Semantic placements
    | "automatic"
    | "principal"
    | "navigation"
    | "primaryAction"
    | "secondaryAction"
    | "status"
    | "confirmationAction"
    | "cancellationAction"
    | "destructiveAction"
    // Positional placements
    | "bottomBar"
    | "topBarLeading"
    | "topBarTrailing"
    | "navigationBarLeading"
    | "navigationBarTrailing"
    | "bottomOrnament"
    | "keyboard"
    | "largeSubtitle"
    | "subtitle"
    | "title";

/** Toolbar bar identifiers for `.toolbarVisibility()`. */
type ToolbarBarPlacement = "navigationBar" | "tabBar" | "bottomBar" | "windowToolbar" | "automatic";

// =============================================================================
// MARK: - Asset Types
// =============================================================================

/** Metadata for a media asset (image, video, or 3D model). */
type AssetMedia = {
    id?: string;
    alt?: string;
    name?: string;
    url: string;
    dimensions?: { width: number, height: number };
}

/** An asset value resolved from a PropertyAsset field. Exactly one media type is present. */
type Asset =
    | { image: AssetMedia; video?: never; model?: never }
    | { video: AssetMedia; image?: never; model?: never }
    | { model: AssetMedia; image?: never; video?: never }

// =============================================================================
// MARK: - Type Inference Utilities
// =============================================================================

/**
 * Infers the runtime prop types from a `properties` definition.
 * Maps each PropertyField to its corresponding runtime value type
 * (e.g. PropertyString → string, PropertyNumber → number).
 */
type InferProps<T> =
    T extends (...args: any[]) => infer R
    ? R extends ComponentProperties
    ? { [K in keyof R]: InferPropField<R[K]> }
    : never
    : T extends ComponentProperties
    ? { [K in keyof T]: InferPropField<T[K]> }
    : never;

/** Maps a PropertyField type to its runtime value type. */
type InferPropField<T> =
    T extends { type: "string" } ? string
    : T extends { type: "boolean" } ? boolean
    : T extends { type: "enum"; defaultValue?: infer V } ? V extends string | number ? V : string | number
    : T extends { type: "number" } ? number
    : T extends { type: "date" } ? string
    : T extends { type: "array"; valueType: infer V } ? InferPropField<V>[]
    : T extends { type: "component" } ? Record<string, any>
    : T extends { type: "asset" } ? Asset
    : T extends { type: "content" } ? string
    : T extends { type: "group"; properties: infer G }
    ? G extends ComponentProperties
    ? InferProps<G>
    : never
    : never;

// =============================================================================
// MARK: - useStore
// =============================================================================

/**
 * Wraps a primitive into `{ value: T }` for store compatibility.
 * Objects are kept as-is.
 */
type StoreShape<T> =
    T extends object
    ? T
    : { value: T };

/** A setter that accepts a direct value or an updater function. */
type StoreSetter<T> = (value: T | ((prev: T) => T)) => void;

/** Auto-generated per-field setters (e.g. `setCount`, `setName`). */
type FieldSetters<T> = {
    [K in keyof T as K extends string ? `set${Capitalize<K>}` : never]: StoreSetter<T[K]>;
};

/** Store metadata. */
type StoreMeta = {
    /** The key passed to useStore. */
    key: string;
    /** The scope, if provided. */
    scope?: string;
    /** The resolved key: `"scope:key"` or `"key"`. */
    fullKey: string;
}

/**
 * A store instance with flattened state fields, auto-generated setters, and metadata.
 *
 * For a store with `{ count: 0, name: "test" }`, provides:
 * - `store.count` / `store.name` — read fields directly
 * - `store.setCount(5)` / `store.setName("new")` — per-field setters
 * - `store.set(prev => ({ ...prev, count: prev.count + 1 }))` — full-state update
 */
type Store<T extends object> = StoreMeta & T & FieldSetters<T> & {
    /** Replaces the entire store value. Accepts a value or updater function. */
    set(value: T | ((prev: T) => T)): void;
};

/**
 * Global shared state store. State is keyed by name and shared across all components.
 * Use `scope` to namespace stores (e.g. per-instance isolation).
 *
 * ```js
 * const store = useStore("counter", { count: 0, label: "clicks" })
 *
 * store.count              // read: 0
 * store.setCount(5)        // per-field setter
 * store.setLabel("taps")   // auto-generated setter
 * store.set(prev => ({     // full-state update
 *   ...prev,
 *   count: prev.count + 1
 * }))
 * ```
 *
 * With scope for per-instance isolation:
 * ```js
 * const store = useStore("prefs", { theme: "light" }, props.userId)
 * ```
 */
declare function useStore<T>(
    key: string,
    defaultValue: T,
    scope?: string
): Store<StoreShape<T>>;

/**
 * Schedules a callback to run after a delay (in milliseconds).
 *
 * Returns a handle that can be passed to `clearTimeout` to cancel the
 * pending callback before it fires.
 *
 * @example
 * ```js
 * const id = setTimeout(() => {
 *   console.log('fired')
 * }, 1000)
 *
 * // Cancel before it fires:
 * clearTimeout(id)
 * ```
 */
declare function setTimeout(callback: () => void, delayMs?: number): number;

/**
 * Cancels a pending `setTimeout` callback.
 */
declare function clearTimeout(id: number): void;

/**
 * Displays a modal alert with the given message.
 *
 * @example
 * ```js
 * alert("Something went wrong")
 * ```
 */
declare function alert(message?: unknown): void;
