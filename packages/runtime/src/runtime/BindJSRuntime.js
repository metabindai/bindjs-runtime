// Core
import AST from './AST.js'
import { componentNames } from './ComponentNames.js'

// Components
import { GenericComponent, processComponentArgs } from './Components/GenericComponent.js'
import { Color } from './Components/Color.js'
import { Button } from './Components/Button.js'
import { Picker } from './Components/Picker.js'
import { AnimationComponent } from './Components/AnimationComponent.js'
import { PropertyComponent } from './Components/PropertyComponent.js'
import { ComposerGroup } from './Components/ComposerGroup.js'
import { ForEach } from './Components/ForEach.js'
import { Content } from './Components/Content.js'
import { CallbackComponent } from './Components/CallbackComponent.js'
import { NavigationLink } from './Components/NavigationLink.js'
import { PathComponent } from './Components/Path.js'

// Modifiers
import { GenericModifier } from './Modifiers/GenericModifier.js'
import { Padding } from './Modifiers/Padding.js'
import { Resizable } from './Modifiers/Resizable.js'
import { Opacity } from './Modifiers/Opacity.js'
import { OnHandler } from './Modifiers/OnHandler.js'
import { AnimationModifier } from './Modifiers/AnimationModifier.js'
import { FontModifier } from './Modifiers/FontModifier.js'
import { EnvironmentValue } from './Modifiers/EnvironmentValue.js'
import { Fill, Stroke } from './Modifiers/ShapeStyle.js'
import { ButtonStyle } from './Modifiers/ButtonStyle.js'
import { ContentModifier } from './Modifiers/ContentModifier.js'
import { VisualEffectModifier } from './Modifiers/VisualEffectModifier.js'
import { SheetModifier } from './Modifiers/SheetModifier.js'
import { ScrollPositionModifier } from './Modifiers/ScrollPositionModifier.js'
import { GalleryModifier } from './Modifiers/GalleryModifier.js'
import { NavigationDestinationModifier } from './Modifiers/NavigationDestination.js'
import { AnimationViewModifier } from './Modifiers/AnimationViewModifier.js'

// Helpers
import { LayoutGroup } from './Helpers/LayoutGroup.js'
import { Detent } from './Helpers/Detent.js'

// Functions
import { getComponentData } from './Functions/getComponentData.js'
import { useState } from './Functions/useState.js'
import { useRef } from './Functions/useRef.js'
import { useStore } from './Functions/useStore.js'
import { useAppState } from './Functions/useAppState.js'
import { useNavigate, useAction } from './Functions/useNavigate.js'
import { makeComponent } from './Functions/makeComponent.js'
import { getContent } from './Functions/getContent.js'
import { convertComponentProps } from './Functions/convertComponentProps.js'
import { withAnimation } from './Functions/withAnimation.js'
import { useMCPHost } from './Functions/useMCPHost.js'
import { OpenURLAction } from './Functions/OpenURLAction.js'
import standardLibraryFunctions from './Functions/standardLibrary.js'

// Default Components
import ThumbnailComponent from './DefaultComponents/ThumbnailComponent.js'
import ThumbnailContent from './DefaultComponents/ThumbnailContent.js'
import SizeToFitScreen from './DefaultComponents/SizeToFitScreen.js'


/**
 * Optional logger injected by the runtime owner. Any subset of console-style
 * methods; missing methods fall back to the default console. Use to downgrade
 * routine compile/runtime noise (e.g. mid-edit syntax errors in Composer) so
 * it doesn't reach console.error.
 *
 * @typedef {Object} BindJSLogger
 * @property {(...args: unknown[]) => void} [log]
 * @property {(...args: unknown[]) => void} [info]
 * @property {(...args: unknown[]) => void} [warn]
 * @property {(...args: unknown[]) => void} [error]
 * @property {(...args: unknown[]) => void} [debug]
 */

/**
 * @typedef {Object} BindJSRuntimeOptions
 * @property {boolean} [expandForEach]
 * @property {BindJSLogger} [logger]
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

export class BindJSRuntime {
    /** @param {BindJSRuntimeOptions} [options] */
    constructor(options) {
        this.options = options ?? { expandForEach: false }
        this.logger = resolveLogger(options?.logger)
        this.reset()
    }

    reset() {
        this.context = {
            'Self': () => { }
        }

        this.components = {}

        this.functionCache = {}
        this.modifierFunctions = {}
        this.callStack = []
        this.environment = {}
        this.storedEnvironments = {}
        this.storedFunctions = {}
        this.storedData = {}
        this.storedHookStates = {}
        this.hookState = {}
        this.modifierRegistry = { GenericModifier }
        this.componentRegistry = { GenericComponent }

        // Current component being registered
        this._currentComponentName = undefined

        // Default app state that can be managed by the renderer. Can be overridden by the renderer.
        this.appState = {}

        this.resetState()
        this.registerBuiltInCallbacks()
        this.registerBuiltInComponents()

        this.needsRerender = () => {
            this.logger.log('Needs rerender not implemented')
        }

        // Default open url implementation. Can be overriden
        this.onOpenURL = (url, resultCallback, options = { preferInApp: false }) => {
            this.logger.log('onOpenURL', url, options)
            if (options?.preferInApp) {
                window.open(url, '_self');
            } else {
                window.open(url, '_blank');
            }

            if (resultCallback) {
                resultCallback(true)
            }
        }

        // Callback to update the app state.
        // Renderers will want to override this to know when the app state has changed
        // and to update the appropriate storage.
        this.onUpdateAppState = (key, value, state) => {
            // Default implementation.
            this.appState[key] = value
        }

        this.navigateCallback = ({ to, props }) => {
            this.logger.log('Navigate not implemented', to, props)
        }

        this.actionCallback = ({ name, props }) => {
            this.logger.log('Action not implemented', name, props)
        }

        this.withAnimation = (handlerId) => {
            this.logger.log('With animation not implemented', handlerId)
            // Provide default implementation.
            //
            // this.withAnimation should be overridden by the renderer to wrap the animation in a context
            // that will cause the state change to animate
            let animationBlock = this.restoreFunction(handlerId)
            if (animationBlock) {
                animationBlock()
            }
        }

        // MCP host interface. Set by the renderer to provide tool calls,
        // messaging, context updates, etc. Null when not in an MCP context.
        this.mcpHost = null
    }

    willRender() {
        this.hookState.path = []
        this.hookState.makeComponentIndex = 0
        this.hookState.childIndex = 0
        this.hookState.modifierId = null
        this.hookState.forEachElementId = null
    }

    resetState() {

        // Hook state needs to keep track of two things
        // - Component path. A unique path for the current component that's consistent across renders.
        // - Component hook storage. Storage for the hooks based on the component path.
        // - Component hook index. The current index of the hook that is being called
        this.hookState = {
            // Current component path
            path: [],

            // Current index in an array of children. Used to create the path if no id 
            childIndex: 0,

            // Current id set by a modifier. Used to create the path if set.
            modifierId: null,

            // Current id in a ForEach loop. Used to create the path if set.
            forEachElementId: null,

            // Index of the number of calls to makeComponent. Used to generate a unique id for a component if a name isnt available (if called from code)
            makeComponentIndex: 0,

            // Stores the hooks for each component, keyed by path.
            componentHookStore: {},

            // State of the individual for current component
            currentComponent: {
                hookStorage: [],
                hookIndex: 0
            }
        }
    }

    resetStorage() {
        this.storedEnvironments = {}
        //this.storedFunctions = {}
        this.storedData = {}
        this.storedHookStates = {}
    }

    /**
     * Clear stored data/environments/hook states for one renderer only.
     *
     * Storage keys are produced by `currentPathId`, which always starts with the
     * renderer id (`${rendererId},...`). Filtering by that prefix lets one
     * renderer reset its own state without wiping siblings (e.g. a component
     * editor mounting must not clear a still-visible thumbnail's chart data).
     */
    resetRendererStorage(rendererId) {
        if (rendererId == null || rendererId === 0) return
        const prefix = `${rendererId},`
        const filter = (dict) => {
            if (!dict) return
            for (const key of Object.keys(dict)) {
                if (key.startsWith(prefix)) delete dict[key]
            }
        }
        filter(this.storedEnvironments)
        filter(this.storedData)
        filter(this.storedHookStates)
    }

    resetCache(componentName) {
        this.functionCache[componentName] = {}
    }

    registerASTComponents(componentNames) {
        // Construct AST functions for inbuilt components.
        for (const componentName of componentNames) {
            this.#registerBuiltInComponent(componentName)
        }
    }

    registerBuiltInComponents() {

        this.registerASTComponents(componentNames)

        // Register specific handlers for inbuilt components
        this.#registerBuiltInComponent('Color', Color);
        this.#registerBuiltInComponent('Button', Button);
        this.#registerBuiltInComponent('ForEach', ForEach);
        this.#registerBuiltInComponent('Content', Content);
        this.#registerBuiltInComponent('Picker', Picker);
        this.#registerBuiltInComponent('NavigationLink', NavigationLink);
        this.#registerBuiltInComponent('Path', PathComponent);

        this.registerComponentName('ThumbnailComponent')
        this.registerComponentName('ThumbnailContent')
        this.registerComponentName('SizeToFitScreen')

        // Register default components. These are components initalised with bindjs body string.
        this.#registerDefaultComponent('ThumbnailComponent', ThumbnailComponent);
        this.#registerDefaultComponent('ThumbnailContent', ThumbnailContent);
        this.#registerDefaultComponent('SizeToFitScreen', SizeToFitScreen);

        // Register specific handlers for inbuilt modifiers
        this.#registerBuiltInModifier('padding', Padding);
        this.#registerBuiltInModifier('opacity', Opacity);
        this.#registerBuiltInModifier('font', FontModifier);
        this.#registerBuiltInModifier('fill', Fill);
        this.#registerBuiltInModifier('stroke', Stroke);
        this.#registerBuiltInModifier('buttonStyle', ButtonStyle);
        this.#registerBuiltInModifier('resizable', Resizable);

        this.#registerBuiltInModifier('background', ContentModifier);
        this.#registerBuiltInModifier('listRowBackground', ContentModifier);
        this.#registerBuiltInModifier('overlay', ContentModifier);
        this.#registerBuiltInModifier('safeAreaInset', ContentModifier);
        this.#registerBuiltInModifier('contextMenu', ContentModifier);
        this.#registerBuiltInModifier('toolbar', ContentModifier);
        this.#registerBuiltInModifier('visualEffect', VisualEffectModifier);
        this.#registerBuiltInModifier('sheet', SheetModifier);
        this.#registerBuiltInModifier('fullScreenCover', SheetModifier);
        this.#registerBuiltInModifier('scrollPosition', ScrollPositionModifier);
        this.#registerBuiltInModifier('gallery', GalleryModifier);
        this.#registerBuiltInModifier('navigationDestination', NavigationDestinationModifier);
        this.#registerBuiltInModifier('animation', AnimationViewModifier);

        // Register event handlers
        ['onTapGesture', 'onDragGesture', 'onLongPressGesture', 'onHover', 'onAppear', 'onDisappear', 'onSubmit', 'onChange'].map(name => this.#registerBuiltInModifier(name, OnHandler));

        // Register animation components
        ['Spring', 'Linear', 'EaseIn', 'EaseOut', 'EaseInOut', 'Bouncy', 'Snappy', 'InterpolatingSpring'].map(name => this.#registerBuiltInComponent(name, AnimationComponent));

        // Register animation modifiers
        ['delay', 'speed', 'repeatCount', 'repeatForever'].map(name => this.#registerBuiltInModifier(name, AnimationModifier));

        ['PropertyString', 'PropertyNumber', 'PropertyInteger', 'PropertyEnum', 'PropertyBoolean', 'PropertyArray', 'PropertyAsset', 'PropertyContent', 'PropertyComponent', 'PropertyDate', 'PropertyGroup', 'PropertyChildren', 'PropertyComponentList'].map(name => {
            this.#registerHelperComponent(name, PropertyComponent)
        });

        // Register components that use callbacks
        ['GeometryReader'].map(name => this.#registerBuiltInComponent(name, CallbackComponent));

        this.#registerBuiltInComponent('ComposerGroup', ComposerGroup);
        this.#registerBuiltInComponent('ComposerChildren', ComposerGroup);

        // Register layout group
        this.#registerHelperComponent('LayoutGroup', LayoutGroup);
        this.#registerHelperComponent('Detent', Detent);

        // Regster environment value modiifer
        this.#registerBuiltInModifier('environment', EnvironmentValue);
    }

    /**
     * Register built in callbacks available to components
     * @param {*} environment 
     */
    registerBuiltInCallbacks() {

        this.registerCallback('useEnvironment', () => {
            return this.environment
        })

        // Standard library functions
        for (const key in standardLibraryFunctions) {
            this.registerCallback(key, standardLibraryFunctions[key])
        }

        this.registerCallback('OpenURLAction', OpenURLAction.bind(this));

        // useState
        this.registerCallback('useState', useState.bind(this))

        // useRef
        this.registerCallback('useRef', useRef.bind(this))

        // useAppState (deprecated)
        this.registerCallback('useAppState', useAppState.bind(this))

        // useStore
        this.registerCallback('useStore', useStore.bind(this))

        // useNavigate
        this.registerCallback('useNavigate', useNavigate.bind(this))
        this.registerCallback('useAction', useAction.bind(this))

        // DEPRECATED: makeComponent
        this.registerCallback('makeComponent', makeComponent.bind(this))

        // Define
        this.registerCallback('defineComponent', this.defineComponent.bind(this))
        this.registerCallback('defineButtonStyle', this.defineButtonStyle.bind(this))

        // getContent
        this.registerCallback('getContent', getContent.bind(this))

        // getComponentData
        this.registerCallback('getComponentData', getComponentData.bind(this))

        // Prevent top in browser from being interpreted as a function
        this.registerCallback('top', () => { })

        // With animation callback
        this.registerCallback('withAnimation', withAnimation.bind(this))

        // MCP host
        this.registerCallback('useMCPHost', useMCPHost.bind(this))
    }

    /**
     * Creates a built in component.
     * A callback can be passed to generate the component, or left empty to use the generic handler.
     */
    #registerBuiltInComponent(name, callback) {
        if (callback) {
            this.componentRegistry[name] = callback
        }

        this.context[name] = (...args) => {
            return this.#makeInBuiltComponent(name, args)
        }
    }

    #registerDefaultComponent(name, bodyCode) {
        const code = bodyCode += `
        exports.default = defineComponent({ body })
        `
        this.registerComponentName(name);
        this.registerComponent(name, code);
    }

    /**
     * Registers a built in modifier using a callback
     */
    #registerBuiltInModifier(name, callback) {
        this.modifierRegistry[name] = callback
    }

    #registerHelperComponent(name, callback) {
        this.context[name] = (...args) => callback({ name, args: args })
    }

    /**
     * Register the JS of one or more components
     * @param {*} components 
     */
    registerComponents(components, entryPoint = 'body') {
        for (const componentName of Object.keys(components)) {
            this.registerComponent(componentName, components[componentName], entryPoint)
        }
    }

    aliasComponent(componentName, aliasName) {
        this.components[aliasName] = this.components[componentName]
        this.context[aliasName] = this.context[componentName]
    }

    registerComponentName(componentName) {
        const name = this.sanitizeName(componentName);
        this.context[name] = this.makeComponent(() => {
            return AST.Directive('Text', { rawValue: "Placeholder" })
        });
    }

    sanitizeName = (componentName) => {
        // Remove all characters that are NOT (letters, digits, $, _)
        let name = componentName.replace(/[^a-zA-Z0-9$_]/g, '');

        // If the name starts with a digit, prefix with an underscore
        if (/^[0-9]/.test(name)) {
            name = '_' + name;
        }

        return name;
    };

    /**
     * Checks if content has an explicit export statement (ignoring comments)
     * @private
     */
    #hasExplicitExport(content) {
        // Match exports.default = at the start of a line, ignoring leading whitespace
        // but not if it's in a comment
        const regex = /^(?!\s*\/\/)(?!\s*\/\*)\s*exports\.default\s*=/m;
        return regex.test(content);
    }

    /**
     * Checks if content has a const declaration with the given name
     * @private
     */
    #hasConst(content, name) {
        const regex = new RegExp(`(^|[^\\w/])const\\s+${name}\\s*=`, "m");
        return regex.test(content);
    }

    /**
     * Wraps legacy component code in a defineComponent export
     * @private
     */
    #wrapInDefineComponent(content) {
        const componentParts = {
            body: this.#hasConst(content, 'body') ? 'body' : '() => null',
            metadata: this.#hasConst(content, 'metadata') ? 'metadata' : '{}',
            properties: this.#hasConst(content, 'properties') ? 'properties' : '{}',
            previews: this.#hasConst(content, 'previews') ? 'previews' : 'null',
            thumbnail: this.#hasConst(content, 'thumbnail') ? 'thumbnail' : 'null',
            icon: this.#hasConst(content, 'icon') ? 'icon' : 'null'
        };

        const exportStatement = `
exports.default = defineComponent({
    body: ${componentParts.body},
    metadata: ${componentParts.metadata},
    properties: ${componentParts.properties},
    previews: ${componentParts.previews},
    thumbnail: ${componentParts.thumbnail},
    icon: ${componentParts.icon}
});`;

        return content + exportStatement;
    }


    // Registers the content of a component into the runtime.
    // Content is the JS of the component.
    // Entry point is the export to use. i.e. exports.default 
    registerComponent(componentName, content, entryPoint = 'default') {
        const name = this.sanitizeName(componentName);

        this.callStack = []
        this.functionCache[name] = {}

        this._currentComponentName = name;

        /**
         * Backward compatibility: Auto-wrap legacy component code in defineComponent
         * TODO: Migration removal - remove once all components use explicit exports
         */
        if ((entryPoint === 'default' || entryPoint === 'body') && !this.#hasExplicitExport(content)) {
            content = this.#wrapInDefineComponent(content);
        }

        this.components[name] = content

        // Create the function
        // This will defer the compiling of the component until it is called.
        this.context[name] = (arg1, arg2, ...otherArgs) => {
            const { props, children } = processComponentArgs(arg1, arg2)

            return this.#makeComponent((props, children) => {
                this._currentComponentName = name;

                // Get the export and the body content to run.
                try {
                    let exportComponent = this.getComponentExport(name);
                    if (typeof exportComponent?._body == 'boolean' && exportComponent?._body == true) {
                        return exportComponent?._bodyContent(props, children, ...otherArgs);
                    } else {
                        return exportComponent;
                    }
                } catch (error) {
                    this.logger.error('Error running component', name, error);
                    return null;
                }

            }, props, children, name)
        }

    }

    // Gets default export from a registered component.
    // 
    // If property is passed will return that property from the default export.
    // Each property is executed and cached individually so that the function list is correctly resolved.
    // Meaning , trys to avoid issue of if say metadata is accessed before all functions have been registered , it'll only be the metadata funciton that will have the incomplete list.
    getComponentExport(componentName, property, cache = true) {
        const componentKeys = Object.keys(this.context);
        const functionList = componentKeys.join(', ');
        //console.log('getComponetnExport ', componentName, componentKeys);
        let func = null

        if (cache && this.functionCache[componentName] && this.functionCache[componentName]['export_' + property]) {
            func = this.functionCache[componentName]['export_' + property]
        } else {
            this.aliasComponent(componentName, 'Self');

            const returnStatement = property ? `return exports.default?.${property}; ` : "return exports.default;";

            try {
                func = new Function(`{ ${functionList} } `, `var exports = {}; ${this.components[componentName]}; ${returnStatement} `)(this.context);
            } catch (error) {
                this.logger.error('Error running component', componentName, error);
                return null;
            }

            if (cache && func) {
                this.functionCache[componentName]['export_' + property] = func
            }
        }

        return func
    }

    getComponentType(componentName) {
        let exportComponent = this.getComponentExport(componentName)
        if (!exportComponent) {
            return null;
        }
        if (exportComponent._component) {
            return "Component"
        } else if (exportComponent._buttonStyle) {
            return "ButtonStyleComponent"
        } else {
            return null;
        }
    }

    defineProperties(definitionProps) {
        return definitionProps
    }

    /**
     * Defines a component with its body, metadata, properties, previews, and thumbnail.
     * 
     * This is the primary method used within component code to export a complete component
     * definition. It packages all aspects of a component into a single callable function
     * that can be used throughout the runtime.
     * 
     * The component definition includes:
     * - **body**: The main rendering function that returns the component's UI structure
     * - **metadata**: Descriptive information (title, description, category, visibility)
     * - **properties**: Property definitions for configurable inputs
     * - **previews**: Array of pre-configured component instances for documentation
     * - **thumbnail**: Visual representation (SVG string or function) for galleries
     * - **icon**: Optional icon name string for menus and context menus
     * 
     * This method is typically called at the end of a component file as:
     * `exports.default = defineComponent({ body, metadata, properties, previews, thumbnail })`
     * 
     * @param {Object} definitionProps - The component definition object
     * @param {Function} definitionProps.body - The component's body function (props, children) => Component
     * @param {Object|Function} [definitionProps.metadata] - Component metadata (title, description, etc.)
     * @param {Object|Function} [definitionProps.properties] - Property definitions for the component
     * @param {Array|Function} [definitionProps.previews] - Array of preview component instances
     * @param {string|Function} [definitionProps.thumbnail] - Thumbnail representation (SVG or function)
     * @param {string} [definitionProps.icon] - Icon name string for lightweight identification in menus
     * @returns {Function} A callable component function with attached metadata, properties, previews, and thumbnail
     * 
     * @example
     * // Basic component definition
     * const body = (props, children) => {
     *   return Text(props.label)
     * }
     * 
     * const metadata = {
     *   title: 'My Button',
     *   description: 'A simple button component',
     *   category: 'Controls'
     * }
     * 
     * const properties = {
     *   label: { type: 'string', defaultValue: 'Click me' }
     * }
     * 
     * exports.default = defineComponent({ body, metadata, properties })
     */
    defineComponent(definitionProps) {
        const { metadata, properties, body, previews, thumbnail, icon } = definitionProps

        var componentName = this._currentComponentName
        if (!componentName) {
            // If it isn't passed in, generate one from the call order
            const componentIndex = this.hookState.makeComponentIndex++;
            componentName = `Component_${componentIndex} `
        }

        // Body content of the component.
        const bodyContent = (props, children, ...otherArgs) => {

            const convertedProps = this.convertComponentProps(props)

            // Call the body of our registered component
            const componentFunction = body(convertedProps, children, ...otherArgs)

            // It's assumed a component returns an inbuilt component.
            // Run the returned function to generate the ast
            let ast = componentFunction && typeof componentFunction === 'function' ? componentFunction() : null

            if (ast && ast._component) {
                ast = ast()
            }

            // Wrap the component in a directive so the renderer knows what component generated that part of the AST
            const componentAst = AST.Directive('ComponentCall', { name: componentName, props: props }, [ast])

            // Return
            return componentAst
        }

        // This body is executed when the return from defineComponent is called directly.
        // So by components that are defined inline using defineComponent().
        // Execution of the body uses the bodyContent function when called from a registered component.
        const bodyDefinition = (arg1, arg2, ...otherArgs) => {
            const { props, children } = processComponentArgs(arg1 ?? {}, arg2 ?? [])
            return this.#makeComponent(bodyContent, props, children, componentName)
        }

        // Flag this definition function as being a component but also that it's a body function.
        bodyDefinition._component = true
        bodyDefinition._body = true
        bodyDefinition._bodyContent = bodyContent;

        bodyDefinition.metadata = metadata
        bodyDefinition.properties = properties
        bodyDefinition.thumbnail = thumbnail
        bodyDefinition.icon = icon
        bodyDefinition.previews = previews;
        bodyDefinition.body = body;

        // Return the definition
        return bodyDefinition
    }


    defineButtonStyle(buttonStyleDefinition) {
        const { body } = buttonStyleDefinition

        const bodyContent = (props, children) => {
            // Store handle to the body function for the buttonStyle modifier
            const path = this.currentPathId('buttonStyle')
            let handlerId = this.storeFunction(body, path);
            let environmentId = this.storeEnvironment(path, { restoreHookStateStorage: true });

            // When called as a component, render using the body
            let renderAsComponentAST = AST.Directive('Text', { rawValue: 'Button Style' })
            let ast = body({ label: this.makeComponent(() => renderAsComponentAST) }, props)
            ast = this.unwrapComponentAST(ast);

            // Return with both ast and the handlerId.
            return { buttonStyleProps: (props ?? {}), handlerId, environmentId, ...ast }
        }

        const bodyDefinition = (props) => {
            return this.makeComponent(bodyContent, props)
        }

        bodyDefinition._buttonStyle = true;
        bodyDefinition._body = true
        bodyDefinition._bodyContent = bodyContent;
        bodyDefinition.body = bodyDefinition
        return bodyDefinition
    }

    /**
    * Register callback to be made available to the runtime
    * @param {*} callbackName
    * @param {*} callback 
    */
    registerCallback(callbackName, callback) {
        this.context[callbackName] = callback
    }

    /**
     * Open URL handling
     * @param {*} url 
     */
    openURL(url, resultCallback, options = { preferInApp: false }) {
        if (this.onOpenURL) {
            this.onOpenURL(url, resultCallback, options)
        } else if (resultCallback) {
            resultCallback(false)
        }
    }

    /**
     * Register initial environment
     * @param {*} environment 
     */
    registerEnvironment(environment = {}) {
        this.environment = { openURL: this.openURL.bind(this), ...environment }
    }

    /**
     * AppState
     */
    registerAppState(state) {
        this.appState = state
    }

    updatedAppState(key, value, newState, completionCallback) {
        // Execute the callback to let the renderer know the app state has changed
        this.onUpdateAppState(key, value, newState(this.appState))

        // If the app state has changed, trigger a re-render
        if (completionCallback) {
            completionCallback()
        }
    }

    /**
     * Restores an environment by id
     * @param {*} environmentId 
     */
    restoreEnvironment(environmentId) {
        let env = this.storedEnvironments[environmentId]

        if (env) {
            this.environment = env
        }

        let hookState = this.storedHookStates[environmentId]
        if (hookState) {

            // Restore hook state path
            this.hookState.path = [...hookState.path]

            // Restore storage for current function.
            if (hookState.restoreHookStateStorage) {
                this.restoreHookStateStorage();
            }
        }
    }

    restoreHookStateStorage() {
        // Setup currentComponent content.
        // This is needed if when restoring a function that would be accessing state.
        let { path, componentHookStore, currentComponent } = this.hookState

        // Create path key. This is a unique key consistent across renders
        let hookKey = path.join('.')

        // Get hook storage for this component
        let hookStorage = componentHookStore[hookKey] ?? (componentHookStore[hookKey] = []);

        // Setup component hook state for the component we're about to call
        currentComponent.hookStorage = hookStorage
        currentComponent.hookIndex = 0
    }

    getEnvironment(environmentId) {
        return this.storedEnvironments[environmentId]
    }

    debugEnvironment() {
        this.logger.log('Envionment:')
        this.logger.log(' - Current:', this.environment)
        this.logger.log(' - Stored: ', this.storedEnvironments)
    }

    /**
     * Unregister a component
     * @param {*} componentName
     * @returns
     */
    unregisterComponent(componentName) {
        delete this.components[componentName]
        delete this.functionCache[componentName]
        delete this.context[componentName]
    }

    setRendererId(id) {
        this.rendererId = id
    }

    /**
     * Calls the body of registered component and returns its body as an AST.
     * 
     * This is the primary method for executing a component that has been registered
     * via registerComponent(). It looks up the component by name in the context,
     * calls it with the provided parameters, and unwraps any component functions
     * to return the final AST representation.
     * 
     * @param {string} componentName - The name of the registered component to call
     * @param {Object} params - Props/parameters to pass to the component
     * @param {Array} children - Child components to pass to the component
     * @param {boolean} unwrap - Whether to unwrap the component AST or just return the body function. Useful if wanting to wrap the output in the children another element to be called.
     * @param {...any} args - Additional arguments to pass to the component
     * @returns {Object|null} The component's AST, or null if the component doesn't exist
     * 
     * @example
     * const ast = runtime.callComponent('MyComponent', { color: 'blue' }, []);
     */
    callComponent(componentName, params, children, unwrap = true, ...args) {
        componentName = this.sanitizeName(componentName);

        this.aliasComponent(componentName, 'Self');

        let body = this.context[componentName];
        if (body) {
            let b = body(params, children, ...args);
            return unwrap ? this.invokeComponent(b) : b
        }
        return null
    }

    /**
     * Invokes a component function and returns its AST.
     */
    invokeComponent(element) {
        return this.unwrapComponentAST(element)
    }

    /**
     * Calls a specific preview variant of a registered component and returns its AST.
     * 
     * This method retrieves and executes a preview from the component's previews array.
     * Previews are alternative representations of a component, typically used for
     * documentation, galleries, or showcasing different states/configurations.
     * 
     * If the requested preview doesn't exist or the component has no previews defined,
     * this method falls back to calling the component's main body.
     * 
     * @param {string} componentName - The name of the registered component
     * @param {number} previewIndex - The index of the preview to render (0-based)
     * @param {Object} params - Props/parameters to pass to the preview or body
     * @param {Array} children - Child components to pass to the preview or body
     * @param {...any} args - Additional arguments to pass
     * @returns {Object|null} The preview's AST, or the body's AST if no preview exists
     * 
     * @example
     * // Render the first preview of a Button component
     * const ast = runtime.callComponentPreview('Button', 0, { label: 'Click me' }, []);
     */
    callComponentPreview(componentName, previewIndex, params, children, unwrap = true, ...args) {
        componentName = this.sanitizeName(componentName);

        this.aliasComponent(componentName, 'Self');

        let previews = this.getComponentPreviews(componentName)
        if (previews && Array.isArray(previews) && previews.length > 0) {
            let b = previews[previewIndex];
            if (b) {
                return unwrap ? this.unwrapComponentAST(b) : b
            }
        }

        // Fallback to body
        return this.callComponent(componentName, params, children, unwrap, ...args)
    }

    /**
     * Renders a component as a thumbnail with optional framing.
     * 
     * This method generates a thumbnail representation of a component, which is useful
     * for component galleries, content previews, or visual catalogs. The thumbnail can be:
     * 1. A custom thumbnail defined by the component (string SVG or function)
     * 2. The component's first preview (fallback)
     * 3. Optionally wrapped in a frame component for consistent presentation
     * 
     * The thumbnail can be framed in two ways:
     * - 'component': Wraps in ThumbnailComponent (for component library thumbnails)
     * - 'content': Wraps in ThumbnailContent (for content/page thumbnails with platform sizing)
     * 
     * @param {string} componentName - The name of the registered component
     * @param {Object} thumbnailOptions - Configuration for thumbnail rendering
     * @param {string} thumbnailOptions.type - Frame type: 'component', 'content', or undefined for no frame
     * @param {string} [thumbnailOptions.defaultPlatform] - Platform size for 'content' type (mobile/tablet/desktop)
     * @param {number} [thumbnailOptions.padding] - Padding for the thumbnail frame
     * @param {Object} params - Props/parameters to pass to the component
     * @param {Array} children - Child components to pass
     * @param {...any} args - Additional arguments
     * @returns {Object} The thumbnail's AST, optionally wrapped in a frame component
     * 
     * @example
     * // Render a component thumbnail with component frame
     * const ast = runtime.callComponentThumbnail('MyButton', { type: 'component' }, {}, []);
     * 
     * @example
     * // Render a content thumbnail with mobile sizing
     * const ast = runtime.callComponentThumbnail('HomePage', 
     *   { type: 'content', defaultPlatform: 'mobile', padding: 20 }, 
     *   {}, []
     * );
     */
    callComponentThumbnail(componentName, thumbnailOptions = {}, params, children, unwrap = true, ...args) {
        componentName = this.sanitizeName(componentName);

        // First determine if the component specifies a custom thumbnail.
        let thumbnail = this.getComponentThumbnail(componentName);
        if (typeof thumbnail == 'string') {
            thumbnail = AST.Directive('Image', { svg: thumbnail });
        } else if (typeof thumbnail == 'function') {
            thumbnail = thumbnail(params, children)
        }

        var thumbnailContent = thumbnail

        // Fallback to preview when no thumbnail is defined
        if (!thumbnail) {
            thumbnailContent = this.callComponentPreview(componentName, 0, params, children, unwrap, ...args)
        }

        // Apply the built in thumbnail component views.
        // These will be applied when thumbnailOptions is passed with type component | content.
        // Otherwise if not passed then the thumbnail content is returned as is.
        if (thumbnailOptions.type == 'component') {
            return this.callComponent('ThumbnailComponent', thumbnailOptions, [thumbnailContent], unwrap, ...args)
        } else if (thumbnailOptions.type == 'content') {
            return this.callComponent('ThumbnailContent', thumbnailOptions, [thumbnailContent], unwrap, ...args)
        } else {
            return thumbnailContent
        }

    }

    /**
     * Retrieves the metadata for a registered component.
     * 
     * Metadata provides descriptive information about a component, such as its title,
     * description, category, and visibility settings. This is commonly used for:
     * - Component documentation and catalogs
     * - IDE autocomplete and tooltips
     * - Component organization and filtering
     * 
     * If the metadata is defined as a function, it will be executed and the result returned.
     * If no metadata is defined, an empty object is returned.
     * 
     * @param {string} componentName - The name of the registered component
     * @returns {Object} The component's metadata object (always returns an object, never null)
     * 
     * @example
     * const metadata = runtime.getComponentMetadata('Button');
     * // Returns: { title: 'Button', description: 'A clickable button', category: 'Controls' }
     */
    getComponentMetadata(componentName) {
        let metadata = this.getComponentExport(componentName, 'metadata')
        metadata = typeof metadata === 'function' ? metadata() : metadata ?? {}
        return metadata
    }

    /**
     * Retrieves the property definitions for a registered component.
     * 
     * Properties define the configurable inputs (props) that a component accepts,
     * including their types, default values, validation rules, and inspector UI settings.
     * This information is used for:
     * - Visual property editors and inspectors
     * - Type checking and validation
     * - Auto-generating component documentation
     * - IDE autocomplete for component props
     * 
     * If the properties are defined as a function, it will be executed and the result returned.
     * If no properties are defined, an empty object is returned.
     * 
     * @param {string} componentName - The name of the registered component
     * @returns {Object} The component's property definitions (always returns an object, never null)
     * 
     * @example
     * const properties = runtime.getComponentProperties('Button');
     * // Returns: { label: { type: 'string', defaultValue: 'Click me' }, ... }
     */
    getComponentProperties(componentName) {
        let properties = this.getComponentExport(componentName, 'properties')
        properties = typeof properties === 'function' ? properties() : properties ?? {}
        return properties
    }

    /**
     * Retrieves the preview variants for a registered component.
     * 
     * Previews are pre-configured instances of a component that showcase different
     * states, configurations, or use cases. They are commonly used for:
     * - Component documentation and galleries
     * - Visual regression testing
     * - Design system showcases
     * - Quick component exploration
     * 
     * If the previews are defined as a function, it will be executed and the result returned.
     * Previews should be an array of component instances or null/undefined if none are defined.
     * 
     * @param {string} componentName - The name of the registered component
     * @returns {Array|null|undefined} Array of preview component instances, or null/undefined if none defined
     * 
     * @example
     * const previews = runtime.getComponentPreviews('Button');
     * // Returns: [Button({ label: 'Primary' }), Button({ label: 'Secondary', variant: 'outline' })]
     */
    getComponentPreviews(componentName) {
        let previews = this.getComponentExport(componentName, 'previews')
        if (previews && typeof previews == 'function') {
            previews = previews()
        }
        if (!Array.isArray(previews)) {
            previews = []
        }
        return previews
    }

    /**
     * Retrieves component previews with extracted metadata (id, title, component).
     * 
     * This method processes previews to extract custom names from the previewName modifier.
     * If a preview uses .previewName('Custom Name'), that name will be used as the title.
     * Otherwise, it defaults to "Preview N" where N is the 1-based index.
     * 
     * @param {string} componentName - The name of the registered component
     * @returns {Array<{id: string, title: string, component: any}>} Array of preview metadata objects
     * 
     * @example
     * const previews = runtime.getComponentPreviewsWithMetadata('Button');
     * // Returns: [
     * //   { id: '0', title: 'Default', component: [preview AST] },
     * //   { id: '1', title: 'Preview 2', component: [preview AST] }
     * // ]
     */
    getComponentPreviewsWithMetadata(componentName) {
        let previews = this.getComponentPreviews(componentName);
        return previews.map((preview, index) => {
            let previewAST = preview();
            let title = null;

            // Extract preview name if available from the previewName modifier
            if (previewAST?.type === "ModifiedComponent" && previewAST.props?.modifier?.type === "previewName") {
                title = previewAST.props?.modifier?.props?.rawValue;
            }

            return {
                id: String(index),
                title: title ?? `Preview ${index + 1} `,
                component: preview
            };
        });
    }

    /**
     * Retrieves the thumbnail representation for a registered component.
     * 
     * A thumbnail is a visual representation of a component used in galleries, catalogs,
     * or selection interfaces. The thumbnail can be defined as:
     * - A string containing SVG markup for a static icon/image
     * - A function that returns a component instance for dynamic thumbnails
     * - null/undefined if no custom thumbnail is defined (will fallback to preview)
     * 
     * Thumbnails are typically smaller, simplified versions of components optimized
     * for quick visual identification in component libraries or content browsers.
     * 
     * @param {string} componentName - The name of the registered component
     * @returns {string|Function|null|undefined} SVG string, thumbnail function, or null/undefined
     * 
     * @example
     * const thumbnail = runtime.getComponentThumbnail('Button');
     * // Returns: '<svg>...</svg>' or a function that generates the thumbnail
     */
    getComponentThumbnail(componentName) {
        return this.getComponentExport(componentName, 'thumbnail')
    }

    /**
     * Retrieves the icon name for a registered component.
     *
     * An icon is an optional string identifier (e.g. a Lucide icon name) that can be
     * used in component selection menus and context menus as a lightweight alternative
     * to full thumbnail rendering.
     *
     * @param {string} componentName - The name of the registered component
     * @returns {string|null|undefined} Icon name string, or null/undefined if not defined
     *
     * @example
     * const icon = runtime.getComponentIcon('Button');
     * // Returns: 'mouse-pointer-click' or null
     */
    getComponentIcon(componentName) {
        return this.getComponentExport(componentName, 'icon')
    }

    /**
     * Unwraps a component function and returns the AST by calling it.
     */
    unwrapComponentAST(callback) {
        // Unwrap component functions (_component marker)
        while (callback && callback._component) {
            callback = callback();
        }
        return callback
    }


    convertComponentProps(props) {
        return convertComponentProps.bind(this)(props)
    }

    /**
     * DEPRECATED
     * Calls a function within a registered component
     * @param {*} componentName 
     * @param {*} componentEntryPoint 
     * @returns 
     */
    call(componentName, componentEntryPoint = 'body', params, children, ...args) {
        const componentKeys = Object.keys(this.context);
        const functionList = componentKeys.join(', ');

        //console.log('call deprecated: ', componentName, componentEntryPoint);

        let func = null
        if (this.functionCache[componentName] && this.functionCache[componentName][componentEntryPoint]) {
            //console.log(`[cache hit ${ componentName }.${ componentEntryPoint }]`)
            func = this.functionCache[componentName][componentEntryPoint]
        } else {
            //console.log(`[constructing ${ componentName }.${ componentEntryPoint }]`)
            func = new Function(`{ ${functionList} } `, `var exports = {}; ${this.components[componentName]}; return ${componentEntryPoint} `)(this.context);
            this.functionCache[componentName][componentEntryPoint] = func
        }

        // Backward compatibility. Migrating props and metadata just to objects.
        if (typeof func === 'object') {
            return func
        }

        return func(params, children, ...args)
    }


    /**
     * Process the props for a component or a modifier ,expanding functions in arrays or values
     * @param {*} props 
     * @returns 
     */
    processProps(props) {
        if (props == null || typeof props != 'object') {
            return props
        }

        var newProps = { ...props }
        Object.keys(newProps).forEach(key => {
            let value = newProps[key]

            // Expand functions in arrays
            if (Array.isArray(value)) {
                newProps[key] = value.map(v =>
                    (typeof v === 'function' && v._component) ? v() : v
                )

                // If the value is an object, process its properties recursively
            } else if (typeof value === 'object' && value !== null) {
                newProps[key] = this.processProps(value)

                // Expand functions if value of key 
            } else if (typeof value === 'function' && value._component) {
                newProps[key] = newProps[key]()

                // Store any other setter functions
            } else if (typeof value === 'function' && (key.startsWith('set') || key.startsWith('on'))) {
                // Update from setWhateverKey to setWhateverKeyId;
                let setKey = key + 'Id';
                newProps[setKey] = this.storeFunction(value, this.currentPathId(key));
                delete newProps[key];
            }
        })
        return newProps
    }

    /**
     * Generate a unique identifier for the current hook path.
     *
     * @param {string|number} [name] - Optional segment to include in the path ID.
     * @returns {string} A comma-separated identifier
     */
    currentPathId(name) {
        const { path, childIndex } = this.hookState;
        let id = [this.rendererId ?? 0, ...path, name, childIndex].join(',');
        return id
    }

    /**
     * Creates a modifier function
     */
    #makeModifier(name, f) {

        const makeModifier = this.#makeModifier.bind(this)

        return (...args) => {

            const modifierContent = () => {

                const executeModifiedContent = (args) => {

                    // Capture the hook state so it can be maintained once the content is executed
                    const capturedHookState = { ...this.hookState }

                    // If this modifier is an id, store the name into the hook state so it can be used 
                    // for the hook path
                    if (name == 'id') {
                        this.hookState.modifierId = args[0]
                    }

                    // Will be a function to an inbuilt when modifying a custom component
                    let content = f()
                    if (typeof content === 'function') {
                        content = content()
                    }

                    // Reset hook state id
                    this.hookState.modifierId = null

                    // Restore state
                    this.hookState = { ...capturedHookState }

                    return content
                }

                /**
                 * Find modifier that handles the content for this modifier.
                 * GenericModifier is the default if no specific modifier is found.
                 */
                const modifierFunction = this.modifierRegistry[name] ?? this.modifierRegistry['GenericModifier']
                if (!modifierFunction) {
                    this.logger.warn(`Modifier ${name} not found`)
                    return {}
                }

                // Process args
                const processedArgs = args.map(arg => {
                    if (typeof arg === 'object' && !Array.isArray(arg)) {
                        return this.processProps(arg)
                    } else {
                        return arg
                    }
                })

                // Execute environment function provided by the modifier function if available
                var capturedEnvironment = null
                if (modifierFunction.environmentValue) {
                    const result = modifierFunction.environmentValue(name, processedArgs, this.environment)

                    // If the modifier function returns a value, store it in the environment. 
                    if (result) {
                        capturedEnvironment = { ...this.environment }
                        const { key, value } = result
                        this.environment[key] = value
                    }
                }

                // Execute content
                const content = executeModifiedContent(processedArgs)

                // Restore environment if needed
                if (capturedEnvironment) {
                    this.environment = capturedEnvironment
                }

                // Execute modifier function
                const { props: modifierProps, ast: modifierAst } = modifierFunction.bind(this)({ args: processedArgs, content: content, name: name })

                /**
                 * Modifier function can return either an AST or a new set of props. 
                 */

                // If the modifier function returns an AST, use it directly
                if (modifierAst) {

                    return modifierAst

                    // Otherwise, use the props to create a new modifier    
                } else {
                    return AST.ModifiedContent(AST.Directive(name, modifierProps, []), content)
                }

            }

            return new Proxy(modifierContent, {
                get: function (target, prop, receiver) {
                    if (prop == 'toJSON' || prop == 'type' || prop == 'children' || prop == 'props') {
                        return target[prop]
                    } else {
                        let modifierName = prop

                        return makeModifier(modifierName, modifierContent, ...arguments)
                    }
                }
            })
        }
    }

    makeComponent(body, props, children) {
        //console.log('Make component', body, props, children)
        return this.#makeComponent(body, props, children)
    }

    /**
     * Creates a component
     */
    #makeComponent(body, props, children, componentName) {

        const f = () => {

            let { path, modifierId, childIndex, componentHookStore, currentComponent, forEachElementId } = this.hookState

            // Push on to hook state path
            // Use id if specified otherwise use child index + component name to create a deterministct path to that item.
            var id = null
            if (modifierId) {
                id = modifierId + componentName + '_' + childIndex
            } else if (forEachElementId) {
                id = forEachElementId
            } else {
                id = componentName + '_' + childIndex
            }

            path.push(id)

            // Create path key. This is a unique key consistent across renders
            let hookKey = path.join('.')

            // Get hook storage for this component
            let hookStorage = componentHookStore[hookKey] ?? (componentHookStore[hookKey] = []);

            // Setup component hook state for the component we're about to call
            currentComponent.hookStorage = hookStorage
            currentComponent.hookIndex = 0

            // Call the content function
            let r = body(props, children)

            // Reset
            currentComponent.hookStorage = null
            path.pop()

            return r
        }

        f._component = true

        const makeModifier = this.#makeModifier.bind(this)

        return new Proxy(f, {
            get: function (target, prop, receiver) {
                if (prop == 'toJSON' || prop == 'type' || prop == 'children' || prop == 'props') {
                    return target[prop]
                }
                return makeModifier(prop, f, ...arguments)
            }
        })
    }

    #generateUniqueID() {
        return Math.random().toString(36).substring(7)
    }

    storeEnvironment(environmentId, options = {}) {
        const id = environmentId ?? this.#generateUniqueID()
        if (this.environment) {
            this.storedEnvironments[id] = { ...this.environment }
        }
        if (this.hookState) {
            this.storedHookStates[id] = { path: [...this.hookState.path], restoreHookStateStorage: options?.restoreHookStateStorage }
        }
        return id
    }

    restoreFunction(functionId) {
        return this.storedFunctions[functionId]
    }

    storeFunction(f, functionId) {
        const id = functionId ?? this.#generateUniqueID()
        this.storedFunctions[id] = f
        return id
    }

    restoreData(dataId) {
        return this.storedData[dataId]
    }

    storeData(data, dataId) {
        const id = dataId ?? this.#generateUniqueID()
        this.storedData[id] = data
        return id
    }

    setForEachElementId(id) {
        this.hookState.forEachElementId = id
    }

    /**
    * Creates a built in component
    */
    #makeInBuiltComponent(type, args) {

        return this.#makeComponent((...componentArgs) => {

            const handler = this.componentRegistry[type] ?? this.componentRegistry['GenericComponent']
            const { props, children, ast } = handler.bind(this)({ args: args, name: type })

            /**
             * Component AST
             */
            if (ast) {
                return ast
            } else {
                return AST.Directive(type, { ...props }, children ?? [])
            }

        }, args[0], args[1], type)
    }

    /**
     * 
     * Calls the contents of a ForEach function with a specific element and index.
     * 
     * @param {string} functionId 
     * @param {string?} environmentId 
     * @param {any} element 
     * @param {number} index 
     * @returns 
     */
    callForEachFunction(functionId, element, index) {
        let f = this.restoreFunction(functionId)
        let result = f(element, index)
        while (result && result._component) {
            result = result()
        }
        return result
    }

    /**
     * Gets a component from the context
     */
    getComponent(name) {
        return this.context[name]
    }
}
