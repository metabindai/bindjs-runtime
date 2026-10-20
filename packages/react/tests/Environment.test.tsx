import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvironmentProvider, useEnvironment } from '../src/Renderer/ui/Environment';
import { Disabled } from '../src/Renderer/ui/Modifiers/Disabled';
import { Button } from '../src/Renderer/ui/Views/Button';

const controls = vi.hoisted(() => ({ click: undefined as undefined | (() => void), action: vi.fn() }));
vi.mock('../src/Renderer/ui/Style', () => ({ useEnvironmentStyle: () => ({}), useStyle: () => ({}), StyleProvider: ({ children }) => children }));
vi.mock('../src/Renderer/RendererContext', () => ({ useRendererContext: () => ({ functionCallback: () => controls.action }) }));
vi.mock('../src/Renderer/ui/AnimationContext', () => ({ useAnimationContext: () => ({}) }));
vi.mock('../src/Renderer/ui/Actions', () => ({ ActionsProvider: ({ children, actions }) => { controls.click = actions.onClick; return children; } }));
vi.mock('../src/Renderer/ui/Layout/useLayout', () => ({ useLayout: () => null }));
vi.mock('../src/Renderer/ui/Layout/LayoutRegistry', () => ({ layoutRegistry: { register() {} } }));
vi.mock('../src/Renderer/ui/Layout', () => ({ useLayout: () => null, LayoutNodeChildren: ({ children }) => children, layoutStyle: () => ({}) }));
vi.mock('../src/Renderer/ui/Views/Text', () => ({ default: () => null }));

function Probe() { return <output>{JSON.stringify(useEnvironment())}</output>; }
function render(children: React.ReactNode) { return renderToStaticMarkup(<EnvironmentProvider values={{ systemColorScheme: 'dark', dynamicTypeSize: 'accessibility5', custom: 42 }}>{children}</EnvironmentProvider>); }

describe('disabled environment', () => {
    beforeEach(() => { controls.click = undefined; controls.action.mockClear(); });
    it('inherits theme, type size and custom values through a partial provider', () => {
        const html = render(<EnvironmentProvider values={{ isEnabled: false }}><Probe /></EnvironmentProvider>);
        expect(html).toContain('&quot;colorScheme&quot;:&quot;dark&quot;');
        expect(html).toContain('&quot;dynamicTypeSize&quot;:&quot;accessibility5&quot;');
        expect(html).toContain('&quot;custom&quot;:42');
    });
    it('overrides only explicitly supplied environment values', () => {
        const html = render(<EnvironmentProvider values={{ colorScheme: 'light' }}><Probe /></EnvironmentProvider>);
        expect(html).toContain('&quot;colorScheme&quot;:&quot;light&quot;');
        expect(html).toContain('&quot;custom&quot;:42');
    });
    it('preserves the parent environment in disabled subtrees', () => {
        const html = render(<Disabled rawValue={true}><Probe /></Disabled>);
        expect(html).toContain('&quot;colorScheme&quot;:&quot;dark&quot;');
        expect(html).toContain('&quot;isEnabled&quot;:false');
    });
    it('dims and removes disabled subtrees from interaction and focus', () => {
        const html = render(<Disabled rawValue={true}><button>Submit</button></Disabled>);
        expect(html).toContain('aria-disabled="true"');
        expect(html).toContain('inert=""');
        expect(html).toContain('opacity:0.5');
    });
    it('leaves enabled subtrees interactive', () => {
        const html = render(<Disabled rawValue={false}><button>Submit</button></Disabled>);
        expect(html).not.toContain('inert=');
        expect(html).not.toContain('opacity:');
    });
    it('does not invoke a disabled button action, including programmatic clicks', () => {
        render(<Disabled rawValue={true}><Button handlerId="submit" label={<span>Submit</span>} /></Disabled>);
        expect(controls.click).toBeTypeOf('function');
        controls.click!();
        expect(controls.action).not.toHaveBeenCalled();
    });
    it('does not re-enable a button inside a disabled ancestor', () => {
        render(<Disabled rawValue={true}><Disabled rawValue={false}><Button handlerId="submit" label={<span>Submit</span>} /></Disabled></Disabled>);
        controls.click!();
        expect(controls.action).not.toHaveBeenCalled();
    });
    it('still invokes enabled button actions', () => {
        render(<Button handlerId="submit" label={<span>Submit</span>} />);
        controls.click!();
        expect(controls.action).toHaveBeenCalledOnce();
    });
});
