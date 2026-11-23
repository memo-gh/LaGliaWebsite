import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage'

const MENU_ITEMS = [
  { id: 'contattaci', href: '#contattaci' },
  { id: 'vini', href: '#vini' },
  { id: 'territorio', href: '#territorio' },
  { id: 'azienda', href: '#azienda' },
  { id: 'eventi', href: '#eventi' },
]

// Desktop/Tablet (md+, >= 768px): 5 fixed angular slots surrounding the right-edge semi-circle:
// 0° = directly left of the outer circle's center (in line with the middle of the hero text)
// +90° = directly above the outer circle's center
// -90° = directly below the outer circle's center
const DESKTOP_SLOT_ANGLES = [64, 32, 0, -32, -64]

// Mobile (< md, < 768px): 5 fixed angular slots arching over the bottom-centered semi-circle:
// 0° = directly above the wheel's center (12 o'clock)
// -90° = directly left along the bottom edge, +90° = directly right along the bottom edge
const MOBILE_SLOT_ANGLES = [-66, -36, 0, 36, 66]

const DESKTOP_ORBIT_RADIUS = 275
const MOBILE_ORBIT_RX = 260
const MOBILE_ORBIT_RY = 296

const WHEEL_UNITS = {
  mobile: 'clamp(0.44px, min(0.148vw, 0.108dvh), 0.96px)',
  tablet: 'clamp(0.58px, min(0.138dvh, 0.084vw), 0.9px)',
  desktop: 'clamp(0.68px, min(0.148dvh, 0.092vw), 1.25px)',
}

const ANIMATION_DURATION_MS = 900

function getViewportMode() {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(max-width: 767px)').matches) return 'mobile'
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet'
  return 'desktop'
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function MenuWheel({ onNavigate, isLoaded = true }) {
  const { t } = useLanguage()
  const [viewportMode, setViewportMode] = useState(getViewportMode)
  const isMobile = viewportMode === 'mobile'

  // itemSlots[i] holds which slot (0..4) MENU_ITEMS[i] currently occupies.
  // Initially: Contattaci=0, Vini=1, Territorio=2 (Center, white), Azienda=3, Eventi=4
  const [itemSlots, setItemSlots] = useState([0, 1, 2, 3, 4])
  // currentAngles[i] holds the live animated angle (in degrees) for each item
  const [currentAngles, setCurrentAngles] = useState(() =>
    getViewportMode() === 'mobile' ? MOBILE_SLOT_ANGLES : DESKTOP_SLOT_ANGLES
  )
  const [hoveredId, setHoveredId] = useState(null)
  const [activeCenterId, setActiveCenterId] = useState('territorio')
  const [isAnimating, setIsAnimating] = useState(false)

  const rafRef = useRef(null)
  const itemSlotsRef = useRef(itemSlots)
  const isMobileRef = useRef(isMobile)

  useEffect(() => {
    itemSlotsRef.current = itemSlots
  }, [itemSlots])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 767px)')
    const tabletMq = window.matchMedia('(max-width: 1023px)')

    const handleBreakpointChange = () => {
      const nextMode = mobileMq.matches
        ? 'mobile'
        : tabletMq.matches
          ? 'tablet'
          : 'desktop'
      const nextIsMobile = nextMode === 'mobile'

      setViewportMode(nextMode)

      if (nextIsMobile !== isMobileRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
        setIsAnimating(false)
        setHoveredId(null)
        const nextSlotAngles = nextIsMobile
          ? MOBILE_SLOT_ANGLES
          : DESKTOP_SLOT_ANGLES
        setCurrentAngles(itemSlotsRef.current.map((slot) => nextSlotAngles[slot]))
      }
    }

    mobileMq.addEventListener('change', handleBreakpointChange)
    tabletMq.addEventListener('change', handleBreakpointChange)

    return () => {
      mobileMq.removeEventListener('change', handleBreakpointChange)
      tabletMq.removeEventListener('change', handleBreakpointChange)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleLinkClick = (e, item, clickedIndex) => {
    e.preventDefault()
    if (isAnimating) return

    const slotAngles = isMobile ? MOBILE_SLOT_ANGLES : DESKTOP_SLOT_ANGLES
    const totalSlots = MENU_ITEMS.length
    const clickedSlot = itemSlots[clickedIndex]

    // Determine how many slots to shift so the clicked item lands on Center slot (2)
    let shift = 0
    if (clickedSlot === 0) {
      shift = 2 // Move 2 steps along the front arc into Center
    } else if (clickedSlot === 1) {
      shift = 1 // Move 1 step along the front arc into Center
    } else if (clickedSlot === 3) {
      shift = -1 // Move 1 step opposite along the front arc into Center
    } else if (clickedSlot === 4) {
      shift = -2 // Move 2 steps opposite along the front arc into Center
    } else {
      shift = totalSlots // Already in Center: perform a full 360° loop around the circle
    }

    const startAngles = itemSlots.map((slot) => slotAngles[slot])
    const targetSlots = itemSlots.map(
      (slot) => ((slot + shift) % totalSlots + totalSlots) % totalSlots
    )

    // On desktop, angles decrease with slot index (64 -> -64); on mobile, angles increase (-66 -> +66)
    const wrapDirection = isMobile ? 1 : -1

    const endAngles = itemSlots.map((oldSlot, idx) => {
      const startAngle = startAngles[idx]
      const newSlot = targetSlots[idx]
      let endAngle = slotAngles[newSlot]

      if (shift === totalSlots) {
        return startAngle + wrapDirection * 360
      }

      if (shift > 0) {
        // Items that wrap past the far end loop cleanly behind the clipped edge
        if (oldSlot + shift >= totalSlots) {
          endAngle += wrapDirection * 360
        }
      } else {
        // Items that wrap past the start end loop cleanly behind the clipped edge
        if (oldSlot + shift < 0) {
          endAngle -= wrapDirection * 360
        }
      }

      return endAngle
    })

    setIsAnimating(true)
    setActiveCenterId(item.id)
    setHoveredId(null)

    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / ANIMATION_DURATION_MS)
      const eased = easeInOutCubic(progress)

      const interpolated = startAngles.map(
        (start, i) => start + (endAngles[i] - start) * eased
      )
      setCurrentAngles(interpolated)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setItemSlots(targetSlots)
        setCurrentAngles(targetSlots.map((s) => slotAngles[s]))
        setIsAnimating(false)
        rafRef.current = null

        if (typeof onNavigate === 'function') {
          onNavigate(item)
        } else {
          window.location.hash = item.href
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  // Desktop circle centerline radii (matching 195px, 130px, 60px outer radii with 13px stroke)
  const outerR = 188.5
  const middleR = 123.5
  const innerR = 53.5
  const middleCy = outerR - middleR // 65
  const innerCy = outerR - innerR // 135

  const desktopArcs = [
    { r: outerR, cy: 0, delayMs: 0 },
    { r: middleR, cy: middleCy, delayMs: 120 },
    { r: innerR, cy: innerCy, delayMs: 240 },
  ]

  // Mobile concentric bottom-anchored semi-circles arching upward
  const mobileArcs = [
    { r: 152, delayMs: 0 },
    { r: 100, delayMs: 120 },
    { r: 43, delayMs: 240 },
  ]

  return (
    <div
      style={{
        '--wheel-unit': WHEEL_UNITS[viewportMode],
      }}
      className={`pointer-events-none absolute z-20 h-0 w-0 select-none ${
        isMobile
          ? 'bottom-0 left-1/2 -translate-x-1/2'
          : 'right-0 top-1/2 -translate-y-1/2'
      }`}
      aria-label={t.menuWheel.ariaLabel}
    >
      {/* Shared coordinate origin: bottom-center on mobile, right-center on tablet/desktop */}
      <div className="relative h-0 w-0">
        {isMobile ? (
          /* 3 Nested Red Semi-Circles flush against the bottom edge (y = 0) and drawn left-to-right */
          <svg
            width="440"
            height="220"
            viewBox="-220 -220 440 220"
            fill="none"
            style={{
              width: 'calc(440 * var(--wheel-unit))',
              height: 'calc(220 * var(--wheel-unit))',
            }}
            className="absolute bottom-0 left-0 -translate-x-1/2 overflow-visible"
            aria-hidden="true"
          >
            {mobileArcs.map((arc, i) => (
              <path
                key={i}
                d={`M ${-arc.r} 0 A ${arc.r} ${arc.r} 0 0 1 ${arc.r} 0`}
                pathLength="1"
                stroke="#BD3B28"
                strokeWidth="11"
                strokeLinecap="butt"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: isLoaded ? 0 : 1,
                  transition: `stroke-dashoffset 850ms cubic-bezier(0.22, 1, 0.36, 1) ${arc.delayMs}ms`,
                }}
              />
            ))}
          </svg>
        ) : (
          /* 3 Nested Red Semi-Circles flush against the right edge (x = 0) and drawn top-to-bottom */
          <svg
            width="220"
            height="440"
            viewBox="-220 -220 220 440"
            fill="none"
            style={{
              width: 'calc(220 * var(--wheel-unit))',
              height: 'calc(440 * var(--wheel-unit))',
            }}
            className="absolute right-0 top-0 -translate-y-1/2 overflow-visible"
            aria-hidden="true"
          >
            {desktopArcs.map((arc, i) => (
              <path
                key={i}
                d={`M 0 ${arc.cy - arc.r} A ${arc.r} ${arc.r} 0 0 0 0 ${arc.cy + arc.r}`}
                pathLength="1"
                stroke="#BD3B28"
                strokeWidth="13"
                strokeLinecap="butt"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: isLoaded ? 0 : 1,
                  transition: `stroke-dashoffset 850ms cubic-bezier(0.22, 1, 0.36, 1) ${arc.delayMs}ms`,
                }}
              />
            ))}
          </svg>
        )}

        {/* 5 Anchor Links orbiting the wheel (left-to-right on mobile, top-to-bottom on tablet/desktop) */}
        {MENU_ITEMS.map((item, index) => {
          const angleDeg = currentAngles[index]
          const angleRad = (angleDeg * Math.PI) / 180

          const x = isMobile
            ? Math.sin(angleRad) * MOBILE_ORBIT_RX
            : -Math.cos(angleRad) * DESKTOP_ORBIT_RADIUS
          const y = isMobile
            ? -Math.cos(angleRad) * MOBILE_ORBIT_RY
            : -Math.sin(angleRad) * DESKTOP_ORBIT_RADIUS

          const isCenter = activeCenterId === item.id
          const isHovered = hoveredId === item.id
          const isHighlighted = isCenter || isHovered
          const label = t.menuWheel.items[item.id] ?? item.id

          // Stagger after Hero title texts (which run at 750ms..1170ms):
          // Contattaci (1310ms) -> Vini (1450ms) -> Territorio (1590ms) -> Azienda (1730ms) -> Eventi (1870ms)
          const entranceDelayMs = 1310 + index * 140
          const hiddenOffsetY = isMobile ? '14px' : '-14px'

          return (
            <div
              key={item.id}
              style={{
                transform: `translate3d(calc(${x.toFixed(2)} * var(--wheel-unit)), calc(${y.toFixed(2)} * var(--wheel-unit)), 0)`,
              }}
              className="pointer-events-auto absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? 'translateY(0px)'
                    : `translateY(${hiddenOffsetY})`,
                  transition: `opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelayMs}ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelayMs}ms`,
                }}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item, index)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    fontSize: isMobile
                      ? 'calc(28 * var(--wheel-unit))'
                      : 'calc(31 * var(--wheel-unit))',
                    transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
                    transition:
                      'color 250ms ease, transform 250ms ease, text-shadow 250ms ease',
                  }}
                  className={`block cursor-pointer whitespace-nowrap px-1.5 py-1 font-sans font-bold leading-tight tracking-tight md:p-0 ${
                    isHighlighted
                      ? 'text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)] md:[text-shadow:0_2px_16px_rgba(0,0,0,0.35)]'
                      : 'text-white/75 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)] md:text-[#6A717A]/85 md:[text-shadow:none]'
                  }`}
                >
                  {label}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
