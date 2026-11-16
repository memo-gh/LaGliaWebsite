import { useEffect, useRef, useState } from 'react'
import vineyardImg from '../assets/dan-meyers-0AgtPoAARtE-unsplash.jpg'

const CANVAS_W = 1257
const CANVAS_H = 639

// Exact horizontal coordinate of the bottom-left vertical line in Terroir.jsx (21 / 1067)
// so it connects seamlessly across the section boundary into the line beneath "L'Azienda".
const TERROIR_BOTTOM_LEFT_LINE_X_PCT = (21 / 1067) * 100
const HEADER_LINE_RIGHT_X_PCT = (662 / CANVAS_W) * 100
const HEADER_LINE_Y_PCT = (113.5 / CANVAS_H) * 100

function clamp01(val) {
  return Math.max(0, Math.min(1, val))
}

function easeOutCubic(t) {
  const c = clamp01(t)
  return 1 - Math.pow(1 - c, 3)
}

function easeInOutCubic(t) {
  const c = clamp01(t)
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

function stage(progress, start, end) {
  return easeOutCubic((progress - start) / (end - start))
}

const DEFAULT_QUOTE_LINES = [
  'Lorem Ipsum is simply',
  'dummy text of the',
  'printing and typesetting',
  'industry. Lorem Ipsum',
  "has been the industry's",
  'standard dummy text',
  'ever since 1966, when',
  'designers at Letraset',
  'and James Mosley, the',
  'librarian at St Bride',
  'Printing Library in',
  'London,',
]

// Series of vineyard slides for the continuous horizontal slideshow.
// Each slide has its own focal framing, Ken Burns zoom/pan animation,
// a tiny one-line "Lorem ipsum" description, and a replacement Lorem Ipsum
// text passage that animates into the left quote block when the image is clicked.
const SLIDES = [
  {
    id: 'slide-1',
    src: vineyardImg,
    alt: 'La Glia vineyard rows at golden hour',
    caption: 'Lorem ipsum',
    objectPosition: '50% 50%',
    kbAnimation: 'kbDrift1 16s ease-in-out infinite alternate',
    quoteLines: [
      'Lorem ipsum dolor sit',
      'amet, consectetur',
      'adipiscing elit, sed do',
      'eiusmod tempor',
      'incididunt ut labore et',
      'dolore magna aliqua.',
      'Ut enim ad minim',
      'veniam, quis nostrud',
      'exercitation ullamco',
      'laboris nisi ut aliquip',
      'ex ea commodo',
      'consequat.',
    ],
  },
  {
    id: 'slide-2',
    src: vineyardImg,
    alt: 'Casentino hillside vineyard perspective',
    caption: 'Lorem ipsum',
    objectPosition: '22% 62%',
    kbAnimation: 'kbDrift2 18s ease-in-out infinite alternate',
    quoteLines: [
      'Duis aute irure dolor',
      'in reprehenderit in',
      'voluptate velit esse',
      'cillum dolore eu fugiat',
      'nulla pariatur. Excepteur',
      'sint occaecat cupidatat',
      'non proident, sunt in',
      'culpa qui officia',
      'deserunt mollit anim',
      'id est laborum sed',
      'perspiciatis unde',
      'omnis iste.',
    ],
  },
  {
    id: 'slide-3',
    src: vineyardImg,
    alt: 'Sunlit vines and forest ridge',
    caption: 'Lorem ipsum',
    objectPosition: '78% 58%',
    kbAnimation: 'kbDrift3 15s ease-in-out infinite alternate',
    quoteLines: [
      'Sed ut perspiciatis',
      'unde omnis iste natus',
      'error sit voluptatem',
      'accusantium doloremque',
      'laudantium, totam rem',
      'aperiam, eaque ipsa',
      'quae ab illo inventore',
      'veritatis et quasi',
      'architecto beatae vitae',
      'dicta sunt explicabo',
      'nemo enim ipsam',
      'voluptatem.',
    ],
  },
  {
    id: 'slide-4',
    src: vineyardImg,
    alt: 'Rolling Tuscan estate rows',
    caption: 'Lorem ipsum',
    objectPosition: '50% 82%',
    kbAnimation: 'kbDrift4 19s ease-in-out infinite alternate',
    quoteLines: [
      'At vero eos et',
      'accusamus et iusto',
      'odio dignissimos',
      'ducimus qui blanditiis',
      'praesentium voluptatum',
      'deleniti atque corrupti',
      'quos dolores et quas',
      'molestias excepturi',
      'sint occaecati cupiditate',
      'non provident, similique',
      'sunt in culpa qui',
      'officia.',
    ],
  },
]

export default function Company() {
  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)

  // Continuous vertical track offset (in px), velocity, and click-to-center animation state
  const offsetPxRef = useRef(0)
  const hasCenteredInitialSlideRef = useRef(false)
  const speedFactorRef = useRef(0)
  const isTrackPausedRef = useRef(false)
  const centeringAnimRef = useRef(null)

  // Gate slideshow & Ken Burns start until user has scrolled down completely + a short delay
  const isSlideshowReadyRef = useRef(false)
  const slideshowDelayTimerRef = useRef(null)
  const [isSlideshowActive, setIsSlideshowActive] = useState(false)

  const [progress, setProgress] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [hoveredCardKey, setHoveredCardKey] = useState(null)
  const [hoveredSlideIndex, setHoveredSlideIndex] = useState(null)
  const [selectedSlideId, setSelectedSlideId] = useState(null)

  // Animated text replacement state for the left quote column
  const [displayedLines, setDisplayedLines] = useState(DEFAULT_QUOTE_LINES)
  const [textPhase, setTextPhase] = useState('visible') // 'exiting' | 'entering' | 'visible'
  const textSwapTimeoutRef = useRef(null)
  const textEnterRafRef = useRef(null)

  useEffect(() => {
    return () => {
      if (textSwapTimeoutRef.current) clearTimeout(textSwapTimeoutRef.current)
      if (textEnterRafRef.current) cancelAnimationFrame(textEnterRafRef.current)
      if (slideshowDelayTimerRef.current) {
        clearTimeout(slideshowDelayTimerRef.current)
      }
    }
  }, [])

  const triggerTextReplacement = (nextLines, nextSlideId) => {
    if (textSwapTimeoutRef.current) clearTimeout(textSwapTimeoutRef.current)
    if (textEnterRafRef.current) cancelAnimationFrame(textEnterRafRef.current)

    setSelectedSlideId(nextSlideId)
    setTextPhase('exiting')

    textSwapTimeoutRef.current = setTimeout(() => {
      setDisplayedLines(nextLines)
      setTextPhase('entering')

      textEnterRafRef.current = requestAnimationFrame(() => {
        textEnterRafRef.current = requestAnimationFrame(() => {
          setTextPhase('visible')
        })
      })
    }, 230)
  }

  // Smoothly glides the clicked card to the vertical center of the slideshow viewport
  const centerCardInViewport = (cardIndexInTrack, slideIdx) => {
    const viewportEl = viewportRef.current
    const trackEl = trackRef.current
    if (!viewportEl || !trackEl) return

    const halfHeight =
      trackEl.children[SLIDES.length]?.offsetTop || trackEl.scrollHeight / 2
    const cardEl = trackEl.children[cardIndexInTrack]
    if (!cardEl || halfHeight <= 0) return

    const viewportCenter = viewportEl.clientHeight / 2
    const cardCenter = cardEl.offsetTop + cardEl.offsetHeight / 2

    // We want cardCenter - offsetPx === viewportCenter (modulo halfHeight)
    const desiredOffset = cardCenter - viewportCenter
    const currentOffset = offsetPxRef.current

    let delta =
      (((desiredOffset - currentOffset) % halfHeight) + halfHeight) % halfHeight
    if (delta > halfHeight / 2) {
      delta -= halfHeight
    }

    centeringAnimRef.current = {
      startOffset: currentOffset,
      delta,
      startTime: performance.now(),
      duration: 620,
    }
    speedFactorRef.current = 0
    setActiveSlideIndex(slideIdx)
  }

  const handleSlideClick = (slide, cardIndexInTrack, slideIdx) => {
    centerCardInViewport(cardIndexInTrack, slideIdx)
    if (selectedSlideId === slide.id) {
      triggerTextReplacement(DEFAULT_QUOTE_LINES, null)
    } else {
      triggerTextReplacement(slide.quoteLines, slide.id)
    }
  }

  const handleCounterClick = (slide, index) => {
    centerCardInViewport(index, index)
    triggerTextReplacement(slide.quoteLines, slide.id)
  }

  useEffect(() => {
    let rafId = null
    let lastTime = performance.now()

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Wait until Company scrolls past the middle of the viewport (52% vh)
      // so it stays at 0 while the user is viewing Terroir above, and then visibly
      // animates the white lines, "L'Azienda" title, quote, and slideshow in view.
      const startY = vh * 0.52
      const minPossibleTop = Math.max(0, vh - rect.height)
      const endY = Math.max(vh * 0.06, minPossibleTop + 12)

      const span = Math.max(140, startY - endY)
      let raw = (startY - rect.top) / span

      // Guarantee 100% completion when scrolled to the very bottom of the document
      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = (now) => {
      const dt = Math.min(64, Math.max(0, now - lastTime))
      lastTime = now

      // 1. Scroll-driven reveal progress
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.004
        const damped = diff * 0.025
        const step = Math.sign(diff) * Math.min(Math.abs(damped), maxStep)
        currentProgressRef.current += step
        setProgress(currentProgressRef.current)
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current
        setProgress(currentProgressRef.current)
      }

      // Initiate the slideshow + Ken Burns effect only once the user has scrolled down
      // completely (and the entrance animation has settled), after a brief 550ms delay.
      if (
        !isSlideshowReadyRef.current &&
        !slideshowDelayTimerRef.current &&
        targetProgressRef.current >= 0.96 &&
        currentProgressRef.current >= 0.88
      ) {
        slideshowDelayTimerRef.current = setTimeout(() => {
          isSlideshowReadyRef.current = true
          setIsSlideshowActive(true)
        }, 550)
      }

      // 2. Vertical slideshow movement:
      //    Starts with slide-1 centered in the viewport; only begins sliding after isSlideshowReadyRef is true.
      const trackEl = trackRef.current
      const viewportEl = viewportRef.current
      if (trackEl && viewportEl) {
        const halfHeight =
          trackEl.children[SLIDES.length]?.offsetTop || trackEl.scrollHeight / 2
        const firstCard = trackEl.children[0]

        if (halfHeight > 0 && firstCard) {
          // Ensure the very first image starts centered in the slideshow viewport
          if (!hasCenteredInitialSlideRef.current) {
            const viewportCenter = viewportEl.clientHeight / 2
            const firstCardCenter =
              firstCard.offsetTop + firstCard.offsetHeight / 2
            offsetPxRef.current =
              (((firstCardCenter - viewportCenter) % halfHeight) + halfHeight) %
              halfHeight
            hasCenteredInitialSlideRef.current = true
          }

          if (centeringAnimRef.current) {
            const { startOffset, delta, startTime, duration } =
              centeringAnimRef.current
            const t = clamp01((now - startTime) / duration)
            const eased = easeInOutCubic(t)
            const nextOffset = startOffset + delta * eased
            offsetPxRef.current =
              ((nextOffset % halfHeight) + halfHeight) % halfHeight

            if (t >= 1) {
              centeringAnimRef.current = null
            }
          } else if (isSlideshowReadyRef.current) {
            const targetSpeedFactor = isTrackPausedRef.current ? 0 : 1
            speedFactorRef.current +=
              (targetSpeedFactor - speedFactorRef.current) *
              Math.min(1, dt * 0.012)

            const basePxPerMs = 0.026
            offsetPxRef.current =
              (offsetPxRef.current +
                dt * basePxPerMs * speedFactorRef.current) %
              halfHeight
          }

          trackEl.style.transform = `translate3d(0, ${-offsetPxRef.current}px, 0)`

          // Determine which slide is currently closest to the vertical center of the slideshow viewport
          if (!centeringAnimRef.current) {
            const viewportCenter = viewportEl.clientHeight / 2
            const centerInTrack =
              (offsetPxRef.current + viewportCenter) % halfHeight
            const slideSpan = halfHeight / SLIDES.length
            const currentIdx =
              Math.floor(centerInTrack / slideSpan) % SLIDES.length
            setActiveSlideIndex((prev) =>
              prev === currentIdx ? prev : currentIdx
            )
          }
        }
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

  // Phase 1: White 1px architectural lines (draw progressively on scroll)
  const topLeftVertLineP = stage(progress, 0.0, 0.24)
  const topRightVertLineP = stage(progress, 0.0, 0.38)
  const horizLineP = stage(progress, 0.14, 0.48)
  const midBottomVertLineP = stage(progress, 0.22, 0.68)

  // Phase 2: Header ("L'Azienda" + "E i l suo team")
  const titleP = stage(progress, 0.12, 0.52)
  const subtitleP = stage(progress, 0.3, 0.64)

  // Phase 3: Quote marks & staggered body text lines
  const openQuoteP = stage(progress, 0.34, 0.6)
  const closeQuoteP = stage(progress, 0.72, 0.96)

  // Phase 4: Right-side Ken Burns horizontal slideshow + rectangle counter
  const slideshowP = stage(progress, 0.4, 0.84)

  const loopedSlides = [...SLIDES, ...SLIDES]
  const highlightedSlideIndex =
    hoveredSlideIndex !== null ? hoveredSlideIndex : activeSlideIndex

  return (
    <section
      ref={sectionRef}
      id="azienda"
      className="relative w-full bg-[linear-gradient(180deg,#464534_0%,#3D3930_50%,#332D2B_100%)] text-white select-none overflow-hidden"
    >
      <style>{`
        @keyframes kbDrift1 {
          0% {
            transform: scale(1.02) translate3d(-1.5%, -1%, 0);
          }
          100% {
            transform: scale(1.15) translate3d(2%, 1.5%, 0);
          }
        }
        @keyframes kbDrift2 {
          0% {
            transform: scale(1.14) translate3d(2%, -1.5%, 0);
          }
          100% {
            transform: scale(1.02) translate3d(-2%, 1%, 0);
          }
        }
        @keyframes kbDrift3 {
          0% {
            transform: scale(1.03) translate3d(1.5%, 1.5%, 0);
          }
          100% {
            transform: scale(1.16) translate3d(-2%, -1.5%, 0);
          }
        }
        @keyframes kbDrift4 {
          0% {
            transform: scale(1.15) translate3d(-2%, 1%, 0);
          }
          100% {
            transform: scale(1.03) translate3d(1.5%, -1.5%, 0);
          }
        }
      `}</style>

      {/* Proportional 1257 x 639 architectural canvas matching the reference screenshot */}
      <div className="relative mx-auto w-full max-w-[1440px] aspect-[1257/639] min-h-[420px]">
        {/* 1A. Top-left vertical white line connecting from Terroir's bottom-left line down to the line beneath "L'Azienda" */}
        <div
          aria-hidden="true"
          style={{
            left: `${TERROIR_BOTTOM_LEFT_LINE_X_PCT}%`,
            top: '0%',
            height: `${HEADER_LINE_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${topLeftVertLineP})`,
            opacity: topLeftVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1B. Horizontal white line under "L'Azienda" connected at its left end to the top-left vertical line */}
        <div
          aria-hidden="true"
          style={{
            left: `${TERROIR_BOTTOM_LEFT_LINE_X_PCT}%`,
            top: `${HEADER_LINE_Y_PCT}%`,
            width: `${HEADER_LINE_RIGHT_X_PCT - TERROIR_BOTTOM_LEFT_LINE_X_PCT}%`,
            transformOrigin: 'left center',
            transform: `scaleX(${horizLineP})`,
            opacity: horizLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 2. Top-right vertical white line (x: 1001.5, y: 0 -> 114) */}
        <div
          aria-hidden="true"
          style={{
            left: `${(1001.5 / CANVAS_W) * 100}%`,
            top: '0%',
            height: `${(114 / CANVAS_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${topRightVertLineP})`,
            opacity: topRightVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 3. Lower-middle vertical white line (x: 532.5, y: 317 -> 639) */}
        <div
          aria-hidden="true"
          style={{
            left: `${(532.5 / CANVAS_W) * 100}%`,
            top: `${(317 / CANVAS_H) * 100}%`,
            height: `${((CANVAS_H - 317) / CANVAS_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${midBottomVertLineP})`,
            opacity: midBottomVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 4. Header Title: "L’Azienda" (animated on scroll with upward slide + progressive clip reveal) */}
        <h2
          style={{
            left: `${(70 / CANVAS_W) * 100}%`,
            top: `${(54 / CANVAS_H) * 100}%`,
            opacity: titleP,
            transform: `translate3d(${(1 - titleP) * -18}px, ${(1 - titleP) * 24}px, 0)`,
            clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
          }}
          className="absolute font-serif text-[clamp(22px,3.6vw,50px)] font-bold text-white leading-none tracking-[0.005em]"
        >
          L’Azienda
        </h2>

        {/* 5. Header Subtitle: "E i l suo team" aligned to the right end of the horizontal line */}
        <div
          style={{
            left: `${(40 / CANVAS_W) * 100}%`,
            top: `${(117 / CANVAS_H) * 100}%`,
            width: `${((662 - 40) / CANVAS_W) * 100}%`,
            opacity: subtitleP,
            transform: `translate3d(${(1 - subtitleP) * -14}px, ${(1 - subtitleP) * 12}px, 0)`,
          }}
          className="absolute flex justify-end"
        >
          <span className="font-serif text-[clamp(10px,1.08vw,15px)] font-normal text-[#BB4732] tracking-[0.05em] leading-none">
            E i l suo team
          </span>
        </div>

        {/* 6. Left Column: Opening Quote Mark “ */}
        <span
          aria-hidden="true"
          style={{
            left: `${(68 / CANVAS_W) * 100}%`,
            top: `${(182 / CANVAS_H) * 100}%`,
            opacity: openQuoteP,
            transform:
              textPhase === 'exiting'
                ? 'translate3d(-4px, -4px, 0) scale(0.92)'
                : `translate3d(0, ${(1 - openQuoteP) * 14}px, 0) scale(1)`,
            transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="pointer-events-none absolute font-serif text-[clamp(24px,3.2vw,44px)] font-bold leading-none text-[#C74337]"
        >
          &ldquo;
        </span>

        {/* 7. Left Column: Staggered 12-line Serif Body Text (replaces with animation when an image is clicked) */}
        <div
          aria-live="polite"
          style={{
            left: `${(111 / CANVAS_W) * 100}%`,
            top: `${(211 / CANVAS_H) * 100}%`,
            width: `${((430 - 111) / CANVAS_W) * 100}%`,
          }}
          className="absolute font-serif text-[clamp(11px,1.58vw,22px)] font-normal text-white/95 leading-[1.46] tracking-[0.025em]"
        >
          {displayedLines.map((line, index) => {
            const lineStart = 0.36 + index * 0.03
            const lineEnd = lineStart + 0.24
            const scrollLineP = stage(progress, lineStart, lineEnd)

            let swapOpacity = 1
            let swapOffsetX = 0
            let swapOffsetY = 0
            let swapBlur = 0

            if (textPhase === 'exiting') {
              swapOpacity = 0
              swapOffsetX = -12
              swapOffsetY = -8
              swapBlur = 2.5
            } else if (textPhase === 'entering') {
              swapOpacity = 0
              swapOffsetX = 14
              swapOffsetY = 10
              swapBlur = 2.5
            }

            const delayMs =
              textPhase === 'exiting' ? index * 10 : index * 22

            return (
              <div
                key={index}
                style={{
                  opacity: scrollLineP * swapOpacity,
                  transform: `translate3d(${swapOffsetX}px, ${(1 - scrollLineP) * 14 + swapOffsetY}px, 0)`,
                  filter: swapBlur > 0 ? `blur(${swapBlur}px)` : 'none',
                  transition:
                    textPhase === 'entering'
                      ? 'none'
                      : `opacity 260ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, transform 300ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, filter 260ms ease ${delayMs}ms`,
                }}
                className="whitespace-nowrap"
              >
                {line}
              </div>
            )
          })}
        </div>

        {/* 8. Left Column: Closing Quote Mark ” */}
        <span
          aria-hidden="true"
          style={{
            left: `${(362 / CANVAS_W) * 100}%`,
            top: `${(542 / CANVAS_H) * 100}%`,
            opacity: closeQuoteP,
            transform:
              textPhase === 'exiting'
                ? 'translate3d(4px, 4px, 0) scale(0.92)'
                : `translate3d(0, ${(1 - closeQuoteP) * 14}px, 0) scale(1)`,
            transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="pointer-events-none absolute font-serif text-[clamp(24px,3.2vw,44px)] font-bold leading-none text-[#C74337]"
        >
          &rdquo;
        </span>

        {/* 9. Right-Side Vertical Slideshow & Vertical Rectangle Indicator */}
        <div
          style={{
            left: `${(662 / CANVAS_W) * 100}%`,
            top: `${(188 / CANVAS_H) * 100}%`,
            width: `${((1205 - 662) / CANVAS_W) * 100}%`,
            opacity: slideshowP,
            transform: `translate3d(${(1 - slideshowP) * 32}px, ${(1 - slideshowP) * 14}px, 0)`,
          }}
          className="absolute flex items-center gap-[clamp(8px,0.9vw,14px)]"
        >
          {/* Masked & Blurred-Edge Vertical Slideshow Viewport */}
          <div
            ref={viewportRef}
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 4%, rgba(0,0,0,0.75) 9%, black 15%, black 85%, rgba(0,0,0,0.75) 91%, rgba(0,0,0,0.25) 96%, transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 4%, rgba(0,0,0,0.75) 9%, black 15%, black 85%, rgba(0,0,0,0.75) 91%, rgba(0,0,0,0.25) 96%, transparent 100%)',
            }}
            className="relative flex-1 aspect-[522/410] overflow-hidden px-[2.2%]"
          >
            {/* Top progressive blur feather overlay */}
            <div
              aria-hidden="true"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)',
              }}
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[16%] backdrop-blur-[8px]"
            />

            {/* Bottom progressive blur feather overlay */}
            <div
              aria-hidden="true"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to top, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)',
                maskImage:
                  'linear-gradient(to top, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)',
              }}
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[16%] backdrop-blur-[8px]"
            />

            <div
              ref={trackRef}
              className="flex w-full flex-col will-change-transform"
            >
              {loopedSlides.map((slide, idx) => {
                const cardKey = `${slide.id}-${idx}`
                const slideIdx = idx % SLIDES.length
                const isHovered = hoveredCardKey === cardKey
                const isSelected = selectedSlideId === slide.id

                return (
                  <figure
                    key={cardKey}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onMouseEnter={() => {
                      isTrackPausedRef.current = true
                      setHoveredCardKey(cardKey)
                      setHoveredSlideIndex(slideIdx)
                    }}
                    onMouseLeave={() => {
                      isTrackPausedRef.current = false
                      setHoveredCardKey(null)
                      setHoveredSlideIndex(null)
                    }}
                    onClick={() => handleSlideClick(slide, idx, slideIdx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSlideClick(slide, idx, slideIdx)
                      }
                    }}
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transition:
                        'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className={`m-0 flex w-full shrink-0 flex-col pb-[clamp(10px,1.1vw,16px)] cursor-pointer outline-none ${
                      isHovered ? 'z-10' : 'z-0'
                    }`}
                  >
                    {/* Borderless image frame matching the 522x348 aspect ratio */}
                    <div className="relative w-full aspect-[522/348] overflow-hidden">
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        style={{
                          objectPosition: slide.objectPosition,
                          animation: slide.kbAnimation,
                          animationPlayState:
                            !isSlideshowActive || isHovered
                              ? 'paused'
                              : 'running',
                        }}
                        className="h-full w-full object-cover will-change-transform"
                      />
                    </div>

                    {/* Tiny one-line description under each image */}
                    <figcaption
                      style={{
                        color:
                          isHovered || isSelected
                            ? 'rgba(255,255,255,0.95)'
                            : 'rgba(255,255,255,0.75)',
                        transition: 'color 250ms ease',
                      }}
                      className="mt-[clamp(4px,0.45vw,7px)] font-serif text-[clamp(9px,0.82vw,12px)] font-normal tracking-[0.03em] leading-none truncate"
                    >
                      {slide.caption}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>

          {/* Vertical indicator composed of tiny rectangles that turn red (#BB4732) */}
          <div
            role="tablist"
            aria-label="Slide indicator"
            className="flex flex-col items-center justify-center gap-[clamp(6px,0.55vw,10px)]"
          >
            {SLIDES.map((slide, index) => {
              const isCurrent = highlightedSlideIndex === index
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => handleCounterClick(slide, index)}
                  style={{
                    backgroundColor: isCurrent
                      ? '#BB4732'
                      : 'rgba(255, 255, 255, 0.26)',
                    transform: isCurrent ? 'scaleY(1.15)' : 'scaleY(1)',
                    transition:
                      'background-color 300ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="w-[clamp(3px,0.32vw,4.5px)] h-[clamp(16px,1.8vw,26px)] cursor-pointer rounded-[1px] border-none p-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
