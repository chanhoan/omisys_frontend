'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
}

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // Already in view on mount → reveal straight away, skip the hidden state
    // so above-the-fold content never flashes out-and-in.
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setRevealed(true)
      return
    }
    setArmed(true)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 'static' before mount / no-JS → fully visible; 'hidden' → armed off-screen; 'revealed' → shown
  const state = !armed ? 'static' : revealed ? 'revealed' : 'hidden'

  return (
    <div ref={ref} className={`reveal${className ? ` ${className}` : ''}`} data-reveal={state}>
      {children}
    </div>
  )
}
