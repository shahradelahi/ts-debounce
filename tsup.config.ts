import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  splitting: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'esnext',
  outDir: 'dist',
});
