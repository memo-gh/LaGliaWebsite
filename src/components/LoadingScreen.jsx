import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

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
  const { t } = useLanguage()
  const [progress, setProgress] = useState(0)
  const [isAgePromptVisible, setIsAgePromptVisible] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [isExiting, setIsExiting] = useState(false)
  const [isUnmounted, setIsUnmounted] = useState(false)

  const callbacksRef = useRef({ onStartExit, onComplete })
  const prevOverflowRef = useRef('')
  const exitTimerRef = useRef(null)
  const unmountTimerRef = useRef(null)

  useEffect(() => {
    callbacksRef.current = { onStartExit, onComplete }
  }, [onStartExit, onComplete])

  useEffect(() => {
    prevOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let rafId = null
    let promptTimer = null
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const raw = clamp01(elapsed / durationMs)
      setProgress(raw)

      if (raw < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        promptTimer = setTimeout(() => {
          setIsAgePromptVisible(true)
        }, 220)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.style.overflow = prevOverflowRef.current
      if (rafId) cancelAnimationFrame(rafId)
      if (promptTimer) clearTimeout(promptTimer)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
    }
  }, [durationMs])

  const handleConfirmAdult = () => {
    if (!isAgePromptVisible || isExiting) return
    setSelectedChoice('yes')

    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true)
      if (callbacksRef.current.onStartExit) {
        callbacksRef.current.onStartExit()
      }
      unmountTimerRef.current = setTimeout(() => {
        document.body.style.overflow = prevOverflowRef.current
        setIsUnmounted(true)
        if (callbacksRef.current.onComplete) {
          callbacksRef.current.onComplete()
        }
      }, 560)
    }, 180)
  }

  const handleDeclineAdult = () => {
    if (!isAgePromptVisible || isExiting) return
    setSelectedChoice('no')
  }

  if (isUnmounted) return null

  return (
    <div
      role={isAgePromptVisible ? 'dialog' : 'status'}
      aria-modal={isAgePromptVisible ? 'true' : undefined}
      aria-live="polite"
      aria-label={isAgePromptVisible ? t.loading.ageQuestion : t.loading.ariaLabel}
      style={{
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.02)' : 'scale(1)',
        transition:
          'opacity 540ms cubic-bezier(0.22, 1, 0.36, 1), transform 540ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFE6B6] pb-[clamp(84px,14dvh,144px)] select-none"
    >
      {/* 3-Ring Eccentric Logo SVG */}
      <div className="w-[clamp(170px,min(24vw,34dvh),270px)] aspect-square">
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

      {/* Caption & Age Verification Buttons anchored cleanly below the logo */}
      <div className="relative mt-[clamp(24px,3.2vw,38px)] flex flex-col items-center">
        <div className="grid place-items-center">
          <p
            style={{
              opacity: isAgePromptVisible ? 0 : 1,
              transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            aria-hidden={isAgePromptVisible}
            className="col-start-1 row-start-1 mb-0 font-mono text-[clamp(13px,1.35vw,17px)] font-normal text-[#1E1B18] tracking-[0.02em]"
          >
            {t.loading.caption}
          </p>
          <p
            style={{
              opacity: isAgePromptVisible ? 1 : 0,
              transition: 'opacity 380ms cubic-bezier(0.22, 1, 0.36, 1) 120ms',
            }}
            aria-hidden={!isAgePromptVisible}
            className="col-start-1 row-start-1 mb-0 font-mono text-[clamp(13px,1.35vw,17px)] font-normal text-[#1E1B18] tracking-[0.02em]"
          >
            {t.loading.ageQuestion}
          </p>
        </div>

        {/* Two pill-shaped buttons appearing below the text after load */}
        <div
          style={{
            opacity: isAgePromptVisible ? 1 : 0,
            transform: isAgePromptVisible
              ? 'translate3d(0, 0, 0)'
              : 'translate3d(0, 8px, 0)',
            transition:
              'opacity 380ms cubic-bezier(0.22, 1, 0.36, 1) 140ms, transform 380ms cubic-bezier(0.22, 1, 0.36, 1) 140ms',
          }}
          aria-hidden={!isAgePromptVisible}
          className={`absolute left-1/2 top-full -translate-x-1/2 pt-[clamp(18px,2.2vw,26px)] flex flex-col items-center ${
            isAgePromptVisible ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-[clamp(12px,1.6vw,20px)]">
            <button
              type="button"
              disabled={!isAgePromptVisible || isExiting}
              onClick={handleConfirmAdult}
              className={`min-w-[clamp(86px,8vw,108px)] cursor-pointer rounded-full border border-[#1E1B18] px-[clamp(22px,2.4vw,32px)] py-[clamp(7px,0.75vw,10px)] font-mono text-[clamp(13px,1.35vw,17px)] font-normal tracking-[0.02em] transition-colors duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E1B18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE6B6] ${
                selectedChoice === 'yes'
                  ? 'bg-[#1E1B18] text-[#FFE6B6]'
                  : 'bg-transparent text-[#1E1B18] hover:bg-[#1E1B18] hover:text-[#FFE6B6] active:bg-[#1E1B18] active:text-[#FFE6B6]'
              }`}
            >
              {t.loading.ageYes}
            </button>

            <button
              type="button"
              disabled={!isAgePromptVisible || isExiting}
              onClick={handleDeclineAdult}
              className={`min-w-[clamp(86px,8vw,108px)] cursor-pointer rounded-full border border-[#1E1B18] px-[clamp(22px,2.4vw,32px)] py-[clamp(7px,0.75vw,10px)] font-mono text-[clamp(13px,1.35vw,17px)] font-normal tracking-[0.02em] transition-colors duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E1B18] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE6B6] ${
                selectedChoice === 'no'
                  ? 'bg-[#1E1B18] text-[#FFE6B6]'
                  : 'bg-transparent text-[#1E1B18] hover:bg-[#1E1B18] hover:text-[#FFE6B6] active:bg-[#1E1B18] active:text-[#FFE6B6]'
              }`}
            >
              {t.loading.ageNo}
            </button>
          </div>

          {selectedChoice === 'no' && (
            <p className="mt-4 w-[min(86vw,400px)] text-center font-mono text-[clamp(12px,1.15vw,14.5px)] font-normal leading-[1.45] text-[#1E1B18] tracking-[0.02em]">
              {t.loading.underageMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
