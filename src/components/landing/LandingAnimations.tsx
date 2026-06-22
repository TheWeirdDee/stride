'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Scroll-triggered reveal animations for the marketing landing — powered by GSAP
 * + ScrollTrigger. Targets the main blocks by selector so no markup changes are
 * needed. (The hero cards animate in via framer-motion in LandingHero.)
 */
export default function LandingAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const selectors = [
        '.about-top', '.step', '.prog-head', '.pcard', '.sband', '.city-card',
        '.map-card', '.tier-row', '.tstake', '.story', '.screens-head',
        '.stories-head', '.cta-band .inner', '.foot-top > div', '.sec-head',
      ]
      selectors.forEach((sel) => {
        gsap.utils.toArray<HTMLElement>(sel).forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          })
        })
      })
      // Hero streak grid cells pop in like a contribution graph filling up.
      gsap.from('.streak-grid i', { scale: 0, opacity: 0, duration: 0.35, ease: 'back.out(1.6)', stagger: { each: 0.012, from: 'start' }, delay: 0.5 })
    })

    // Recalculate once images/fonts settle.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => { clearTimeout(t); ctx.revert() }
  }, [])

  return null
}
