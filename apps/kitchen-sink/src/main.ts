import './styles/main.scss'
import { createOrchestrator } from '../../../packages/lib/src/index.ts'

// Initialize orchestrator with lazy-loaded Trail Scrub section
const orchestrator = createOrchestrator({
  sections: [
    {
      id: 'trail-scrub',
      target: '#trail-scrub',
      css: 'lazy',
      loader: () => import('../../../packages/sections/trail-scrub/src/index.ts'),
      trailDataUrl: '/data/trails/highland-mary.geojson'
    }
  ],
  debug: true
})

// Initialize the orchestrator
orchestrator.init()

console.log('Trail Scrub Animation Demo loaded successfully')
