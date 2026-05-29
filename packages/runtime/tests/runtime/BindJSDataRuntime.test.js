import { describe, it, expect } from 'vitest'
import { BindJSDataRuntime } from '../../src/runtime/BindJSDataRuntime.js'

describe('BindJSDataRuntime property constructors', () => {
    it('exposes the data-only Property* helpers as sandbox globals', () => {
        const runtime = new BindJSDataRuntime()
        const expected = [
            'PropertyString',
            'PropertyNumber',
            'PropertyInteger',
            'PropertyBoolean',
            'PropertyEnum',
            'PropertyDate',
            'PropertyArray',
            'PropertyGroup',
            // Schema-prefixed aliases for type-safe data-source authoring —
            // the .d.ts PropertySchemaField union references PropertySchemaArray
            // / PropertySchemaGroup, so authors using TS need constructors that
            // return those exact types. Both names produce the same descriptor.
            'PropertySchemaArray',
            'PropertySchemaGroup',
        ]
        for (const name of expected) {
            expect(typeof runtime.context[name]).toBe('function')
        }
    })

    it('PropertySchemaArray and PropertySchemaGroup produce array/group descriptors', () => {
        const runtime = new BindJSDataRuntime()
        const arr = runtime.context.PropertySchemaArray({
            title: 'Repos',
            valueType: { type: 'group', properties: { id: { type: 'string' } } },
        })
        expect(arr.type).toBe('array')
        expect(arr.title).toBe('Repos')

        const grp = runtime.context.PropertySchemaGroup({
            title: 'Item',
            properties: { id: runtime.context.PropertyString({}) },
        })
        expect(grp.type).toBe('group')
        expect(grp.title).toBe('Item')
        expect(grp.properties.id.type).toBe('string')
    })

    it('PropertySchemaArray + PropertySchemaGroup compose end-to-end through defineDataSource', async () => {
        const runtime = new BindJSDataRuntime()
        const source = `
            exports.default = defineDataSource({
                metadata: { title: 'Search', description: 'probe' },
                properties: {
                    query: PropertyString({ title: 'Query' }),
                },
                output: {
                    results: PropertySchemaArray({
                        valueType: PropertySchemaGroup({
                            properties: {
                                id: PropertyString({}),
                                title: PropertyString({}),
                            },
                        }),
                    }),
                    total: PropertyInteger({}),
                },
                handler: async () => ({ results: [], total: 0 }),
            })
        `
        runtime.registerDataSource('search', source)
        const properties = runtime.getProperties('search')
        const output = runtime.getOutput('search')
        expect(properties.query.type).toBe('string')
        expect(output.results.type).toBe('array')
        expect(output.results.valueType.type).toBe('group')
        expect(output.results.valueType.properties.id.type).toBe('string')
        expect(output.total.type).toBe('integer')
    })

    it('PropertyInteger returns a property descriptor with type "integer"', () => {
        // MET-592: PropertyInteger rounds out the data-only property set so
        // OpenAPI importers (and hand authors) can declare integer fields
        // that round-trip through JSON Schema as {type: "integer"} rather
        // than falling through to 'unknown' and getting stripped.
        const runtime = new BindJSDataRuntime()
        const descriptor = runtime.context.PropertyInteger({
            title: 'ID',
            validation: { min: 1, max: 100 },
        })
        expect(descriptor.type).toBe('integer')
        expect(descriptor.title).toBe('ID')
        expect(descriptor.validation).toEqual({ min: 1, max: 100 })
    })

    it('PropertyInteger is picked up when defineDataSource runs in the sandbox', async () => {
        // End-to-end through registerDataSource + getProperties — this is
        // the path generateDataSchema uses when metabind-server compiles a
        // data tool.
        const runtime = new BindJSDataRuntime()
        const source = `
            exports.default = defineDataSource({
                metadata: { title: 'Int probe', description: 'Int probe' },
                properties: {
                    id: PropertyInteger({ title: 'ID', validation: { min: 1, max: 100 } }),
                    name: PropertyString({ title: 'Name' }),
                },
                handler: async (props) => ({ echoed: props }),
            })
        `
        runtime.registerDataSource('int-probe', source)
        const properties = runtime.getProperties('int-probe')
        expect(properties).toBeDefined()
        expect(properties.id.type).toBe('integer')
        expect(properties.id.validation).toEqual({ min: 1, max: 100 })
        expect(properties.name.type).toBe('string')
    })
})
