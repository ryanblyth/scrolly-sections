import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'mapbox-gl', 
        'gsap', 
        'gsap/ScrollTrigger',
        '@turf/along', 
        '@turf/length', 
        '@turf/bbox'
      ]
    }
  },
  optimizeDeps: {
    include: [
      'mapbox-gl',
      'gsap',
      'gsap/ScrollTrigger',
      '@turf/along',
      '@turf/length',
      '@turf/bbox'
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`
      }
    }
  }
})
