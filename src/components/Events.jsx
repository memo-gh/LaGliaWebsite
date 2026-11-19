import { useEffect, useRef, useState } from 'react'
import eventsBgVideo from '../assets/7330180-uhd_3840_2160_25fps.mp4'
import { useLanguage } from '../i18n/useLanguage'

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

export default function Events({ onOpenWip }) {
  const { t } = useLanguage()
  const runwayRef = useRef(null)
  const bookingBarRef = useRef(null)
  const videoRef = useRef(null)

  const targetVideoProgressRef = useRef(0)
  const currentVideoProgressRef = useRef(0)
  const [videoProgress, setVideoProgress] = useState(0)

  const contentRevealedRef = useRef(false)
  const currentContentProgressRef = useRef(0)
  const [contentProgress, setContentProgress] = useState(0)

  const targetBookingProgressRef = useRef(0)
  const currentBookingProgressRef = useRef(0)
  const [bookingProgress, setBookingProgress] = useState(0)

  const [expandedCardId, setExpandedCardId] = useState(null)

  useEffect(() => {
    let rafId = null
    let lastTime = performance.now()

    const computeScrollTarget = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      const docHeight = document.documentElement.scrollHeight

      // 1. Scroll-driven video expansion progress (collapsed slit -> full-screen)
      const runwayEl = runwayRef.current
      if (runwayEl) {
        const rect = runwayEl.getBoundingClientRect()
        const startY = vh * 0.72
        const scrollableInside = Math.max(vh * 0.2, rect.height - vh)
        const endY = -Math.min(vh * 0.25, scrollableInside * 0.75)
        const span = Math.max(200, startY - endY)
        let raw = (startY - rect.top) / span

        if (window.scrollY + vh >= docHeight - 6) {
          raw = 1
        }
        targetVideoProgressRef.current = clamp01(raw)
      }

      // 2. Booking tab reveal progress (triggers only when scrolling below the video runway)
      const bookEl = bookingBarRef.current
      if (bookEl) {
        const bookRect = bookEl.getBoundingClientRect()
        const bStartY = vh * 0.96
        const bEndY = vh * 0.72
        const bSpan = Math.max(80, bStartY - bEndY)
        let bRaw = (bStartY - bookRect.top) / bSpan

        if (window.scrollY + vh >= docHeight - 6) {
          bRaw = 1
        }
        targetBookingProgressRef.current = clamp01(bRaw)
      }
    }

    const animateLoop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000))
      lastTime = now

      // Smooth damped interpolation for scroll-driven video expansion
      const vDiff =
        targetVideoProgressRef.current - currentVideoProgressRef.current
      if (Math.abs(vDiff) > 0.0004) {
        const maxStep = 0.04
        const damped = vDiff * 0.12
        const step = Math.sign(vDiff) * Math.min(Math.abs(damped), maxStep)
        currentVideoProgressRef.current += step
        setVideoProgress(currentVideoProgressRef.current)
      } else if (
        currentVideoProgressRef.current !== targetVideoProgressRef.current
      ) {
        currentVideoProgressRef.current = targetVideoProgressRef.current
        setVideoProgress(currentVideoProgressRef.current)
      }

      // Once video is expanded, automatically animate heading & cards in on their own
      if (currentVideoProgressRef.current >= 0.92) {
        contentRevealedRef.current = true
      } else if (currentVideoProgressRef.current < 0.45) {
        contentRevealedRef.current = false
      }

      if (contentRevealedRef.current) {
        if (currentContentProgressRef.current < 1) {
          currentContentProgressRef.current = Math.min(
            1,
            currentContentProgressRef.current + dt / 1.15
          )
          setContentProgress(currentContentProgressRef.current)
        }
      } else if (currentContentProgressRef.current > 0) {
        currentContentProgressRef.current = Math.max(
          0,
          currentContentProgressRef.current - dt / 0.4
        )
        setContentProgress(currentContentProgressRef.current)
      }

      // Smooth damped interpolation for the booking bar below
      const bDiff =
        targetBookingProgressRef.current - currentBookingProgressRef.current
      if (Math.abs(bDiff) > 0.0004) {
        const bMaxStep = 0.025
        const bDamped = bDiff * 0.09
        const bStep = Math.sign(bDiff) * Math.min(Math.abs(bDamped), bMaxStep)
        currentBookingProgressRef.current += bStep
        setBookingProgress(currentBookingProgressRef.current)
      } else if (
        currentBookingProgressRef.current !== targetBookingProgressRef.current
      ) {
        currentBookingProgressRef.current = targetBookingProgressRef.current
        setBookingProgress(currentBookingProgressRef.current)
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

  // Ensure background video plays seamlessly when mounted
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.play().catch(() => {})
  }, [])

  // Phase 0 (Scroll-driven): Collapsed video slit smoothly expands to full-screen
  const videoRevealP = easeOutCubic(videoProgress)
  const videoInsetV = (1 - videoRevealP) * 39
  const videoInsetH = (1 - videoRevealP) * 24
  const videoRadius = (1 - videoRevealP) * 28
  const videoScale = 1 + (1 - videoRevealP) * 0.14

  // Phase 1 (Auto-animated once video is open): Centered Heading & Subtitle
  const conjP = stage(contentProgress, 0.0, 0.34)
  const titleP = stage(contentProgress, 0.06, 0.42)
  const subtitle1P = stage(contentProgress, 0.14, 0.48)
  const subtitle2P = stage(contentProgress, 0.2, 0.54)

  // Phase 2 (Auto-animated): Left Card ("Visita la Cantina")
  const leftCardP = stage(contentProgress, 0.24, 0.64)
  const leftTitleP = stage(contentProgress, 0.32, 0.68)
  const leftLineP = stage(contentProgress, 0.5, 0.84)
  const leftMetaP = stage(contentProgress, 0.58, 0.9)

  // Phase 3 (Auto-animated): Right Card ("Degustazioni")
  const rightCardP = stage(contentProgress, 0.34, 0.74)
  const rightTitleP = stage(contentProgress, 0.42, 0.78)
  const rightLineP = stage(contentProgress, 0.58, 0.9)
  const rightMetaP = stage(contentProgress, 0.66, 0.98)

  // Phase 4: Booking Tab (below the video runway, revealed as user scrolls further down)
  const bottomBarCollapseP = stage(bookingProgress, 0.0, 0.55)
  const bottomText1P = stage(bookingProgress, 0.18, 0.78)
  const bottomText2P = stage(bookingProgress, 0.28, 0.88)
  const bookBtnP = stage(bookingProgress, 0.34, 0.96)

  const handleBookClick = () => {
    if (typeof onOpenWip === 'function') {
      onOpenWip('booking')
      return
    }
    const footerEl = document.getElementById('contattaci')
    if (footerEl) {
      footerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const cards = [
    {
      id: 'cellar',
      data: t.events.cards.cellar,
      cardP: leftCardP,
      cardTitleP: leftTitleP,
      lineP: leftLineP,
      metaP: leftMetaP,
      baseLeft: '2.8%',
      baseTop: '46%',
      baseWidth: '45.5%',
      baseHeight: '46%',
      bulletBaseStart: 0.4,
    },
    {
      id: 'tasting',
      data: t.events.cards.tasting,
      cardP: rightCardP,
      cardTitleP: rightTitleP,
      lineP: rightLineP,
      metaP: rightMetaP,
      baseLeft: '55.7%',
      baseTop: '46%',
      baseWidth: '41.5%',
      baseHeight: '46%',
      bulletBaseStart: 0.5,
    },
  ]

  return (
    <section className="relative w-full bg-[#141111] pb-[clamp(4rem,10vh,8rem)] text-[#FFF9EE] select-none overflow-x-clip">
      {/* 1. Sticky Scroll Runway — scrolling expands the collapsed video; once open, heading & cards animate in automatically */}
      <div ref={runwayRef} className="relative h-[135dvh] w-full">
        {/* Anchor positioned at the fully revealed stage so #eventi navigation lands on the open view */}
        <div
          id="eventi"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-dvh"
        />

        <div className="sticky top-0 h-dvh min-h-dvh w-full overflow-hidden bg-[#141111]">
          {/* Background Video starting collapsed (centered rounded slit) and expanding smoothly on scroll */}
          <div
            style={{
              clipPath: `inset(${videoInsetV.toFixed(2)}% ${videoInsetH.toFixed(2)}% ${videoInsetV.toFixed(2)}% ${videoInsetH.toFixed(2)}% round ${videoRadius.toFixed(1)}px)`,
              opacity: 0.45 + 0.55 * videoRevealP,
            }}
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-[clip-path,opacity]"
          >
            <video
              ref={videoRef}
              src={eventsBgVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{
                transform: `scale(${videoScale.toFixed(4)})`,
              }}
              className="h-full w-full object-cover will-change-transform"
            />
            {/* Subtle top & bottom gradient + cellar vignette so it transitions coherently from Wine.jsx (#141111) into the booking bar (#141111) */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,17,0.55)_0%,rgba(16,10,7,0.18)_18%,rgba(12,8,5,0.38)_82%,rgba(20,17,17,0.72)_100%)]" />
          </div>

        {/* Top Centered Heading & Subtitle */}
        <div
          style={{
            opacity: expandedCardId ? 0 : 1,
            pointerEvents: expandedCardId ? 'none' : 'auto',
            transition: 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="relative z-10 mx-auto flex max-w-[780px] flex-col items-center px-[clamp(1.25rem,3vw,2.75rem)] pt-[clamp(3.25rem,9.5vh,6.75rem)] text-center"
        >
          <h2 className="flex flex-wrap items-baseline justify-center gap-[clamp(0.45rem,0.9vw,0.85rem)] font-serif text-[clamp(28px,3.6vw,54px)] leading-none tracking-[0.01em]">
            <span
              style={{
                opacity: conjP,
                transform: `translate3d(${(1 - conjP) * -18}px, ${(1 - conjP) * 20}px, 0)`,
              }}
              className="inline-block font-serif italic font-normal text-[#BB4732] [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]"
            >
              {t.events.conjunction}
            </span>
            <span
              style={{
                opacity: titleP,
                transform: `translate3d(${(1 - titleP) * -14}px, ${(1 - titleP) * 22}px, 0)`,
                clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
              }}
              className="inline-block font-bold text-[#FFF9EE] [text-shadow:0_2px_22px_rgba(0,0,0,0.65)]"
            >
              {t.events.title}
            </span>
          </h2>

          <div className="mt-[clamp(0.85rem,2vh,1.5rem)] font-serif text-[clamp(12px,1.22vw,18px)] font-normal leading-[1.35] tracking-[0.01em] text-[#FFF9EE]/95 [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            <p
              style={{
                opacity: subtitle1P,
                transform: `translate3d(0, ${(1 - subtitle1P) * 16}px, 0)`,
              }}
              className="m-0"
            >
              {t.events.subtitleLine1}
            </p>
            <p
              style={{
                opacity: subtitle2P,
                transform: `translate3d(0, ${(1 - subtitle2P) * 16}px, 0)`,
              }}
              className="m-0"
            >
              {t.events.subtitleLine2}
            </p>
          </div>
        </div>

        {/* Two Frosted Glass Experience Cards (expandable to the whole page on click) */}
        {cards.map((card) => {
          const isExpanded = expandedCardId === card.id
          const isOtherExpanded =
            expandedCardId !== null && expandedCardId !== card.id

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                setExpandedCardId((prev) =>
                  prev === card.id ? null : card.id
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpandedCardId((prev) =>
                    prev === card.id ? null : card.id
                  )
                } else if (e.key === 'Escape' && isExpanded) {
                  setExpandedCardId(null)
                }
              }}
              style={{
                left: isExpanded ? '0%' : card.baseLeft,
                top: isExpanded ? '0%' : card.baseTop,
                width: isExpanded ? '100%' : card.baseWidth,
                height: isExpanded ? '100%' : card.baseHeight,
                borderRadius: isExpanded
                  ? '0px'
                  : 'clamp(10px, 1.05vw, 15px)',
                opacity: isOtherExpanded ? 0 : card.cardP,
                pointerEvents:
                  isOtherExpanded || card.cardP < 0.05 ? 'none' : 'auto',
                transformOrigin: 'center bottom',
                transform: isExpanded
                  ? 'translate3d(0, 0, 0) scaleY(1)'
                  : `translate3d(0, ${(1 - card.cardP) * 44}px, 0) scaleY(${0.72 + 0.28 * card.cardP})`,
                transition:
                  'left 620ms cubic-bezier(0.22, 1, 0.36, 1), top 620ms cubic-bezier(0.22, 1, 0.36, 1), width 620ms cubic-bezier(0.22, 1, 0.36, 1), height 620ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, padding 620ms cubic-bezier(0.22, 1, 0.36, 1), background-color 620ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className={`group/card absolute ${
                isExpanded
                  ? 'z-30 bg-[#1B120C]/90 backdrop-blur-xl px-[clamp(2rem,5vw,4.5rem)] pt-[clamp(2.5rem,7vh,5rem)] pb-[clamp(2rem,5vh,3.75rem)]'
                  : 'z-20 bg-[#20150E]/55 backdrop-blur-md px-[clamp(1.35rem,2.4vw,2.25rem)] pt-[clamp(1.35rem,2.5vw,2.15rem)] pb-[clamp(1rem,1.8vw,1.5rem)]'
              } flex cursor-pointer flex-col justify-between border border-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.42)]`}
            >
              {/* Card Title + Expand/Collapse Symbol + Indented Bullet Lines */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3
                    style={{
                      opacity: card.cardTitleP,
                      transform: `translate3d(${(1 - card.cardTitleP) * -14}px, ${(1 - card.cardTitleP) * 14}px, 0)`,
                    }}
                    className="m-0 font-serif text-[clamp(20px,2.25vw,33px)] font-normal leading-none tracking-[0.01em] text-[#FFF9EE]"
                  >
                    {card.data.title}
                  </h3>

                  {/* Expand / Collapse Symbol */}
                  <span
                    aria-hidden="true"
                    style={{
                      opacity: card.cardTitleP,
                      transform: `translate3d(${(1 - card.cardTitleP) * 10}px, ${(1 - card.cardTitleP) * 10}px, 0)`,
                    }}
                    className="inline-flex h-[clamp(26px,2.5vw,36px)] w-[clamp(26px,2.5vw,36px)] shrink-0 items-center justify-center rounded-full border border-[#FFF9EE]/25 bg-[#FFF9EE]/5 text-[#FFF9EE]/80 transition-all duration-300 group-hover/card:scale-110 group-hover/card:border-[#FFF9EE]/55 group-hover/card:bg-[#FFF9EE]/15 group-hover/card:text-[#FFF9EE]"
                  >
                    {isExpanded ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[clamp(14px,1.35vw,19px)] w-[clamp(14px,1.35vw,19px)]"
                      >
                        <path
                          d="M4 14H10V20M20 10H14V4M14 10L21 3M3 21L10 14"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[clamp(14px,1.35vw,19px)] w-[clamp(14px,1.35vw,19px)]"
                      >
                        <path
                          d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </div>

                <div className="mt-[clamp(1.2rem,2.6vh,2rem)] flex flex-col gap-[clamp(0.7rem,1.65vh,1.2rem)] pl-[clamp(1rem,1.65vw,1.6rem)] font-serif text-[clamp(12px,1.18vw,17px)] font-normal leading-none tracking-[0.01em] text-[#FFF9EE]/90">
                  {card.data.bullets.map((bullet, idx) => {
                    const bStart = card.bulletBaseStart + idx * 0.06
                    const bP = stage(contentProgress, bStart, bStart + 0.26)
                    return (
                      <p
                        key={idx}
                        style={{
                          opacity: bP,
                          transform: `translate3d(${(1 - bP) * -14}px, ${(1 - bP) * 12}px, 0)`,
                        }}
                        className="m-0"
                      >
                        {bullet}
                      </p>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Divider Line + 3 Metadata Items */}
              <div className="mt-[clamp(1.5rem,3.2vh,2.4rem)]">
                <div
                  aria-hidden="true"
                  style={{
                    transformOrigin: 'left center',
                    transform: `scaleX(${card.lineP})`,
                    opacity: card.lineP > 0.005 ? 1 : 0,
                  }}
                  className="h-px w-full bg-[#FFF9EE]/65"
                />

                <div
                  style={{
                    opacity: card.metaP,
                    transform: `translate3d(0, ${(1 - card.metaP) * 12}px, 0)`,
                  }}
                  className="mt-[clamp(0.65rem,1.35vh,1rem)] flex items-center justify-between gap-2 font-serif text-[clamp(11px,1.15vw,16.5px)] font-normal leading-none tracking-[0.01em] text-[#FFF9EE]/95"
                >
                  <span className="whitespace-nowrap">{card.data.people}</span>
                  <span className="whitespace-nowrap">{card.data.price}</span>
                  <span className="whitespace-nowrap">
                    {card.data.languages}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* 2. Booking Tab — sits below the full-screen video and uncollapses/reveals on scroll with coherent #141111 espresso-dark background */}
      <div
        ref={bookingBarRef}
        className="relative z-20 w-full bg-[linear-gradient(180deg,#141111_0%,#191413_50%,#141111_100%)] overflow-hidden"
      >
        <div
          style={{
            opacity: bottomBarCollapseP,
            transformOrigin: 'center top',
            transform: `translate3d(0, ${(1 - bottomBarCollapseP) * 28}px, 0) scaleY(${0.6 + 0.4 * bottomBarCollapseP})`,
          }}
          className="mx-auto flex min-h-[clamp(124px,21vh,196px)] w-full max-w-[1440px] flex-col items-center justify-between gap-6 px-[clamp(1.5rem,5.6vw,5.25rem)] py-[clamp(1.5rem,3.5vh,2.5rem)] sm:flex-row"
        >
          {/* Left 2-line Serif Text */}
          <div className="text-center font-serif text-[clamp(17px,2.1vw,31px)] font-normal leading-[1.28] tracking-[0.01em] text-[#FFF9EE] sm:text-left">
            <p
              style={{
                opacity: bottomText1P,
                transform: `translate3d(${(1 - bottomText1P) * -20}px, ${(1 - bottomText1P) * 14}px, 0)`,
              }}
              className="m-0"
            >
              {t.events.bottomTextLine1}
            </p>
            <p
              style={{
                opacity: bottomText2P,
                transform: `translate3d(${(1 - bottomText2P) * -20}px, ${(1 - bottomText2P) * 14}px, 0)`,
              }}
              className="m-0"
            >
              {t.events.bottomTextLine2}
            </p>
          </div>

          {/* Right Terracotta "Prenota >" Button (#BB4732 matching Wine.jsx & Terroir.jsx accent) */}
          <button
            type="button"
            onClick={handleBookClick}
            style={{
              opacity: bookBtnP,
              transform: `translate3d(${(1 - bookBtnP) * 22}px, ${(1 - bookBtnP) * 14}px, 0)`,
            }}
            className="group relative inline-flex h-[clamp(48px,6.8vh,68px)] min-w-[clamp(180px,22.5vw,290px)] cursor-pointer items-center justify-center rounded-[clamp(10px,1.05vw,15px)] border-0 bg-[#BB4732] px-[clamp(1.5rem,2.6vw,2.5rem)] font-serif text-[clamp(17px,1.9vw,27px)] font-bold tracking-[0.015em] text-[#FFF9EE] shadow-[0_8px_24px_rgba(0,0,0,0.36)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#C8503A] active:scale-[0.98] sm:mr-[clamp(0.5rem,7.5vw,6.5rem)]"
          >
            <span>{t.events.bookBtn}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="absolute right-[clamp(1.1rem,1.9vw,1.75rem)] h-[clamp(16px,1.65vw,23px)] w-[clamp(16px,1.65vw,23px)] transition-transform duration-250 group-hover:translate-x-1"
            >
              <path
                d="M9 5L16 12L9 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
