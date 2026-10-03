import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'build', '.next'],
    globals: true,
    setupFiles: ['../../vitest.setup.ts'],
  },
});