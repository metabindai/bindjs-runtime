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
import { layoutRegistry, LayoutMeasurement } from '../Layout';
import { Divider } from './Divider';
import styled from 'styled-components';

interface MarkdownProps {
    text?: string;
    value?: string;
    rawValue?: string;
    children?: React.ReactNode[];
}

export default function Markdown({ text, value, rawValue, children }: MarkdownProps) {
    const style = useStyle()
    const fontContext = useFont()
    const fontStyle = fontContext.style
    const foregroundStyleContext = useForegroundStyleContext()
    const environmentStyle = useEnvironmentStyle()
    const environment = useEnvironment()

    let elementStyle: React.CSSProperties = {
        margin: '0px',
    }

    // Determine if text selection should be enabled based on environment style
    const isTextSelectionEnabled = environmentStyle.textSelection === 'enabled';
    elementStyle = styleUserSelect(isTextSelectionEnabled, elementStyle);

    const content = rawValue ?? value ?? text ?? children;

    /**
     * Resolve font properties based on dynamic type size
     * If no text style is explicitly set, default to 'body'
     */
    const { fontSize, fontWeight, lineHeight } = resolveFont({
        textStyle: fontContext.textStyle || 'body',
        dynamicTypeSize: environment.dynamicTypeSize,
        explicitSize: fontContext.size,
        weight: fontContext.weight,
        custom: fontContext.custom ? true : false
    });

    // Create a new style object with the resolved font properties
    const resolvedFontStyle: React.CSSProperties = {
        ...fontStyle,
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

    // Process markdown content
    const markdownContent = typeof content === 'string' ? content : '';

    const cleaned = markdownContent
        .replace(/^\s+/, "") // remove leading whitespace
        .replace(/\r\n/g, '\n')
        .trim();

    // Custom components to map markdown elements to styled components
    const components = {
        hr: ({ node, ...props }) => <Divider {...props} />
    };

    return (
        <MarkdownDocumentTextStyle className="markdown" style={{ ...elementStyle, ...style, ...foregroundStyle, ...resolvedFontStyle }}>
            <ClearStyle>
                <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={components}
                >
                    {cleaned}
                </ReactMarkdown>
            </ClearStyle>
        </MarkdownDocumentTextStyle>
    );
}

/**
 * Document-style markdown formatting with proper paragraph spacing,
 * heading margins, and document structure.
 */
const MarkdownDocumentTextStyle = styled.div`
    /* Paragraphs */
    & p {
        margin: 1.25em 0;
    }

    & p:first-child {
        margin-top: 0;
    }

    & p:last-child {
        margin-bottom: 0;
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

    & h1:first-child, & h2:first-child, & h3:first-child, 
    & h4:first-child, & h5:first-child, & h6:first-child {
        margin-top: 0;
    }

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
    Markdown,
    sizeThatFits
);
