import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  shims: true,
  clean: true,
  sourcemap: false,
  target: 'node16',
  outDir: 'dist',
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    };
  },
});
