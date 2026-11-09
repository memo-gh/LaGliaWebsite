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

// Full 3x2 grid bounds (x: 53 -> 576, y: 129 -> 376)
const GRID_BOUNDS = {
  x1: 53,
  x2: 576,
  y1: 129,
  y2: 376,
  leftPct: (53 / CANVAS_W) * 100,
  topPct: (129 / CANVAS_H) * 100,
  widthPct: ((576 - 53) / CANVAS_W) * 100,
  heightPct: ((376 - 129) / CANVAS_H) * 100,
}

// Phase 2 (progress 0.40 -> 1.00):
// Content inside each cell animates right after the white grid lines complete.
const CELLS = [
  {
    id: 'altitudine',
    label: 'ALTITUDINE',
    lines: ['350m', 's.l.m.'],
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
  const [activeCellId, setActiveCellId] = useState(null)
  const [hoveredCellId, setHoveredCellId] = useState(null)
  const [isCastleHovered, setIsCastleHovered] = useState(false)

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Start progressive animation when the section enters the bottom of the viewport.
      const startY = vh * 0.94

      // Because Terroir is at the bottom of the page, the highest rect.top can reach
      // when scrolling to the very bottom is (vh - rect.height).
      const minPossibleTop = Math.max(0, vh - rect.height)
      const endY = Math.max(vh * 0.14, minPossibleTop + 24)

      const span = Math.max(180, startY - endY)
      let raw = (startY - rect.top) / span

      // Guarantee 100% completion when scrolled to the bottom of the document
      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 12) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        // Slower, graceful easing with a capped per-frame velocity so fast scrolls
        // still unfold the grid, text, and Poppi Castle doodle at an unhurried pace.
        const maxStep = 0.0052
        const damped = diff * 0.032
        const step =
          Math.sign(diff) * Math.min(Math.abs(damped), maxStep)
        currentProgressRef.current += step
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
  const isAnyExpanded = activeCellId !== null

  const handleCellClick = (cellId) => {
    setActiveCellId((prev) => (prev === cellId ? null : cellId))
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85dvh] w-full bg-[linear-gradient(180deg,#1B2410_0%,#28311B_28%,#3B3E2A_64%,#4E4A3A_100%)] text-white select-none overflow-hidden py-8 sm:py-12 md:py-16 flex items-center"
    >
      {/* Proportional 1052 x 417 architectural canvas matching the screenshot */}
      <div
        id="territorio"
        className="relative mx-auto w-full max-w-[1440px] aspect-[1052/417] min-h-[340px]"
      >
        {/* PHASE 1A: Horizontal 1px white grid lines (animate left-to-right via scaleX) */}
        {HORIZONTAL_LINES.map((line, idx) => {
          const lineP = stage(progress, line.start, line.end)

          // Adapt grid horizontal lines when a cell expands to fill the 3x2 grid
          let x1 = line.x1
          let x2 = line.x2
          let lineOpacity = lineP > 0.005 ? 1 : 0

          if (isAnyExpanded) {
            if (idx === 2) {
              // Top border of grid expands across all 3 columns + right overhang
              x1 = 53
              x2 = 596
            } else if (idx === 3) {
              // Middle horizontal divider fades out while cell is expanded
              lineOpacity = 0
            } else if (idx === 4) {
              // Bottom border of grid expands across all 3 columns + left overhang
              x1 = 36
              x2 = 576
            }
          }

          return (
            <div
              key={`h-${idx}`}
              aria-hidden="true"
              style={{
                left: `${(x1 / CANVAS_W) * 100}%`,
                top: `${(line.y / CANVAS_H) * 100}%`,
                width: `${((x2 - x1) / CANVAS_W) * 100}%`,
                transformOrigin: 'left center',
                transform: `scaleX(${lineP})`,
                opacity: lineOpacity,
                transition:
                  'left 560ms cubic-bezier(0.22, 1, 0.36, 1), width 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease',
              }}
              className="pointer-events-none absolute z-20 h-px bg-white/60"
            />
          )
        })}

        {/* PHASE 1B: Vertical 1px white grid lines (animate top-to-bottom via scaleY) */}
        {VERTICAL_LINES.map((line, idx) => {
          const lineP = stage(progress, line.start, line.end)

          // Adapt grid vertical lines when a cell expands to fill the 3x2 grid
          let y1 = line.y1
          let y2 = line.y2
          let lineOpacity = lineP > 0.005 ? 1 : 0

          if (isAnyExpanded) {
            if (idx === 2) {
              // Left border of grid extends through Row 2 + bottom overhang
              y1 = 129
              y2 = 392
            } else if (idx === 3) {
              // First internal vertical divider (x=228) fades out for the left info panel
              lineOpacity = 0
            } else if (idx === 4) {
              // Second internal vertical divider (x=402) becomes a subtle separator between left info and right title
              lineOpacity = 0.35
            } else if (idx === 5) {
              // Right border of grid (x=576) extends up through Row 1 + top overhang
              y1 = 115
              y2 = 376
            }
          }

          return (
            <div
              key={`v-${idx}`}
              aria-hidden="true"
              style={{
                left: `${(line.x / CANVAS_W) * 100}%`,
                top: `${(y1 / CANVAS_H) * 100}%`,
                height: `${((y2 - y1) / CANVAS_H) * 100}%`,
                transformOrigin: 'center top',
                transform: `scaleY(${lineP})`,
                opacity: lineOpacity,
                transition:
                  'top 560ms cubic-bezier(0.22, 1, 0.36, 1), height 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease',
              }}
              className="pointer-events-none absolute z-20 w-px bg-white/60"
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

        {/* PHASE 2B: 4 Interactive Terroir Cells (hover affordance + click-to-expand to full 3x2 grid) */}
        {CELLS.map((cell) => {
          const labelP = stage(progress, cell.labelRange[0], cell.labelRange[1])
          const valueP = stage(progress, cell.valueRange[0], cell.valueRange[1])
          const isActive = activeCellId === cell.id
          const isOtherExpanded = isAnyExpanded && !isActive
          const isHovered = hoveredCellId === cell.id

          return (
            <div
              key={cell.id}
              role="button"
              tabIndex={isOtherExpanded ? -1 : 0}
              aria-expanded={isActive}
              aria-label={cell.label}
              onClick={() => handleCellClick(cell.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCellClick(cell.id)
                } else if (e.key === 'Escape' && isActive) {
                  setActiveCellId(null)
                }
              }}
              onMouseEnter={() => setHoveredCellId(cell.id)}
              onMouseLeave={() => setHoveredCellId(null)}
              style={{
                left: `${isActive ? GRID_BOUNDS.leftPct : cell.leftPct}%`,
                top: `${isActive ? GRID_BOUNDS.topPct : cell.topPct}%`,
                width: `${isActive ? GRID_BOUNDS.widthPct : cell.widthPct}%`,
                height: `${isActive ? GRID_BOUNDS.heightPct : cell.heightPct}%`,
                opacity: isOtherExpanded ? 0 : 1,
                pointerEvents: isOtherExpanded || labelP < 0.1 ? 'none' : 'auto',
                transition:
                  'left 560ms cubic-bezier(0.22, 1, 0.36, 1), top 560ms cubic-bezier(0.22, 1, 0.36, 1), width 560ms cubic-bezier(0.22, 1, 0.36, 1), height 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease, background-color 300ms ease, box-shadow 300ms ease',
              }}
              className={`group absolute cursor-pointer overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-white/80 ${
                isActive
                  ? 'z-10 bg-[#2B311F]/95 backdrop-blur-xs shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]'
                  : isHovered
                    ? 'z-10 bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]'
                    : 'z-0 bg-transparent'
              }`}
            >
              {/* Subtle top-left hover accent bar (intuitive non-text interactive cue) */}
              <div
                aria-hidden="true"
                style={{
                  transform:
                    isHovered || isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left center',
                  transition: 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-[#BB4732]"
              />

              {/* Intuitive non-text geometric expand/collapse indicator in top-right corner */}
              <div
                aria-hidden="true"
                style={{
                  opacity: labelP * (isHovered || isActive ? 1 : 0.38),
                  transform:
                    isHovered && !isActive
                      ? 'scale(1.12)'
                      : isActive && isHovered
                        ? 'scale(0.92)'
                        : 'scale(1)',
                  transition:
                    'opacity 280ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="pointer-events-none absolute right-[10px] top-[10px] z-20 flex h-5 w-5 items-center justify-center"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-3.5 w-3.5 overflow-visible"
                >
                  {/* Top-right corner bracket / arrow */}
                  <path
                    d={
                      isActive
                        ? 'M 15 9 L 11 9 L 11 5'
                        : 'M 9 4 L 16 4 L 16 11'
                    }
                    stroke={isHovered || isActive ? '#BB4732' : '#FFFFFF'}
                    strokeWidth="1.6"
                    strokeLinecap="square"
                    style={{
                      transform:
                        isHovered && !isActive
                          ? 'translate(1.5px, -1.5px)'
                          : isHovered && isActive
                            ? 'translate(-1px, 1px)'
                            : 'translate(0, 0)',
                      transition:
                        'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), stroke 250ms ease',
                    }}
                  />
                  {/* Bottom-left corner bracket / arrow */}
                  <path
                    d={
                      isActive
                        ? 'M 5 11 L 9 11 L 9 15'
                        : 'M 11 16 L 4 16 L 4 9'
                    }
                    stroke={isHovered || isActive ? '#FFFFFF' : '#FFFFFF'}
                    strokeWidth="1.6"
                    strokeLinecap="square"
                    style={{
                      transform:
                        isHovered && !isActive
                          ? 'translate(-1.5px, 1.5px)'
                          : isHovered && isActive
                            ? 'translate(1px, -1px)'
                            : 'translate(0, 0)',
                      transition:
                        'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), stroke 250ms ease',
                    }}
                  />
                </svg>
              </div>

              {/* LEFT SIDE: Detailed info panel (appears when cell expands to full grid) */}
              <div
                aria-hidden={!isActive}
                style={{
                  width: '66.73%',
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(-18px, 0, 0)',
                  transition: isActive
                    ? 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) 160ms, transform 460ms cubic-bezier(0.22, 1, 0.36, 1) 140ms'
                    : 'opacity 180ms ease 0ms, transform 220ms ease 0ms',
                }}
                className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-center px-[4.5%] py-[4%]"
              >
                <div className="mb-[0.65em] h-[2px] w-7 bg-[#BB4732]" />
                <p className="font-serif text-[clamp(11px,1.28vw,18px)] font-normal leading-[1.55] tracking-[0.01em] text-white/90">
                  {cell.description}
                </p>
              </div>

              {/* RIGHT SIDE (or full cell when collapsed): Category Label & 2-Line Metric */}
              <div
                style={{
                  left: isActive ? '66.73%' : '0%',
                  width: isActive ? '33.27%' : '100%',
                  transform:
                    isHovered && !isActive
                      ? 'translate3d(4px, -2px, 0)'
                      : 'translate3d(0, 0, 0)',
                  transition:
                    'left 560ms cubic-bezier(0.22, 1, 0.36, 1), width 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className={`pointer-events-none absolute inset-y-0 flex flex-col pl-[14px] sm:pl-[18px] ${
                  isActive ? 'justify-center' : 'justify-start pt-[10%]'
                }`}
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
            </div>
          )
        })}

        {/* PHASE 3: Right-Side Line-Art Doodle of Castello dei Conti Guidi (Poppi's Castle) */}
        {(() => {
          const hillP = stage(progress, 0.36, 0.66)
          const wallP = stage(progress, 0.46, 0.76)
          const palaceP = stage(progress, 0.54, 0.84)
          const towerP = stage(progress, 0.62, 0.92)
          const detailsP = stage(progress, 0.72, 0.98)
          const sunP = stage(progress, 0.68, 0.96)

          return (
            <div
              onMouseEnter={() => setIsCastleHovered(true)}
              onMouseLeave={() => setIsCastleHovered(false)}
              style={{
                left: `${(612 / CANVAS_W) * 100}%`,
                top: `${(106 / CANVAS_H) * 100}%`,
                width: `${((1005 - 612) / CANVAS_W) * 100}%`,
                height: `${((386 - 106) / CANVAS_H) * 100}%`,
              }}
              className="group absolute flex flex-col items-center justify-center"
            >
              <svg
                viewBox="0 0 393 280"
                fill="none"
                aria-label="Line-art doodle of Castello dei Conti Guidi in Poppi"
                className="h-full w-full overflow-visible"
              >
                {/* Warm #BB4732 Tuscan Sun / Moon disc behind the castle tower */}
                <g
                  style={{
                    opacity: sunP,
                    transform: isCastleHovered
                      ? 'translate3d(4px, -4px, 0) scale(1.05)'
                      : `translate3d(0, ${(1 - sunP) * 10}px, 0) scale(1)`,
                    transformOrigin: '238px 78px',
                    transition:
                      'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <circle
                    cx="238"
                    cy="78"
                    r="34"
                    fill="#BB4732"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx="238"
                    cy="78"
                    r="34"
                    stroke="#BB4732"
                    strokeWidth="1.25"
                    strokeDasharray="3 3"
                    pathLength="1"
                    style={{
                      strokeDashoffset: 1 - sunP,
                    }}
                  />
                </g>

                {/* 1. Rolling Casentino Hilltop & Vineyard Contour Lines at the base */}
                <path
                  d="M 18 246 C 78 242, 134 218, 198 218 C 262 218, 314 238, 378 246"
                  stroke="#FFFFFF"
                  strokeOpacity="0.75"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - hillP,
                    opacity: hillP > 0.01 ? 1 : 0,
                  }}
                />
                <path
                  d="M 46 258 C 112 248, 168 232, 232 234 C 284 236, 326 248, 362 256"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - hillP,
                    opacity: hillP > 0.01 ? 1 : 0,
                  }}
                />
                {/* Playful vineyard row strokes on the hillside slope */}
                <path
                  d="M 96 248 Q 146 230 186 226 M 126 254 Q 170 238 212 234 M 162 258 Q 202 244 242 240"
                  stroke="#BB4732"
                  strokeOpacity="0.85"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - detailsP,
                    opacity: detailsP > 0.01 ? 1 : 0,
                  }}
                />

                {/* 2. Tuscan Cypresses flanking the castle hill (sway gently on hover) */}
                <g
                  style={{
                    opacity: wallP,
                    transform: isCastleHovered
                      ? 'rotate(1.8deg)'
                      : 'rotate(0deg)',
                    transformOrigin: '86px 232px',
                    transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* Left Cypress 1 */}
                  <path
                    d="M 80 232 L 80 222 M 80 222 C 74 218, 75 186, 80 174 C 85 186, 86 218, 80 222 Z"
                    stroke="#FFFFFF"
                    strokeOpacity="0.7"
                    strokeWidth="1.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1 - wallP,
                    }}
                  />
                  {/* Left Cypress 2 (smaller) */}
                  <path
                    d="M 65 236 L 65 229 M 65 229 C 61 226, 61 202, 65 193 C 69 202, 69 226, 65 229 Z"
                    stroke="#FFFFFF"
                    strokeOpacity="0.5"
                    strokeWidth="1.05"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1 - wallP,
                    }}
                  />
                </g>

                <g
                  style={{
                    opacity: wallP,
                    transform: isCastleHovered
                      ? 'rotate(-1.8deg)'
                      : 'rotate(0deg)',
                    transformOrigin: '314px 232px',
                    transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {/* Right Cypress */}
                  <path
                    d="M 314 231 L 314 221 M 314 221 C 308 217, 309 185, 314 173 C 319 185, 320 217, 314 221 Z"
                    stroke="#FFFFFF"
                    strokeOpacity="0.7"
                    strokeWidth="1.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1 - wallP,
                    }}
                  />
                </g>

                {/* 3. Outer Medieval Curtain Wall & Arched Gate at Base of Castle */}
                <path
                  d="M 96 227 L 96 196 L 104 196 L 104 201 L 112 201 L 112 196 L 120 196 L 120 201 L 128 201 L 128 196 L 284 196 L 284 201 L 292 201 L 292 196 L 300 196 L 300 227"
                  stroke="#FFFFFF"
                  strokeOpacity="0.85"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - wallP,
                    opacity: wallP > 0.01 ? 1 : 0,
                  }}
                />
                {/* Outer wall arched entrance gate */}
                <path
                  d="M 142 221 L 142 209 A 8 8 0 0 1 158 209 L 158 221"
                  stroke="#BB4732"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - detailsP,
                    opacity: detailsP > 0.01 ? 1 : 0,
                  }}
                />

                {/* 4. Main Palace Body of Castello dei Conti Guidi (Left Wing & Right Facade) */}
                <path
                  d="M 122 196 L 122 128 L 168 128 M 202 128 L 274 128 L 274 196"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - palaceP,
                    opacity: palaceP > 0.01 ? 1 : 0,
                  }}
                />

                {/* Overhanging Crenellated Battlements (Merli Guelfi) + Machicolation cornice */}
                <path
                  d="M 118 128 L 168 128 M 202 128 L 278 128 M 118 128 L 118 118 L 125 118 L 125 123 L 132 123 L 132 118 L 139 118 L 139 123 L 146 123 L 146 118 L 153 118 L 153 123 L 160 123 L 160 118 L 168 118 M 202 118 L 209 118 L 209 123 L 216 123 L 216 118 L 223 118 L 223 123 L 230 123 L 230 118 L 237 118 L 237 123 L 244 123 L 244 118 L 251 118 L 251 123 L 258 123 L 258 118 L 265 118 L 265 123 L 272 123 L 272 118 L 278 118 L 278 128"
                  stroke="#FFFFFF"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - palaceP,
                    opacity: palaceP > 0.01 ? 1 : 0,
                  }}
                />

                {/* 5. Iconic Tall Front Bell/Clock Tower (Torre Campanaria) rising from the facade */}
                <path
                  d="M 168 196 L 168 58 L 202 58 L 202 196"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - towerP,
                    opacity: towerP > 0.01 ? 1 : 0,
                  }}
                />

                {/* Tower Corbels / Crenellated Belfry Crown */}
                <path
                  d="M 164 58 L 206 58 L 206 46 L 199 46 L 199 50 L 192 50 L 192 46 L 185 46 L 185 50 L 178 50 L 178 46 L 171 46 L 171 50 L 164 50 L 164 58"
                  stroke="#FFFFFF"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - towerP,
                    opacity: towerP > 0.01 ? 1 : 0,
                  }}
                />

                {/* Iconic Pointed Pyramidal Spire Roof on Top of the Tower (in #BB4732) */}
                <path
                  d="M 167 46 L 185 20 L 203 46 Z M 185 20 L 185 11 M 181 14 L 189 14"
                  stroke="#BB4732"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - towerP,
                    opacity: towerP > 0.01 ? 1 : 0,
                  }}
                />

                {/* 6. Architectural Windows: Tower Belfry Arches, Clock & Palace Bifore */}
                {/* Tower arched belfry opening + small clock circle */}
                <path
                  d="M 179 78 L 179 67 A 6 6 0 0 1 191 67 L 191 78 Z M 185 67 L 185 78"
                  stroke="#FFFFFF"
                  strokeWidth="1.15"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - detailsP,
                    opacity: detailsP > 0.01 ? 1 : 0,
                  }}
                />
                <circle
                  cx="185"
                  cy="94"
                  r="5.5"
                  stroke="#BB4732"
                  strokeWidth="1.25"
                  style={{
                    opacity: detailsP,
                  }}
                />
                {/* Upper & lower rows of Gothic Bifore (mullioned windows) on Palace facade */}
                <path
                  d="M 136 154 L 136 142 A 5 5 0 0 1 146 142 L 146 154 M 141 144 L 141 154 M 136 178 L 136 167 A 5 5 0 0 1 146 167 L 146 178 M 216 154 L 216 142 A 5 5 0 0 1 226 142 L 226 154 M 221 144 L 221 154 M 236 154 L 236 142 A 5 5 0 0 1 246 142 L 246 154 M 241 144 L 241 154 M 256 154 L 256 142 A 5 5 0 0 1 266 142 L 266 154 M 261 144 L 261 154 M 216 178 L 216 167 A 5 5 0 0 1 226 167 L 226 178 M 236 178 L 236 167 A 5 5 0 0 1 246 167 L 246 178 M 256 178 L 256 167 A 5 5 0 0 1 266 167 L 266 178"
                  stroke="#FFFFFF"
                  strokeOpacity="0.85"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  pathLength="1"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - detailsP,
                    opacity: detailsP > 0.01 ? 1 : 0,
                  }}
                />

                {/* 7. Playful Sketched Swifts / Birds ("Rondini") & Breeze Lines around the Tower */}
                <g
                  style={{
                    opacity: detailsP,
                    transform: isCastleHovered
                      ? 'translate3d(8px, -5px, 0)'
                      : 'translate3d(0, 0, 0)',
                    transition:
                      'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  <path
                    d="M 118 58 Q 124 52 129 57 Q 134 52 140 58"
                    stroke="#FFFFFF"
                    strokeOpacity="0.8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 138 42 Q 142 38 146 42 Q 150 38 154 42"
                    stroke="#BB4732"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 284 64 Q 289 59 294 63 Q 299 59 304 64"
                    stroke="#FFFFFF"
                    strokeOpacity="0.75"
                    strokeWidth="1.15"
                    strokeLinecap="round"
                  />
                </g>

                {/* Handwritten-style Caption under the Hill */}
                <text
                  x="200"
                  y="273"
                  textAnchor="middle"
                  style={{
                    opacity: detailsP,
                    transform: `translate3d(0, ${(1 - detailsP) * 6}px, 0)`,
                  }}
                  className="fill-white/70 font-serif text-[11.5px] italic tracking-[0.04em]"
                >
                  Castello dei Conti Guidi — Poppi
                </text>
              </svg>
            </div>
          )
        })()}
      </div>
    </section>
  )
}
