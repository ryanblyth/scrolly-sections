// Scrolly Sections Library
// This is the main orchestrator package

export interface SectionConfig {
  id: string
  target: string | Element
  css?: boolean | 'lazy'
  prefersReducedMotion?: boolean
  [key: string]: unknown
}

export interface SectionModule {
  createSection: () => {
    mount: (opts: SectionConfig) => Promise<void>
    unmount: () => Promise<void>
    isMounted: () => boolean
  }
}

export interface OrchestratorOptions {
  sections: Array<{
    id: string
    section?: SectionModule
    loader?: () => Promise<SectionModule>
    target: string | Element
    css?: boolean | 'lazy'
    prefersReducedMotion?: boolean
    [key: string]: unknown
  }>
  debug?: boolean
  preloadMargin?: string
}

export class ScrollySections {
  private sections: Map<string, any> = new Map()
  private loadedSections: Map<string, SectionModule> = new Map()
  private observer: IntersectionObserver | null = null
  private options: OrchestratorOptions

  constructor(options: OrchestratorOptions) {
    this.options = {
      preloadMargin: '200px',
      ...options
    }
  }

  public init(): void {
    this.setupIntersectionObserver()
    this.registerSections()
    
    if (this.options.debug) {
      console.log('ScrollySections initialized with sections:', this.options.sections)
    }
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section-id')
            if (sectionId) {
              this.loadSection(sectionId)
            }
          }
        })
      },
      {
        rootMargin: this.options.preloadMargin || '200px'
      }
    )
  }

  private registerSections(): void {
    this.options.sections.forEach(sectionConfig => {
      const target = typeof sectionConfig.target === 'string' 
        ? document.querySelector(sectionConfig.target) as HTMLElement
        : sectionConfig.target

      if (!target) {
        console.warn(`Section target not found: ${sectionConfig.target}`)
        return
      }

      // Mark target for observation
      target.setAttribute('data-section-id', sectionConfig.id)
      this.observer?.observe(target)

      // Store section config
      this.sections.set(sectionConfig.id, sectionConfig)
    })
  }

  private async loadSection(sectionId: string): Promise<void> {
    const sectionConfig = this.sections.get(sectionId)
    if (!sectionConfig) return

    // Check if already loaded
    if (this.loadedSections.has(sectionId)) return

    try {
      let sectionModule: SectionModule

      if (sectionConfig.section) {
        // Direct section module
        sectionModule = sectionConfig.section
      } else if (sectionConfig.loader) {
        // Lazy load section
        sectionModule = await sectionConfig.loader()
      } else {
        console.warn(`No section or loader provided for: ${sectionId}`)
        return
      }

      // Store loaded section
      this.loadedSections.set(sectionId, sectionModule)

      // Create and mount section
      const section = sectionModule.createSection()
      await section.mount({
        target: sectionConfig.target,
        css: sectionConfig.css,
        prefersReducedMotion: sectionConfig.prefersReducedMotion,
        ...sectionConfig
      })

      // Stop observing this target
      const target = typeof sectionConfig.target === 'string' 
        ? document.querySelector(sectionConfig.target) as HTMLElement
        : sectionConfig.target
      
      if (target) {
        this.observer?.unobserve(target)
      }

      if (this.options.debug) {
        console.log(`Section loaded and mounted: ${sectionId}`)
      }
    } catch (error) {
      console.error(`Failed to load section ${sectionId}:`, error)
    }
  }

  public addSection(sectionConfig: any): void {
    this.options.sections.push(sectionConfig)
    this.registerSections()
    
    if (this.options.debug) {
      console.log('Added section:', sectionConfig)
    }
  }

  public getSections(): any[] {
    return [...this.options.sections]
  }

  public destroy(): void {
    // Unmount all loaded sections
    this.loadedSections.forEach((sectionModule, sectionId) => {
      try {
        const section = sectionModule.createSection()
        section.unmount()
      } catch (error) {
        console.error(`Failed to unmount section ${sectionId}:`, error)
      }
    })

    // Clean up observer
    this.observer?.disconnect()
    this.observer = null

    // Clear maps
    this.sections.clear()
    this.loadedSections.clear()
  }
}

// Create orchestrator factory
export const createOrchestrator = (options: OrchestratorOptions): ScrollySections => {
  return new ScrollySections(options)
}

// Export default
export default ScrollySections
