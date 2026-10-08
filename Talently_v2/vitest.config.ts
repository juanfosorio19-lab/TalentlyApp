import { defineConfig } from 'vitest/config';

// Pruebas del rediseño v3 (src/app, src/ui, src/domain). La app actual no tiene pruebas.
export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/{app,ui,domain,features}/**/*.test.{ts,tsx}'],
    },
});
