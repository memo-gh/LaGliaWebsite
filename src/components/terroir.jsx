import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

const CANVAS_W = 1067
const CANVAS_H = 629

// Exact horizontal coordinate of the top-right vertical line in Company.jsx (1001.5 / 1257)
// so the bottom-right vertical line in Terroir.jsx connects seamlessly across the section boundary.
const COMPANY_TOP_RIGHT_LINE_X_PCT = (1001.5 / 1257) * 100
const HEADER_LINE_LEFT_X_PCT = (175 / CANVAS_W) * 100
const HEADER_LINE_TOP_Y_PCT = (56 / CANVAS_H) * 100
const HEADER_LINE_Y_PCT = (164 / CANVAS_H) * 100
const RIGHT_OUTER_LINE_X_PCT = (1009 / CANVAS_W) * 100
const RIGHT_LINE_STEP_Y_PCT = (534 / CANVAS_H) * 100

const LEFT_CORNER_X_PCT = (21 / CANVAS_W) * 100
const LEFT_CORNER_Y_PCT = (564 / CANVAS_H) * 100
const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

function getIsMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

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
    Icon: AltitudeProfileIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
  },
  {
    id: 'clima',
    Icon: ClimateIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
  },
  {
    id: 'vigna',
    Icon: VineyardIcon,
    lines: [
      'Lorem ipsum dolor sit amet',
      'consectetur adipiscing elit. Amet',
      'consectetur adipiscing elit quisque.',
    ],
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
  const { t } = useLanguage()
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
  const [isArrowHovered, setIsArrowHovered] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isMobile, setIsMobile] = useState(getIsMobileViewport)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY)
    const handleChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

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

  const headerLineVertP = stage(progress, 0.06, 0.24)
  const headerLineHorizP = stage(progress, 0.18, 0.46)
  const rightLineVertTopP = stage(progress, 0.38, 0.68)
  const rightLineHorizP = stage(progress, 0.6, 0.8)
  const rightLineVertBottomP = stage(progress, 0.74, 0.98)

  const leftCornerHorizP = stage(progress, 0.52, 0.8)
  const leftCornerVertP = stage(progress, 0.68, 0.98)

  const leftCardP = stage(progress, 0.14, 0.44)
  const rightTopCardP = stage(progress, 0.2, 0.5)
  const rightBottomCardP = stage(progress, 0.26, 0.56)

  const featuredItem = {
    ...TERROIR_ITEMS[cardOrder[0]],
    ...t.terroir.items[TERROIR_ITEMS[cardOrder[0]].id],
  }
  const rightTopItem = {
    ...TERROIR_ITEMS[cardOrder[1]],
    ...t.terroir.items[TERROIR_ITEMS[cardOrder[1]].id],
  }
  const rightBottomItem = {
    ...TERROIR_ITEMS[cardOrder[2]],
    ...t.terroir.items[TERROIR_ITEMS[cardOrder[2]].id],
  }

  const FeaturedIcon = featuredItem.Icon
  const RightTopIcon = rightTopItem.Icon
  const RightBottomIcon = rightBottomItem.Icon

  // Card styling: ~50% transparent dark woodland-espresso charcoal that harmonizes with the green-to-earth background
  const cardSurfaceClass =
    'group/card bg-[linear-gradient(145deg,rgba(21,26,17,0.52)_0%,rgba(14,18,12,0.46)_100%)] backdrop-blur-[6px] border border-[#FFF9EE]/12 shadow-[0_18px_42px_rgba(0,0,0,0.28)]'

  // Layout coordinates (in 1067x629 canvas units) for collapsed vs expanded states
  const CARD_GAP = 31
  const RIGHT_EDGE = 979
  const RIGHT_COLLAPSED_W = 177
  const isMobileExpanded = isMobile && isDetailOpen
  const isDesktopCollapsed = isDetailOpen && !isMobile
  const leftCardWidth = isDetailOpen
    ? isMobile
      ? RIGHT_EDGE - 27 // 952 (full grid width on mobile while other cards hide)
      : RIGHT_EDGE - RIGHT_COLLAPSED_W - CARD_GAP - 27 // 744
    : 409 - 27 // 382
  const leftCardTop = isMobileExpanded ? 196 : 230
  const leftCardHeight = isMobileExpanded ? 536 - 196 : 503 - 230
  const rightCardLeft = isDesktopCollapsed ? RIGHT_EDGE - RIGHT_COLLAPSED_W : 440 // 802 vs 440
  const rightCardWidth = isDesktopCollapsed ? RIGHT_COLLAPSED_W : RIGHT_EDGE - 440 // 177 vs 539

  const cardExpandTransition =
    'left 620ms cubic-bezier(0.16, 1, 0.3, 1), top 520ms cubic-bezier(0.16, 1, 0.3, 1), width 620ms cubic-bezier(0.16, 1, 0.3, 1), height 520ms cubic-bezier(0.16, 1, 0.3, 1), border-color 300ms ease, box-shadow 300ms ease'
  const rightCardTransition = isMobile
    ? `${cardExpandTransition}, opacity 280ms ease, transform 380ms cubic-bezier(0.16, 1, 0.3, 1)`
    : cardExpandTransition

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
        {/* 1A. Top-left vertical 1px white line beside the header (x: 175, y: 56 -> 164) */}
        <div
          aria-hidden="true"
          style={{
            left: `${HEADER_LINE_LEFT_X_PCT}%`,
            top: `${HEADER_LINE_TOP_Y_PCT}%`,
            height: `${HEADER_LINE_Y_PCT - HEADER_LINE_TOP_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${headerLineVertP})`,
            opacity: headerLineVertP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1B. Upper horizontal 1px white line under the header (x: 175 -> 1009, y: 164) */}
        <div
          aria-hidden="true"
          style={{
            left: `${HEADER_LINE_LEFT_X_PCT}%`,
            top: `${HEADER_LINE_Y_PCT}%`,
            width: `${RIGHT_OUTER_LINE_X_PCT - HEADER_LINE_LEFT_X_PCT}%`,
            transformOrigin: 'left center',
            transform: `scaleX(${headerLineHorizP})`,
            opacity: headerLineHorizP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 1C. Right-side upper vertical 1px white line (x: 1009, y: 164 -> 534) */}
        <div
          aria-hidden="true"
          style={{
            left: `${RIGHT_OUTER_LINE_X_PCT}%`,
            top: `${HEADER_LINE_Y_PCT}%`,
            height: `${RIGHT_LINE_STEP_Y_PCT - HEADER_LINE_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${rightLineVertTopP})`,
            opacity: rightLineVertTopP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1D. Right-side horizontal step 1px white line (x: Company line -> 1009, y: 534) */}
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

        {/* 1E. Right-side lower vertical 1px white line connecting seamlessly into Company.jsx (y: 534 -> 629) */}
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
            {t.terroir.title}
          </h2>

          <p
            style={{
              opacity: subtitleP,
              transform: `translate3d(0, ${(1 - subtitleP) * 16}px, 0)`,
            }}
            className="mt-[clamp(8px,1.35vw,18px)] mb-0 font-body text-[clamp(6.8px,1.88vw,10.5px)] sm:text-[clamp(10px,1.52vw,20.5px)] font-normal text-[#FFF9EE]/95 leading-[1.4] tracking-[0.01em]"
          >
            <span className="block">{t.terroir.subtitleLine1}</span>
            <span className="block">{t.terroir.subtitleLine2}</span>
          </p>
        </header>

        {/* 4. Left Featured Card (expands right; on mobile fills full width while hiding other cards) */}
        <article
          ref={(el) => {
            cardRefs.current.left = el
          }}
          onMouseEnter={(e) => handleCardMouseEnter('left', e)}
          onMouseMove={(e) => handleCardMouseMove('left', e)}
          onMouseLeave={() => handleCardMouseLeave('left')}
          style={{
            left: `${(27 / CANVAS_W) * 100}%`,
            top: `${(leftCardTop / CANVAS_H) * 100}%`,
            width: `${(leftCardWidth / CANVAS_W) * 100}%`,
            height: `${(leftCardHeight / CANVAS_H) * 100}%`,
            opacity: leftCardP,
            transform: `translate3d(0, ${(1 - leftCardP) * 24}px, 0)`,
            transition: cardExpandTransition,
          }}
          className={`absolute rounded-[clamp(10px,1.3vw,16px)] ${
            isDetailOpen ? 'z-20' : 'z-10'
          } ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          {/* Subtle #BB4732 right-edge hue when hovering the expand/collapse arrow */}
          <div
            aria-hidden="true"
            style={{
              opacity: isArrowHovered ? 1 : 0,
              background:
                'radial-gradient(75% 88% at 100% 50%, rgba(187, 71, 50, 0.34) 0%, rgba(187, 71, 50, 0.14) 50%, rgba(187, 71, 50, 0) 100%)',
              transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[clamp(90px,14vw,190px)] rounded-r-[inherit]"
          />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transform: isSwapping ? 'translateY(6px)' : 'translateY(0)',
              transition: 'opacity 180ms ease, transform 180ms ease',
            }}
            className={`relative z-10 flex h-full w-full items-stretch justify-between gap-[clamp(10px,1.4vw,20px)] overflow-hidden rounded-[inherit] ${
              isMobileExpanded
                ? 'pl-4 pr-2.5 py-3.5'
                : 'pl-[clamp(18px,3.2vw,44px)] pr-[clamp(10px,1.6vw,22px)] py-[clamp(16px,2.2vw,30px)]'
            }`}
          >
            {/* Left content column: Icon + Title + Body/Detail text */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* Icon + Title row */}
              <div className="flex min-w-0 shrink-0 items-center overflow-hidden">
                <div className="h-[clamp(28px,4.5vw,58px)] w-[clamp(28px,4.5vw,58px)] shrink-0">
                  <FeaturedIcon className="h-full w-full" />
                </div>
                <h3 className="m-0 ml-[clamp(10px,1.7vw,22px)] whitespace-nowrap font-serif text-[clamp(18px,2.7vw,36px)] font-normal text-[#FFF9EE] leading-none tracking-[0.01em] pt-[0.15em]">
                  {featuredItem.title}
                </h3>
              </div>

              {/* Body text + Expanded detail column (stacked & wrapping cleanly on mobile expanded) */}
              {isMobileExpanded ? (
                <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1 font-body">
                  <p className="m-0 text-[12px] font-normal leading-[1.42] tracking-[0.01em] text-[#FFF9EE]/85">
                    {featuredItem.lines.join(' ')}
                  </p>
                  <p className="m-0 border-t border-[#FFF9EE]/18 pt-2.5 text-[12.5px] font-normal leading-[1.48] tracking-[0.01em] text-[#FFF9EE]/95">
                    {featuredItem.detailText}
                  </p>
                </div>
              ) : (
                <div className="mt-[clamp(12px,1.8vw,24px)] flex min-h-0 min-w-0 flex-1 items-center overflow-hidden">
                  {/* Summary lines anchored on the left */}
                  <div className="shrink-0 pl-[clamp(2px,0.4vw,6px)] font-body text-[clamp(9.5px,1.2vw,16px)] font-normal text-[#FFF9EE]/90 leading-[1.45] tracking-[0.01em]">
                    {featuredItem.lines.map((line, i) => (
                      <div key={i} className="whitespace-nowrap">
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* Expanded detail text revealed smoothly as card widens to the right */}
                  <div
                    aria-hidden={!isDetailOpen}
                    style={{
                      opacity: isDetailOpen ? 1 : 0,
                      transform: isDetailOpen
                        ? 'translate3d(0, 0, 0)'
                        : 'translate3d(-12px, 0, 0)',
                      maxWidth: isDetailOpen ? '600px' : '0px',
                      marginLeft: isDetailOpen
                        ? 'clamp(14px, 2.2vw, 32px)'
                        : '0px',
                      paddingLeft: isDetailOpen
                        ? 'clamp(14px, 2.2vw, 32px)'
                        : '0px',
                      borderLeftColor: isDetailOpen
                        ? 'rgba(255, 249, 238, 0.18)'
                        : 'rgba(255, 249, 238, 0)',
                      transition: isDetailOpen
                        ? 'opacity 360ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 420ms cubic-bezier(0.16, 1, 0.3, 1) 180ms, max-width 580ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 480ms cubic-bezier(0.16, 1, 0.3, 1), padding-left 480ms cubic-bezier(0.16, 1, 0.3, 1), border-left-color 360ms ease 180ms'
                        : 'opacity 150ms ease-out, transform 200ms ease-out, max-width 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 420ms cubic-bezier(0.16, 1, 0.3, 1), padding-left 420ms cubic-bezier(0.16, 1, 0.3, 1), border-left-color 150ms ease',
                    }}
                    className={`min-w-0 flex-1 overflow-hidden border-l font-body text-[clamp(9.5px,1.2vw,16px)] font-normal text-[#FFF9EE]/92 leading-[1.52] tracking-[0.01em] ${
                      isDetailOpen ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    <p className="m-0 min-w-[clamp(160px,22vw,300px)]">
                      {featuredItem.detailText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tall stemless #FFF9EE Chevron centered vertically to the full card */}
            <div className="flex shrink-0 items-center justify-center">
              <button
                type="button"
                aria-expanded={isDetailOpen}
                aria-label={
                  isDetailOpen ? t.terroir.showLess : t.terroir.learnMore
                }
                onClick={() => setIsDetailOpen((prev) => !prev)}
                onMouseEnter={() => setIsArrowHovered(true)}
                onMouseLeave={() => setIsArrowHovered(false)}
                onFocus={() => setIsArrowHovered(true)}
                onBlur={() => setIsArrowHovered(false)}
                className="group/arrow flex h-[clamp(52px,6.8vw,92px)] w-[clamp(22px,2.2vw,34px)] shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-[#FFF9EE] transition-transform duration-300 ease-out hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
              >
                <svg
                  viewBox="0 0 18 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: isDetailOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="h-full w-full"
                >
                  <path
                    d="M4 4L14 26L4 48"
                    stroke="#FFF9EE"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </article>

        {/* 5. Top-Right Horizontal Card (collapses on desktop, hides on mobile when featured card expands) */}
        <article
          ref={(el) => {
            cardRefs.current.rightTop = el
          }}
          aria-hidden={isMobileExpanded}
          onMouseEnter={(e) => handleCardMouseEnter('rightTop', e)}
          onMouseMove={(e) => handleCardMouseMove('rightTop', e)}
          onMouseLeave={() => handleCardMouseLeave('rightTop')}
          style={{
            left: `${(rightCardLeft / CANVAS_W) * 100}%`,
            top: `${(232 / CANVAS_H) * 100}%`,
            width: `${(rightCardWidth / CANVAS_W) * 100}%`,
            height: `${((355 - 232) / CANVAS_H) * 100}%`,
            opacity: isMobileExpanded ? 0 : rightTopCardP,
            pointerEvents: isMobileExpanded ? 'none' : 'auto',
            transform: isMobileExpanded
              ? 'translate3d(18px, 0, 0) scale(0.96)'
              : `translate3d(${(1 - rightTopCardP) * 24}px, 0, 0)`,
            transition: rightCardTransition,
          }}
          className={`absolute z-10 rounded-[clamp(10px,1.3vw,16px)] ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transition: 'opacity 180ms ease',
            }}
            className="relative z-10 flex h-full w-full items-center justify-between overflow-hidden rounded-[inherit] px-[clamp(14px,2.2vw,30px)]"
          >
            {/* Left Icon */}
            <div className="h-[clamp(28px,4.9vw,62px)] w-[clamp(28px,4.9vw,62px)] shrink-0">
              <RightTopIcon className="h-full w-full" />
            </div>

            {/* Middle Title + Description — collapses cleanly on desktop when featured card is expanded */}
            <div
              aria-hidden={isDesktopCollapsed}
              style={{
                opacity: isDesktopCollapsed ? 0 : 1,
                transform: isDesktopCollapsed
                  ? 'translate3d(10px, 0, 0)'
                  : 'translate3d(0, 0, 0)',
                maxWidth: isDesktopCollapsed ? '0px' : '440px',
                marginLeft: isDesktopCollapsed
                  ? '0px'
                  : 'clamp(12px, 1.8vw, 26px)',
                marginRight: isDesktopCollapsed
                  ? '0px'
                  : 'clamp(10px, 1.4vw, 20px)',
                transition: isDesktopCollapsed
                  ? 'opacity 180ms ease-out, transform 220ms ease-out, max-width 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-right 480ms cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'opacity 320ms ease-out 240ms, transform 360ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, max-width 560ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 560ms cubic-bezier(0.16, 1, 0.3, 1), margin-right 560ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
                isDesktopCollapsed ? 'pointer-events-none' : ''
              }`}
            >
              <h3 className="m-0 whitespace-nowrap font-serif text-[clamp(16px,2.45vw,32px)] font-normal text-[#FFF9EE] leading-[1.08] tracking-[0.01em]">
                {rightTopItem.title}
              </h3>
              <div className="mt-[clamp(2px,0.35vw,5px)] pl-[2%] font-body text-[clamp(9px,1.18vw,15.5px)] font-normal text-[#FFF9EE]/90 leading-[1.38] tracking-[0.01em]">
                {rightTopItem.lines.map((line, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chevron Action Button */}
            <button
              type="button"
              tabIndex={isMobileExpanded ? -1 : undefined}
              aria-label={t.terroir.showDetailsAria(rightTopItem.title)}
              onClick={() => handleSwapWithFeatured(1)}
              className="group relative flex h-[34%] aspect-square shrink-0 items-center justify-center rounded-[clamp(6px,0.9vw,11px)] border-[1.5px] border-[#BB4237] bg-transparent hover:border-[#C94B3F] hover:bg-[#BB4237]/15 active:scale-[0.96] cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[50%] w-[50%] transition-transform duration-200 group-hover:translate-x-[1.5px]"
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

        {/* 6. Bottom-Right Horizontal Card (collapses on desktop, hides on mobile when featured card expands) */}
        <article
          ref={(el) => {
            cardRefs.current.rightBottom = el
          }}
          aria-hidden={isMobileExpanded}
          onMouseEnter={(e) => handleCardMouseEnter('rightBottom', e)}
          onMouseMove={(e) => handleCardMouseMove('rightBottom', e)}
          onMouseLeave={() => handleCardMouseLeave('rightBottom')}
          style={{
            left: `${(rightCardLeft / CANVAS_W) * 100}%`,
            top: `${(374 / CANVAS_H) * 100}%`,
            width: `${(rightCardWidth / CANVAS_W) * 100}%`,
            height: `${((503 - 374) / CANVAS_H) * 100}%`,
            opacity: isMobileExpanded ? 0 : rightBottomCardP,
            pointerEvents: isMobileExpanded ? 'none' : 'auto',
            transform: isMobileExpanded
              ? 'translate3d(18px, 0, 0) scale(0.96)'
              : `translate3d(${(1 - rightBottomCardP) * 24}px, 0, 0)`,
            transition: rightCardTransition,
          }}
          className={`absolute z-10 rounded-[clamp(10px,1.3vw,16px)] ${cardSurfaceClass}`}
        >
          <CardBorderGlow />
          <div
            style={{
              opacity: isSwapping ? 0 : 1,
              transition: 'opacity 180ms ease',
            }}
            className="relative z-10 flex h-full w-full items-center justify-between overflow-hidden rounded-[inherit] px-[clamp(14px,2.2vw,30px)]"
          >
            {/* Left Icon */}
            <div className="h-[clamp(28px,4.9vw,62px)] w-[clamp(28px,4.9vw,62px)] shrink-0">
              <RightBottomIcon className="h-full w-full" />
            </div>

            {/* Middle Title + Description — collapses cleanly on desktop when featured card is expanded */}
            <div
              aria-hidden={isDesktopCollapsed}
              style={{
                opacity: isDesktopCollapsed ? 0 : 1,
                transform: isDesktopCollapsed
                  ? 'translate3d(10px, 0, 0)'
                  : 'translate3d(0, 0, 0)',
                maxWidth: isDesktopCollapsed ? '0px' : '440px',
                marginLeft: isDesktopCollapsed
                  ? '0px'
                  : 'clamp(12px, 1.8vw, 26px)',
                marginRight: isDesktopCollapsed
                  ? '0px'
                  : 'clamp(10px, 1.4vw, 20px)',
                transition: isDesktopCollapsed
                  ? 'opacity 180ms ease-out, transform 220ms ease-out, max-width 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 480ms cubic-bezier(0.16, 1, 0.3, 1), margin-right 480ms cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'opacity 320ms ease-out 240ms, transform 360ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, max-width 560ms cubic-bezier(0.16, 1, 0.3, 1), margin-left 560ms cubic-bezier(0.16, 1, 0.3, 1), margin-right 560ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
                isDesktopCollapsed ? 'pointer-events-none' : ''
              }`}
            >
              <h3 className="m-0 whitespace-nowrap font-serif text-[clamp(16px,2.45vw,32px)] font-normal text-[#FFF9EE] leading-[1.08] tracking-[0.01em]">
                {rightBottomItem.title}
              </h3>
              <div className="mt-[clamp(2px,0.35vw,5px)] pl-[2%] font-body text-[clamp(9px,1.18vw,15.5px)] font-normal text-[#FFF9EE]/90 leading-[1.38] tracking-[0.01em]">
                {rightBottomItem.lines.map((line, i) => (
                  <div key={i} className="whitespace-nowrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chevron Action Button */}
            <button
              type="button"
              tabIndex={isMobileExpanded ? -1 : undefined}
              aria-label={t.terroir.showDetailsAria(rightBottomItem.title)}
              onClick={() => handleSwapWithFeatured(2)}
              className="group relative flex h-[34%] aspect-square shrink-0 items-center justify-center rounded-[clamp(6px,0.9vw,11px)] border-[1.5px] border-[#BB4237] bg-transparent hover:border-[#C94B3F] hover:bg-[#BB4237]/15 active:scale-[0.96] cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFF9EE]/80"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[50%] w-[50%] transition-transform duration-200 group-hover:translate-x-[1.5px]"
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
