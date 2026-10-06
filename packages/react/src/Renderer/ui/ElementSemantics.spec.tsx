import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BindJSRuntime } from '@metabindai/bindjs-runtime';
import { YapUIDecoder } from '../../YapUIDecoder';

// Renders a BindJS body to HTML the way the server-side prerender does.
function render(body: (c: Record<string, any>) => any): string {
    const runtime = new BindJSRuntime();
    runtime.registerBuiltInComponents();
    const components = new Proxy({}, { get: (_, name: string) => runtime.getComponent(name) });
    const component = runtime.defineComponent({ body: () => body(components) });
    const ast = runtime.invokeComponent(component).props.children[0];
    return renderToString(<>{YapUIDecoder(ast, () => null)}</>);
}

const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length;

describe('Button', () => {
    it('renders its label as a button element', () => {
        const html = render(({ Button }) => Button('Start Free', () => {}));
        expect(html).toMatch(/<button[^>]*class="text"[^>]*data-bindjs-control=""[^>]*type="button"[^>]*>Start Free<\/button>/);
        expect(html).not.toContain('<p');
    });

    it('renders a stack label as the button', () => {
        const html = render(({ Button, HStack, Text }) => Button({ action: () => {}, label: HStack([Text('A'), Text('B')]) }));
        expect(html).toMatch(/^<div style="display:contents;cursor:pointer"><button[^>]*hstack/);
        expect(count(html, /<button/g)).toBe(1);
    });

    it('does not nest a button inside a button', () => {
        const html = render(({ Button, VStack }) => Button({ action: () => {}, label: VStack([Button('Inner', () => {})]) }));
        expect(count(html, /<button/g)).toBe(1);
    });

    it('keeps an overlay out of the button', () => {
        const html = render(({ Button, Text }) => Button({ action: () => {}, label: Text('Copy').overlay(Text('Copied')) }));
        expect(count(html, /<button/g)).toBe(1);
        expect(html).toMatch(/<button[^>]*>Copy<\/button>/);
    });

    it('is disabled with the disabled modifier', () => {
        const html = render(({ Button }) => Button('Send', () => {}).disabled(true));
        expect(html).toMatch(/<button[^>]*disabled=""/);
    });

    it('takes a label, and aria-pressed for the isSelected trait', () => {
        const html = render(({ Button, Image }) => Button({ action: () => {}, label: Image({ url: 'x.png' }).frame({ width: 20, height: 20 }) })
            .accessibilityLabel('Close')
            .accessibilityAddTraits('isSelected'));
        expect(html).toMatch(/<button[^>]*aria-label="Close"/);
        expect(html).toMatch(/<button[^>]*aria-pressed="true"/);
    });
});

describe('Link', () => {
    it('renders as a link with an href', () => {
        const html = render(({ Text }) => Text('Pricing').link('/pricing'));
        expect(html).toMatch(/<a[^>]*class="text"[^>]*data-bindjs-control=""[^>]*href="\/pricing"[^>]*>Pricing<\/a>/);
    });

    it('does not nest a button inside a link', () => {
        const html = render(({ Button, Text }) => Button('Go', () => {}).link('/go'));
        expect(count(html, /<a /g)).toBe(1);
        expect(count(html, /<button/g)).toBe(0);
    });
});

describe('Accessibility modifiers', () => {
    it('gives an image its label as alt text, and no label an empty alt', () => {
        expect(render(({ Image }) => Image({ url: 'a.png' }).accessibilityLabel('A chart'))).toMatch(/<img[^>]*alt="A chart"/);
        expect(render(({ Image }) => Image({ url: 'a.png' }))).toMatch(/<img[^>]*alt=""/);
    });

    it('labels a background image as an image', () => {
        const html = render(({ Image }) => Image({ url: 'a.png' }).resizable().accessibilityLabel('Studio'));
        expect(html).toMatch(/<div[^>]*aria-label="Studio"[^>]*role="img"/);
    });

    it('hides a view from assistive technology', () => {
        expect(render(({ Text }) => Text('$').accessibilityHidden(true))).toMatch(/<p[^>]*aria-hidden="true"/);
        expect(render(({ Text }) => Text('$').accessibilityHidden(false))).not.toContain('aria-hidden');
    });

    it('reads a text label instead of the visible text', () => {
        const html = render(({ Text }) => Text('npm i -g metabind').accessibilityLabel('Install command'));
        expect(html).toMatch(/<p[^>]*><span aria-hidden="true">npm i -g metabind<\/span><span[^>]*>Install command<\/span><\/p>/);
    });

    it('labels a container as a group', () => {
        const html = render(({ VStack, Text }) => VStack([Text('A')]).accessibilityLabel('Plans'));
        expect(html).toMatch(/<div[^>]*vstack[^>]*aria-label="Plans"[^>]*role="group"/);
    });

    it('labels a text field', () => {
        const html = render(({ TextField }) => TextField({ placeholder: 'Describe your app' }).accessibilityLabel('Prompt'));
        expect(html).toMatch(/<input[^>]*aria-label="Prompt"/);
    });

    it('makes a tappable view with the isButton trait a button', () => {
        const html = render(({ VStack, Text }) => VStack([Text('Card')]).accessibilityAddTraits('isButton').onTapGesture(() => {}));
        expect(html).toMatch(/<button[^>]*vstack[^>]*data-bindjs-control=""[^>]*type="button"/);
    });
});
