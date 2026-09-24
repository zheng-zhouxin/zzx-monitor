import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/dsn-api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite(path) {
                    return path.replace(/^\/dsn-api/, '/api')
                },
            },
        },
    },
})
