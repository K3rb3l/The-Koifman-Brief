'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)

  // Respect reduced motion globally
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function applyMotionPreference(reduced: boolean) {
    if (reduced) {
      gsap.globalTimeline.timeScale(1000)
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }

  applyMotionPreference(prefersReducedMotion.matches)
  prefersReducedMotion.addEventListener('change', (e) => applyMotionPreference(e.matches))
}

// Shared easing matching current cubic-bezier(0.16, 1, 0.3, 1)
const EASE_REVEAL = 'power3.out'
const DURATION_REVEAL = 0.5

export { gsap, ScrollTrigger, useGSAP, EASE_REVEAL, DURATION_REVEAL }
