import { useEffect, useRef, useState } from 'react'
import merlotBottleImg from '../assets/merlot-bottle.png'
import comingSoonBottleImg from '../assets/pngwing.com(1).png'
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

const RED_SQUEEZED_BG =
  'linear-gradient(90deg, #BB4732 0%, #943726 40%, #662519 78%, #3A140D 100%)'
const BLUE_SQUEEZED_BG =
  'linear-gradient(90deg, #1B6091 0%, #164C73 40%, #10344E 78%, #092132 100%)'

export default function WineMobile({
  onOpenWip,
  descriptionLines,
  wineSpecs,
  comingSoonSpecs,
  detailCategories,
  vinificazioneLines,
}) {
  const { t } = useLanguage()
  const sectionRef = useRef(null)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  const [activeCard, setActiveCard] = useState('red')
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      const startY = vh * 0.85
      const endY = vh * 0.2
      const span = Math.max(120, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6 || rect.top <= 16) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.014
        const damped = diff * 0.09
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

  const handleSelectCard = (nextCard) => {
    if (nextCard === activeCard) return
    setIsDetailOpen(false)
    setActiveCard(nextCard)
  }

  const lineP = stage(progress, 0.0, 0.35)
  const titleP = stage(progress, 0.1, 0.48)
  const cardP = stage(progress, 0.22, 0.68)
  const btnP = stage(progress, 0.42, 0.85)

  const isComingSoon = activeCard === 'blue'
  const linesToRender = isComingSoon ? t.wine.comingSoonLines : descriptionLines
  const specTranslations = isComingSoon
    ? t.wine.specs.comingSoon
    : t.wine.specs.merlot
  const specsToRender = (isComingSoon ? comingSoonSpecs : wineSpecs).map(
    (spec) => ({
      ...spec,
      label: specTranslations[spec.id] ?? spec.label,
    })
  )
  const bottleImgSrc = isComingSoon ? comingSoonBottleImg : merlotBottleImg
  const bottleAltText = isComingSoon
    ? t.wine.comingSoonBottleAlt
    : t.wine.merlotBottleAlt

  const renderSqueezedBar = (cardKey) => {
    const isBlueBar = cardKey === 'blue'
    return (
      <button
        type="button"
        onClick={() => handleSelectCard(cardKey)}
        aria-label={isBlueBar ? t.wine.nextWineAria : t.wine.prevWineAria}
        style={{
          background: isBlueBar ? BLUE_SQUEEZED_BG : RED_SQUEEZED_BG,
        }}
        className={`group flex w-full cursor-pointer items-center justify-between rounded-[14px] px-5 py-3.5 text-left text-[#FFF9EE] shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition-transform duration-300 active:scale-[0.99] ${
          isBlueBar
            ? 'border-2 border-[#0C8CE9]'
            : 'border border-black/80'
        }`}
      >
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-[clamp(17px,4.6vw,22px)] font-bold leading-none tracking-[0.01em]">
            {isBlueBar ? t.wine.comingSoonTitle : t.wine.merlotTitle}
          </span>
          {!isBlueBar && (
            <span className="font-serif text-[clamp(13px,3.6vw,17px)] font-bold leading-none text-[#FFF9EE]/85">
              2023
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-2 font-serif text-[clamp(11px,3vw,13px)] font-bold tracking-[0.02em] text-[#FFF9EE]/90">
          <span>
            {isBlueBar ? t.wine.inCellarBadge : t.wine.prevWineAria}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            {isBlueBar ? (
              <path d="M5 12h14M13 6l6 6-6 6" />
            ) : (
              <path d="M19 12H5M11 6l-6 6 6 6" />
            )}
          </svg>
        </span>
      </button>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="vini"
      className="relative w-full overflow-hidden bg-[linear-gradient(180deg,#332D2B_0%,#282322_34%,#1E1A1A_68%,#141111_100%)] px-4 pb-14 pt-10 text-white select-none sm:px-6 sm:pb-18 sm:pt-12"
    >
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header with architectural horizontal white line + "I Nostri Vini" */}
        <header className="mb-6 flex items-center gap-4 sm:mb-7">
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'left center',
              transform: `scaleX(${lineP})`,
              opacity: lineP > 0.005 ? 1 : 0,
            }}
            className="h-px flex-1 bg-white/65"
          />
          <h2
            style={{
              opacity: titleP,
              transform: `translate3d(${(1 - titleP) * -12}px, ${(1 - titleP) * 14}px, 0)`,
              clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
            }}
            className="shrink-0 font-serif text-[clamp(24px,6.8vw,38px)] font-bold leading-none tracking-[0.01em] text-white"
          >
            {t.wine.sectionTitle}
          </h2>
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'right center',
              transform: `scaleX(${lineP})`,
              opacity: lineP > 0.005 ? 1 : 0,
            }}
            className="h-px flex-1 bg-white/65"
          />
        </header>

        {/* Cards Stack: Active expanded wine card + compact squeezed switcher bar */}
        <div
          style={{
            opacity: cardP,
            transform: `translate3d(0, ${(1 - cardP) * 20}px, 0)`,
          }}
          className="flex flex-col gap-3.5"
        >
          {isComingSoon && renderSqueezedBar('red')}

          {/* Expanded Active Wine Card */}
          <div
            className={`relative overflow-hidden rounded-[18px] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition-colors duration-300 sm:rounded-[22px] sm:p-7 ${
              isComingSoon
                ? 'border-2 border-[#0C8CE9] bg-[#1B6091]'
                : 'border border-black/80 bg-[#BB4732]'
            }`}
          >
            {/* Top Row: Title (+ Year) | Flexible hairline | "In Dettaglio >" / "In Cantina" */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
              <div className="flex items-baseline gap-2.5">
                <h3 className="font-serif text-[clamp(22px,6.2vw,34px)] font-bold leading-none tracking-[0.01em] text-[#FFF9EE]">
                  {isComingSoon ? t.wine.comingSoonTitle : t.wine.merlotTitle}
                </h3>
                {!isComingSoon && (
                  <span className="font-serif text-[clamp(16px,4.4vw,24px)] font-bold leading-none tracking-[0.015em] text-[#FFF9EE]">
                    2023
                  </span>
                )}
              </div>

              <div
                aria-hidden="true"
                className="hidden h-px flex-1 self-center bg-[#FFF9EE]/55 sm:block"
              />

              {isComingSoon ? (
                <span className="font-serif text-[clamp(11px,3.2vw,14px)] font-bold leading-none tracking-[0.02em] text-[#FFF9EE]/85">
                  {t.wine.inCellarBadge}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-serif text-[clamp(12px,3.4vw,15px)] font-bold leading-none tracking-[0.02em] text-[#FFF9EE] transition-opacity hover:opacity-85"
                >
                  <span>{t.wine.inDetailBtn}</span>
                  <span className="font-normal">&gt;</span>
                </button>
              )}
            </div>

            {/* Main Card Body: Clean non-overlapping grid */}
            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-5 sm:grid-cols-[1.35fr_auto_auto] sm:gap-x-6">
              {/* Description Paragraph (below specs on narrow phones, left column on sm+) */}
              <div className="col-span-2 order-2 border-l border-[#FFF9EE]/55 pl-3.5 sm:col-span-1 sm:order-1">
                <p className="font-serif text-[clamp(13px,3.5vw,15.5px)] font-normal leading-[1.45] tracking-[0.01em] text-[#FFF9EE]">
                  {linesToRender.join(' ')}
                </p>
              </div>

              {/* 3 Wine Specs with custom SVG icons */}
              <div className="order-1 flex flex-col gap-3.5 sm:order-2 sm:border-l sm:border-[#FFF9EE]/45 sm:pl-5">
                {specsToRender.map((spec) => (
                  <div key={spec.id} className="flex items-center gap-2.5">
                    <img
                      src={spec.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0 object-contain sm:h-[20px] sm:w-[20px]"
                    />
                    <span className="font-serif text-[clamp(13px,3.6vw,15.5px)] font-normal leading-tight tracking-[0.01em] text-[#FFF9EE]">
                      {spec.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottle + Price */}
              <div className="order-1 flex flex-col items-center justify-center sm:order-3">
                <div className="h-[clamp(140px,36vw,200px)] w-[clamp(64px,16vw,92px)]">
                  <img
                    src={bottleImgSrc}
                    alt={bottleAltText}
                    draggable={false}
                    className="h-full w-full object-contain select-none"
                  />
                </div>
                <span className="mt-2 whitespace-nowrap font-serif text-[clamp(11px,3vw,13px)] italic font-normal leading-none tracking-[0.02em] text-[#FFF9EE]/80">
                  {isComingSoon ? t.wine.priceComingSoon : t.wine.priceMerlot}
                </span>
              </div>
            </div>

            {/* "I Dettagli" Left-to-Right Purple Overlay (Red Card) */}
            {!isComingSoon && (
              <div
                onClick={() => setIsDetailOpen(false)}
                role="region"
                aria-label={t.wine.detailsRegionAria}
                aria-hidden={!isDetailOpen}
                style={{
                  clipPath: isDetailOpen
                    ? 'inset(0 0% 0 0)'
                    : 'inset(0 100% 0 0)',
                  transition: 'clip-path 560ms cubic-bezier(0.65, 0, 0.35, 1)',
                  pointerEvents: isDetailOpen ? 'auto' : 'none',
                }}
                className="absolute inset-0 z-30 flex flex-col justify-between overflow-y-auto bg-[#5A174F] p-5 cursor-pointer sm:p-7"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-[clamp(20px,5.6vw,28px)] font-bold leading-none tracking-[0.01em] text-[#FFF9EE]">
                    {t.wine.detailsTitle}
                  </h4>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDetailOpen(false)
                    }}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#BD9EAF]/50 bg-white/10 text-sm text-[#FFF9EE] transition-colors hover:bg-white/20"
                  >
                    &times;
                  </button>
                </div>

                <div className="my-auto grid grid-cols-1 gap-4 py-4 sm:grid-cols-[1fr_1fr] sm:items-start sm:gap-6">
                  {/* 2x2 Category Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                    {detailCategories.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 border-l border-[#BD9EAF]/75 pl-2.5"
                      >
                        <span className="font-serif text-[clamp(10px,2.7vw,12px)] font-bold uppercase leading-none tracking-[0.02em] text-[#BD9EAF]">
                          {t.wine.categoryLabel}
                        </span>
                        <span className="font-serif text-[clamp(12px,3.3vw,14.5px)] font-bold leading-snug tracking-[0.01em] text-[#FFF9EE]">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Vinificazione Column */}
                  <div className="flex flex-col gap-1.5 border-l border-[#BD9EAF]/75 pl-3">
                    <span className="font-serif text-[clamp(10px,2.7vw,12px)] font-bold uppercase leading-none tracking-[0.02em] text-[#BD9EAF]">
                      {t.wine.vinificationLabel}
                    </span>
                    <p className="font-serif text-[clamp(12px,3.3vw,14.5px)] font-bold leading-[1.38] tracking-[0.01em] text-[#FFF9EE]">
                      {vinificazioneLines.join(' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isComingSoon && renderSqueezedBar('blue')}
        </div>

        {/* "Acquista" / "Buy Now" Pill Button */}
        <div
          style={{
            opacity: btnP,
            transform: `translate3d(0, ${(1 - btnP) * 16}px, 0)`,
          }}
          className="mt-5 flex justify-start"
        >
          <button
            type="button"
            disabled={isComingSoon}
            onClick={() => onOpenWip?.('shop')}
            style={{
              opacity: isComingSoon ? 0.5 : 1,
            }}
            className={`inline-flex h-[46px] items-center justify-center gap-2.5 rounded-[12px] border-0 bg-[#FFF9EE] px-6 text-[#1D1919] shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition-all duration-300 ${
              isComingSoon
                ? 'cursor-not-allowed'
                : 'cursor-pointer hover:scale-[1.03] hover:bg-white active:scale-[0.98]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0"
            >
              <path
                d="M6 7.5H18L19 20.5H5L6 7.5Z"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
              <path
                d="M9 7.5V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V7.5"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-sans text-[14px] font-bold leading-none tracking-[0.01em]">
              {t.wine.buyBtn}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
