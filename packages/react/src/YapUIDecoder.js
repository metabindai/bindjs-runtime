import React from 'react';
import { shouldApplyChartModifierContext } from './YapUIDecoderChartScope';

// Modifiers
import {
    ContainerRelativeFrame,
    BackgroundBlur,
    UnhandledModifer,
    ThumbnailScale, ButtonStyle,
} from './Renderer/ui/Modifiers';
import { ControlSize } from './Renderer/ui/Modifiers/ControlSize';
import { TextSelection } from './Renderer/ui/Modifiers/TextSelection';
import { devTools } from './devtools';

import { ZIndex } from './Renderer/ui/Modifiers/ZIndex';
import { Hidden } from './Renderer/ui/Modifiers/Hidden';
import {
    Grayscale,
    Saturation,
    Brightness,
    Contrast,
    ColorInvert
} from './Renderer/ui/Modifiers/ImageEffects';

import { Padding } from './Renderer/ui/Modifiers/Padding'
import { Frame } from './Renderer/ui/Modifiers/Frame'
import { ForegroundStyle } from './Renderer/ui/Modifiers/ForegroundStyle';
import {
    Font,
    FontWeight,
    FontSize,
    LineSpacing,
    MultilineTextAlignment,
    Bold,
    Italic,
    Strikethrough,
    Underline,
    Monospaced,
    FontDesign,
    LineLimit,
    Tracking,
    TextCase
} from './Renderer/ui/Modifiers/Font';

import { ColorScheme } from './Renderer/ui/Modifiers/ColorScheme';
import { DynamicTypeSize } from './Renderer/ui/Modifiers/DynamicTypeSize';
import { Overlay } from './Renderer/ui/Modifiers/Overlay';
import { Background } from './Renderer/ui/Modifiers/Background';
import { Shadow } from './Renderer/ui/Modifiers/Shadow';
import { Border, BorderWidth } from './Renderer/ui/Modifiers/Border';
import { Opacity } from './Renderer/ui/Modifiers/Opacity';
import { CornerRadius } from './Renderer/ui/Modifiers/CornerRadius';
import { Offset } from './Renderer/ui/Modifiers/Offset';
import { Blur } from './Renderer/ui/Modifiers/Blur';
import { BlendMode } from './Renderer/ui/Modifiers/ImageEffects';
import { AllowsHitTesting } from './Renderer/ui/Modifiers/AllowsHitTesting';
import { Disabled } from './Renderer/ui/Modifiers/Disabled';
import { ScaleEffect } from './Renderer/ui/Modifiers/ScaleEffect';
import { RotationEffect } from './Renderer/ui/Modifiers/RotationEffect';
import { TransformEffect } from './Renderer/ui/Modifiers/TransformEffect';
import { ID } from './Renderer/ui/Modifiers/ID';
import { Tag } from './Renderer/ui/Modifiers/Tag';
import { Link } from './Renderer/ui/Modifiers/Link';
import { AccentColor } from './Renderer/ui/Modifiers/AccentColor';
import { GlassEffect } from './Renderer/ui/Modifiers/GlassEffect';
import { Mask } from './Renderer/ui/Modifiers/Mask';
import { ClipShape } from './Renderer/ui/Modifiers/ClipShape';
import { VisualEffectModifier } from './Renderer/ui/Modifiers/VisualEffect';
import { IgnoresSafeArea } from './Renderer/ui/Modifiers/IgnoresSafeArea';
import { ScrollTargetLayout, ScrollTargetBehavior } from './Renderer/ui/Modifiers/ScrollTarget';

// Views
import { Spacer } from './Renderer/ui/Views/Spacer';
import { VStack } from './Renderer/ui/Views/VStack';
import { HStack } from './Renderer/ui/Views/HStack';
import { ZStack } from './Renderer/ui/Views/ZStack';
import { Button } from './Renderer/ui/Views/Button';
import { ForEach } from './Renderer/ui/Views/ForEach';
import { Circle } from './Renderer/ui/Views/Circle';
import { Group } from './Renderer/ui/Views/Group';
import { Rectangle, RoundedRectangle } from './Renderer/ui/Views/Rectangle';
import { Ellipse } from './Renderer/ui/Views/Ellipse';
import { Capsule } from './Renderer/ui/Views/Capsule';
import { Shader } from './Renderer/ui/Views/Shader';
import { Material } from './Renderer/ui/Views/Material';
import Text from "./Renderer/ui/Views/Text"
import Markdown from "./Renderer/ui/Views/Markdown"
import { TextEditor } from './Renderer/ui/Views/TextEditor';
import { Script } from './Renderer/ui/Script';
import { UIImage } from './Renderer/ui/Views/Image';
import { UIVideo } from './Renderer/ui/Views/Video';
import { UIContent } from './Renderer/ui/Views/Content';
import { ScrollView } from './Renderer/ui/Views/ScrollView';
import { Divider } from './Renderer/ui/Views/Divider';
import { Color } from './Renderer/ui/Views/Color';
import { LinearGradient } from './Renderer/ui/Views/LinearGradient';
import { AngularGradient } from './Renderer/ui/Views/AngularGradient';
import { RadialGradient } from './Renderer/ui/Views/RadialGradient';
import { EllipticalGradient } from './Renderer/ui/Views/EllipticalGradient';
import { TextField } from './Renderer/ui/Views/TextField';
import { Toggle } from './Renderer/ui/Views/Toggle';
import { Slider } from './Renderer/ui/Views/Slider';
import { ProgressView } from './Renderer/ui/Views/ProgressView';
import { ComposerGroup, ComposerAdd } from './Renderer/ui/ComposerGroup';
import { EmptyView } from './Renderer/ui/Views/EmptyView';
import { ReactRepresentable } from './Renderer/ui/ReactRepresentable';
import { Section } from './Renderer/ui/Views/Section';
import { DOMIdentifable } from './Renderer/ui/DOMIdentifable';
import { Placeholder } from './Renderer/ui/Views/Placeholder';
import { Model3D } from './Renderer/ui/Views/Model3D';
import { Picker } from './Renderer/ui/Views/Picker';
import { NavigationLink } from './Renderer/ui/Views/NavigationLink';
import { GeometryReader } from './Renderer/ui/Views/GeometryReader';
import { Chart } from './Renderer/ui/Views/Chart/Chart';
import { PieChart } from './Renderer/ui/Views/Chart/PieChart';
import { AreaMark, BarMark, LineMark, PieSliceMark, PointMark, RectangleMark, RuleMark } from './Renderer/ui/Views/Chart/Marks';
import {
    Annotation as ChartAnnotationModifier,
    ChartForegroundStyleScale,
    ChartLegend,
    ChartSelection,
    ChartSymbolScale,
    ChartXAxis,
    ChartXAxisLabel,
    ChartXScale,
    ChartXSelection,
    ChartYAxis,
    ChartYAxisLabel,
    ChartYScale,
    ChartYSelection,
    ChartAccessibilityHint,
    ChartAccessibilityLabel,
    ChartAccessibilityValue,
    InterpolationMethod,
    LineStyle,
    Symbol as ChartSymbol,
    SymbolSize,
} from './Renderer/ui/Views/Chart/ChartModifierContext';

import { PreviewFrame } from './Renderer/ui/PreviewFrame';
import { Component } from './Renderer/ui/Component';

// Actions 
import { OnTapGesture } from './Renderer/ui/Modifiers/OnTapGesture';
import { OnHover } from './Renderer/ui/Modifiers/OnHover';
import { OnChange } from './Renderer/ui/Modifiers/OnChange';
import { OnAppear } from './Renderer/ui/Modifiers/OnAppear';
import { OnDisappear } from './Renderer/ui/Modifiers/OnDisappear';
import { OnDragGesture } from './Renderer/ui/Modifiers/OnDrag';
import { OnLongPressGesture } from './Renderer/ui/Modifiers/OnLongPress';

// Environment
import { EnvironmentValue } from './Renderer/ui/Modifiers/EnvironmentValue';
import { AspectRatio, ScaledToFill, ScaledToFit } from './Renderer/ui/Modifiers/AspectRatio';
import { FixedSize } from './Renderer/ui/Modifiers/FixedSize';

const debug = false;
const debugPerformance = false;

// Tag / component map
const componentsMap = {
    HStack: HStack,
    VStack: VStack,
    ZStack: ZStack,
    LazyHStack: HStack,
    LazyVStack: VStack,
    ScrollView: ScrollView,
    Spacer: Spacer,
    Text: Text,
    Markdown: Markdown,
    Divider: Divider,
    //Children: Children,
    Section: Section,
    Image: UIImage,
    UIImage: UIImage,
    Video: UIVideo,
    UIVideo: UIVideo,
    Content: UIContent,
    ForEach: ForEach,
    Script: Script,
    Color: Color,
    LinearGradient: LinearGradient,
    AngularGradient: AngularGradient,
    RadialGradient: RadialGradient,
    EllipticalGradient: EllipticalGradient,
    Button: Button,
    Circle: Circle,
    Rectangle: Rectangle,
    RoundedRectangle: RoundedRectangle,
    Ellipse: Ellipse,
    Capsule: Capsule,
    Shader: Shader,
    Material: Material,
    Group: Group,
    PreviewFrame: PreviewFrame,
    Component: Component,
    TextField: TextField,
    SecureField: TextField,
    TextEditor: TextEditor,
    Toggle: Toggle,
    Slider: Slider,
    ProgressView: ProgressView,
    Chart: Chart,
    PieChart: PieChart,
    BarMark: BarMark,
    LineMark: LineMark,
    AreaMark: AreaMark,
    PointMark: PointMark,
    RuleMark: RuleMark,
    RectangleMark: RectangleMark,
    PieSliceMark: PieSliceMark,

    ComposerGroup: ComposerGroup,

    ComposerAdd: ComposerAdd,
    ComposerChildren: ComposerGroup,
    ComposerComponents: ComposerGroup,

    ReactRepresentable: ReactRepresentable,
    DOMIdentifable: DOMIdentifable,
    EmptyView: EmptyView,
    Empty: EmptyView,
    Placeholder: Placeholder,

    Model3D: Model3D,
    Picker: Picker,
    NavigationLink: NavigationLink,
    GeometryReader: GeometryReader,
    CustomFont: EmptyView,
    FontCustom: EmptyView
};

export const registerComponent = (name, component) => {
    if (debug) { console.log('registerComponent:', name, component) }
    componentsMap[name] = component;
}

// Modifier map
const modifiersMap = {
    padding: Padding,
    foregroundStyle: ForegroundStyle,
    background: Background,
    opacity: Opacity,
    overlay: Overlay,
    lineSpacing: LineSpacing,
    font: Font,
    fontStyle: Font,
    fontSize: FontSize,
    fontWeight: FontWeight,
    fontDesign: FontDesign,
    bold: Bold,
    italic: Italic,
    strikethrough: Strikethrough,
    underline: Underline,
    monospaced: Monospaced,
    border: Border,
    borderWidth: BorderWidth,
    shadow: Shadow,
    blur: Blur,
    backgroundBlur: BackgroundBlur,
    grayscale: Grayscale,
    saturation: Saturation,
    brightness: Brightness,
    contrast: Contrast,
    colorInvert: ColorInvert,
    glassEffect: GlassEffect,
    blendMode: BlendMode,
    offset: Offset,
    cornerRadius: CornerRadius,
    containerRelativeFrame: ContainerRelativeFrame,
    allowsHitTesting: AllowsHitTesting,
    frame: Frame,
    zIndex: ZIndex,
    onTapGesture: OnTapGesture,
    onHover: OnHover,
    onDragGesture: OnDragGesture,
    onLongPressGesture: OnLongPressGesture,
    onAppear: OnAppear,
    onChange: OnChange,
    onDisappear: OnDisappear,
    previewName: UnhandledModifer,
    previewFrame: UnhandledModifer,
    tag: UnhandledModifer,
    id: ID,
    tag: Tag,
    disabled: Disabled,
    hidden: Hidden,
    link: Link,
    scaleEffect: ScaleEffect,
    rotationEffect: RotationEffect,
    multilineTextAlignment: MultilineTextAlignment,
    lineLimit: LineLimit,
    tracking: Tracking,
    textCase: TextCase,
    thumbnailScale: ThumbnailScale,
    buttonStyle: ButtonStyle,
    controlSize: ControlSize,
    textSelection: TextSelection,
    transformEffect: TransformEffect,
    environment: EnvironmentValue,
    colorScheme: ColorScheme,
    dynamicTypeSize: DynamicTypeSize,
    aspectRatio: AspectRatio,
    scaledToFit: ScaledToFit,
    scaledToFill: ScaledToFill,
    fixedSize: FixedSize,
    accentColor: AccentColor,
    mask: Mask,
    clipShape: ClipShape,
    visualEffect: VisualEffectModifier,
    ignoresSafeArea: IgnoresSafeArea,
    scrollTargetLayout: ScrollTargetLayout,
    scrollTargetBehavior: ScrollTargetBehavior,
    chartXAxis: ChartXAxis,
    chartYAxis: ChartYAxis,
    chartXScale: ChartXScale,
    chartYScale: ChartYScale,
    chartForegroundStyleScale: ChartForegroundStyleScale,
    chartSelection: ChartSelection,
    chartSymbolScale: ChartSymbolScale,
    chartXSelection: ChartXSelection,
    chartYSelection: ChartYSelection,
    chartLegend: ChartLegend,
    chartXAxisLabel: ChartXAxisLabel,
    chartYAxisLabel: ChartYAxisLabel,
    lineStyle: LineStyle,
    interpolationMethod: InterpolationMethod,
    symbol: ChartSymbol,
    symbolSize: SymbolSize,
    annotation: ChartAnnotationModifier,
    accessibilityLabel: ChartAccessibilityLabel,
    accessibilityHint: ChartAccessibilityHint,
    accessibilityValue: ChartAccessibilityValue
};

const preventDecode = {
    link: true,
    Chart: true,
    PieChart: true
}

/**
 * YapUIDecoder decodes a JSON structure representing YapUI Directives or Variables 
 * into React components or HTML elements. It handles variables, custom components, 
 * modifiers, and external view dependencies through a view callback.
 *
 * @param {Object} json - The JSON structure representing the UI to be decoded.
 * @param {function} viewCallback - A callback function that can handle external view dependencies.
 *                                  This function is called when the element type is not recognized
 *                                  in the internal component or modifier maps.
 *
 * @returns {ReactElement|null} The decoded React element or null if the decoding fails.
 */
export function YapUIDecoder(json, viewCallback, resolvedDependanciesCallback) {

    const startTime = performance.now();
    var componentDependencies = []

    var decodeCallCount = 0;
    var performanceStats = {
        components: 0,
        modifiers: 0,
        props: 0,
        arrays: 0
    };

    devTools.event('YapUIDecoder', 'call');

    /**
     * Recursively decodes a JSON element into a React element or an HTML tag.
     * Handles text content, components, modifiers, variables, and external views.
     *
     * @param {Object} element - The JSON element to decode.
     * @returns {ReactElement|null} The decoded React element or null if the decoding fails.
     */
    const decodeProp = (prop, stack, retainJSON, element, index = 0, shallow = false) => {
        if (debug) { console.log('decodeProp:', prop) }

        //return null
        if (prop == null) {
            return prop;

            // Ignore if already a react element
        } else if (React.isValidElement(prop)) {

            return prop

            // array
        } else if (Array.isArray(prop)) {
            performanceStats.arrays++;
            if (shallow) {
                return prop
            } else {
                return prop.map((child, childIndex) => {
                    return decodeProp(child, stack + 1, retainJSON, element, childIndex)
                })
            }
            // dictionary
        } else if (typeof prop == 'object' && prop.type == null) {
            return Object.fromEntries(
                // Set shallow to true so that arrays and objects in props are not further decoded.
                // As want to avoid decoding child properties that are an array of components, as this will happen in the node decode function.
                Object.entries(prop).map(([key, value], childIndex) => [
                    key,
                    decodeProp(value, stack + 1, retainJSON, element, childIndex, true)
                ])
            );
            // component
        } else if (typeof prop == 'object' && prop.type != null) {
            if (retainJSON) {
                return prop
            } else {
                return decode(prop, stack + 1, false, element, index)
            }
            // literal
        } else {
            return prop;
        }
    }

    const decode = (element, stack, retainJSON, parent, index = 0) => {
        decodeCallCount++;
        devTools.event('YapUIDecoder', 'decode');

        if (stack > 200) {
            console.error('YapUIDecoder: Stack > 200:', element)
            return;
        }

        /**
         * Decode plain arguments
         */

        // Null value.
        if (element == null) {
            return element;

            // Argument values
        } else if (typeof element == 'object' && element['_0']) {
            // todo , support multiple arguments
            return decode(element['_0'], stack + 1, preventDecode[type], element);

        } else if (typeof element == 'object' && element['rawValue']) {
            // todo , support multiple arguments
            return decode(element['rawValue'], stack + 1, preventDecode[type], element);

            // Array value
        } else if (Array.isArray(element)) {
            return element.map((child, index) => {
                return decode(child, stack + 1, false, element, index)
            })
        } else if (element.type == null) {
            return element;
        }

        /**
         * Decode Components, Modifiers, and Variables
         */

        // get type, props, children

        let type = element.type;

        // Resolve any components in props
        if (debug) { console.log('-resolve props ', type) }

        /**
         * Component
         */
        if (type == 'ComponentCall') {
            componentDependencies.push(element.props.name)

            devTools.event('YapUIDecoder', 'ComponentCall')
            let children = decode(element.props?.children[0], stack + 1, retainJSON, element, index)

            const view = viewCallback(element.props?.name, element?.props, children);
            if (view) {
                return view
            } else {
                return children
            }

        } else if (type == 'ForEach' && Array.isArray(element.props?.children)) {

            return decode(element.props.children, stack + 1, retainJSON, element, index)

        } else if (type == 'Representable') {

            return <Representable key={element.props.functionId} functionId={element.props.functionId} environmentId={element.props.environmentId} _type={"Representable"} />

        } else if (componentsMap[type]) {
            performanceStats.components++;
            // Get props
            const props = element.props ? { ...element.props } : {};

            // Store the type name so it can be read later on in a react tree, as react component names can become obfuscated when minified
            // and this is useful to have if querying the tree for a component name.
            props['_type'] = type;

            // Resolve props
            for (const key in props) {
                performanceStats.props++;
                props[key] = decodeProp(props[key], stack + 1, preventDecode[type], element)
            }

            // Resolve children
            const children = props?.children

            // Setup node
            const Node = componentsMap[type];

            const key = (parent?.type ?? 'Element') + "_" + type + "_" + stack + "_" + index;

            if (debug) { console.log(`decode: component [${type}]`, props); }

            return <Node key={key} {...props}>{children}</Node>;

            /**
             * Modifier
             */
        } else if (type == 'ModifiedComponent') {
            performanceStats.modifiers++;

            const modifierType = element.props?.modifier?.type;
            const modifierProps = element.props?.modifier?.props;

            // Resolve modifier content
            const content = element.props?.content ? element.props.content.map((child, index) => {
                return decode(child, stack + 1, preventDecode[modifierType], element.props.modifier, index)
            }) : null;

            // Early exit if the modifier type is not recognized
            if (modifiersMap[modifierType] == null) {
                return content
            }

            if (!shouldApplyChartModifierContext(modifierType, element)) {
                return content
            }

            // Resolve modifier props
            for (const key in modifierProps) {
                modifierProps[key] = decodeProp(modifierProps[key], stack + 1, preventDecode[type], element.modifier)
            }

            // Include type in props.
            modifierProps['_type'] = modifierType;

            const Node = modifiersMap[modifierType];

            const key = (parent?.type ?? 'Element') + "_" + type + "_" + modifierType + "_" + stack + "_" + index;

            return <Node key={key}  {...modifierProps}>{content}</Node>

            /**
             * External view dependency
             */
        } else if (viewCallback) {

            const viewType = element.props?.type ?? element.type;
            const view = viewCallback(viewType, element?.props, element?.props?.children);

            if (view) {
                return view
            }

            /**
             * String element
             */
        } else {
            console.log(`decode: string [${element}]`);

            return element;
        }

        return null;
    }

    let result = decode(json, 0, false, null)

    if (resolvedDependanciesCallback) {
        resolvedDependanciesCallback([...componentDependencies])
    }

    if (debugPerformance) {
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        devTools.log(`YapUIDecoder Performance: ${totalTime.toFixed(2)}ms, ${decodeCallCount} decode calls, ${(totalTime / decodeCallCount).toFixed(2)}ms/call`);
        devTools.log(`  Components: ${performanceStats.components}, Modifiers: ${performanceStats.modifiers}, Props: ${performanceStats.props}, Arrays: ${performanceStats.arrays}`);
    }

    return result
}
