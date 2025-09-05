import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ScrollyTrailScrub',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'iife']
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['mapbox-gl', 'gsap', 'gsap/ScrollTrigger', '@turf/along', '@turf/length', '@turf/bbox'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'index.css'
          }
          return assetInfo.name || 'asset'
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/variables.scss";`
      }
    }
  }
})
