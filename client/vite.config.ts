import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        target: 'esnext',
        modulePreload: {
            polyfill: false
        },
        sourcemap: true,
        rollupOptions: {
            input: {
                index: 'index.html',
                ipm: 'ipm.html'
            }
        }
    }
});