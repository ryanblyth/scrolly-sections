import './styles.scss'
import mapboxgl from 'mapbox-gl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import along from '@turf/along'
import length from '@turf/length'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

export type SectionOptions = {
  target: string | Element
  css?: boolean | 'lazy'
  prefersReducedMotion?: boolean
  trailDataUrl?: string
}

export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>
  unmount(): Promise<void>
  isMounted(): boolean
}

class TrailScrubSection {
  private container: HTMLElement | null = null
  private map: any = null
  private scrollTrigger: any = null
  private isMountedFlag: boolean = false
  private cssInjected: boolean = false
  private options: SectionOptions | null = null

  async mount(opts: SectionOptions): Promise<void> {
    if (this.isMountedFlag) {
      return // Idempotent
    }

    this.options = opts

    // Find target element
    this.container = typeof opts.target === 'string' 
      ? document.querySelector(opts.target) as HTMLElement
      : opts.target as HTMLElement

    if (!this.container) {
      throw new Error(`TrailScrubSection: Target element not found: ${opts.target}`)
    }

    // Handle CSS loading
    if (opts.css === 'lazy' && !this.cssInjected) {
      this.injectCSS()
      this.cssInjected = true
    }

    // Check for reduced motion
    const prefersReducedMotion = opts.prefersReducedMotion ?? 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Check for Mapbox token
    const hasToken = this.checkMapboxToken()
    
    if (!hasToken) {
      this.renderNoTokenOverlay()
      this.isMountedFlag = true
      return
    }

    if (prefersReducedMotion) {
      this.renderStaticTrail()
      this.isMountedFlag = true
      return
    }

    // Initialize map and trail scrub
    await this.initializeMap()
    this.isMountedFlag = true
  }

  async unmount(): Promise<void> {
    if (!this.isMountedFlag) {
      return // Idempotent
    }

    if (this.scrollTrigger) {
      this.scrollTrigger.kill()
      this.scrollTrigger = null
    }

    if (this.map) {
      this.map.remove()
      this.map = null
    }

    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('scrolly-trail-scrub')
    }

    this.isMountedFlag = false
  }

  isMounted(): boolean {
    return this.isMountedFlag
  }

  private checkMapboxToken(): boolean {
    // Check for token in ESM mode
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_MAPBOX_TOKEN) {
      return true
    }

    // Check for token in IIFE mode
    if (this.container?.dataset.mapboxToken) {
      return true
    }

    return false
  }

  private renderNoTokenOverlay(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="scrolly-trail-scrub scrolly-trail-scrub--no-token">
        <div class="scrolly-trail-scrub__overlay">
          <p>Trail Scrub: Mapbox token not configured. Set VITE_MAPBOX_TOKEN or data-mapbox-token.</p>
        </div>
      </div>
    `
    this.container.classList.add('scrolly-trail-scrub')
  }

  private renderStaticTrail(): void {
    if (!this.container) return

    this.container.innerHTML = `
      <div class="scrolly-trail-scrub scrolly-trail-scrub--static">
        <div class="scrolly-trail-scrub__placeholder">
          <h3>Trail Scrub (Static)</h3>
          <p>Reduced motion enabled - showing static trail view</p>
        </div>
      </div>
    `
    this.container.classList.add('scrolly-trail-scrub')
  }

  private async initializeMap(): Promise<void> {
    if (!this.container) return

    try {
      // Get token
      const token = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_MAPBOX_TOKEN
        ? (import.meta as any).env.VITE_MAPBOX_TOKEN
        : this.container.dataset.mapboxToken

      if (!token) {
        this.renderNoTokenOverlay()
        return
      }

      // Set Mapbox token
      mapboxgl.accessToken = token

      // Find the existing map container
      const mapContainer = document.getElementById('trail-map') as HTMLElement
      if (!mapContainer) {
        throw new Error('Map container #trail-map not found')
      }

      // Initialize map
      this.map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-107.575507, 37.771122],
        zoom: 12
      })

      // Load trail data
      const trailData = await this.loadTrailData()

      // Set up map layers and scroll trigger when map loads
      this.map.on('load', () => {
        this.setupTrailLayer(trailData)
        this.setupScrollTrigger(trailData)
      })

    } catch (error) {
      console.error('Failed to initialize map:', error)
      this.renderNoTokenOverlay()
    }
  }

  private async loadTrailData(): Promise<any> {
    const dataUrl = this.options?.trailDataUrl || '/data/trails/highland-mary.geojson'
    
    try {
      const response = await fetch(dataUrl)
      if (!response.ok) {
        throw new Error(`Failed to load trail data: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.warn('Failed to load trail data, using fallback:', error)
      // Return fallback data from the reference
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [-107.575507, 37.771122],
              [-107.576451, 37.770138],
              [-107.577438, 37.769629],
              [-107.581215, 37.769222],
              [-107.58203, 37.76817],
              [-107.58203, 37.76739],
              [-107.58276, 37.767254],
              [-107.583103, 37.766339],
              [-107.582417, 37.766508],
              [-107.582116, 37.765524],
              [-107.581344, 37.765117],
              [-107.579455, 37.764439],
              [-107.576795, 37.761148],
              [-107.577395, 37.759689],
              [-107.577996, 37.759078],
              [-107.577782, 37.758196],
              [-107.576623, 37.756703],
              [-107.576108, 37.755855],
              [-107.576065, 37.755312],
              [-107.576666, 37.752462],
              [-107.569971, 37.749069],
              [-107.557869, 37.75253],
              [-107.556581, 37.762369],
              [-107.556667, 37.769697],
              [-107.561903, 37.77621],
              [-107.573061, 37.779941],
              [-107.577524, 37.778313],
              [-107.575507, 37.771122]
            ]
          },
          properties: {
            name: 'Highland Mary Trail',
            difficulty: 'moderate',
            length_miles: 5.3,
            elevation_gain_ft: 1476
          }
        }]
      }
    }
  }

  private setupTrailLayer(trailData: any): void {
    if (!this.map) return

    // Add trail source
    this.map.addSource('trail', {
      type: 'geojson',
      data: trailData,
      lineMetrics: true
    })

    // Add trail layer with gradient
    this.map.addLayer({
      id: 'trail-line',
      type: 'line',
      source: 'trail',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, '#3b82f6',
          1, '#1d4ed8'
        ]
      }
    })

    // Add trail progress layer for reveal effect
    this.map.addLayer({
      id: 'trail-progress',
      type: 'line',
      source: 'trail',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0
      }
    })
  }

  private setupScrollTrigger(trailData: any): void {
    if (!this.map) return

    const trail = trailData.features[0]
    const trailLength = length(trail)
    
    // Create marker
    const marker = new mapboxgl.Marker()
      .setLngLat(trail.geometry.coordinates[0])
      .addTo(this.map)

    // Setup scroll trigger
    this.scrollTrigger = gsap.to({ progress: 0 }, {
      progress: 1,
      duration: 1,
      ease: 'none',
      onUpdate: () => {
        const progress = this.scrollTrigger.progress()
        
        // Update trail reveal
        this.map.setPaintProperty('trail-progress', 'line-opacity', progress)
        
        // Update marker position
        const markerPos = along(trail, trailLength * progress)
        marker.setLngLat(markerPos.geometry.coordinates as [number, number])
        
        // Update progress indicator
        const progressFill = document.getElementById('progress-fill')
        const progressText = document.getElementById('progress-text')
        if (progressFill) {
          progressFill.style.width = `${progress * 100}%`
        }
        if (progressText) {
          progressText.textContent = `${Math.round(progress * 100)}%`
        }
      }
    })

    // Bind to scroll
    ScrollTrigger.create({
      trigger: this.container,
      start: 'top center',
      end: 'bottom center',
      animation: this.scrollTrigger,
      scrub: 1
    })

    // Setup control event listeners
    this.setupControls(marker)
  }

  private setupControls(marker: any): void {
    // Marker toggle
    const markerToggle = document.getElementById('marker-toggle') as HTMLInputElement
    if (markerToggle) {
      markerToggle.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (target.checked) {
          marker.addTo(this.map)
        } else {
          marker.remove()
        }
      })
    }

    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reduced-motion-toggle') as HTMLInputElement
    if (reducedMotionToggle) {
      reducedMotionToggle.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (target.checked) {
          this.renderStaticTrail()
        } else {
          // Re-initialize the map
          this.initializeMap()
        }
      })
    }

    // Reset animation button
    const resetButton = document.getElementById('reset-animation')
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (this.scrollTrigger) {
          this.scrollTrigger.progress(0)
        }
        // Update progress indicator
        const progressFill = document.getElementById('progress-fill')
        const progressText = document.getElementById('progress-text')
        if (progressFill) {
          progressFill.style.width = '0%'
        }
        if (progressText) {
          progressText.textContent = '0%'
        }
      })
    }

    // Jump to end button
    const jumpToEndButton = document.getElementById('jump-to-end')
    if (jumpToEndButton) {
      jumpToEndButton.addEventListener('click', () => {
        if (this.scrollTrigger) {
          this.scrollTrigger.progress(1)
        }
        // Update progress indicator
        const progressFill = document.getElementById('progress-fill')
        const progressText = document.getElementById('progress-text')
        if (progressFill) {
          progressFill.style.width = '100%'
        }
        if (progressText) {
          progressText.textContent = '100%'
        }
      })
    }
  }

  private injectCSS(): void {
    if (typeof document === 'undefined') return

    const style = document.createElement('style')
    style.textContent = `
      .scrolly-trail-scrub {
        position: relative;
        min-height: 100vh;
        width: 100%;
      }
      .scrolly-trail-scrub__map {
        width: 100%;
        height: 100vh;
      }
      .scrolly-trail-scrub__overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        z-index: 1000;
      }
      .scrolly-trail-scrub__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #f3f4f6;
        text-align: center;
        padding: 2rem;
      }
    `
    document.head.appendChild(style)
  }
}

export const createSection = (): SectionHandle => {
  return new TrailScrubSection()
}

// Default export for ESM
export default createSection