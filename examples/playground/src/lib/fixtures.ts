import fixtures from 'virtual:bindjs-fixtures'

import { processComponentJs } from './processComponent'
import { SAMPLE_COMPONENT } from './sample'

export interface Fixture {
    /** `<category>/<Name>`, also the URL hash. */
    id: string
    category: string
    /** Component name the fixture is registered under in the runtime. */
    name: string
    /** TypeScript source shown in the editor. */
    source: string
    /** Runtime-ready JS (`exports.default = …`), registered at startup. */
    js: string
}

// The free-form editor from the original playground. Its JS comes from Monaco
// on first mount, so it isn't pre-registered like the fixtures.
export const SCRATCH: Fixture = {
    id: 'scratch',
    category: '',
    name: '_playground',
    source: SAMPLE_COMPONENT,
    js: '',
}

export const FIXTURES: Fixture[] = fixtures.map((f) => ({
    ...f,
    js: processComponentJs(f.js),
}))

const CATEGORY_ORDER = [
    'layout',
    'text',
    'shapes',
    'color',
    'effects',
    'controls',
    'gestures',
    'navigation',
    'state',
    'media',
    'charts',
    'shaders',
    'runtime',
]

export const CATEGORY_LABELS: Record<string, string> = {
    layout: 'Layout',
    text: 'Text',
    shapes: 'Shapes',
    color: 'Color & Gradients',
    effects: 'Effects & Animation',
    controls: 'Controls',
    gestures: 'Gestures & Events',
    navigation: 'Navigation & Presentation',
    state: 'Hooks & State',
    media: 'Media',
    charts: 'Charts',
    shaders: 'Shaders',
    runtime: 'Runtime',
}

/** Fixtures grouped by category, known categories first, then any new folders A–Z. */
export function groupFixtures(list: Fixture[]): [string, Fixture[]][] {
    const groups = new Map<string, Fixture[]>()
    for (const f of list) {
        groups.set(f.category, [...(groups.get(f.category) ?? []), f])
    }
    const rank = (c: string) => {
        const i = CATEGORY_ORDER.indexOf(c)
        return i === -1 ? CATEGORY_ORDER.length : i
    }
    return [...groups.entries()].sort(
        ([a], [b]) => rank(a) - rank(b) || a.localeCompare(b),
    )
}

export function findFixture(id: string): Fixture {
    return FIXTURES.find((f) => f.id === id) ?? SCRATCH
}
