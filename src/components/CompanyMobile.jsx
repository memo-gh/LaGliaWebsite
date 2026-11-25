import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

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

const CAROUSEL_JUMP_DELAY_MS = 220

function getCycleWidth(trackEl, slideCount) {
  if (!trackEl) return 0
  const secondCopyStart = trackEl.children[slideCount]?.offsetLeft
  if (secondCopyStart && secondCopyStart > 0) return secondCopyStart
  return trackEl.scrollWidth / 3
}

function normalizeOffset(val, cycleWidth) {
  if (cycleWidth <= 0) return 0
  return ((val % cycleWidth) + cycleWidth) % cycleWidth + cycleWidth
}

export default function CompanyMobile({ slides, topLeftLineXPct }) {
  const { t } = useLanguage()
  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const trackRef = useRef(null)

  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)

  // Continuous horizontal track offset (in px), normalized inside [cycleWidth, 2 * cycleWidth)
  // across 3 looped copies so both left and right edges are always populated.
  const offsetPxRef = useRef(0)
  const hasCenteredInitialSlideRef = useRef(false)
  const speedFactorRef = useRef(0)
  const isTrackPausedRef = useRef(false)
  const centeringAnimRef = useRef(null)

  // Touch drag state for the horizontal photo carousel & text cards
  const photoTouchRef = useRef(null)
  const photoDidDragRef = useRef(false)
  const cardTouchRef = useRef(null)

  // Gate auto-drift & Ken Burns start until section has scrolled in
  const isSlideshowReadyRef = useRef(false)
  const slideshowDelayTimerRef = useRef(null)
  const [isSlideshowActive, setIsSlideshowActive] = useState(false)

  // Pause continuous marquee & Ken Burns whenever #azienda is outside the viewport
  const isInViewRef = useRef(false)
  const [isInView, setIsInView] = useState(false)
  const scheduleLoopRef = useRef(() => {})

  const [progress, setProgress] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const activeCardIndexRef = useRef(0)
  const carouselJumpTimerRef = useRef(null)
  const holdAfterJumpUntilRef = useRef(0)

  const slideCount = slides.length

  useEffect(() => {
    return () => {
      if (carouselJumpTimerRef.current) {
        clearTimeout(carouselJumpTimerRef.current)
      }
      if (slideshowDelayTimerRef.current) {
        clearTimeout(slideshowDelayTimerRef.current)
      }
    }
  }, [])

  // Smoothly glides the target photo card to the horizontal center of the viewport
  const centerCardInViewport = (cardIndexInTrack, slideIdx) => {
    const viewportEl = viewportRef.current
    const trackEl = trackRef.current
    if (!viewportEl || !trackEl) return

    const cycleWidth = getCycleWidth(trackEl, slideCount)
    const cardEl = trackEl.children[cardIndexInTrack]
    if (!cardEl || cycleWidth <= 0) return

    const viewportCenter = viewportEl.clientWidth / 2
    const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2

    const desiredOffset = cardCenter - viewportCenter
    const currentOffset = offsetPxRef.current

    let delta =
      (((desiredOffset - currentOffset) % cycleWidth) + cycleWidth) % cycleWidth
    if (delta > cycleWidth / 2) {
      delta -= cycleWidth
    }

    const duration = 560
    centeringAnimRef.current = {
      startOffset: currentOffset,
      delta,
      startTime: performance.now(),
      duration,
    }
    holdAfterJumpUntilRef.current = performance.now() + duration + 2600
    speedFactorRef.current = 0
    setActiveSlideIndex(slideIdx)
    scheduleLoopRef.current()
  }

  const switchToIndex = (nextIndex, immediate = false) => {
    const wrapped = ((nextIndex % slideCount) + slideCount) % slideCount
    activeCardIndexRef.current = wrapped
    setActiveCardIndex(wrapped)

    if (carouselJumpTimerRef.current) {
      clearTimeout(carouselJumpTimerRef.current)
      carouselJumpTimerRef.current = null
    }

    if (immediate) {
      centerCardInViewport(slideCount + wrapped, wrapped)
    } else {
      carouselJumpTimerRef.current = setTimeout(() => {
        carouselJumpTimerRef.current = null
        centerCardInViewport(slideCount + wrapped, wrapped)
      }, CAROUSEL_JUMP_DELAY_MS)
    }
  }

  const handleCardArrowSwitch = (direction) => {
    switchToIndex(activeCardIndexRef.current + direction, false)
  }

  const handleSlideClick = (cardIndexInTrack, slideIdx) => {
    if (photoDidDragRef.current) {
      photoDidDragRef.current = false
      return
    }
    if (carouselJumpTimerRef.current) {
      clearTimeout(carouselJumpTimerRef.current)
      carouselJumpTimerRef.current = null
    }
    activeCardIndexRef.current = slideIdx
    setActiveCardIndex(slideIdx)
    centerCardInViewport(cardIndexInTrack, slideIdx)
  }

  const handleCounterClick = (index) => {
    switchToIndex(index, true)
  }

  // Horizontal swipe gestures on the photo carousel
  const handlePhotoTouchStart = (e) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    centeringAnimRef.current = null
    isTrackPausedRef.current = true
    photoDidDragRef.current = false
    photoTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startOffset: offsetPxRef.current,
      isHorizontal: null,
      lastX: touch.clientX,
    }
  }

  const handlePhotoTouchMove = (e) => {
    const state = photoTouchRef.current
    if (!state || e.touches.length !== 1) return

    const touch = e.touches[0]
    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY

    if (state.isHorizontal === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      state.isHorizontal = Math.abs(dx) > Math.abs(dy)
    }

    if (!state.isHorizontal) return

    const trackEl = trackRef.current
    const cycleWidth = getCycleWidth(trackEl, slideCount)
    if (cycleWidth <= 0) return

    photoDidDragRef.current = true
    state.lastX = touch.clientX
    offsetPxRef.current = normalizeOffset(state.startOffset - dx, cycleWidth)
    trackEl.style.transform = `translate3d(${-offsetPxRef.current}px, 0, 0)`
  }

  const handlePhotoTouchEnd = () => {
    const state = photoTouchRef.current
    photoTouchRef.current = null
    isTrackPausedRef.current = false
    if (!state || !state.isHorizontal) {
      if (isSlideshowReadyRef.current && isInViewRef.current) {
        scheduleLoopRef.current()
      }
      return
    }

    const dx = state.lastX - state.startX
    const viewportEl = viewportRef.current
    const trackEl = trackRef.current
    if (!viewportEl || !trackEl) return

    const cycleWidth = getCycleWidth(trackEl, slideCount)
    if (cycleWidth <= 0) return

    // If user performed a deliberate swipe, step cleanly; otherwise snap to nearest centered slide
    if (Math.abs(dx) > 42) {
      const dir = dx < 0 ? 1 : -1
      switchToIndex(activeCardIndexRef.current + dir, true)
    } else {
      const viewportCenter = viewportEl.clientWidth / 2
      const centerInCycle =
        (((offsetPxRef.current + viewportCenter) % cycleWidth) + cycleWidth) %
        cycleWidth
      const slideSpan = cycleWidth / slideCount
      const nearestIdx = Math.floor(centerInCycle / slideSpan) % slideCount
      switchToIndex(nearestIdx, true)
    }
  }

  // Horizontal swipe gestures on the text cards
  const handleCardTouchStart = (e) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    cardTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
    }
  }

  const handleCardTouchEnd = (e) => {
    const state = cardTouchRef.current
    cardTouchRef.current = null
    if (!state || e.changedTouches.length !== 1) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
      switchToIndex(activeCardIndexRef.current + (dx < 0 ? 1 : -1), true)
    }
  }

  useEffect(() => {
    let rafId = null
    let lastTime = performance.now()

    const centerInitialSlideIfNeeded = () => {
      if (hasCenteredInitialSlideRef.current) return
      const trackEl = trackRef.current
      const viewportEl = viewportRef.current
      if (!trackEl || !viewportEl) return
      const cycleWidth = getCycleWidth(trackEl, slideCount)
      const middleCopyFirstCard = trackEl.children[slideCount]
      if (cycleWidth <= 0 || !middleCopyFirstCard) return

      const targetCard =
        trackEl.children[slideCount + activeCardIndexRef.current] ||
        middleCopyFirstCard
      const viewportCenter = viewportEl.clientWidth / 2
      const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2
      offsetPxRef.current = normalizeOffset(
        cardCenter - viewportCenter,
        cycleWidth
      )
      hasCenteredInitialSlideRef.current = true
      trackEl.style.transform = `translate3d(${-offsetPxRef.current}px, 0, 0)`
    }

    let scheduleLoop = () => {}

    const animateLoop = (now) => {
      const dt = Math.min(64, Math.max(0, now - lastTime))
      lastTime = now
      let needsNextFrame = false

      // 1. Scroll-driven reveal progress
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.012
        const damped = diff * 0.08
        const step = Math.sign(diff) * Math.min(Math.abs(damped), maxStep)
        currentProgressRef.current += step
        setProgress(currentProgressRef.current)
        needsNextFrame = true
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current
        setProgress(currentProgressRef.current)
      }

      // Start auto-drift & Ken Burns shortly after the section has scrolled into view
      if (
        !isSlideshowReadyRef.current &&
        !slideshowDelayTimerRef.current &&
        targetProgressRef.current >= 0.85 &&
        currentProgressRef.current >= 0.8
      ) {
        slideshowDelayTimerRef.current = setTimeout(() => {
          isSlideshowReadyRef.current = true
          setIsSlideshowActive(true)
          if (isInViewRef.current) {
            scheduleLoop()
          }
        }, 450)
      }

      // 2. Horizontal continuous carousel movement (paused while offscreen)
      const trackEl = trackRef.current
      const viewportEl = viewportRef.current
      if (trackEl && viewportEl) {
        const cycleWidth = getCycleWidth(trackEl, slideCount)
        const middleCopyFirstCard = trackEl.children[slideCount]

        if (cycleWidth > 0 && middleCopyFirstCard) {
          // Center the active slide horizontally on mount or resize
          if (!hasCenteredInitialSlideRef.current) {
            const targetCard =
              trackEl.children[slideCount + activeCardIndexRef.current] ||
              middleCopyFirstCard
            const viewportCenter = viewportEl.clientWidth / 2
            const cardCenter =
              targetCard.offsetLeft + targetCard.offsetWidth / 2
            offsetPxRef.current = normalizeOffset(
              cardCenter - viewportCenter,
              cycleWidth
            )
            hasCenteredInitialSlideRef.current = true
          }

          if (centeringAnimRef.current) {
            const { startOffset, delta, startTime, duration } =
              centeringAnimRef.current
            const t = clamp01((now - startTime) / duration)
            const eased = easeInOutCubic(t)
            offsetPxRef.current = normalizeOffset(
              startOffset + delta * eased,
              cycleWidth
            )
            if (t >= 1) {
              centeringAnimRef.current = null
              if (isSlideshowReadyRef.current && isInViewRef.current) {
                needsNextFrame = true
              }
            } else {
              needsNextFrame = true
            }
          } else if (
            isSlideshowReadyRef.current &&
            isInViewRef.current &&
            !photoTouchRef.current
          ) {
            const isHoldingOrPendingJump =
              carouselJumpTimerRef.current !== null ||
              now < holdAfterJumpUntilRef.current
            const targetSpeedFactor =
              isTrackPausedRef.current || isHoldingOrPendingJump ? 0 : 1
            speedFactorRef.current +=
              (targetSpeedFactor - speedFactorRef.current) *
              Math.min(1, dt * 0.012)

            if (
              targetSpeedFactor === 0 &&
              Math.abs(speedFactorRef.current) < 0.001
            ) {
              speedFactorRef.current = 0
            }

            const basePxPerMs = 0.022
            offsetPxRef.current = normalizeOffset(
              offsetPxRef.current + dt * basePxPerMs * speedFactorRef.current,
              cycleWidth
            )

            if (!isTrackPausedRef.current || speedFactorRef.current > 0) {
              needsNextFrame = true
            }
          }

          trackEl.style.transform = `translate3d(${-offsetPxRef.current}px, 0, 0)`

          // Update active indicator dot/bar to whichever photo is closest to horizontal center
          if (!centeringAnimRef.current) {
            const viewportCenter = viewportEl.clientWidth / 2
            const centerInCycle =
              (((offsetPxRef.current + viewportCenter) % cycleWidth) +
                cycleWidth) %
              cycleWidth
            const slideSpan = cycleWidth / slideCount
            const currentIdx = Math.floor(centerInCycle / slideSpan) % slideCount
            setActiveSlideIndex((prev) =>
              prev === currentIdx ? prev : currentIdx
            )
          }
        }
      }

      if (needsNextFrame) {
        rafId = requestAnimationFrame(animateLoop)
      } else {
        rafId = null
      }
    }

    scheduleLoop = () => {
      if (rafId === null) {
        lastTime = performance.now()
        rafId = requestAnimationFrame(animateLoop)
      }
    }

    scheduleLoopRef.current = scheduleLoop

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      const startY = vh * 0.85
      const endY = vh * 0.22
      const span = Math.max(120, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6) {
        raw = 1
      }

      const nextTarget = clamp01(raw)
      if (
        nextTarget !== targetProgressRef.current ||
        currentProgressRef.current !== nextTarget
      ) {
        targetProgressRef.current = nextTarget
        scheduleLoop()
      }
    }

    const handleResize = () => {
      hasCenteredInitialSlideRef.current = false
      computeScrollTarget()
      scheduleLoop()
    }

    const sectionEl = sectionRef.current
    let observer = null
    if (sectionEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const inView = Boolean(entries[0]?.isIntersecting)
          isInViewRef.current = inView
          setIsInView(inView)
          if (
            inView &&
            (!hasCenteredInitialSlideRef.current ||
              isSlideshowReadyRef.current ||
              centeringAnimRef.current !== null ||
              currentProgressRef.current !== targetProgressRef.current)
          ) {
            scheduleLoop()
          }
        },
        { threshold: 0 }
      )
      observer.observe(sectionEl)
    }

    centerInitialSlideIfNeeded()
    computeScrollTarget()
    window.addEventListener('scroll', computeScrollTarget, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      scheduleLoopRef.current = () => {}
      if (observer) observer.disconnect()
      window.removeEventListener('scroll', computeScrollTarget)
      window.removeEventListener('resize', handleResize)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [slideCount])

  // Staged scroll reveal curves
  const vertLineP = stage(progress, 0.0, 0.22)
  const horizLineP = stage(progress, 0.14, 0.4)
  const titleP = stage(progress, 0.08, 0.45)
  const subtitleP = stage(progress, 0.22, 0.58)
  const slideshowP = stage(progress, 0.28, 0.72)
  const cardStackP = stage(progress, 0.42, 0.86)

  const loopedSlides = [...slides, ...slides, ...slides]

  return (
    <section
      ref={sectionRef}
      id="azienda"
      className="relative w-full overflow-hidden bg-[linear-gradient(180deg,#464534_0%,#3D3930_50%,#332D2B_100%)] pb-12 text-white select-none sm:pb-16"
    >
      <style>{`
        @keyframes kbDrift1 {
          0% { transform: scale(1.02) translate3d(-1.5%, -1%, 0); }
          100% { transform: scale(1.15) translate3d(2%, 1.5%, 0); }
        }
        @keyframes kbDrift2 {
          0% { transform: scale(1.14) translate3d(2%, -1.5%, 0); }
          100% { transform: scale(1.02) translate3d(-2%, 1%, 0); }
        }
        @keyframes kbDrift3 {
          0% { transform: scale(1.03) translate3d(1.5%, 1.5%, 0); }
          100% { transform: scale(1.16) translate3d(-2%, -1.5%, 0); }
        }
        @keyframes kbDrift4 {
          0% { transform: scale(1.15) translate3d(-2%, 1%, 0); }
          100% { transform: scale(1.03) translate3d(1.5%, -1.5%, 0); }
        }
      `}</style>

      {/* Header: Top-left vertical line connects seamlessly from Terroir into the horizontal line beneath "L'Azienda" */}
      <header className="relative w-full pb-5 sm:pb-6">
        <div className="relative pt-9 sm:pt-12">
          {/* Top-left vertical architectural white line */}
          <div
            aria-hidden="true"
            style={{
              left: `${topLeftLineXPct}%`,
              top: 0,
              bottom: 0,
              transformOrigin: 'center top',
              transform: `scaleY(${vertLineP})`,
              opacity: vertLineP > 0.005 ? 1 : 0,
            }}
            className="pointer-events-none absolute z-10 w-px bg-white/65"
          />

          <div className="mx-auto w-full px-6 sm:px-10">
            <div className="mx-auto max-w-[520px] pb-2.5">
              <h2
                style={{
                  opacity: titleP,
                  transform: `translate3d(${(1 - titleP) * -14}px, ${(1 - titleP) * 16}px, 0)`,
                  clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
                }}
                className="font-serif text-[clamp(26px,8vw,40px)] font-bold leading-none tracking-[0.005em] text-white"
              >
                {t.company.title}
              </h2>
            </div>
          </div>

          {/* Horizontal white line starting at the exact corner of the vertical line */}
          <div
            aria-hidden="true"
            style={{
              left: `${topLeftLineXPct}%`,
              right: 'max(1.5rem, calc((100% - 520px) / 2))',
              bottom: 0,
              transformOrigin: 'left center',
              transform: `scaleX(${horizLineP})`,
              opacity: horizLineP > 0.005 ? 1 : 0,
            }}
            className="pointer-events-none absolute z-10 h-px bg-white/65"
          />
        </div>

        <div className="mx-auto w-full px-6 sm:px-10">
          <div className="mx-auto max-w-[520px]">
            <div
              style={{
                opacity: subtitleP,
                transform: `translate3d(${(1 - subtitleP) * -10}px, ${(1 - subtitleP) * 8}px, 0)`,
              }}
              className="mt-1.5 flex justify-end"
            >
              <span className="font-serif text-[clamp(11px,3.2vw,14px)] font-normal leading-none tracking-[0.05em] text-[#BB4732]">
                {t.company.subtitle}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 1. Horizontal, Centered Photos Carousel */}
      <div
        style={{
          opacity: slideshowP,
          transform: `translate3d(0, ${(1 - slideshowP) * 18}px, 0)`,
        }}
        className="relative w-full"
      >
        <div
          ref={viewportRef}
          onTouchStart={handlePhotoTouchStart}
          onTouchMove={handlePhotoTouchMove}
          onTouchEnd={handlePhotoTouchEnd}
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 5%, rgba(0,0,0,0.85) 11%, black 17%, black 83%, rgba(0,0,0,0.85) 89%, rgba(0,0,0,0.3) 95%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 5%, rgba(0,0,0,0.85) 11%, black 17%, black 83%, rgba(0,0,0,0.85) 89%, rgba(0,0,0,0.3) 95%, transparent 100%)',
          }}
          className="relative w-full overflow-hidden touch-pan-y"
        >
          {/* Left progressive blur feather overlay */}
          <div
            aria-hidden="true"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
              maskImage:
                'linear-gradient(to right, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
            }}
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[12%] backdrop-blur-[6px]"
          />

          {/* Right progressive blur feather overlay */}
          <div
            aria-hidden="true"
            style={{
              WebkitMaskImage:
                'linear-gradient(to left, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
              maskImage:
                'linear-gradient(to left, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)',
            }}
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[12%] backdrop-blur-[6px]"
          />

          <div
            ref={trackRef}
            className="flex flex-row items-start will-change-transform"
          >
            {loopedSlides.map((slide, idx) => {
              const cardKey = `${slide.id}-${idx}`
              const slideIdx = idx % slideCount
              const isSelected = activeCardIndex === slideIdx

              return (
                <figure
                  key={cardKey}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => handleSlideClick(idx, slideIdx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSlideClick(idx, slideIdx)
                    }
                  }}
                  className="m-0 w-[76vw] max-w-[440px] shrink-0 cursor-pointer px-1.5 outline-none sm:px-2"
                >
                  <div className="relative aspect-[522/348] w-full overflow-hidden rounded-[6px] shadow-[0_10px_28px_rgba(0,0,0,0.3)]">
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      draggable={false}
                      style={{
                        objectPosition: slide.objectPosition,
                        animation: slide.kbAnimation,
                        animationPlayState:
                          isSlideshowActive && isInView ? 'running' : 'paused',
                      }}
                      className="h-full w-full object-cover will-change-transform"
                    />
                  </div>

                  <figcaption
                    style={{
                      color: isSelected
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(255,255,255,0.68)',
                      transition: 'color 250ms ease',
                    }}
                    className="mt-2 text-center font-serif text-[clamp(10px,2.8vw,13px)] font-normal leading-none tracking-[0.03em] truncate"
                  >
                    {slide.caption}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>

        {/* Centered Horizontal Rectangle Slide Indicators */}
        <div
          role="tablist"
          aria-label={t.company.slideIndicatorAria}
          className="mt-3.5 flex items-center justify-center gap-2.5"
        >
          {slides.map((slide, index) => {
            const isCurrent = activeSlideIndex === index
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={t.company.slideAria(index + 1)}
                onClick={() => handleCounterClick(index)}
                style={{
                  backgroundColor: isCurrent
                    ? '#BB4732'
                    : 'rgba(255, 255, 255, 0.28)',
                  transform: isCurrent ? 'scaleX(1.2)' : 'scaleX(1)',
                  transition:
                    'background-color 300ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="h-[4px] w-[24px] cursor-pointer rounded-[1px] border-none p-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
              />
            )
          })}
        </div>
      </div>

      {/* 2. Horizontal, Centered Text Cards immediately beneath the photos carousel */}
      <div
        aria-live="polite"
        onTouchStart={handleCardTouchStart}
        onTouchEnd={handleCardTouchEnd}
        style={{
          opacity: cardStackP,
          transform: `translate3d(0, ${(1 - cardStackP) * 18}px, 0)`,
        }}
        className="relative mt-5 w-full overflow-hidden py-1 sm:mt-6"
      >
        <div className="relative mx-auto w-[84vw] max-w-[490px]">
          {/* Invisible sizing spacer locked to the tallest quote card so switching never shifts height */}
          <div aria-hidden="true" className="pointer-events-none invisible grid">
            {slides.map((slide) => (
              <div
                key={`spacer-${slide.id}`}
                className="col-start-1 row-start-1 flex flex-col justify-between rounded-[16px] border border-transparent px-5 py-4 sm:px-6 sm:py-5"
              >
                <span className="font-serif text-[26px] font-bold leading-none">
                  &ldquo;
                </span>
                <p className="pt-1 font-body text-[clamp(13px,3.6vw,16.5px)] leading-[1.45] tracking-[0.01em]">
                  {slide.quoteLines.join(' ')}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-serif text-[26px] font-bold leading-none">
                    &rdquo;
                  </span>
                  <div className="h-[28px] w-[64px]" />
                </div>
              </div>
            ))}
          </div>

          {slides.map((slide, cardIdx) => {
            let rel = (cardIdx - activeCardIndex + slideCount) % slideCount
            if (rel === slideCount - 1) rel = -1

            const isFront = rel === 0
            const isNeighbor = rel === -1 || rel === 1

            let translateX = '0%'
            let scale = 1
            let opacity = 1
            let zIndex = 20

            if (rel === -1) {
              translateX = 'calc(-100% - 14px)'
              scale = 0.92
              opacity = 0.4
              zIndex = 10
            } else if (rel === 1) {
              translateX = 'calc(100% + 14px)'
              scale = 0.92
              opacity = 0.4
              zIndex = 10
            } else if (!isFront) {
              translateX = '0%'
              scale = 0.86
              opacity = 0
              zIndex = 0
            }

            return (
              <article
                key={slide.id}
                aria-hidden={!isFront}
                onClick={
                  isNeighbor
                    ? () => switchToIndex(cardIdx, true)
                    : undefined
                }
                style={{
                  zIndex,
                  opacity,
                  transform: `translate3d(${translateX}, 0, 0) scale(${scale})`,
                  backgroundColor: isFront
                    ? 'rgba(38, 34, 30, 0.46)'
                    : 'rgba(38, 34, 30, 0.28)',
                  borderColor: isFront
                    ? 'rgba(255, 255, 255, 0.22)'
                    : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: isFront
                    ? '0 14px 32px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.14)'
                    : '0 8px 18px rgba(0, 0, 0, 0.16)',
                  transition:
                    'transform 460ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, background-color 380ms ease, border-color 380ms ease',
                }}
                className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[16px] border px-5 py-4 backdrop-blur-md sm:px-6 sm:py-5 ${
                  isFront
                    ? 'pointer-events-auto'
                    : isNeighbor
                      ? 'pointer-events-auto cursor-pointer'
                      : 'pointer-events-none'
                }`}
              >
                {/* Opening Quote Mark */}
                <span
                  aria-hidden="true"
                  className="-mb-1 pointer-events-none select-none font-serif text-[26px] font-bold leading-none text-[#C74337]"
                >
                  &ldquo;
                </span>

                {/* Flowing horizontal Plus Jakarta Sans quote body */}
                <p
                  style={{
                    filter: isFront ? 'blur(0px)' : 'blur(1px)',
                    transition: 'filter 320ms ease',
                  }}
                  className="my-auto pt-1 font-body text-[clamp(13px,3.6vw,16.5px)] font-normal leading-[1.45] tracking-[0.01em] text-white/95"
                >
                  {slide.quoteLines.join(' ')}
                </p>

                {/* Footer Row: Closing Quote Mark + Card Switch Arrows */}
                <div className="mt-3 flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none select-none font-serif text-[26px] font-bold leading-none text-[#C74337]"
                  >
                    &rdquo;
                  </span>

                  {isFront && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={t.company.prevCardAria}
                        onClick={() => handleCardArrowSwitch(-1)}
                        className="group flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[7px] border border-white/25 bg-white/10 text-white/85 transition-colors duration-200 hover:border-[#BB4732] hover:bg-[#BB4732]/30 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-[58%] w-[58%] transition-transform duration-200 group-hover:-translate-x-0.5"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        aria-label={t.company.nextCardAria}
                        onClick={() => handleCardArrowSwitch(1)}
                        className="group flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[7px] border border-white/25 bg-white/10 text-white/85 transition-colors duration-200 hover:border-[#BB4732] hover:bg-[#BB4732]/30 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-[58%] w-[58%] transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
