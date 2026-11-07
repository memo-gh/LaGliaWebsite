import { useEffect, useRef, useState } from 'react'

const CANVAS_W = 1052
const CANVAS_H = 417

function clamp01(val) {
  return Math.max(0, Math.min(1, val))
}

function easeOutCubic(t) {
  const c = clamp01(t)
  return 1 - Math.pow(1 - c, 3)
}

function stage(progress, start, end) {
  return easeOutCubic((progress - start) / (end - start))
}

// Phase 1 (progress 0.00 -> 0.54):
// 11 uniform 1px white grid lines (horizontal & vertical) matching the exact
// 1052 x 417 geometry and overhangs from the reference screenshot.
const HORIZONTAL_LINES = [
  // 1. Header top border (x: 16 -> 1043, y: 12)
  { x1: 16, x2: 1043, y: 12, start: 0.0, end: 0.22 },
  // 2. Header bottom border (x: 16 -> 1027, y: 84)
  { x1: 16, x2: 1027, y: 84, start: 0.06, end: 0.28 },
  // 3. Row 1 top border across ALTITUDINE & TERRENO + right overhang (x: 53 -> 463, y: 129)
  { x1: 53, x2: 463, y: 129, start: 0.14, end: 0.36 },
  // 4. Middle shared border with left & right overhangs (x: 32 -> 620, y: 252.5)
  { x1: 32, x2: 620, y: 252.5, start: 0.22, end: 0.46 },
  // 5. Row 2 bottom border across CLIMA & VIGNA (x: 228 -> 576, y: 376)
  { x1: 228, x2: 576, y: 376, start: 0.32, end: 0.54 },
]

const VERTICAL_LINES = [
  // 6. Header left border + bottom overhang (x: 16, y: 12 -> 119)
  { x: 16, y1: 12, y2: 119, start: 0.03, end: 0.22 },
  // 7. Header right border + bottom overhang (x: 1005, y: 12 -> 119)
  { x: 1005, y1: 12, y2: 119, start: 0.12, end: 0.30 },
  // 8. Row 1 left border of ALTITUDINE + bottom overhang (x: 53, y: 129 -> 279)
  { x: 53, y1: 129, y2: 279, start: 0.18, end: 0.38 },
  // 9. Continuous vertical divider x=228 from top of Row 1 to bottom of Row 2 (y: 129 -> 376)
  { x: 228, y1: 129, y2: 376, start: 0.22, end: 0.44 },
  // 10. Continuous vertical divider x=402 from top of Row 1 to bottom of Row 2 (y: 129 -> 376)
  { x: 402, y1: 129, y2: 376, start: 0.26, end: 0.48 },
  // 11. Row 2 right border of VIGNA (x: 576, y: 252.5 -> 376)
  { x: 576, y1: 252.5, y2: 376, start: 0.32, end: 0.52 },
]

// Phase 2 (progress 0.40 -> 1.00):
// Content inside each cell animates right after the white grid lines complete.
const CELLS = [
  {
    id: 'altitudine',
    label: 'ALTITUDINE',
    lines: ['350m', 's.l.m.'],
    leftPct: (53 / CANVAS_W) * 100,
    topPct: (129 / CANVAS_H) * 100,
    widthPct: ((228 - 53) / CANVAS_W) * 100,
    heightPct: ((252.5 - 129) / CANVAS_H) * 100,
    labelRange: [0.46, 0.66],
    valueRange: [0.52, 0.72],
  },
  {
    id: 'terreno',
    label: 'TERRENO',
    lines: ['franco-', 'argilloso'],
    leftPct: (228 / CANVAS_W) * 100,
    topPct: (129 / CANVAS_H) * 100,
    widthPct: ((402 - 228) / CANVAS_W) * 100,
    heightPct: ((252.5 - 129) / CANVAS_H) * 100,
    labelRange: [0.54, 0.74],
    valueRange: [0.60, 0.80],
  },
  {
    id: 'clima',
    label: 'CLIMA',
    lines: ['forti', 'escursioni'],
    leftPct: (228 / CANVAS_W) * 100,
    topPct: (252.5 / CANVAS_H) * 100,
    widthPct: ((402 - 228) / CANVAS_W) * 100,
    heightPct: ((376 - 252.5) / CANVAS_H) * 100,
    labelRange: [0.64, 0.84],
    valueRange: [0.70, 0.90],
  },
  {
    id: 'vigna',
    label: 'VIGNA',
    lines: ['Sud', '-Ovest'],
    leftPct: (402 / CANVAS_W) * 100,
    topPct: (252.5 / CANVAS_H) * 100,
    widthPct: ((576 - 402) / CANVAS_W) * 100,
    heightPct: ((376 - 252.5) / CANVAS_H) * 100,
    labelRange: [0.72, 0.92],
    valueRange: [0.78, 0.98],
  },
]

export default function Terroir() {
  const sectionRef = useRef(null)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Start progressive animation when the section enters the bottom of the viewport.
      const startY = vh * 0.92

      // Because Terroir is at the bottom of the page, the highest rect.top can reach
      // when scrolling to the very bottom is (vh - rect.height).
      // Ensure endY is always reachable well before scroll hits the bottom of the page.
      const minPossibleTop = Math.max(0, vh - rect.height)
      const endY = Math.max(vh * 0.22, minPossibleTop + 48)

      const span = Math.max(120, startY - endY)
      let raw = (startY - rect.top) / span

      // Also guarantee 100% completion when scrolled to the bottom of the document
      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 12) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0006) {
        currentProgressRef.current += diff * 0.1
        setProgress(currentProgressRef.current)
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current
        setProgress(currentProgressRef.current)
      }
      rafId = requestAnimationFrame(animateLoop)
    }

    computeScrollTarget()
    window.addEventListener('scroll', computeScrollTarget, { passive: true })
    window.addEventListener('resize', computeScrollTarget, { passive: true })
    rafId = requestAnimationFrame(animateLoop)

    return () => {
      window.removeEventListener('scroll', computeScrollTarget)
      window.removeEventListener('resize', computeScrollTarget)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Header content stages (right after the top header grid lines finish drawing)
  const headerSubtitleP = stage(progress, 0.34, 0.54)
  const headerTitleP = stage(progress, 0.40, 0.60)
  const headerCoordsP = stage(progress, 0.44, 0.64)

  return (
    <section
      id="territorio"
      ref={sectionRef}
      className="relative min-h-[85dvh] w-full bg-[#565142] text-white select-none overflow-hidden py-8 sm:py-12 md:py-16 flex items-center"
    >
      {/* Proportional 1052 x 417 architectural canvas matching the screenshot */}
      <div className="relative mx-auto w-full max-w-[1440px] aspect-[1052/417] min-h-[340px]">
        {/* PHASE 1A: Horizontal 1px white grid lines (animate left-to-right via scaleX) */}
        {HORIZONTAL_LINES.map((line, idx) => {
          const lineP = stage(progress, line.start, line.end)
          return (
            <div
              key={`h-${idx}`}
              aria-hidden="true"
              style={{
                left: `${(line.x1 / CANVAS_W) * 100}%`,
                top: `${(line.y / CANVAS_H) * 100}%`,
                width: `${((line.x2 - line.x1) / CANVAS_W) * 100}%`,
                transformOrigin: 'left center',
                transform: `scaleX(${lineP})`,
                opacity: lineP > 0.005 ? 1 : 0,
              }}
              className="pointer-events-none absolute h-px bg-white/60"
            />
          )
        })}

        {/* PHASE 1B: Vertical 1px white grid lines (animate top-to-bottom via scaleY) */}
        {VERTICAL_LINES.map((line, idx) => {
          const lineP = stage(progress, line.start, line.end)
          return (
            <div
              key={`v-${idx}`}
              aria-hidden="true"
              style={{
                left: `${(line.x / CANVAS_W) * 100}%`,
                top: `${(line.y1 / CANVAS_H) * 100}%`,
                height: `${((line.y2 - line.y1) / CANVAS_H) * 100}%`,
                transformOrigin: 'center top',
                transform: `scaleY(${lineP})`,
                opacity: lineP > 0.005 ? 1 : 0,
              }}
              className="pointer-events-none absolute w-px bg-white/60"
            />
          )
        })}

        {/* PHASE 2A: Header Content inside the top bar (y: 12..84) */}
        <div
          style={{
            left: `${(16 / CANVAS_W) * 100}%`,
            top: `${(12 / CANVAS_H) * 100}%`,
            width: `${((1005 - 16) / CANVAS_W) * 100}%`,
            height: `${((84 - 12) / CANVAS_H) * 100}%`,
          }}
          className="absolute flex items-center justify-between pl-[1.45%] pr-[1.65%]"
        >
          {/* Left: "Poppi (AR), Via Magrete 12" + "Territorio" */}
          <div className="flex flex-col justify-center leading-tight">
            <span
              style={{
                opacity: headerSubtitleP,
                transform: `translate3d(0, ${(1 - headerSubtitleP) * 10}px, 0)`,
              }}
              className="font-serif text-[clamp(10px,1.22vw,17px)] font-normal text-[#BB4732] tracking-[0.01em]"
            >
              Poppi (AR), Via Magrete 12
            </span>
            <h2
              style={{
                opacity: headerTitleP,
                transform: `translate3d(0, ${(1 - headerTitleP) * 12}px, 0)`,
              }}
              className="mt-[0.15em] font-serif text-[clamp(18px,2.35vw,33px)] font-bold text-white tracking-[0.005em] leading-[1.08]"
            >
              Territorio
            </h2>
          </div>

          {/* Right: Staggered coordinates "43°43'N" / "11°45'E" */}
          <div
            style={{
              opacity: headerCoordsP,
              transform: `translate3d(0, ${(1 - headerCoordsP) * 10}px, 0)`,
            }}
            className="font-sans text-[clamp(11px,1.45vw,20px)] font-normal text-white/95 leading-[1.18] tracking-[0.01em] pt-[0.6%]"
          >
            <div>43°43&apos;N</div>
            <div className="pl-[2.1em]">11°45&apos;E</div>
          </div>
        </div>

        {/* PHASE 2B: 4 Staggered Terroir Cells (content animates right after the grid lines) */}
        {CELLS.map((cell) => {
          const labelP = stage(progress, cell.labelRange[0], cell.labelRange[1])
          const valueP = stage(progress, cell.valueRange[0], cell.valueRange[1])

          return (
            <div
              key={cell.id}
              style={{
                left: `${cell.leftPct}%`,
                top: `${cell.topPct}%`,
                width: `${cell.widthPct}%`,
                height: `${cell.heightPct}%`,
              }}
              className="absolute flex flex-col justify-start pl-[1.25%] pt-[1.85%]"
            >
              {/* Red uppercase category label */}
              <span
                style={{
                  opacity: labelP,
                  transform: `translate3d(0, ${(1 - labelP) * 12}px, 0)`,
                }}
                className="font-sans text-[clamp(10px,1.45vw,20px)] font-bold uppercase tracking-[0.02em] text-[#BB4732] leading-none"
              >
                {cell.label}
              </span>

              {/* White serif 2-line description */}
              <div
                style={{
                  opacity: valueP,
                  transform: `translate3d(0, ${(1 - valueP) * 14}px, 0)`,
                }}
                className="mt-[0.65em] font-serif text-[clamp(14px,2.02vw,28px)] font-bold text-white leading-[1.32] tracking-[0.005em]"
              >
                {cell.lines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
