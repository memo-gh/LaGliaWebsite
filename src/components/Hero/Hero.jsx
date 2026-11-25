import { useEffect, useState } from 'react'
import heroBg from '../../assets/shrinked.webp'
import trueColoredLaGliaLogo from '../../assets/true_coloredLaGliaLogo.svg'
import { useLanguage } from '../../i18n/useLanguage'
import MenuWheel from './MenuWheel'

export default function Hero({
  isReady = true,
  language: controlledLanguage,
  onLanguageChange,
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { language: contextLanguage, setLanguage, t } = useLanguage()

  const language = controlledLanguage ?? contextLanguage

  const handleLanguageSelect = (nextLang) => {
    if (nextLang === language) return
    setLanguage(nextLang)
    if (typeof onLanguageChange === 'function') {
      onLanguageChange(nextLang)
    }
  }

  useEffect(() => {
    if (!isReady) return
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [isReady])

  const handleNavigate = (item) => {
    if (!item?.href || item.href === '#') return
    const targetId = item.href.replace(/^#/, '')
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      window.history.replaceState(null, '', item.href)
    } else {
      window.location.hash = item.href
    }
  }

  return (
    <section className="relative h-dvh max-h-dvh w-full overflow-hidden bg-neutral-900 text-white select-none">
      {/* Background Image: fits webpage viewport height and crops from the top (object-bottom) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg}
          alt="La Glia vineyard landscape"
          className="h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/35 md:bg-black/10 md:bg-none" />
      </div>

      {/* Hero Typography: Top-centered on mobile (< md), left-aligned & vertically centered on tablet/desktop (md+) */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-start px-5 pt-[clamp(4.25rem,12.5dvh,7.5rem)] text-center sm:pt-[clamp(4.5rem,11.5dvh,7.5rem)] md:items-start md:justify-center md:pt-0 md:pl-[clamp(1.25rem,3vw,2.5rem)] md:pr-6 md:text-left lg:pl-[clamp(1rem,2.8vw,3rem)]">
        {/* Header: La Glia Logo (drawn top-to-bottom) + "LA GLIA | Azienda Agricola" (appears at 1170ms) */}
        <header className="flex items-center justify-center gap-[clamp(0.5rem,2.2vw,1rem)] md:-ml-[clamp(0.35rem,0.9vw,1rem)] md:items-end md:justify-start md:gap-[clamp(0.6rem,1.1vw,1.25rem)] lg:-ml-[clamp(0.35rem,1.1vw,1.35rem)] lg:gap-[clamp(0.65rem,1.2vw,1.5rem)]">
          <img
            src={trueColoredLaGliaLogo}
            alt="La Glia logo"
            style={{
              clipPath: isLoaded ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              transition: 'clip-path 750ms cubic-bezier(0.22, 1, 0.36, 1) 0ms',
            }}
            className="h-[clamp(2rem,8.5vw,3.25rem)] w-[clamp(2rem,8.5vw,3.25rem)] shrink-0 object-contain md:h-[clamp(2.25rem,4vw,3.75rem)] md:w-[clamp(2.25rem,4vw,3.75rem)] lg:h-[clamp(2.25rem,4.2vw,5.25rem)] lg:w-[clamp(2.25rem,4.2vw,5.25rem)]"
          />
          <span
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded
                ? 'translate3d(0, 0, 0)'
                : 'translate3d(-12px, 12px, 0)',
              transition:
                'opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) 1170ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 1170ms',
            }}
            className="font-serif text-[clamp(0.95rem,4vw,1.6rem)] font-normal leading-none tracking-wide text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.3)] md:pb-[0.12em] md:text-[clamp(1.1rem,2vw,1.85rem)] md:[text-shadow:none] lg:text-[clamp(1.1rem,2.1vw,2.75rem)]"
          >
            LA GLIA | Azienda Agricola
          </span>
        </header>

        {/* Main Typography: "Tra Scienza / e Design" (IT) or "Science / meets Design" (EN) */}
        <div className="mt-[clamp(0.65rem,2dvh,1.25rem)] md:mt-[clamp(0.75rem,1.6vw,1.75rem)]">
          <h1
            className={`font-serif font-bold leading-[1.04] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.28)] md:[text-shadow:none] ${
              language === 'en'
                ? 'text-[clamp(2.2rem,min(10.8vw,6.8dvh),3.85rem)] sm:text-[clamp(2.85rem,min(9.4vw,7.4dvh),4.5rem)] md:text-[clamp(2.65rem,6.9vw,4.75rem)] lg:text-[clamp(3.15rem,7.2vw,6.5rem)] xl:text-[clamp(3rem,7.8vw,10.5rem)]'
                : 'text-[clamp(2.45rem,min(12.2vw,7.4dvh),4.25rem)] sm:text-[clamp(3.25rem,min(10.5vw,8dvh),5rem)] md:text-[clamp(3rem,7.8vw,5.25rem)] lg:text-[clamp(3.5rem,8.4vw,7.5rem)] xl:text-[clamp(3.2rem,9.4vw,13rem)]'
            }`}
          >
            {/* Line 1: "Tra Scienza" / "Science" */}
            <span
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded
                  ? 'translate3d(0, 0, 0)'
                  : 'translate3d(-16px, 16px, 0)',
                transition:
                  'opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) 1030ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 1030ms',
              }}
              className="block"
            >
              {t.hero.line1}
            </span>

            {/* Line 2: "e" / "meets" (italic Poppins in #BD3B28 with its own delay) + "Design" on the same line */}
            <span className="flex items-baseline justify-center gap-[clamp(0.45rem,2vw,1rem)] whitespace-nowrap md:justify-start md:gap-[clamp(0.6rem,1.4vw,1.6rem)]">
              <span
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(-16px, 16px, 0)',
                  transition:
                    'opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) 750ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 750ms',
                }}
                className="inline-block font-sans italic font-normal text-[#BD3B28] pr-[0.06em]"
              >
                {t.hero.conjunction}
              </span>
              <span
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(-16px, 16px, 0)',
                  transition:
                    'opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) 890ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 890ms',
                }}
                className="inline-block"
              >
                {t.hero.line2End}
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* Language Toggle: Top-right on mobile (< md) to clear the bottom wheel, bottom-left on tablet/desktop (md+) */}
      <div
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(0, 14px, 0)',
          transition:
            'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) 1350ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 1350ms',
        }}
        className="absolute top-[clamp(0.85rem,2.2dvh,1.5rem)] right-[clamp(1rem,4vw,1.75rem)] z-20 flex items-center gap-3 md:top-auto md:right-auto md:bottom-[clamp(1.25rem,2.8vw,2.5rem)] md:left-[clamp(1rem,2.8vw,3rem)]"
      >
        <div
          role="group"
          aria-label={t.hero.languageSelectorAria}
          className="relative inline-grid grid-cols-2 items-center rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.38)] transition-colors duration-300 hover:border-white/35"
        >
          {/* Sliding Active Pill Indicator */}
          <span
            aria-hidden="true"
            style={{
              transform:
                language === 'it' ? 'translateX(0%)' : 'translateX(100%)',
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[#BD3B28] shadow-[0_2px_12px_rgba(189,59,40,0.55)]"
          />

          <button
            type="button"
            onClick={() => handleLanguageSelect('it')}
            aria-pressed={language === 'it'}
            aria-label="Italiano"
            className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1 font-serif text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              language === 'it'
                ? 'text-[#FFF9EE]'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            ITA
          </button>

          <button
            type="button"
            onClick={() => handleLanguageSelect('en')}
            aria-pressed={language === 'en'}
            aria-label="English"
            className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1 font-serif text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              language === 'en'
                ? 'text-[#FFF9EE]'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            ENG
          </button>
        </div>
      </div>

      {/* Navigation Wheel: bottom-centered on mobile (< md), right-aligned on tablet/desktop (md+) */}
      <MenuWheel onNavigate={handleNavigate} isLoaded={isLoaded} />
    </section>
  )
}
