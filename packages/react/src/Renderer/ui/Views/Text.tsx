import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useStyle } from '../Style';
import { ClearStyle } from '../Style';
import { useEnvironmentStyle } from '../Style';
import { useForegroundStyleContext, foregroundStyleToCSS } from '../Modifiers/ForegroundStyle';
import { useResolvedFontStyle } from '../Modifiers/Font';
import { styleUserSelect } from '../../Utils/styleUserSelect';
import { useEnvironment } from '../Environment';
import remarkBreaks from 'remark-breaks';
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
    const resolvedFontStyle = useResolvedFontStyle()
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
