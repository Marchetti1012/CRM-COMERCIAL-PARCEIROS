'use client'

const LAYERS = [
  { blur: 0.25, start: 0,    end: 12.5, opStart: 25,  opEnd: 37.5 },
  { blur: 0.5,  start: 12.5, end: 25,   opStart: 37.5, opEnd: 50  },
  { blur: 1,    start: 25,   end: 37.5, opStart: 50,  opEnd: 62.5 },
  { blur: 2,    start: 37.5, end: 50,   opStart: 62.5, opEnd: 75  },
  { blur: 4,    start: 50,   end: 62.5, opStart: 75,  opEnd: 87.5 },
  { blur: 8,    start: 62.5, end: 75,   opStart: 87.5, opEnd: 100 },
  { blur: 16,   start: 75,   end: 87.5, opStart: 100, opEnd: 100  },
  { blur: 32,   start: 87.5, end: 100,  opStart: 100, opEnd: 100  },
]

export default function ProgressiveBlur() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '120px',
        zIndex: 999,
        pointerEvents: 'none',
      }}
    >
      {LAYERS.map((layer, i) => {
        const mask = `linear-gradient(to top, rgba(0,0,0,${layer.opEnd / 100}) ${layer.start}%, rgba(0,0,0,${layer.opStart / 100}) ${layer.end}%, transparent ${layer.end}%)`
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
