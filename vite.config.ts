import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({ registerType: 'autoUpdate' })],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    base: '/koru-dao-ui/',
    build: {
        target: ['es2020'],
        outDir: 'docs'
    },
});
