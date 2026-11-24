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

function GuestsIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="9" cy="8" r="3.2" stroke="#FFF9EE" strokeWidth="1.4" />
      <path
        d="M3.5 19C3.5 15.8 6 13.8 9 13.8C12 13.8 14.5 15.8 14.5 19"
        stroke="#FFF9EE"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="16.2" cy="9.2" r="2.4" stroke="#BB4732" strokeWidth="1.4" />
      <path
        d="M16.2 14.2C18.5 14.2 20.5 15.7 20.5 18.5"
        stroke="#BB4732"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PriceIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" stroke="#FFF9EE" strokeWidth="1.4" />
      <path
        d="M15.2 8.8C14.4 8.1 13.4 7.7 12.2 7.7C9.9 7.7 8.3 9.5 8.3 12C8.3 14.5 9.9 16.3 12.2 16.3C13.4 16.3 14.4 15.9 15.2 15.2"
        stroke="#BB4732"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M7 10.7H12.5M7 13.3H12.5"
        stroke="#BB4732"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LanguagesIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="8.5" stroke="#FFF9EE" strokeWidth="1.4" />
      <ellipse
        cx="12"
        cy="12"
        rx="3.8"
        ry="8.5"
        stroke="#BB4732"
        strokeWidth="1.4"
      />
      <path
        d="M4 9.2H20M4 14.8H20"
        stroke="#FFF9EE"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

export default function Events({ onOpenWip }) {
  const { language, t } = useLanguage()
  const runwayRef = useRef(null)
  const videoRef = useRef(null)

  const targetVideoProgressRef = useRef(0)
  const currentVideoProgressRef = useRef(0)
  const [videoProgress, setVideoProgress] = useState(0)

  const contentRevealedRef = useRef(false)
  const currentContentProgressRef = useRef(0)
  const [contentProgress, setContentProgress] = useState(0)

  const [expandedCardId, setExpandedCardId] = useState(null)
  const [revealedExpandedId, setRevealedExpandedId] = useState(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )

  useEffect(() => {
    if (!expandedCardId) return
    let raf2 = null
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setRevealedExpandedId(expandedCardId)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [expandedCardId])

  const openCard = (id) => {
    setRevealedExpandedId(null)
    setExpandedCardId(id)
  }

  const closeCard = () => {
    setExpandedCardId(null)
    setRevealedExpandedId(null)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let rafId = null
    let lastTime = performance.now()

    const computeScrollTarget = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      const docHeight = document.documentElement.scrollHeight

      // Scroll-driven video expansion progress (collapsed slit -> full-screen)
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
        if (contentRevealedRef.current) {
          setExpandedCardId(null)
          setRevealedExpandedId(null)
        }
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

  // Close expanded card on Escape (unless a modal dialog such as WIP is open above it)
  useEffect(() => {
    if (!expandedCardId) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
          return
        }
        closeCard()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [expandedCardId])

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

  const handleBookClick = (e) => {
    e.stopPropagation()
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
      index: '01',
      data: t.events.cards.cellar,
      cardP: leftCardP,
      cardTitleP: leftTitleP,
      lineP: leftLineP,
      metaP: leftMetaP,
      baseLeft: isMobile ? '5%' : '4.5%',
      baseTop: isMobile ? '31%' : '43%',
      baseWidth: isMobile ? '90%' : '44%',
      baseHeight: isMobile ? '31%' : '49%',
      bulletBaseStart: 0.4,
    },
    {
      id: 'tasting',
      index: '02',
      data: t.events.cards.tasting,
      cardP: rightCardP,
      cardTitleP: rightTitleP,
      lineP: rightLineP,
      metaP: rightMetaP,
      baseLeft: isMobile ? '5%' : '51.5%',
      baseTop: isMobile ? '65%' : '43%',
      baseWidth: isMobile ? '90%' : '44%',
      baseHeight: isMobile ? '31%' : '49%',
      bulletBaseStart: 0.5,
    },
  ]

  const expandAriaLabel =
    language === 'en' ? 'Expand experience details' : 'Espandi dettagli esperienza'
  const collapseAriaLabel =
    language === 'en' ? 'Close experience details' : 'Chiudi dettagli esperienza'

  return (
    <section className="relative w-full bg-[#141111] pb-[clamp(2rem,5vh,4rem)] text-[#FFF9EE] select-none overflow-x-clip">
      {/* Sticky Scroll Runway — scrolling expands the collapsed video; once open, heading & cards animate in automatically */}
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
            {/* Subtle top & bottom gradient + cellar vignette transitioning coherently between Wine.jsx (#141111) and Footer.jsx (#141111) */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,17,17,0.58)_0%,rgba(16,10,7,0.2)_20%,rgba(12,8,5,0.42)_78%,rgba(20,17,17,0.9)_100%)]" />
          </div>

          {/* Top Centered Heading & Subtitle */}
          <div
            style={{
              opacity: expandedCardId ? 0 : 1,
              pointerEvents: expandedCardId ? 'none' : 'auto',
              transition: 'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="relative z-10 mx-auto flex max-w-[780px] flex-col items-center px-[clamp(1.25rem,3vw,2.75rem)] pt-[clamp(2.25rem,8.5vh,6.25rem)] text-center"
          >
            <h2 className="flex flex-wrap items-baseline justify-center gap-[clamp(0.45rem,0.9vw,0.85rem)] font-serif text-[clamp(26px,3.6vw,54px)] leading-none tracking-[0.01em]">
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

            <div className="mt-[clamp(0.65rem,1.8vh,1.45rem)] font-serif text-[clamp(12px,1.22vw,18px)] font-normal leading-[1.35] tracking-[0.01em] text-[#FFF9EE]/95 [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
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

          {/* Two Frosted Glass Experience Cards (symmetric when collapsed; full-stage editorial sheet with integrated Book Now CTA when expanded) */}
          {cards.map((card) => {
            const isExpanded = expandedCardId === card.id
            const isExpandedRevealed = isExpanded && revealedExpandedId === card.id
            const isOtherExpanded =
              expandedCardId !== null && expandedCardId !== card.id

            return (
              <div
                key={card.id}
                role={!isExpanded ? 'button' : 'region'}
                tabIndex={!isExpanded ? 0 : undefined}
                aria-expanded={isExpanded}
                aria-label={card.data.title}
                onClick={() => {
                  if (!isExpanded) {
                    openCard(card.id)
                  }
                }}
                onKeyDown={(e) => {
                  if (!isExpanded && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    openCard(card.id)
                  }
                }}
                style={{
                  left: isExpanded ? '0%' : card.baseLeft,
                  top: isExpanded ? '0%' : card.baseTop,
                  width: isExpanded ? '100%' : card.baseWidth,
                  height: isExpanded ? '100%' : card.baseHeight,
                  borderRadius: isExpanded
                    ? '0px'
                    : 'clamp(12px, 1.15vw, 18px)',
                  opacity: isOtherExpanded ? 0 : card.cardP,
                  pointerEvents:
                    isOtherExpanded || card.cardP < 0.05 ? 'none' : 'auto',
                  transformOrigin: 'center bottom',
                  transform: isExpanded
                    ? 'translate3d(0, 0, 0) scaleY(1)'
                    : `translate3d(0, ${(1 - card.cardP) * 44}px, 0) scaleY(${0.72 + 0.28 * card.cardP})`,
                  transition:
                    'left 620ms cubic-bezier(0.22, 1, 0.36, 1), top 620ms cubic-bezier(0.22, 1, 0.36, 1), width 620ms cubic-bezier(0.22, 1, 0.36, 1), height 620ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, padding 620ms cubic-bezier(0.22, 1, 0.36, 1), background-color 620ms cubic-bezier(0.22, 1, 0.36, 1), border-color 420ms ease',
                }}
                className={`group/card absolute overflow-x-hidden ${
                  isExpanded
                    ? 'z-30 overflow-y-auto border-transparent bg-[#16100C]/90 backdrop-blur-xl px-[clamp(1.5rem,5vw,4.5rem)] pt-[clamp(2rem,6.5vh,4.75rem)] pb-[clamp(1.75rem,5vh,3.75rem)]'
                    : 'z-20 cursor-pointer overflow-hidden border-[#FFF9EE]/14 bg-[#20150E]/58 backdrop-blur-md hover:border-[#FFF9EE]/28 hover:bg-[#261911]/70 px-[clamp(1.25rem,2.4vw,2.4rem)] pt-[clamp(1.1rem,2.4vw,2.2rem)] pb-[clamp(0.9rem,1.8vw,1.6rem)]'
                } border shadow-[0_18px_44px_rgba(0,0,0,0.44)]`}
              >
                {/* Warm subtle terracotta ambient glow in expanded state */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background:
                      'radial-gradient(circle at 86% 88%, rgba(187, 71, 50, 0.16) 0%, rgba(187, 71, 50, 0.04) 36%, transparent 66%)',
                  }}
                />

                {/* Inner Editorial Stage */}
                <div
                  className={`relative z-10 mx-auto flex h-full w-full flex-col justify-between transition-[max-width] duration-500 ${
                    isExpanded ? 'max-w-[1220px]' : 'max-w-none'
                  }`}
                >
                  {/* 1. Card Header: Optional Expanded Eyebrow + Title + Expand/Collapse Control */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {/* Expanded-only Editorial Eyebrow */}
                      <div
                        className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ${
                          isExpanded
                            ? 'mb-[clamp(0.65rem,1.5vh,1.1rem)] max-h-8 opacity-100 delay-150'
                            : 'mb-0 max-h-0 opacity-0'
                        }`}
                      >
                        <span className="font-serif italic text-[clamp(12px,1.15vw,16px)] text-[#BB4732] leading-none">
                          {card.index}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-px w-8 bg-[#BB4732]/85"
                        />
                        <span className="font-serif text-[clamp(10px,0.95vw,13px)] font-bold uppercase tracking-[0.14em] text-[#B8ABA6] leading-none">
                          {t.events.title}
                        </span>
                      </div>

                      <h3
                        style={{
                          opacity: card.cardTitleP,
                          transform: `translate3d(${(1 - card.cardTitleP) * -14}px, ${(1 - card.cardTitleP) * 14}px, 0)`,
                        }}
                        className={`m-0 font-serif font-normal leading-[1.08] tracking-[0.01em] text-[#FFF9EE] transition-[font-size] duration-500 ${
                          isExpanded
                            ? 'text-[clamp(28px,3.8vw,54px)]'
                            : 'text-[clamp(18px,2.2vw,32px)]'
                        }`}
                      >
                        {card.data.title}
                      </h3>
                    </div>

                    {/* Expand / Collapse Circular Control */}
                    <button
                      type="button"
                      aria-label={
                        isExpanded ? collapseAriaLabel : expandAriaLabel
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isExpanded) {
                          closeCard()
                        } else {
                          openCard(card.id)
                        }
                      }}
                      style={{
                        opacity: card.cardTitleP,
                        transform: `translate3d(${(1 - card.cardTitleP) * 10}px, ${(1 - card.cardTitleP) * 10}px, 0)`,
                      }}
                      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-300 ${
                        isExpanded
                          ? 'h-[clamp(36px,3.2vw,46px)] w-[clamp(36px,3.2vw,46px)] border-[#FFF9EE]/30 bg-[#FFF9EE]/8 text-[#FFF9EE] hover:scale-105 hover:border-[#BB4732]/85 hover:bg-[#BB4732]/20'
                          : 'h-[clamp(28px,2.5vw,38px)] w-[clamp(28px,2.5vw,38px)] border-[#FFF9EE]/25 bg-[#FFF9EE]/5 text-[#FFF9EE]/85 group-hover/card:scale-110 group-hover/card:border-[#BB4732]/80 group-hover/card:bg-[#BB4732]/20 group-hover/card:text-[#FFF9EE]'
                      }`}
                    >
                      {isExpanded ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          className="h-[clamp(15px,1.4vw,20px)] w-[clamp(15px,1.4vw,20px)]"
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
                          aria-hidden="true"
                          className="h-[clamp(13px,1.3vw,18px)] w-[clamp(13px,1.3vw,18px)]"
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
                    </button>
                  </div>

                  {/* 2. Middle Content: Compact Bullet List when Collapsed; 2-Column Editorial Highlights + Specs when Expanded */}
                  <div
                    className={`${
                      isExpanded
                        ? 'my-auto grid grid-cols-1 gap-[clamp(1.5rem,3.5vh,2.75rem)] py-[clamp(1.25rem,3vh,2.5rem)] md:grid-cols-[1.25fr_0.95fr] md:items-center md:gap-[clamp(2.25rem,5.5vw,5.5rem)]'
                        : 'mt-[clamp(0.85rem,2.4vh,2rem)]'
                    }`}
                  >
                    {/* Experience Highlights / Bullets with Architectural Left Hairline */}
                    <div
                      className={`relative flex flex-col font-serif font-normal tracking-[0.01em] text-[#FFF9EE]/90 transition-all duration-500 ${
                        isExpanded
                          ? 'gap-[clamp(1rem,2.3vh,1.75rem)] pl-[clamp(1.25rem,2.2vw,2.2rem)] text-[clamp(15px,1.5vw,22px)] leading-[1.55]'
                          : 'gap-[clamp(0.5rem,1.45vh,1.15rem)] pl-[clamp(0.95rem,1.65vw,1.6rem)] text-[clamp(12px,1.18vw,17px)] leading-[1.25]'
                      }`}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          transformOrigin: 'center top',
                          transform: `scaleY(${card.lineP})`,
                          opacity: card.lineP > 0.005 ? 1 : 0,
                        }}
                        className="pointer-events-none absolute inset-y-0.5 left-0 w-px bg-[linear-gradient(180deg,#BB4732_0%,rgba(255,249,238,0.45)_38%,rgba(255,249,238,0.12)_100%)]"
                      />

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
                            className="m-0 flex items-baseline gap-3"
                          >
                            {isExpanded && (
                              <span
                                aria-hidden="true"
                                className="inline-block h-px w-3 shrink-0 translate-y-[-0.3em] bg-[#BB4732]"
                              />
                            )}
                            <span>{bullet}</span>
                          </p>
                        )
                      })}
                    </div>

                    {/* Expanded-only Right Column: Structured Experience Details (matching Footer & Wine architectural vertical rules) */}
                    {isExpanded && (
                      <div
                        className={`relative flex flex-col justify-center border-l border-[#FFF9EE]/25 pl-[clamp(1.15rem,2.4vw,2.4rem)] font-serif transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isExpandedRevealed
                            ? 'translate-y-0 opacity-100 delay-150'
                            : 'translate-y-3 opacity-0 delay-0'
                        }`}
                      >
                        <div className="flex items-center gap-4 border-b border-[#FFF9EE]/14 py-[clamp(0.75rem,1.6vh,1.25rem)] first:pt-1">
                          <GuestsIcon className="h-[clamp(20px,1.8vw,26px)] w-[clamp(20px,1.8vw,26px)] shrink-0" />
                          <span className="text-[clamp(15px,1.45vw,21px)] font-normal tracking-[0.015em] text-[#FFF9EE]/95">
                            {card.data.people}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 border-b border-[#FFF9EE]/14 py-[clamp(0.75rem,1.6vh,1.25rem)]">
                          <PriceIcon className="h-[clamp(20px,1.8vw,26px)] w-[clamp(20px,1.8vw,26px)] shrink-0" />
                          <span className="text-[clamp(16px,1.65vw,24px)] font-bold tracking-[0.015em] text-[#FFF9EE]">
                            {card.data.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 py-[clamp(0.75rem,1.6vh,1.25rem)] last:pb-1">
                          <LanguagesIcon className="h-[clamp(20px,1.8vw,26px)] w-[clamp(20px,1.8vw,26px)] shrink-0" />
                          <span className="text-[clamp(15px,1.45vw,21px)] font-normal tracking-[0.015em] text-[#FFF9EE]/95">
                            {card.data.languages}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Bottom Divider Hairline + Metadata (Collapsed) OR Integrated Booking Bar (Expanded) */}
                  <div className={isExpanded ? 'mt-2' : 'mt-[clamp(1rem,2.6vh,2.2rem)]'}>
                    <div
                      aria-hidden="true"
                      style={{
                        transformOrigin: 'left center',
                        transform: `scaleX(${card.lineP})`,
                        opacity: card.lineP > 0.005 ? 1 : 0,
                      }}
                      className={`h-px w-full transition-colors duration-500 ${
                        isExpanded ? 'bg-[#FFF9EE]/40' : 'bg-[#FFF9EE]/60'
                      }`}
                    />

                    {!isExpanded ? (
                      <div
                        style={{
                          opacity: card.metaP,
                          transform: `translate3d(0, ${(1 - card.metaP) * 12}px, 0)`,
                        }}
                        className="mt-[clamp(0.6rem,1.35vh,1rem)] flex items-center justify-between gap-2 font-serif text-[clamp(11px,1.12vw,16.5px)] font-normal leading-none tracking-[0.01em] text-[#FFF9EE]/95"
                      >
                        <span className="whitespace-nowrap">
                          {card.data.people}
                        </span>
                        <span className="whitespace-nowrap font-bold text-[#FFF9EE]">
                          {card.data.price}
                        </span>
                        <span className="whitespace-nowrap">
                          {card.data.languages}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`mt-[clamp(1.1rem,2.5vh,1.85rem)] flex flex-col items-stretch justify-between gap-[clamp(1rem,2.4vh,1.75rem)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex-row sm:items-center ${
                          isExpandedRevealed
                            ? 'translate-y-0 opacity-100 delay-200'
                            : 'translate-y-3 opacity-0 delay-0'
                        }`}
                      >
                        {/* Editorial Booking Note */}
                        <div className="border-l border-[#BB4732]/85 pl-[clamp(0.85rem,1.4vw,1.35rem)] font-serif text-[clamp(14px,1.35vw,20px)] font-normal leading-[1.38] tracking-[0.01em] text-[#FFF9EE]/85">
                          <p className="m-0">{t.events.bottomTextLine1}</p>
                          <p className="m-0">{t.events.bottomTextLine2}</p>
                        </div>

                        {/* Integrated Terracotta Book Now CTA matching card & website aesthetic */}
                        <button
                          type="button"
                          onClick={handleBookClick}
                          className="group/btn relative inline-flex h-[clamp(48px,6.2vh,62px)] w-full sm:w-auto sm:min-w-[clamp(195px,19.5vw,260px)] cursor-pointer items-center justify-center gap-3 rounded-[clamp(10px,1vw,14px)] border border-[#FFF9EE]/22 bg-[#BB4732] px-[clamp(1.6rem,2.6vw,2.6rem)] font-serif text-[clamp(15px,1.4vw,21px)] font-bold tracking-[0.03em] text-[#FFF9EE] shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,249,238,0.2)] transition-all duration-300 hover:-translate-y-[1px] hover:border-[#FFF9EE]/38 hover:bg-[#C94F39] hover:shadow-[0_14px_34px_rgba(187,71,50,0.34),inset_0_1px_0_rgba(255,249,238,0.26)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF9EE]/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16100C]"
                        >
                          <span>{t.events.bookBtn}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="h-[clamp(15px,1.4vw,20px)] w-[clamp(15px,1.4vw,20px)] transition-transform duration-300 group-hover/btn:translate-x-1"
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
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
