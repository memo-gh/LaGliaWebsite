import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import merlotBottleImg from '../assets/merlot-bottle.png'
import wineBarIcon from '../assets/wine_bar_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'
import nutritionIcon from '../assets/nutrition_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'
import restaurantIcon from '../assets/restaurant_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'

const CANVAS_W = 1045
const CANVAS_H = 512

// Exact horizontal coordinate of the lower-middle vertical line at the bottom of Company.jsx (532.5 / 1257)
// so the top vertical line in Wine.jsx aligns seamlessly with it across the section boundary.
const TOP_LINE_X_PCT = (532.5 / 1257) * 100
const BOTTOM_LINE_X_PCT = (604.5 / CANVAS_W) * 100

const RED_CARD_W = 801
const RED_CARD_H = 295

const BASE_BLUE_WIDTH_PCT = ((1006 - 891) / CANVAS_W) * 100
const BASE_BLUE_RIGHT_PCT = ((CANVAS_W - 1006) / CANVAS_W) * 100

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

const DESCRIPTION_LINES = [
  'Lorem ipsum dolor sit amet consectetur',
  'adipiscing elit. Non nostrud ea aliquip',
  'adipiscing ipsum duis. At mollit adipiscing',
  'ullamco elit enim exercitation voluptate eu.',
  'Non adipiscing anim minim proident',
  'nostrud aliqua cupidatat. Vero laborum',
  'officia qui nulla nostrud excepteur fugiat',
  'lorem. Iusto deserunt elit lorem',
]

const WINE_SPECS = [
  {
    id: 'alcohol',
    icon: wineBarIcon,
    label: '13% vol.',
    topPx: 125,
    start: 0.56,
    end: 0.82,
  },
  {
    id: 'grape',
    icon: nutritionIcon,
    label: 'Solo Merlot',
    topPx: 162,
    start: 0.62,
    end: 0.88,
  },
  {
    id: 'pairing',
    icon: restaurantIcon,
    label: 'Cazzi e Mazzi',
    topPx: 199,
    start: 0.68,
    end: 0.94,
  },
]

export default function Wine() {
  const sectionRef = useRef(null)
  const redShiftWrapRef = useRef(null)
  const redTiltCardRef = useRef(null)
  const bottleWrapRef = useRef(null)
  const glareRef = useRef(null)
  const blueCardRef = useRef(null)
  const blueArrowRef = useRef(null)

  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [isDetailHovered, setIsDetailHovered] = useState(false)

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Begin reveal as Wine scrolls into the viewport and finish as it fills the screen
      const startY = vh * 0.62
      const endY = vh * 0.04

      const span = Math.max(140, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6 || rect.top <= 8) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.0042
        const damped = diff * 0.026
        const step = Math.sign(diff) * Math.min(Math.abs(damped), maxStep)
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

  // GSAP 3D Tilt hover handlers for the red rectangle
  const handleRedMouseMove = (e) => {
    const cardEl = redTiltCardRef.current
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    const nx = relX - 0.5
    const ny = relY - 0.5

    gsap.to(cardEl, {
      rotateY: nx * 11,
      rotateX: -ny * 9.5,
      scale: 1.014,
      boxShadow: `${-nx * 18}px ${16 - ny * 14}px 38px rgba(0, 0, 0, 0.42)`,
      duration: 0.42,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    if (bottleWrapRef.current) {
      gsap.to(bottleWrapRef.current, {
        x: nx * 9,
        y: ny * 7,
        rotation: nx * 2.2,
        scale: 1.035,
        duration: 0.42,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0.16,
        background: `radial-gradient(circle at ${relX * 100}% ${relY * 100}%, rgba(255, 249, 238, 0.55) 0%, rgba(255, 249, 238, 0) 62%)`,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      })
    }
  }

  const handleRedMouseLeave = () => {
    if (redTiltCardRef.current) {
      gsap.to(redTiltCardRef.current, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.24)',
        duration: 0.68,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (bottleWrapRef.current) {
      gsap.to(bottleWrapRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.68,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  // GSAP width-amplifying + big #FFF9EE arrow hover handlers for the blue rectangle
  const handleBlueMouseEnter = () => {
    if (blueCardRef.current) {
      gsap.to(blueCardRef.current, {
        width: `${BASE_BLUE_WIDTH_PCT * 1.42}%`,
        right: `${Math.max(1.2, BASE_BLUE_RIGHT_PCT - 1.55)}%`,
        boxShadow: '0 16px 36px rgba(12, 140, 233, 0.26)',
        duration: 0.48,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (blueArrowRef.current) {
      gsap.to(blueArrowRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.42,
        ease: 'back.out(1.6)',
        overwrite: 'auto',
      })
    }

    if (redShiftWrapRef.current) {
      gsap.to(redShiftWrapRef.current, {
        xPercent: -1.8,
        duration: 0.48,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }

  const handleBlueMouseLeave = () => {
    if (blueCardRef.current) {
      gsap.to(blueCardRef.current, {
        width: `${BASE_BLUE_WIDTH_PCT}%`,
        right: `${BASE_BLUE_RIGHT_PCT}%`,
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.24)',
        duration: 0.56,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (blueArrowRef.current) {
      gsap.to(blueArrowRef.current, {
        opacity: 0,
        x: -16,
        scale: 0.78,
        duration: 0.34,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }

    if (redShiftWrapRef.current) {
      gsap.to(redShiftWrapRef.current, {
        xPercent: 0,
        duration: 0.56,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }

  // Phase 1: Outer architectural 1px white lines
  const topVertLineP = stage(progress, 0.0, 0.24)
  const topHorizLineP = stage(progress, 0.06, 0.36)
  const bottomHorizLineP = stage(progress, 0.56, 0.88)
  const bottomVertLineP = stage(progress, 0.68, 0.96)

  // Phase 2: Section Heading ("I Nostri Vini")
  const titleP = stage(progress, 0.14, 0.5)

  // Phase 3: Red card & Blue card containers
  const redCardP = stage(progress, 0.22, 0.62)
  const blueCardP = stage(progress, 0.34, 0.74)

  // Phase 4: Inner elements of the Red card
  const wineNameP = stage(progress, 0.34, 0.66)
  const wineYearP = stage(progress, 0.4, 0.7)
  const innerTopLineP = stage(progress, 0.44, 0.76)
  const detailLinkP = stage(progress, 0.5, 0.8)
  const innerLeftVertLineP = stage(progress, 0.42, 0.78)
  const innerMidVertLineP = stage(progress, 0.54, 0.84)
  const bottleP = stage(progress, 0.46, 0.86)

  return (
    <section
      ref={sectionRef}
      id="vini"
      className="relative w-full min-h-dvh bg-[linear-gradient(180deg,#2E2828_0%,#252121_34%,#1D1919_68%,#141111_100%)] text-white select-none overflow-hidden"
    >
      {/* Uses the exact same max-w-[1440px] centered coordinate space as Company.jsx so the top vertical line aligns 1:1 */}
      <div className="relative mx-auto w-full max-w-[1440px] min-h-dvh aspect-[1045/512]">
        {/* 1A. Top vertical 1px white line aligned with Company.jsx's bottom vertical line (532.5 / 1257) */}
        <div
          aria-hidden="true"
          style={{
            left: `${TOP_LINE_X_PCT}%`,
            top: '0%',
            height: `${(42 / CANVAS_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${topVertLineP})`,
            opacity: topVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1B. Top-left horizontal 1px white line extending from the very left edge of the webpage to the top vertical line */}
        <div
          aria-hidden="true"
          style={{
            left: 'calc(50% - 50vw)',
            right: `${100 - TOP_LINE_X_PCT}%`,
            top: `${(41.5 / CANVAS_H) * 100}%`,
            transformOrigin: 'right center',
            transform: `scaleX(${topHorizLineP})`,
            opacity: topHorizLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 2. Section Heading: "I Nostri Vini" */}
        <h2
          style={{
            left: `${(465 / CANVAS_W) * 100}%`,
            top: `${(14 / CANVAS_H) * 100}%`,
            opacity: titleP,
            transform: `translate3d(${(1 - titleP) * -16}px, ${(1 - titleP) * 20}px, 0)`,
            clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
          }}
          className="absolute font-serif text-[clamp(22px,3.1vw,46px)] font-bold text-white leading-none tracking-[0.01em]"
        >
          I Nostri Vini
        </h2>

        {/* 3. Main Red Rectangle (#BB4732) with GSAP 3D Tilt Hover Animation */}
        <div
          ref={redShiftWrapRef}
          style={{
            left: `${(56 / CANVAS_W) * 100}%`,
            top: `${(108 / CANVAS_H) * 100}%`,
            width: `${(RED_CARD_W / CANVAS_W) * 100}%`,
            height: `${(RED_CARD_H / CANVAS_H) * 100}%`,
          }}
          className="absolute z-10"
        >
          <div
            style={{
              opacity: redCardP,
              transform: `translate3d(0, ${(1 - redCardP) * 28}px, 0)`,
              perspective: '1100px',
            }}
            className="h-full w-full"
          >
            <div
              ref={redTiltCardRef}
              onMouseMove={handleRedMouseMove}
              onMouseLeave={handleRedMouseLeave}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.24)',
              }}
              className="relative h-full w-full rounded-[clamp(14px,1.85vw,26px)] border border-black/80 bg-[#BB4732] overflow-hidden will-change-transform"
            >
              {/* Subtle cursor-following specular highlight overlay during tilt */}
              <div
                ref={glareRef}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
              />

              {/* Top Row: "Il Merlot" */}
              <h3
                style={{
                  left: `${(20 / RED_CARD_W) * 100}%`,
                  top: `${(24 / RED_CARD_H) * 100}%`,
                  opacity: wineNameP,
                  transform: `translate3d(${(1 - wineNameP) * -14}px, ${(1 - wineNameP) * 14}px, 0)`,
                }}
                className="absolute font-serif text-[clamp(20px,2.9vw,44px)] font-bold text-[#FFF9EE] leading-none tracking-[0.01em]"
              >
                Il Merlot
              </h3>

              {/* Top Row: "2023" */}
              <span
                style={{
                  left: `${(168 / RED_CARD_W) * 100}%`,
                  top: `${(31 / RED_CARD_H) * 100}%`,
                  opacity: wineYearP,
                  transform: `translate3d(${(1 - wineYearP) * -10}px, ${(1 - wineYearP) * 12}px, 0)`,
                }}
                className="absolute font-serif text-[clamp(15px,2.05vw,32px)] font-bold text-[#FFF9EE] leading-none tracking-[0.015em]"
              >
                2023
              </span>

              {/* Top Row: Horizontal line between "2023" and "In Dettaglio >" */}
              <div
                aria-hidden="true"
                style={{
                  left: `${(242 / RED_CARD_W) * 100}%`,
                  top: `${(44 / RED_CARD_H) * 100}%`,
                  width: `${((497 - 242) / RED_CARD_W) * 100}%`,
                  transformOrigin: 'left center',
                  transform: `scaleX(${innerTopLineP})`,
                  opacity: innerTopLineP > 0.005 ? 1 : 0,
                }}
                className="pointer-events-none absolute h-px bg-[#FFF9EE]/60"
              />

              {/* Top Row: "In Dettaglio >" */}
              <a
                href="#vini"
                onClick={(e) => e.preventDefault()}
                onMouseEnter={() => setIsDetailHovered(true)}
                onMouseLeave={() => setIsDetailHovered(false)}
                style={{
                  left: `${(517 / RED_CARD_W) * 100}%`,
                  top: `${(36.5 / RED_CARD_H) * 100}%`,
                  opacity: detailLinkP,
                  transform: `translate3d(${(1 - detailLinkP) * 12}px, 0, 0)`,
                }}
                className="absolute inline-flex items-center gap-[0.3em] font-serif text-[clamp(9px,1.02vw,16px)] font-bold text-[#FFF9EE] leading-none tracking-[0.02em] cursor-pointer"
              >
                <span>In Dettaglio</span>
                <span
                  style={{
                    transform: isDetailHovered
                      ? 'translateX(3px)'
                      : 'translateX(0px)',
                    transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="inline-block font-normal"
                >
                  &gt;
                </span>
              </a>

              {/* Left Vertical Line beside the description paragraph */}
              <div
                aria-hidden="true"
                style={{
                  left: `${(35.5 / RED_CARD_W) * 100}%`,
                  top: `${(81 / RED_CARD_H) * 100}%`,
                  height: `${((249 - 81) / RED_CARD_H) * 100}%`,
                  transformOrigin: 'center top',
                  transform: `scaleY(${innerLeftVertLineP})`,
                  opacity: innerLeftVertLineP > 0.005 ? 1 : 0,
                }}
                className="pointer-events-none absolute w-px bg-[#FFF9EE]/55"
              />

              {/* Left Column: 8-line Serif Description Paragraph */}
              <div
                style={{
                  left: `${(56 / RED_CARD_W) * 100}%`,
                  top: `${(96 / RED_CARD_H) * 100}%`,
                  width: `${((365 - 56) / RED_CARD_W) * 100}%`,
                }}
                className="absolute font-serif text-[clamp(9px,1.14vw,18px)] font-normal text-[#FFF9EE] leading-[1.32] tracking-[0.01em]"
              >
                {DESCRIPTION_LINES.map((line, idx) => {
                  const lineStart = 0.44 + idx * 0.032
                  const lineEnd = lineStart + 0.24
                  const lineP = stage(progress, lineStart, lineEnd)

                  return (
                    <div
                      key={idx}
                      style={{
                        opacity: lineP,
                        transform: `translate3d(0, ${(1 - lineP) * 12}px, 0)`,
                      }}
                      className="whitespace-nowrap"
                    >
                      {line}
                    </div>
                  )
                })}
              </div>

              {/* Middle Vertical Line between description and specs */}
              <div
                aria-hidden="true"
                style={{
                  left: `${(415 / RED_CARD_W) * 100}%`,
                  top: `${(144 / RED_CARD_H) * 100}%`,
                  height: `${((196 - 144) / RED_CARD_H) * 100}%`,
                  transformOrigin: 'center top',
                  transform: `scaleY(${innerMidVertLineP})`,
                  opacity: innerMidVertLineP > 0.005 ? 1 : 0,
                }}
                className="pointer-events-none absolute w-px bg-[#FFF9EE]/55"
              />

              {/* Middle-Right Column: 3 Wine Spec Rows with custom SVG icons */}
              {WINE_SPECS.map((spec) => {
                const specP = stage(progress, spec.start, spec.end)
                return (
                  <div
                    key={spec.id}
                    style={{
                      left: `${(453 / RED_CARD_W) * 100}%`,
                      top: `${(spec.topPx / RED_CARD_H) * 100}%`,
                      opacity: specP,
                      transform: `translate3d(${(1 - specP) * 14}px, ${(1 - specP) * 8}px, 0)`,
                    }}
                    className="absolute flex items-center gap-[clamp(5px,0.6vw,10px)] whitespace-nowrap"
                  >
                    <img
                      src={spec.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-[clamp(12px,1.35vw,21px)] w-[clamp(12px,1.35vw,21px)] shrink-0 object-contain"
                    />
                    <span className="font-serif text-[clamp(9px,1.14vw,18px)] font-normal text-[#FFF9EE] leading-none tracking-[0.01em]">
                      {spec.label}
                    </span>
                  </div>
                )
              })}

              {/* Right Column: Wine Bottle + Soft Floor Shadow */}
              <div
                style={{
                  left: `${(669 / RED_CARD_W) * 100}%`,
                  top: `${(24 / RED_CARD_H) * 100}%`,
                  width: `${(100 / RED_CARD_W) * 100}%`,
                  height: `${(257 / RED_CARD_H) * 100}%`,
                  opacity: bottleP,
                  transform: `translate3d(${(1 - bottleP) * 18}px, ${(1 - bottleP) * 20}px, 0)`,
                }}
                className="pointer-events-none absolute z-20"
              >
                <div
                  ref={bottleWrapRef}
                  className="h-full w-full will-change-transform"
                >
                  <img
                    src={merlotBottleImg}
                    alt="Bottiglia Il Merlot 2023"
                    className="h-full w-full object-contain select-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Right Blue Rectangle with GSAP Width-Amplifying Hover Animation + Big #FFF9EE Arrow */}
        <div
          ref={blueCardRef}
          onMouseEnter={handleBlueMouseEnter}
          onMouseLeave={handleBlueMouseLeave}
          style={{
            right: `${BASE_BLUE_RIGHT_PCT}%`,
            top: `${(106 / CANVAS_H) * 100}%`,
            width: `${BASE_BLUE_WIDTH_PCT}%`,
            height: `${((404 - 106) / CANVAS_H) * 100}%`,
            opacity: blueCardP,
            transform: `translate3d(${(1 - blueCardP) * 28}px, ${(1 - blueCardP) * 16}px, 0)`,
            background:
              'linear-gradient(90deg, #1B6091 0%, #164C73 35%, #10344E 70%, #092132 100%)',
            boxShadow: '0 8px 22px rgba(0, 0, 0, 0.24)',
          }}
          className="absolute z-20 flex items-center justify-center cursor-pointer rounded-[clamp(14px,1.85vw,26px)] border-[clamp(2px,0.26vw,3.5px)] border-[#0C8CE9] overflow-hidden will-change-[width,right,transform]"
          role="button"
          tabIndex={0}
          aria-label="Prossimo vino"
        >
          {/* Big #FFF9EE arrow revealed on hover */}
          <svg
            ref={blueArrowRef}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{
              opacity: 0,
              transform: 'translateX(-16px) scale(0.78)',
            }}
            className="pointer-events-none h-[clamp(36px,4.8vw,74px)] w-[clamp(36px,4.8vw,74px)] shrink-0"
          >
            <path
              d="M12 32H50M50 32L33 15M50 32L33 49"
              stroke="#FFF9EE"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 5A. Bottom-right horizontal 1px white line extending all the way to the right edge of the webpage */}
        <div
          aria-hidden="true"
          style={{
            left: `${BOTTOM_LINE_X_PCT}%`,
            right: 'calc(50% - 50vw)',
            top: `${(469.5 / CANVAS_H) * 100}%`,
            transformOrigin: 'left center',
            transform: `scaleX(${bottomHorizLineP})`,
            opacity: bottomHorizLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 5B. Bottom-right vertical 1px white line reaching the bottom edge of the webpage */}
        <div
          aria-hidden="true"
          style={{
            left: `${BOTTOM_LINE_X_PCT}%`,
            top: `${(469.5 / CANVAS_H) * 100}%`,
            bottom: '0%',
            transformOrigin: 'center top',
            transform: `scaleY(${bottomVertLineP})`,
            opacity: bottomVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />
      </div>
    </section>
  )
}
