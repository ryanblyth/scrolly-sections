import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ScrollySectionsLib',
      fileName: (format) => `index.${format}.js`,
      formats: ['es']
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: []
    }
  }
})
