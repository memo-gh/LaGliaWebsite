import { useEffect, useRef, useState } from 'react'

const MENU_ITEMS = [
  { id: 'contattaci', label: 'Contattaci', href: '#contattaci' },
  { id: 'vini', label: 'Vini', href: '#vini' },
  { id: 'territorio', label: 'Territorio', href: '#territorio' },
  { id: 'azienda', label: 'Azienda', href: '#azienda' },
]

// 4 fixed angular slots (in degrees) surrounding the outer red circle:
// 0° = directly left of the outer circle's center (in line with the middle of the hero text)
// +90° = directly above the outer circle's center
// -90° = directly below the outer circle's center
const SLOT_ANGLES = [68, 26, -6, -46]
const ANIMATION_DURATION_MS = 900

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function MenuWheel({ onNavigate, isLoaded = true }) {
  // itemSlots[i] holds which slot (0..3) MENU_ITEMS[i] currently occupies.
  // Initially: Contattaci=0, Vini=1, Territorio=2 (Center, white), Azienda=3
  const [itemSlots, setItemSlots] = useState([0, 1, 2, 3])
  // currentAngles[i] holds the live animated angle (in degrees) for each item
  const [currentAngles, setCurrentAngles] = useState(SLOT_ANGLES)
  const [hoveredId, setHoveredId] = useState(null)
  const [activeCenterId, setActiveCenterId] = useState('territorio')
  const [isAnimating, setIsAnimating] = useState(false)

  const rafRef = useRef(null)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleLinkClick = (e, item, clickedIndex) => {
    e.preventDefault()
    if (isAnimating) return

    const clickedSlot = itemSlots[clickedIndex]

    // Determine how many slots to shift so the clicked item lands on Center slot (2)
    let shift = 0
    if (clickedSlot === 0) {
      shift = 2 // Move 2 steps down along the front arc into Center
    } else if (clickedSlot === 1) {
      shift = 1 // Move 1 step down along the front arc into Center
    } else if (clickedSlot === 3) {
      shift = -1 // Move 1 step up along the front arc into Center
    } else {
      shift = 4 // Already in Center: perform a full 360° loop around the circle
    }

    const startAngles = itemSlots.map((slot) => SLOT_ANGLES[slot])
    const targetSlots = itemSlots.map(
      (slot) => ((slot + shift) % 4 + 4) % 4
    )

    const endAngles = itemSlots.map((oldSlot, idx) => {
      const startAngle = startAngles[idx]
      const newSlot = targetSlots[idx]
      let endAngle = SLOT_ANGLES[newSlot]

      if (shift === 4) {
        return startAngle - 360
      }

      if (shift > 0) {
        // Moving downward along the left arc (angles decrease: 68 -> 26 -> -6 -> -46)
        // Items that wrap from the bottom back to the top loop around the circle (-360°)
        if (oldSlot + shift >= 4) {
          endAngle -= 360
        }
      } else {
        // Moving upward along the left arc (angles increase: -46 -> -6 -> 26 -> 68)
        // Items that wrap from the top back to the bottom loop around the circle (+360°)
        if (oldSlot + shift < 0) {
          endAngle += 360
        }
      }

      return endAngle
    })

    setIsAnimating(true)
    setActiveCenterId(item.id)

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
        setCurrentAngles(targetSlots.map((s) => SLOT_ANGLES[s]))
        setIsAnimating(false)

        if (typeof onNavigate === 'function') {
          onNavigate(item)
        } else {
          window.location.hash = item.href
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  // Circle centerline radii (matching 195px, 130px, 60px outer radii with 13px stroke)
  const outerR = 188.5
  const middleR = 123.5
  const innerR = 53.5
  const middleCy = outerR - middleR // 65
  const innerCy = outerR - innerR // 135
  const orbitRadius = 275

  const arcs = [
    { r: outerR, cy: 0, delayMs: 0 },
    { r: middleR, cy: middleCy, delayMs: 120 },
    { r: innerR, cy: innerCy, delayMs: 240 },
  ]

  return (
    <div
      className="pointer-events-none absolute right-0 top-[54%] -translate-y-1/2 z-20 h-0 w-0 select-none"
      aria-label="Navigation wheel"
    >
      {/* Shared coordinate origin aligned vertically in line with the Hero text */}
      <div className="relative h-0 w-0">
        {/* 3 Nested Red Semi-Circles flush against the right edge (x = 0) and drawn top-to-bottom */}
        <svg
          width="220"
          height="440"
          viewBox="-220 -220 220 440"
          fill="none"
          className="absolute right-0 top-0 -translate-y-1/2 overflow-visible"
          aria-hidden="true"
        >
          {arcs.map((arc, i) => (
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

        {/* 4 Anchor Links appearing sequentially from top-right ("Contattaci") down to "Azienda" */}
        {MENU_ITEMS.map((item, index) => {
          const angleDeg = currentAngles[index]
          const angleRad = (angleDeg * Math.PI) / 180

          const x = -Math.cos(angleRad) * orbitRadius
          const y = -Math.sin(angleRad) * orbitRadius

          const isCenter = activeCenterId === item.id
          const isHovered = hoveredId === item.id
          const isHighlighted = isCenter || isHovered

          // Stagger after left-side texts (which run at 750ms..1170ms):
          // Contattaci (1310ms) -> Vini (1450ms) -> Territorio (1590ms) -> Azienda (1730ms)
          const entranceDelayMs = 1310 + index * 140

          return (
            <div
              key={item.id}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0)`,
              }}
              className="pointer-events-auto absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0px)' : 'translateY(-14px)',
                  transition: `opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelayMs}ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelayMs}ms`,
                }}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item, index)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    transform: isHighlighted ? 'scale(1.15)' : 'scale(1)',
                    transition:
                      'color 250ms ease, transform 250ms ease, text-shadow 250ms ease',
                  }}
                  className={`block cursor-pointer whitespace-nowrap font-sans text-2xl sm:text-[28px] md:text-[31px] font-bold tracking-tight ${
                    isHighlighted
                      ? 'text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]'
                      : 'text-[#6A717A]/85'
                  }`}
                >
                  {item.label}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
