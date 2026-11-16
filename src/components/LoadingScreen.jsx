import { useEffect, useRef, useState } from 'react'

// Exact geometry measured from the reference logo (280x280 coordinate space):
// Three eccentric rings of 12px stroke width converging at the bottom.
const RINGS = [
  {
    id: 'outer',
    cx: 140,
    cy: 140,
    r: 134,
    circumference: 2 * Math.PI * 134,
    start: 0.0,
    end: 0.88,
  },
  {
    id: 'middle',
    cx: 140,
    cy: 156.5,
    r: 106,
    circumference: 2 * Math.PI * 106,
    start: 0.1,
    end: 0.94,
  },
  {
    id: 'inner',
    cx: 140,
    cy: 178,
    r: 73,
    circumference: 2 * Math.PI * 73,
    start: 0.2,
    end: 1.0,
  },
]

function clamp01(val) {
  return Math.max(0, Math.min(1, val))
}

function easeInOutCubic(t) {
  const c = clamp01(t)
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

export default function LoadingScreen({
  durationMs = 2100,
  onStartExit,
  onComplete,
}) {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isUnmounted, setIsUnmounted] = useState(false)
  const callbacksRef = useRef({ onStartExit, onComplete })
  callbacksRef.current = { onStartExit, onComplete }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let rafId = null
    let exitTimer = null
    let unmountTimer = null
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const raw = clamp01(elapsed / durationMs)
      setProgress(raw)

      if (raw < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        exitTimer = setTimeout(() => {
          setIsExiting(true)
          if (callbacksRef.current.onStartExit) {
            callbacksRef.current.onStartExit()
          }
          unmountTimer = setTimeout(() => {
            document.body.style.overflow = prevOverflow
            setIsUnmounted(true)
            if (callbacksRef.current.onComplete) {
              callbacksRef.current.onComplete()
            }
          }, 560)
        }, 220)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.style.overflow = prevOverflow
      if (rafId) cancelAnimationFrame(rafId)
      if (exitTimer) clearTimeout(exitTimer)
      if (unmountTimer) clearTimeout(unmountTimer)
    }
  }, [durationMs])

  if (isUnmounted) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Caricamento in corso"
      style={{
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.02)' : 'scale(1)',
        transition:
          'opacity 540ms cubic-bezier(0.22, 1, 0.36, 1), transform 540ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFEACC] select-none"
    >
      {/* 3-Ring Eccentric Logo SVG */}
      <div className="w-[clamp(190px,24vw,280px)] aspect-square">
        <svg
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full overflow-visible"
        >
          {/* Base warm taupe-grey rings (#8C8377) matching reference image */}
          {RINGS.map((ring) => (
            <circle
              key={`base-${ring.id}`}
              cx={ring.cx}
              cy={ring.cy}
              r={ring.r}
              stroke="#8C8377"
              strokeWidth="12"
            />
          ))}

          {/* Animated red (#BB4732) rings coloring the logo progressively with rounded ends */}
          {RINGS.map((ring) => {
            const localT =
              (progress - ring.start) / Math.max(0.001, ring.end - ring.start)
            const ringP = easeInOutCubic(localT)
            const dashOffset = ring.circumference * (1 - ringP)

            return (
              <circle
                key={`fill-${ring.id}`}
                cx={ring.cx}
                cy={ring.cy}
                r={ring.r}
                stroke="#BB4732"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={ring.circumference}
                strokeDashoffset={dashOffset}
                opacity={ringP > 0.002 ? 1 : 0}
                transform={`rotate(90 ${ring.cx} ${ring.cy})`}
              />
            )
          })}
        </svg>
      </div>

      {/* Caption below the logo */}
      <p className="mt-[clamp(24px,3.2vw,38px)] mb-0 font-mono text-[clamp(13px,1.35vw,17px)] font-normal text-[#1E1B18] tracking-[0.02em]">
        giusto qualche secondo...
      </p>
    </div>
  )
}
