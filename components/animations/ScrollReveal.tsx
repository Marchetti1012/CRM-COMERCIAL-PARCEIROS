'use client'
import { useEffect, useRef } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  delay?: number
  duration?: number
  distance?: string
  threshold?: number
  className?: string
  once?: boolean
}

const TRANSLATE: Record<NonNullable<ScrollRevealProps['direction']>, string> = {
  up:    'translateY(VAR)',
  down:  'translateY(-VAR)',
  left:  'translateX(VAR)',
  right: 'translateX(-VAR)',
  none:  'none',
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 700,
  distance = '40px',
  threshold = 0.15,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const transform = TRANSLATE[direction].replace('VAR', distance)
    Object.assign(el.style, {
      opacity: '0',
      transform: transform === 'none' ? 'none' : transform,
      willChange: 'opacity, transform',
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        Object.assign(el.style, {
          transition: `opacity ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform ${duration}ms cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
          opacity: '1',
          transform: 'translate(0)',
        })
        if (once) observer.disconnect()
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay, duration, distance, threshold, once])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
