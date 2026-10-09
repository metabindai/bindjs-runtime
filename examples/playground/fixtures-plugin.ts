import fs from 'node:fs'
import path from 'node:path'
import { transformWithEsbuild, type Plugin } from 'vite'

// Exposes every fixture under fixtures/<category>/<Name>.ts (repo root) as the virtual
// module `virtual:bindjs-fixtures`: an array of { id, category, name, source, js }.
//
// Fixtures aren't ES modules we can import — they're component scripts the
// runtime evaluates with its globals in scope — so we ship both the TypeScript
// source (for the editor) and esbuild's JS output (registered into the runtime
// up front, so fixtures can call each other by name before any is opened).
const VIRTUAL_ID = 'virtual:bindjs-fixtures'
const RESOLVED_ID = '\0' + VIRTUAL_ID

export function bindjsFixtures(dir: string): Plugin {
    const root = path.resolve(dir)

    return {
        name: 'bindjs-fixtures',

        resolveId(id) {
            return id === VIRTUAL_ID ? RESOLVED_ID : undefined
        },

        async load(id) {
            if (id !== RESOLVED_ID) return

            const files = fs
                .readdirSync(root, { recursive: true, encoding: 'utf8' })
                .filter((f) => f.endsWith('.ts'))
                .sort()

            const fixtures = await Promise.all(
                files.map(async (file) => {
                    const fullPath = path.join(root, file)
                    this.addWatchFile(fullPath)

                    const source = fs.readFileSync(fullPath, 'utf8')
                    const { code } = await transformWithEsbuild(source, fullPath, {
                        loader: 'ts',
                        target: 'es2020',
                    })

                    const id = file.replace(/\\/g, '/').replace(/\.ts$/, '')
                    const [category, name] = id.includes('/')
                        ? [id.slice(0, id.lastIndexOf('/')), id.slice(id.lastIndexOf('/') + 1)]
                        : ['', id]

                    return { id, category, name, source, js: code }
                }),
            )

            return `export default ${JSON.stringify(fixtures)}`
        },

        configureServer(server) {
            // Adding or removing a fixture changes the list itself, which
            // addWatchFile can't see — reload so the sidebar picks it up.
            const onAddOrRemove = (file: string) => {
                if (!path.resolve(file).startsWith(root)) return
                const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
                if (mod) server.moduleGraph.invalidateModule(mod)
                server.ws.send({ type: 'full-reload' })
            }
            server.watcher.add(root)
            server.watcher.on('add', onAddOrRemove)
            server.watcher.on('unlink', onAddOrRemove)
        },
    }
}
