import { useEffect, useState } from 'react'
import heroBg from '../../assets/dan-meyers-0AgtPoAARtE-unsplash.jpg'
import coloredLaGliaLogo from '../../assets/coloredLaGliaLogo.svg'
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
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Left Column: Header + Main Stacked Display Typography vertically centered in line with MenuWheel */}
      <div className="relative z-10 flex h-full w-full flex-col justify-center pl-[clamp(1rem,2.8vw,3rem)] pr-6">
        {/* Header: La Glia Logo (drawn top-to-bottom) + "LA GLIA winery" (appears at 1170ms) */}
        <header className="-ml-[clamp(0.35rem,1.1vw,1.35rem)] flex items-end gap-[clamp(0.65rem,1.2vw,1.5rem)]">
          <img
            src={coloredLaGliaLogo}
            alt="La Glia logo"
            style={{
              clipPath: isLoaded ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              transition: 'clip-path 750ms cubic-bezier(0.22, 1, 0.36, 1) 0ms',
            }}
            className="h-[clamp(2.25rem,4.2vw,5.25rem)] w-[clamp(2.25rem,4.2vw,5.25rem)] object-contain shrink-0"
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
            className="font-serif text-[clamp(1.1rem,2.1vw,2.75rem)] font-normal tracking-wide text-white leading-none pb-[0.12em]"
          >
            LA GLIA | Azienda Agricola
          </span>
        </header>

        {/* Main Typography: "Tra Scienza" and "e Design" scaling dynamically with viewport */}
        <div className="mt-[clamp(0.75rem,1.6vw,1.75rem)]">
          <h1 className="font-sans font-bold text-white text-[clamp(3.2rem,9.4vw,13rem)] leading-[1.04] tracking-[-0.025em]">
            {/* Line 1: "Tra Scienza" */}
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
              Tra Scienza
            </span>

            {/* Line 2: "e" / "&" (italic serif in #BD3B28 with its own delay) + "Design" on the same line */}
            <span className="flex items-baseline gap-[clamp(0.6rem,1.4vw,1.6rem)] whitespace-nowrap">
              <span
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(-16px, 16px, 0)',
                  transition:
                    'opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) 750ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) 750ms',
                }}
                className="inline-block font-serif italic font-normal text-[#BD3B28] pr-[0.06em]"
              >
                {language === 'en' ? '&' : t.hero.conjunction}
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
                Design
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* Bottom-Left Language Toggle (ITA default / ENG) */}
      <div
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(0, 14px, 0)',
          transition:
            'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) 1350ms, transform 520ms cubic-bezier(0.22, 1, 0.36, 1) 1350ms',
        }}
        className="absolute bottom-[clamp(1.25rem,2.8vw,2.5rem)] left-[clamp(1rem,2.8vw,3rem)] z-20 flex items-center gap-3"
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
            className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1 font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
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
            className={`relative z-10 cursor-pointer rounded-full px-3.5 py-1 font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              language === 'en'
                ? 'text-[#FFF9EE]'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            ENG
          </button>
        </div>
      </div>

      {/* Right Navigation Wheel aligned in line with the Hero text */}
      <MenuWheel onNavigate={handleNavigate} isLoaded={isLoaded} />
    </section>
  )
}
