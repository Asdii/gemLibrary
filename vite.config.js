import {defineConfig, normalizePath} from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: normalizePath(path.resolve(__dirname, './gemLibrary/assets') + '/[!.]*'), // 1️⃣
                    dest: normalizePath('./gemLibrary/assets'), // 2️⃣
                },
            ],
        }),
    ]
})
