import React, { useEffect, useState, useRef, forwardRef, useLayoutEffect } from 'react';
import styled from 'styled-components'
import { FunctionContext } from './ui/Function';
import { RendererContext } from './RendererContext';
import { YapUIDecoder } from '../YapUIDecoder.js';
import { AST } from '@metabindai/bindjs-runtime';
import { ChildrenContext } from './ui/Children';
import { Environment } from './ui/Environment';
import { getDomEvents } from './Utils';
import { ActionsProvider } from './ui/Actions';
import { Root } from './ui/Root';
import useMeasure from 'react-use-measure'
import { useDarkMode, useWindowSize } from 'usehooks-ts'
import { useRendererEnvironmentContext, useRendererExecutionContext } from './RendererContext';
import { AnimationContext, useAnimationContext } from './ui/AnimationContext';
import { ErrorBoundary } from "react-error-boundary";
import { devTools } from '../devtools';
import { useContent } from './ui/ContentProvider';
import { useDocumentScroll } from './ui/ScrollViewContext';

export function Renderer(props) {
    const contextEnvironment = structuredClone(useRendererEnvironmentContext())

    const documentScroll = useDocumentScroll();

    // If screen is provided in props, use that, otherwise use the context environment screen.
    // Assumes will always be passed in order to maintain hook consistency.
    const screen = props?.environment?.screen ?? contextEnvironment.screen
    const [measureRef, measuredBounds] = useMeasure()
    const [ref, bounds] = screen ? [null, screen] : [measureRef, measuredBounds]

    const windowSize = useWindowSize()

    const { isDarkMode } = useDarkMode()

    // Function to round values based on device pixel ratio (scale)
    const roundToScale = (value) => {
        const scale = window.devicePixelRatio || 1
        const increment = 1 / scale
        return Math.round(value / increment) * increment
    }

    // Determine color scheme based on context environment or system preference

    let externalEnvironment = {
        ...contextEnvironment,
        ...(props.environment ?? {})
    }
    const systemColorScheme = (isDarkMode ? 'dark' : 'light')
    const colorScheme = externalEnvironment.colorScheme ?? systemColorScheme

    // When document scrolling, the container grows to the full document height,
    // so measure the viewport instead to keep `screen.height` as the visible area.
    const useDocScroll = documentScroll?.useDocumentScroll == true
    const screenHeight = useDocScroll ? Math.min(bounds?.height, windowSize?.height) : bounds?.height
    const hasSized = bounds?.width > 0;

    const environmentData = {
        colorScheme: colorScheme,
        systemColorScheme: systemColorScheme,
        platform: 'web',
        screen: {
            width: roundToScale(bounds?.width ?? 0),
            height: roundToScale(hasSized ? screenHeight ?? 0 : 0)
        },
        ...externalEnvironment
    }


    // fullHeight prop - default to true for backwards compatibility
    var fullHeight = props.fullHeight !== false;
    if (useDocScroll) {
        fullHeight = false;
    }

    // Debug
    devTools.object('Renderer', {
        environment: environmentData,
        props: props
    })

    return (
        <ErrorBoundary fallback={<div></div>}>
            <RendererContentContainer ref={ref} className="rendererContainer" $colorScheme={colorScheme} $fullHeight={fullHeight}>
                {hasSized && <RendererContent {...props} environment={structuredClone(environmentData)} key={props.id ?? props.componentName} />}
            </RendererContentContainer>
        </ErrorBoundary>
    )
};

// Deafult app state storage.
const rendererGlobalAppState = {}

var activeRenderers = {}
var rendererIndex = 0
var performRerender = (rendererId) => {
    let r = activeRenderers[rendererId]
    if (r) {
        r()
    }
}

export function RendererContent(componentProps) {
    return useRendererContent(componentProps)
}

function useRendererContent(componentProps) {

    var { updateEveryRender,
        version,
        runtime,
        ast,
        onDependencyUpdate,
        onASTUpdate,
        props = null,
        componentName,
        frame, frameProps,
        viewCallback, navigateCallback, actionCallback,
        usePreviews = true, previewIndex,
        useThumbnail = null,
        resetState = false,
        environment } = componentProps

    const domEvents = getDomEvents(componentProps)
    delete domEvents['onDependencyUpdate']

    devTools.event('Renderer', 'render')

    /**
     * Allow hirearchy to provide an animation context.
     */
    const animationContext = useAnimationContext()
    const parentAnimation = animationContext?.enabled ? animationContext : undefined

    var [result, setResult] = useState(null);
    var [resultAnimation, setResultAnimation] = useState(parentAnimation ?? { enabled: false });

    const componentContent = runtime ? runtime.components[componentName] : null

    const externalCallbackRef = useRef(null)
    const dependencyRef = useRef([])

    // Pending animation to be applied on next render
    const pendingAnimationRef = useRef(null)

    // Indirection so `activeRenderers[id]` always invokes the latest `needsRerender`
    // closure (which captures the current render's `props`), not the one from mount.
    const needsRerenderRef = useRef(null)

    // Define an id for this renderer instance
    const rendererIdRef = useRef(0)
    const renderVersion = useRef(0)
    const executionContext = useRendererExecutionContext()

    // When componentName changes for this renderer (e.g. a component editor
    // navigates to a different component) clear only THIS renderer's storage.
    // A full runtime.resetStorage() here would wipe sibling renderers (like a
    // thumbnail mounted elsewhere) that share the same runtime instance.
    const lastComponentNameRef = useRef(null)
    if (lastComponentNameRef.current !== componentName) {
        if (resetState && lastComponentNameRef.current !== null && runtime) {
            runtime.resetRendererStorage(rendererIdRef.current)
        }
        lastComponentNameRef.current = componentName
    }

    const contentContext = useContent()

    const resolvedDependanciesCallback = (dependancies) => {
        dependancies.forEach(d => {
            if (dependencyRef.current.indexOf(d) == -1) {
                dependencyRef.current.push(d)
            }
        })
    }

    // Callback used when state is changed within the runtime requiring a re-render
    const needsRerender = () => {
        // Consume pending animation if set, otherwise use disabled
        const animationForRender = pendingAnimationRef.current ?? { enabled: false }
        pendingAnimationRef.current = null // Reset immediately after consuming

        setResultAnimation(animationForRender)
        let r = update()
        if (r) {
            renderVersion.current++;
            setResult(r)
        }
    }
    needsRerenderRef.current = needsRerender

    const withAnimation = (handlerId, options) => {
        // Set pending animation - will be consumed on next render
        pendingAnimationRef.current = {
            enabled: true,
            ...options
        };

        // Execute the handler which will trigger needsRerender
        let f = runtime.restoreFunction(handlerId)
        f(handlerId)
    }


    /**
     * On load, keep track of this renderer's render function.
     * Remove it when the component unmounts.
     */
    useEffect(() => {
        if (rendererIdRef.current == 0) {
            let id = rendererIndex++
            rendererIdRef.current = id
        }

        const id = rendererIdRef.current
        activeRenderers[id] = () => needsRerenderRef.current?.()
        if (runtime) {
            runtime.setRendererId(rendererIdRef.current)
        }

        return () => {
            delete activeRenderers[id]
        }
    }, [])

    /**
     * Assign the rerender function to the runtime (if not already assigned).
     * This is used by the runtime to trigger a re-render when a component changes.
     * 
     * Currenly all active components will be re-rendered when one changes. 
     * TODO: May be better to have runtime be able to keep reference in the future and indicate with instance needs re-rendering.
     */
    if (runtime) {
        runtime.needsRerender = performRerender
        runtime.withAnimation = withAnimation
        runtime.onUpdateAppState = (key, value, newState) => {
            Object.assign(rendererGlobalAppState, newState)
        }
        runtime.navigateCallback = navigateCallback ? (props) => {
            // If pending animation is set, pass it along for navigation
            const animContext = pendingAnimationRef.current
            navigateCallback({ ...props, animationContext: animContext?.enabled ? animContext : undefined })
        } : (() => { console.warn('No navigate callback provided') })
        runtime.actionCallback = actionCallback ? actionCallback : ({ name, props }) => {
            console.log('Action not handled', name, props)
        }
    }

    const update = () => {
        dependencyRef.current = []

        if (runtime === undefined) {
            return;
        }

        if (runtime) {
            runtime.registerAppState(rendererGlobalAppState)
            runtime.willRender()
            runtime.registerEnvironment({ ...environment })
            runtime.aliasComponent(componentName, 'Self')
            runtime.setRendererId(rendererIdRef.current)
            runtime.getContent = contentContext.getContent

            // Debug app state
            if (runtime.appState && Object.keys(runtime.appState).length > 0) {
                devTools.object(`renderer.appState`, runtime.appState)
            }
            devTools.object('renderer.components', runtime.components);
            devTools.object('renderer.context', runtime.context);
        }

        // Body AST
        var bodyAST = null

        // If manually passed in
        if (ast) {
            bodyAST = ast()
            while (bodyAST && typeof bodyAST == 'function') {
                bodyAST = bodyAST()
            }
        }

        /**
         * Component name that'l be used for final render
         * Can changed depending on if has previews and / or frame.
         */
        var renderComponentName = componentName

        /**
         * Do render
         */
        if (!bodyAST) {

            try {
                // Execute the component, based on the context.
                // Dont unwrap until the end so environment works correctly when chaining.
                var componentResult = null;
                if (useThumbnail) {
                    componentResult = runtime.callComponentThumbnail(renderComponentName, useThumbnail ?? { type: 'component' }, props ?? {}, [], false);
                } else if (usePreviews) {
                    componentResult = runtime.callComponentPreview(renderComponentName, previewIndex ?? 0, props ?? {}, [], false);
                } else {
                    componentResult = runtime.callComponent(renderComponentName, props ?? {}, [], false);
                }

                // If a frame component has been specified, then wrap the body in the frame
                if (frame) {
                    componentResult = runtime.callComponent(frame, frameProps ?? {}, [componentResult], false);
                }

                bodyAST = runtime.unwrapComponentAST(componentResult);
            } catch (e) {
                var issue = {
                    type: 'error',
                    message: '',
                    componentName: componentName
                };

                // Check if e is an Error-like object
                if (e && typeof e === 'object') {
                    if (typeof e.message === 'string') {
                        issue.message = e.message;
                    } else {
                        issue.message = String(e);
                    }
                    if (typeof e.stack === 'string') {
                        issue.stack = e.stack;
                    }
                    if (typeof e.name === 'string') {
                        issue.errorName = e.name;
                    }
                } else {
                    // e is a string, number, or something else
                    issue.message = String(e);
                    issue.rawError = e;
                }

                executionContext.executionIssue(issue);
                console.error(`Error rendering ${componentName}`, issue)
            }
        }

        if (bodyAST == null) {
            return null
        }

        if (onASTUpdate) {
            onASTUpdate(bodyAST)
        }

        /**
         * Callback that either returns a react view from external callback or from the runtime.
         */
        const finalViewCallback = (name, props, children, environmentId, entryPoint = 'body') => {
            runtime.setRendererId(rendererIdRef.current)

            return viewCallback ? viewCallback(name, props, children, environmentId) : null
        }

        externalCallbackRef.current = finalViewCallback

        /**
         * Setup a render view callback to handle 'Self' and current component name views
         */
        const renderViewCallback = (name, props, children, environmentId) => {

            if (name == '_Body') {
                return YapUIDecoder(bodyAST, renderViewCallback, resolvedDependanciesCallback)
            } else {
                return finalViewCallback(name, props, children, environmentId ?? props?.environmentId)
            }
        }

        /*
        * Apply frame if provided
        */
        var bodyContent = AST.Directive('_Body', {}, [])

        devTools.event('Renderer', 'update')

        const result = YapUIDecoder(bodyContent, renderViewCallback, resolvedDependanciesCallback)

        if (onDependencyUpdate) {
            onDependencyUpdate([...dependencyRef.current])
        }

        return result
    }

    if (updateEveryRender) {
        renderVersion.current++
        result = update()
    }

    useEffect(() => {
        if (!updateEveryRender) {
            renderVersion.current++
            // For initial/external renders, consume any pending animation or use disabled
            const animationForRender = pendingAnimationRef.current ?? { enabled: false }
            pendingAnimationRef.current = null
            setResultAnimation(animationForRender)
            let r = update()
            if (r) {
                setResult(r)
            }
        }
    }, [updateEveryRender, frame, frameProps, previewIndex, componentContent, componentName, props, version, JSON.stringify(environment)])

    /**
     * Callback to allow a view to be created from a body AST.
     * Used by Button and Text styles
     * @param {*} body 
     * @param {*} props 
     * @param {*} children 
     * @returns 
     */
    const makeViewCallback = (body, props, children) => {
        return runtime.makeComponent(body, props, children)
    }

    const dataCallback = (dataId) => {
        let data = runtime.restoreData(dataId)
        //console.log('Data ', data)
        return data ?? []
    }

    const functionCallback = (functionId, environmentId) => {
        if (environmentId) {
            runtime.restoreEnvironment(environmentId)
        }

        let f = runtime.restoreFunction(functionId)
        if (!f) {
            console.warn('function not restored', functionId)
        }
        //console.log(`function ${functionId}`, f)
        return f ?? (() => { return null })
    }

    const decodeViewCallback = (ast) => {
        return YapUIDecoder(ast, externalCallbackRef.current)
    }

    const setForEachId = (id) => {
        runtime.setForEachElementId(id)
    }

    const restoreEnvironmentCallback = (environmentId) => {
        if (environmentId) {
            runtime.restoreEnvironment(environmentId)
        }
    }

    const getEnvironmentCallback = (environmentId) => {
        return runtime.getEnvironment(environmentId) ?? { noEnv: environmentId }
    }

    const forEachCallback = (functionId, element, index) => {
        return runtime.callForEachFunction(functionId, element, index)
    }

    return (
        <RendererContext.Provider value={{
            viewCallback: externalCallbackRef.current,
            makeView: makeViewCallback,
            navigateCallback: navigateCallback,
            dataCallback: dataCallback,
            functionCallback: functionCallback,
            decodeViewCallback: decodeViewCallback,
            restoreEnvironmentCallback: restoreEnvironmentCallback,
            getEnvironmentCallback: getEnvironmentCallback,
            forEachCallback: forEachCallback,
            setForEachId: setForEachId,
            renderVersion: renderVersion.current
        }}>
            <AnimationContext.Provider value={resultAnimation}>
                <ChildrenContext.Provider value={{ children: [] }}>
                    <FunctionContext.Provider value={{ functions: {}, functionArgs: {}, scripts: {} }}>
                        <ActionsProvider actions={domEvents} showPointer={false}>
                            <Environment values={{ ...environment }}>
                                <Root>
                                    {result}
                                </Root>
                            </Environment>
                        </ActionsProvider>
                    </FunctionContext.Provider>
                </ChildrenContext.Provider>
            </AnimationContext.Provider>
        </RendererContext.Provider>
    )
}

const RendererContentContainer = styled.div.attrs(props => ({
    'data-color-scheme': props.$colorScheme
}))`
    ${props => props.$colorScheme === 'dark' ? rendererDarkStyle : rendererLightStyle}
    display: flex;
    flex-direction: column;;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    ${props => props.$fullHeight !== false ? 'height: 100%;' : 'height: auto;'}
    width: 100%;
    user-select: none;

    & * {
        box-sizing: border-box;
    }
`

const rendererDarkStyle = `
    color-scheme: dark;
    color: #ffffff;

    --color-bg: rgb(28, 28, 28);
    --color-page-bg: #0d0d0dff;
    --color-bg-secondary: rgb(20, 20, 20);
    --color-bg-group-secondary: rgb(20, 20, 20);
    --color-bg-dialog: rgb(28, 28, 28);
    --color-bg-blur: rgba(34, 34, 34, 0.8);
    --color-text: #ffffff;
    --color-text-rgb: 255, 255, 255;
    --color-text-secondary: rgba(184, 184, 184, 0.38);
    --color-text-tertiary: rgba(184, 184, 184, 0.25);
    --color-text-quaternary: rgba(184, 184, 184, 0.15);
    --color-text-error: #ff3b30;
    --color-icon-secondary: rgb(105, 105, 105);
    --color-primary: rgb(13, 121, 236);
    --color-primary-rgb: 13, 121, 236;
    --color-border: rgb(49, 49, 49);
    --color-divider: rgb(42, 42, 42);
    --color-background-selection: rgb(46, 46, 46);
    --color-background-selection-highlight: rgba(5, 62, 123, 0.4);
    --color-background-control: rgba(21, 21, 21, 0.55);
    --color-background-control-rgb: 21, 21, 21;
    --color-preview-bg: rgb(28, 28, 28);
`;

const rendererLightStyle = `
    color-scheme: light;
    color: #000000;
    font-size: 14px;

    --color-bg: #ffffff;
    --color-page-bg: #f6f6f8;
    --color-page-bg-secondary: #f2f2f6;
    --color-bg-secondary: #fafafa;
    --color-bg-group-secondary: #f6f6f6;
    --color-bg-dialog: #ffffff;
    --color-bg-blur: #ffffff80;
    --color-destructive: #ff3b30;
    --color-text: #000000;
    --color-text-rgb: 0, 0, 0;
    --color-text-secondary: rgba(0, 0, 0, 0.6);
    --color-text-tertiary: rgba(0, 0, 0, 0.35);
    --color-text-quaternary: rgba(0, 0, 0, 0.2);
    --color-text-error: #ff3b30;
    --color-icon-primary: rgb(33, 33, 33);
    --color-icon-secondary: rgb(160, 160, 160);
    --color-primary: rgba(50, 145, 239, 1);
    --color-primary-rgb: 50, 145, 239;
    --color-primary-highlight: rgb(13, 73, 133);
    --color-white: #ffffff;
    --color-border: #e3e3e3;
    --color-divider: #eaeaeaff;
    --color-row-alt: #f1f1f1ff;
    --color-background-control: #f3f3f3;
    --color-background-control-rgb: 243, 243, 243;
    --color-background-selection: rgb(242, 242, 242);
    --color-background-selection-highlight: rgb(233, 240, 247);
    --color-sidebar-background-selection: rgba(0, 0, 0, 0.05);
    --content-margin: 20px;
    --color-preview-bg: #ffffff;
`;


Renderer.prototype.sizeThatFits = ({ inProposedSize, props, children }) => {
    console.error('Shouldnt be called')
    //return sizeForMaxChild({ children, inProposedSize })
}

// RendererContentContainer.prototype.sizeThatFits = ({ inProposedSize, props, children }) => {
//     return sizeForMaxChild({ children, inProposedSize })
// }  

RendererContent.prototype.sizeThatFits = ({ inProposedSize, props, children }) => {
    console.error('Shouldnt be called')
    //return sizeForMaxChild({ children, inProposedSize })
}  
