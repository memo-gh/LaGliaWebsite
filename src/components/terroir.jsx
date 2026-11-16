import { useEffect, useRef, useState } from 'react'

const CANVAS_W = 1067
const CANVAS_H = 629

// Exact horizontal coordinate of the top-right vertical line in Company.jsx (1001.5 / 1257)
// so the bottom-right vertical line in Terroir.jsx connects seamlessly across the section boundary.
const COMPANY_TOP_RIGHT_LINE_X_PCT = (1001.5 / 1257) * 100
const RIGHT_OUTER_LINE_X_PCT = (1009 / CANVAS_W) * 100
const RIGHT_LINE_TOP_Y_PCT = (70 / CANVAS_H) * 100
const RIGHT_LINE_STEP_Y_PCT = (534 / CANVAS_H) * 100

const LEFT_CORNER_X_PCT = (21 / CANVAS_W) * 100
const LEFT_CORNER_Y_PCT = (564 / CANVAS_H) * 100

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

// Icon snippets from src/assets/terroirIcons.html
function AltitudeProfileIcon({ className = 'w-full h-full' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mountain / Altitude Profile */}
      <path
        d="M3 16L10 6L14 11L21 3"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Altitude Measurement Drop-line */}
      <path
        d="M10 6V16"
        stroke="#BB4732"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        strokeLinecap="round"
      />

      {/* Ground Level */}
      <path
        d="M3 20H21"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Soil Composition Markers */}
      <path
        d="M7 20V22.5M12 20V23.5M17 20V22.5"
        stroke="#BB4732"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ClimateIcon({ className = 'w-full h-full' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sun Arc */}
      <path
        d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Sun Rays */}
      <path
        d="M12 3V1M18.36 5.64L19.78 4.22M5.64 5.64L4.22 4.22"
        stroke="#BB4732"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Cool Wind / Shift */}
      <path
        d="M3 15H10C11.6569 15 13 13.6569 13 12C13 10.3431 11.6569 9 10 9"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Warm Wind / Shift */}
      <path
        d="M8 19H19C20.6569 19 22 17.6569 22 16C22 14.3431 20.6569 13 19 13"
        stroke="#BB4732"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VineyardIcon({ className = 'w-full h-full' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Training Wire / Trellis */}
      <path
        d="M2 7H22"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Support Stakes (Subtle) */}
      <path
        d="M6 3V21M18 3V21"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Vine Tendril */}
      <path
        d="M12 7V9C12 9 9 10 9 12"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Geometric Grape Cluster */}
      <circle cx="12" cy="11" r="1.5" stroke="#BB4732" strokeWidth="1.2" />
      <circle cx="10" cy="14" r="1.5" stroke="#BB4732" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="1.5" stroke="#BB4732" strokeWidth="1.2" />
      <circle cx="12" cy="17" r="1.5" stroke="#BB4732" strokeWidth="1.2" />
    </svg>
  )
}

const TERROIR_ITEMS = [
  {
    id: 'terreno',
    title: 'Terreno',
    Icon: AltitudeProfileIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
    detailText:
      'Suolo franco-argilloso ricco di scheletro minerale a 350m s.l.m., ideale per conferire struttura, sapidità ed eleganza alle radici.',
  },
  {
    id: 'clima',
    title: 'Clima',
    Icon: ClimateIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
    detailText:
      'Microclima preappenninico caratterizzato da forti escursioni termiche tra il giorno e la notte che esaltano i profumi varietali.',
  },
  {
    id: 'vigna',
    title: 'Vigna',
    Icon: VineyardIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
    detailText:
      'Filari esposti a Sud-Ovest nella valle del Casentino, accarezzati dalla brezza costante e coltivati nel pieno rispetto dei cicli naturali.',
  },
]

const OUTER_HUE_MASK_PAD_PX = 14
const OUTER_HUE_RING_PX = 3

const BORDER_MASK_STYLE = {
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
}

function projectPointToBorder(mx, my, width, height) {
  const cx = width / 2
  const cy = height / 2
  let dx = mx - cx
  let dy = my - cy
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    dx = 0
    dy = -1
  }
  const scale = Math.min(
    cx / Math.max(Math.abs(dx), 0.001),
    cy / Math.max(Math.abs(dy), 0.001)
  )
  return {
    bx: cx + dx * scale,
    by: cy + dy * scale,
  }
}

function CardBorderGlow() {
  return (
    <>
      {/* Thin outer hue effect outside the card following the highlighted border section */}
      <div
        aria-hidden="true"
        style={{
          ...BORDER_MASK_STYLE,
          inset: `-${OUTER_HUE_MASK_PAD_PX}px`,
          padding: `${OUTER_HUE_MASK_PAD_PX}px`,
          borderRadius: `calc(clamp(10px, 1.3vw, 16px) + ${OUTER_HUE_MASK_PAD_PX}px)`,
        }}
        className="pointer-events-none absolute z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
      >
        <div
          style={{
            ...BORDER_MASK_STYLE,
            position: 'absolute',
            inset: `${OUTER_HUE_MASK_PAD_PX - OUTER_HUE_RING_PX}px`,
            padding: `${OUTER_HUE_RING_PX + 1}px`,
            borderRadius: `calc(clamp(10px, 1.3vw, 16px) + ${OUTER_HUE_RING_PX}px)`,
            background: `radial-gradient(130px circle at calc(var(--hx, 50%) + ${OUTER_HUE_RING_PX}px) calc(var(--hy, 0%) + ${OUTER_HUE_RING_PX}px), rgba(179, 62, 42, 0.62) 0%, rgba(148, 49, 32, 0.36) 42%, rgba(110, 34, 21, 0) 100%)`,
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Highlighted section of the border (darker terracotta/wine red) */}
      <div
        aria-hidden="true"
        style={{
          ...BORDER_MASK_STYLE,
          background:
            'radial-gradient(130px circle at var(--hx, 50%) var(--hy, 0%), #B33E2A 0%, #943120 38%, #6E2215 70%, rgba(110, 34, 21, 0) 100%)',
        }}
        className="pointer-events-none absolute inset-0 z-20 rounded-[clamp(10px,1.3vw,16px)] p-[1.25px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
      />
    </>
  )
}

export default function Terroir() {
  const sectionRef = useRef(null)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  const cardRefs = useRef({
    left: null,
    rightTop: null,
    rightBottom: null,
  })
  const borderGlowPosRef = useRef({
    left: { curX: 190, curY: 0, targetX: 190, targetY: 0, active: false },
    rightTop: { curX: 270, curY: 0, targetX: 270, targetY: 0, active: false },
    rightBottom: {
      curX: 270,
      curY: 0,
      targetX: 270,
      targetY: 0,
      active: false,
    },
  })

  // Order of cards: index 0 is featured on the left, indices 1 and 2 are stacked on the right
  const [cardOrder, setCardOrder] = useState([0, 1, 2])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)

  const handleCardMouseEnter = (slotKey, e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const { bx, by } = projectPointToBorder(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height
    )
    const state = borderGlowPosRef.current[slotKey]
    if (state) {
      state.curX = bx
      state.curY = by
      state.targetX = bx
      state.targetY = by
      state.active = true
    }
    el.style.setProperty('--hx', `${bx.toFixed(1)}px`)
    el.style.setProperty('--hy', `${by.toFixed(1)}px`)
  }

  const handleCardMouseMove = (slotKey, e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const { bx, by } = projectPointToBorder(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height
    )
    const state = borderGlowPosRef.current[slotKey]
    if (state) {
      state.targetX = bx
      state.targetY = by
      state.active = true
    }
  }

  const handleCardMouseLeave = (slotKey) => {
    const state = borderGlowPosRef.current[slotKey]
    if (state) {
      state.active = false
    }
  }

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      const startY = vh * 0.92
      const minPossibleTop = Math.max(0, vh - rect.height)
      const endY = Math.max(vh * 0.14, minPossibleTop + 20)

      const span = Math.max(180, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 12) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.014
        const damped = diff * 0.075
        const step = Math.sign(diff) * Math.min(Math.abs(damped), maxStep)
        currentProgressRef.current += step
        setProgress(currentProgressRef.current)
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current
        setProgress(currentProgressRef.current)
      }

      // Smoothly interpolate the highlighted border section and outer hue position along each card perimeter
      ;['left', 'rightTop', 'rightBottom'].forEach((slotKey) => {
        const state = borderGlowPosRef.current[slotKey]
        const cardEl = cardRefs.current[slotKey]
        if (!state || !cardEl) return
        const dx = state.targetX - state.curX
        const dy = state.targetY - state.curY
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          state.curX += dx * 0.22
          state.curY += dy * 0.22
          cardEl.style.setProperty('--hx', `${state.curX.toFixed(1)}px`)
          cardEl.style.setProperty('--hy', `${state.curY.toFixed(1)}px`)
        }
      })

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

  const handleSwapWithFeatured = (rightSlotIndex) => {
    if (isSwapping) return
    setIsSwapping(true)
    setIsDetailOpen(false)
    setTimeout(() => {
      setCardOrder((prev) => {
        const next = [...prev]
        const temp = next[0]
        next[0] = next[rightSlotIndex]
        next[rightSlotIndex] = temp
        return next
      })
      setIsSwapping(false)
    }, 180)
  }

  // Scroll-driven animation stages
  const titleP = stage(progress, 0.04, 0.36)
  const subtitleP = stage(progress, 0.12, 0.44)

  const rightLineVertTopP = stage(progress, 0.1, 0.5)
  const rightLineHorizP = stage(progress, 0.42, 0.72)
  const rightLineVertBottomP = stage(progress, 0.64, 0.96)

  const leftCornerHorizP = stage(progress, 0.52, 0.8)
  const leftCornerVertP = stage(progress, 0.68, 0.98)

  const leftCardP = stage(progress, 0.14, 0.44)
  const rightTopCardP = stage(progress, 0.2, 0.5)
  const rightBottomCardP = stage(progress, 0.26, 0.56)

  const featuredItem = TERROIR_ITEMS[cardOrder[0]]
  const rightTopItem = TERROIR_ITEMS[cardOrder[1]]
  const rightBottomItem = TERROIR_ITEMS[cardOrder[2]]

  const FeaturedIcon = featuredItem.Icon
  const RightTopIcon = rightTopItem.Icon
  const RightBottomIcon = rightBottomItem.Icon

  // Card styling: ~50% transparent dark woodland-espresso charcoal that harmonizes with the green-to-earth background
  const cardSurfaceClass =
    'group/card bg-[linear-gradient(145deg,rgba(21,26,17,0.52)_0%,rgba(14,18,12,0.46)_100%)] backdrop-blur-[6px] border border-[#FFF9EE]/12 shadow-[0_18px_42px_rgba(0,0,0,0.28)] transition-[border-color,box-shadow] duration-300'

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[linear-gradient(180deg,#314A18_0%,#3B4826_50%,#464534_100%)] text-[#FFF9EE] select-none overflow-hidden"
    >
      {/* Proportional 1067 x 629 architectural canvas matching the reference screenshot */}
      <div
        id="territorio"
        className="relative mx-auto w-full max-w-[1440px] aspect-[1067/629] min-h-[420px]"
      >
        {/* 1A. Right-side upper vertical 1px white line (x: 1009, y: 70 -> 534) */}
        <div
          aria-hidden="true"
          style={{
            left: `${RIGHT_OUTER_LINE_X_PCT}%`,
            top: `${RIGHT_LINE_TOP_Y_PCT}%`,
            height: `${RIGHT_LINE_STEP_Y_PCT - RIGHT_LINE_TOP_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${rightLineVertTopP})`,
            opacity: rightLineVertTopP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1B. Right-side horizontal step 1px white line (x: Company line -> 1009, y: 534) */}
        <div
          aria-hidden="true"
          style={{
            left: `${COMPANY_TOP_RIGHT_LINE_X_PCT}%`,
            top: `${RIGHT_LINE_STEP_Y_PCT}%`,
            width: `${RIGHT_OUTER_LINE_X_PCT - COMPANY_TOP_RIGHT_LINE_X_PCT}%`,
            transformOrigin: 'right center',
            transform: `scaleX(${rightLineHorizP})`,
            opacity: rightLineHorizP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 1C. Right-side lower vertical 1px white line connecting seamlessly into Company.jsx (y: 534 -> 629) */}
        <div
          aria-hidden="true"
          style={{
            left: `${COMPANY_TOP_RIGHT_LINE_X_PCT}%`,
            top: `${RIGHT_LINE_STEP_Y_PCT}%`,
            height: `${100 - RIGHT_LINE_STEP_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${rightLineVertBottomP})`,
            opacity: rightLineVertBottomP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 2A. Bottom-left horizontal 1px white line (x: 0 -> 21, y: 564) */}
        <div
          aria-hidden="true"
          style={{
            left: '0%',
            top: `${LEFT_CORNER_Y_PCT}%`,
            width: `${LEFT_CORNER_X_PCT}%`,
            transformOrigin: 'left center',
            transform: `scaleX(${leftCornerHorizP})`,
            opacity: leftCornerHorizP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 2B. Bottom-left vertical 1px white line (x: 21, y: 564 -> 629) */}
        <div
          aria-hidden="true"
          style={{
            left: `${LEFT_CORNER_X_PCT}%`,
            top: `${LEFT_CORNER_Y_PCT}%`,
            height: `${100 - LEFT_CORNER_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${leftCornerVertP})`,
            opacity: leftCornerVertP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 3. Centered Section Header: "Territorio" + 2-line Casentino subtitle */}
        <header
          style={{
            top: `${(44 / CANVAS_H) * 100}%`,
            left: `${(200 / CANVAS_W) * 100}%`,
            width: `${((867 - 200) / CANVAS_W) * 100}%`,
          }}
          className="absolute flex flex-col items-center text-center"
        >
          <h2
            style={{
              opacity: titleP,
              transform: `translate3d(0, ${(1 - titleP) * 18}px, 0)`,
            }}
            className="m-0 font-serif text-[clamp(22px,3.1vw,42px)] font-bold text-[#FFF9EE] leading-[1.08] tracking-[0.01em]"
          >
            Territorio
          </h2>

          <p
            style={{
              opacity: subtitleP,
              transform: `translate3d(0, ${(1 - subtitleP) * 16}px, 0)`,
            }}
            className="mt-[clamp(8px,1.35vw,18px)] mb-0 font-serif text-[clamp(11px,1.52vw,20.5px)] font-normal text-[#FFF9EE]/95 leading-[1.4] tracking-[0.01em]"
          >
            <span className="block">
              Scopri il territorio della valle del Casentino dove nascono e
            </span>
            <span className="block">maturano i nostri prodotti</span>
          </p>
        </header>

        {/* 4. Left Featured Card (x: 27 -> 409, y: 230 -> 503) */}
        <article
          ref={(el) => {
            cardRefs.current.left = el
          }}
          onMouseEnter={(e) => handleCardMouseEnter('left', e)}
          onMouseMove={(e) => handleCardMouseMove('left', e)}
          onMouseLeave={() => handleCardMouseLeave('left')}
          style={{
            left: `${(27 / CANVAS_W) * 100}%`,
            top: `${(230 / CANVAS_H) * 100}%`,
            width: `${((409 - 27) / CANVAS_W) * 100}%`,
            height: `${((503 - 230) / CANVAS_H) * 100}%`,
            opacity: leftCardP,
            transform: `translate3d(0, ${(1 - leftCardP) * 24}px, 0)`,
          }}
          className={`absolute rounded-[clamp(10px,1.3vw,16px)] ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transform: isSwapping ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 180ms ease, transform 180ms ease',
            }}
            className="relative z-10 h-full w-full"
          >
            {/* Icon + Title row */}
            <div
              style={{
                left: `${(39 / 382) * 100}%`,
                top: `${(24 / 273) * 100}%`,
                right: `${(28 / 382) * 100}%`,
              }}
              className="absolute flex items-center"
            >
              <div className="h-[clamp(28px,4.5vw,58px)] w-[clamp(28px,4.5vw,58px)] shrink-0">
                <FeaturedIcon className="h-full w-full" />
              </div>
              <h3 className="m-0 ml-[clamp(10px,1.7vw,22px)] font-serif text-[clamp(18px,2.7vw,36px)] font-normal text-[#FFF9EE] leading-none tracking-[0.01em] pt-[0.15em]">
                {featuredItem.title}
              </h3>
            </div>

            {/* Body text (or expanded detail text when "Scopri di più" is toggled) */}
            <div
              style={{
                left: `${(45 / 382) * 100}%`,
                top: `${(100 / 273) * 100}%`,
                width: `${(295 / 382) * 100}%`,
              }}
              className="absolute font-serif text-[clamp(9.5px,1.2vw,16px)] font-normal text-[#FFF9EE]/90 leading-[1.45] tracking-[0.01em]"
            >
              {isDetailOpen ? (
                <p className="m-0">{featuredItem.detailText}</p>
              ) : (
                featuredItem.lines.map((line, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {line}
                  </div>
                ))
              )}
            </div>

            {/* "Scopri di più" Button (x: 45..190, y: 204..248 inside 382x273 card) */}
            <button
              type="button"
              onClick={() => setIsDetailOpen((prev) => !prev)}
              style={{
                left: `${(45 / 382) * 100}%`,
                top: `${(204 / 273) * 100}%`,
                width: `${(145 / 382) * 100}%`,
                height: `${(44 / 273) * 100}%`,
              }}
              className="absolute flex items-center justify-center rounded-[clamp(8px,1.1vw,14px)] bg-[#BB4237] hover:bg-[#C94B3F] active:scale-[0.98] cursor-pointer border-none font-serif text-[clamp(9.5px,1.2vw,16px)] font-normal text-[#FFF9EE] tracking-[0.01em] shadow-[0_6px_16px_rgba(187,66,55,0.28)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
            >
              {isDetailOpen ? 'Mostra meno' : 'Scopri di più'}
            </button>
          </div>
        </article>

        {/* 5. Top-Right Horizontal Card (x: 440 -> 979, y: 232 -> 355) */}
        <article
          ref={(el) => {
            cardRefs.current.rightTop = el
          }}
          onMouseEnter={(e) => handleCardMouseEnter('rightTop', e)}
          onMouseMove={(e) => handleCardMouseMove('rightTop', e)}
          onMouseLeave={() => handleCardMouseLeave('rightTop')}
          style={{
            left: `${(440 / CANVAS_W) * 100}%`,
            top: `${(232 / CANVAS_H) * 100}%`,
            width: `${((979 - 440) / CANVAS_W) * 100}%`,
            height: `${((355 - 232) / CANVAS_H) * 100}%`,
            opacity: rightTopCardP,
            transform: `translate3d(${(1 - rightTopCardP) * 24}px, 0, 0)`,
          }}
          className={`absolute rounded-[clamp(10px,1.3vw,16px)] ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transition: 'opacity 180ms ease',
            }}
            className="relative z-10 h-full w-full"
          >
            {/* Left Icon */}
            <div
              style={{
                left: `${(40 / 539) * 100}%`,
                top: '50%',
                transform: 'translateY(-44%)',
              }}
              className="absolute h-[clamp(28px,4.9vw,62px)] w-[clamp(28px,4.9vw,62px)]"
            >
              <RightTopIcon className="h-full w-full" />
            </div>

            {/* Middle Title + Description */}
            <div
              style={{
                left: `${(118 / 539) * 100}%`,
                top: `${(11 / 123) * 100}%`,
                width: `${(310 / 539) * 100}%`,
              }}
              className="absolute flex flex-col"
            >
              <h3 className="m-0 font-serif text-[clamp(16px,2.45vw,32px)] font-normal text-[#FFF9EE] leading-[1.08] tracking-[0.01em]">
                {rightTopItem.title}
              </h3>
              <div className="mt-[clamp(2px,0.35vw,5px)] pl-[2%] font-serif text-[clamp(9px,1.18vw,15.5px)] font-normal text-[#FFF9EE]/90 leading-[1.38] tracking-[0.01em]">
                {rightTopItem.lines.map((line, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chevron Action Button (x: 452..505, y: 32..85 inside 539x123 card) */}
            <button
              type="button"
              aria-label={`Mostra dettagli ${rightTopItem.title}`}
              onClick={() => handleSwapWithFeatured(1)}
              style={{
                left: `${(452 / 539) * 100}%`,
                top: `${(32 / 123) * 100}%`,
                width: `${(53 / 539) * 100}%`,
                height: `${(53 / 123) * 100}%`,
              }}
              className="group absolute flex items-center justify-center rounded-[clamp(8px,1.1vw,14px)] bg-[#BB4237] hover:bg-[#C94B3F] active:scale-[0.96] cursor-pointer border-none shadow-[0_6px_16px_rgba(187,66,55,0.28)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[52%] w-[52%] transition-transform duration-200 group-hover:translate-x-[1.5px]"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="#FFF9EE"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </article>

        {/* 6. Bottom-Right Horizontal Card (x: 440 -> 979, y: 374 -> 503) */}
        <article
          ref={(el) => {
            cardRefs.current.rightBottom = el
          }}
          onMouseEnter={(e) => handleCardMouseEnter('rightBottom', e)}
          onMouseMove={(e) => handleCardMouseMove('rightBottom', e)}
          onMouseLeave={() => handleCardMouseLeave('rightBottom')}
          style={{
            left: `${(440 / CANVAS_W) * 100}%`,
            top: `${(374 / CANVAS_H) * 100}%`,
            width: `${((979 - 440) / CANVAS_W) * 100}%`,
            height: `${((503 - 374) / CANVAS_H) * 100}%`,
            opacity: rightBottomCardP,
            transform: `translate3d(${(1 - rightBottomCardP) * 24}px, 0, 0)`,
          }}
          className={`absolute rounded-[clamp(10px,1.3vw,16px)] ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transition: 'opacity 180ms ease',
            }}
            className="relative z-10 h-full w-full"
          >
            {/* Left Icon */}
            <div
              style={{
                left: `${(38 / 539) * 100}%`,
                top: '50%',
                transform: 'translateY(-48%)',
              }}
              className="absolute h-[clamp(28px,4.9vw,62px)] w-[clamp(28px,4.9vw,62px)]"
            >
              <RightBottomIcon className="h-full w-full" />
            </div>

            {/* Middle Title + Description */}
            <div
              style={{
                left: `${(118 / 539) * 100}%`,
                top: `${(12 / 129) * 100}%`,
                width: `${(310 / 539) * 100}%`,
              }}
              className="absolute flex flex-col"
            >
              <h3 className="m-0 font-serif text-[clamp(16px,2.45vw,32px)] font-normal text-[#FFF9EE] leading-[1.08] tracking-[0.01em]">
                {rightBottomItem.title}
              </h3>
              <div className="mt-[clamp(2px,0.35vw,5px)] pl-[2%] font-serif text-[clamp(9px,1.18vw,15.5px)] font-normal text-[#FFF9EE]/90 leading-[1.38] tracking-[0.01em]">
                {rightBottomItem.lines.map((line, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chevron Action Button (x: 452..505, y: 34..89 inside 539x129 card) */}
            <button
              type="button"
              aria-label={`Mostra dettagli ${rightBottomItem.title}`}
              onClick={() => handleSwapWithFeatured(2)}
              style={{
                left: `${(452 / 539) * 100}%`,
                top: `${(34 / 129) * 100}%`,
                width: `${(53 / 539) * 100}%`,
                height: `${(55 / 129) * 100}%`,
              }}
              className="group absolute flex items-center justify-center rounded-[clamp(8px,1.1vw,14px)] bg-[#BB4237] hover:bg-[#C94B3F] active:scale-[0.96] cursor-pointer border-none shadow-[0_6px_16px_rgba(187,66,55,0.28)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[52%] w-[52%] transition-transform duration-200 group-hover:translate-x-[1.5px]"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="#FFF9EE"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}
