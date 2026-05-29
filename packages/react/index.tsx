// TODO: Convert these to typescript
// @ts-ignore
//import { YapJSRuntime } from './src/JSRuntime'

// @ts-ignore
import { useBindJSRuntime } from './src/hooks/useBindJSRuntime'

// @ts-ignore
import { YapUIDecoder } from './src/YapUIDecoder'

// @ts-ignore
import { Renderer as RawRenderer } from './src/Renderer/Renderer'
import type { ComponentType } from 'react'

// @ts-ignore
import Components from './src/YapUIStatic'

import { BindJSRuntime } from '@metabindai/bindjs-runtime';

import { DOMIdentifableContext } from './src/Renderer/ui/DOMIdentifable'

import { RendererEnvironmentContext, RendererExecutionContext, RendererIssue } from './src/Renderer/RendererContext'
import { ComposerGroupContext, ComposerGroupProps, ComposerLayoutConfigurationContext } from './src/Renderer/ui/ComposerGroup'

import { AssetsProvider } from './src/Renderer/ui/Assets'
import { AssetMediaType } from './src/Renderer/ui/Assets'

import { ContentProvider } from './src/Renderer/ui/ContentProvider'
import { FontManager, useFontManager } from './src/Renderer/ui/FontManager'
import { Model3D } from './src/Renderer/ui/Views/Model3D'
import { AnimatableValuesProvider, useAnimationNode, motion, AnimatePresence } from './src/Renderer/ui/AnimatableStyle'
import { DocumentScrollProvider, useDocumentScroll } from './src/Renderer/ui/ScrollViewContext'

import { setDevTools } from './src/devtools'
import type { DevToolsLogger } from './src/devtools'

export { setDevTools }
export type { DevToolsLogger }

export { YapUIDecoder, useBindJSRuntime, useBindJSRuntime as useComposeJSRuntime, Renderer, BindJSRuntime as YapJSRuntime, ComposerGroupContext, RendererEnvironmentContext, RendererExecutionContext, DOMIdentifableContext, Components, AssetsProvider, ContentProvider, FontManager, useFontManager, Model3D, DocumentScrollProvider, useDocumentScroll }
export type { ComposerGroupContextType } from './src/Renderer/ui/ComposerGroup'
export type { ComposerLayoutConfigurationPropertiesContextType } from './src/Renderer/ui/ComposerGroup'

import { RendererNavigationCallback, RendererNavigationAnimation } from './src/Renderer/RendererProps'
import { ContentItem } from './src/Renderer/ui/Views/Content'
import { GetContentByIdFunction } from './src/Renderer/ui/ContentProvider'
import { AnimationContext, useAnimationContext, AnimationContextType } from './src/Renderer/ui/AnimationContext'

const Renderer = RawRenderer as unknown as ComponentType<any>

// Animation exports
export { AnimationContext, useAnimationContext }
export { AnimatableValuesProvider, useAnimationNode }
export { motion, AnimatePresence }

export { ComposerLayoutConfigurationContext }
export type { AnimationContextType, AssetMediaType }
export type { RendererIssue, RendererNavigationCallback, RendererNavigationAnimation, ComposerGroupProps, ContentItem, GetContentByIdFunction }
