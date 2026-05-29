import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useStyle } from '../Style';
import { ClearStyle } from '../Style';
import { useEnvironmentStyle } from '../Style';
import { useForegroundStyleContext, foregroundStyleToCSS } from '../Modifiers/ForegroundStyle';
import { useFont } from '../Modifiers/Font';
import { styleUserSelect } from '../../Utils/styleUserSelect';
import { resolveFont } from '../Utils/resolveDynamicTypeSize';
import { useEnvironment } from '../Environment';
import remarkBreaks from 'remark-breaks';
import { asNumber } from '../../Utils';
import { layoutRegistry, LayoutMeasurement, useLayout, layoutStyle, LayoutNode } from '../Layout';
import { Divider } from './Divider';
import styled from 'styled-components';
import { useAnimationNode } from '../AnimatableStyle';

interface TextProps {
    text?: string;
    value?: string;
    rawValue?: string;
    markdown?: string;
    children?: React.ReactNode[];
}

export default function Text({ text, value, rawValue, markdown, children }: TextProps) {
    const style = useStyle()
    const fontContext = useFont() // Get the full font context, not just the style
    const fontStyle = fontContext.style // Keep the original style for backward compatibility
    const foregroundStyleContext = useForegroundStyleContext()
    const environmentStyle = useEnvironmentStyle()
    const environment = useEnvironment() // Access the environment values

    // Get animation node - provides ref and animation styles
    const { ref: animationRef, style: animationStyle } = useAnimationNode();

    let elementStyle: React.CSSProperties = {
        margin: '0px',
    }

    // Determine if text selection should be enabled based on environment style
    const isTextSelectionEnabled = environmentStyle.textSelection === 'enabled';
    elementStyle = styleUserSelect(isTextSelectionEnabled, elementStyle);

    const content = rawValue ?? value ?? text ?? children;
    const markdownContent = markdown;

    /**
     * Resolve font properties based on dynamic type size
     * If no text style is explicitly set, default to 'body'
     */
    const { fontSize, fontWeight, lineHeight } = resolveFont({
        textStyle: fontContext.textStyle || 'body', // Use 'body' as default style
        dynamicTypeSize: environment.dynamicTypeSize, // Get from environment
        explicitSize: fontContext.size, // Explicit size overrides text style
        weight: fontContext.weight, // Explicit weight overrides default,
        custom: fontContext.custom ? true : false
    });

    // Create a new style object with the resolved font properties
    const resolvedFontStyle: React.CSSProperties = {
        ...fontStyle,
        // Provide default font family if none is set
        fontFamily: fontStyle.fontFamily || 'system-ui, ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif'
    };

    // Only apply resolved properties if they exist
    if (fontSize) {
        resolvedFontStyle.fontSize = fontSize;
    }

    if (fontWeight) {
        resolvedFontStyle.fontWeight = fontWeight;
    }

    // Calculate line height in relative units
    let lineHeightRelative = asNumber(lineHeight || fontSize || 16) / asNumber(fontSize || 16);

    // If there's explicit line spacing, adjust the line height accordingly. In SwiftUI lineSpacing is added to the base line height, not multiplied or an absolute value.
    // Using 'unitless' line spacing so it scales with font size when rendering markdown headers etc.
    if (lineHeightRelative > 0) {
        if (fontContext.lineSpacing) {
            let additionalLineSpacing = fontContext.lineSpacing / asNumber(fontSize || 16);
            let finalLineHeight = (lineHeightRelative ?? 1.0) + additionalLineSpacing;
            resolvedFontStyle.lineHeight = `${finalLineHeight.toFixed(2)}`;
        } else {
            resolvedFontStyle.lineHeight = `${lineHeightRelative.toFixed(2)}`;
        }
    }

    /**
     * Apply foreground style
     */
    const foregroundStyle: React.CSSProperties = foregroundStyleToCSS(foregroundStyleContext, 'text', environment.colorScheme);

    // Combined styles including animation
    const combinedStyle = { ...elementStyle, ...style, ...foregroundStyle, ...resolvedFontStyle, ...animationStyle };

    if (markdownContent) {

        const cleaned = markdownContent
            .replace(/^\s+/, "") // remove leading whitespace
            .replace(/\r\n/g, '\n')
            .trim();

        // Custom components to map markdown elements to MetabindUI components
        const components = {
            hr: ({ node, ...props }) => <Divider {...props} />
        };

        return (
            /** TODO: Handle font resolution globally and semantically */
            <MarkdownInlineTextStyle
                ref={animationRef as React.Ref<HTMLDivElement>}
                className="text"
                style={combinedStyle}
            >
                <ClearStyle>
                    <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={components}
                    >
                        {cleaned}
                    </ReactMarkdown>
                </ClearStyle>
            </MarkdownInlineTextStyle>
        );
    } else {
        return (
            <p
                ref={animationRef as React.Ref<HTMLParagraphElement>}
                className="text"
                style={combinedStyle}
            >
                <ClearStyle>
                    <TextWithLineBreaks content={content} />
                </ClearStyle>
            </p>
        );
    }
}

function TextWithLineBreaks({ content }: { content: string | React.ReactNode }) {
    if (typeof content !== 'string') return <>{content}</>;

    const contentWithBreaks = content.split('\n').flatMap((line, lineIndex, arr) => {
        const parts = line.split('\t').flatMap((segment, tabIndex, tabArr) =>
            tabIndex < tabArr.length - 1
                ? [segment, '\u00a0\u00a0\u00a0\u00a0'] // 4 non-breaking spaces as a tab
                : [segment]
        );

        return lineIndex < arr.length - 1
            ? [...parts, <br key={`br-${lineIndex}`} />]
            : parts;
    });

    return <>{contentWithBreaks}</>;
}

const MarkdownInlineTextStyle = styled.div`

    strong {
        font-weight: 800;
    }

    /* Divider */
    & hr {
        border: none;
        border-top: 1px solid var(--color-divider, #ccc);
        margin: 0.75em 0;
    }

    /* Lists */
    & ul, & ol {
        margin: 0.75em 0;
        padding-left: 1.2em;
    }

    & li {
        margin: 0.25em 0;
    }

    /* Blockquote */
    & blockquote {
        border-left: 3px solid var(--color-divider, #ccc);
        padding-left: 0.75em;
        margin: 0.75em 0;
    }

    /* Inline code (only background + padding, no font-size) */
    & code {
        background: var(--color-code-bg, #f4f4f4);
        padding: 0.1em 0.25em;
        border-radius: 4px;
    }

    /* Code blocks */
    & pre {
        background: var(--color-code-bg, #f4f4f4);
        padding: 0.75em;
        border-radius: 6px;
        margin: 0.75em 0;
        overflow-x: auto;
    }
`;


const MarkdownDocumentTextStyle = styled.div`
    /* Paragraphs */
    & p {
        margin: 1.25em 0;
    }

    & p br, & span.br {
        display: block !important;
        margin: 0.25em 0 !important;
    }

    /* Headings (spacing only) */
    & h1, & h2, & h3, & h4, & h5, & h6 {
        margin-top: 1.5em;
        margin-bottom: 0.4em;
    }

    /* Divider */
    & hr {
        border: none;
        border-top: 1px solid var(--color-divider, #ccc);
        margin: 0.75em 0;
    }

    /* Lists */
    & ul, & ol {
        margin: 0.75em 0;
        padding-left: 1.2em;
    }

    & li {
        margin: 0.25em 0;
    }

    /* Blockquote */
    & blockquote {
        border-left: 3px solid var(--color-divider, #ccc);
        padding-left: 0.75em;
        margin: 0.75em 0;
    }

    /* Inline code (only background + padding, no font-size) */
    & code {
        background: var(--color-code-bg, #f4f4f4);
        padding: 0.1em 0.25em;
        border-radius: 4px;
    }

    /* Code blocks */
    & pre {
        background: var(--color-code-bg, #f4f4f4);
        padding: 0.75em;
        border-radius: 6px;
        margin: 0.75em 0;
        overflow-x: auto;
    }
`;



// Size calculation function
const sizeThatFits = ({ proposal, props, children }): LayoutMeasurement => {
    return {
        frame: {
            width: proposal.width ?? null,
            height: proposal.height ?? null
        }
    };
}

layoutRegistry.register(
    Text,
    sizeThatFits
);
