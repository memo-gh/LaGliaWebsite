import { useEffect, useState } from 'react'
import heroBg from '../../assets/dan-meyers-0AgtPoAARtE-unsplash.jpg'
import MenuWheel from './MenuWheel'

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsLoaded(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleNavigate = (item) => {
    window.location.hash = item.href
  }

  // Left-side text sequence (bottom-left -> up toward top-right):
  // 1. "Terra." (750ms) -> 2. "Radici" (890ms) -> 3. "Vino" (1030ms) -> 4. "LA GLIA winery" (1170ms)
  const heroLines = [
    { text: 'Tra Scienza', delayMs: 1030},
    { text: 'e Design', delayMs: 890 },

  ]

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
      <div className="relative z-10 flex h-full w-full flex-col justify-center px-7 sm:px-12 md:px-14">
        {/* Header: Red Circle Logo Placeholder (drawn top-to-bottom) + "LA GLIA winery" (appears at 1170ms) */}
        <header className="flex items-end gap-3.5">
          <div
            style={{
              clipPath: isLoaded ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              transition: 'clip-path 750ms cubic-bezier(0.22, 1, 0.36, 1) 0ms',
            }}
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-[#BD3B28] shrink-0"
            aria-label="La Glia logo placeholder"
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
            className="font-serif text-lg sm:text-xl md:text-[23px] font-normal tracking-wide text-white leading-none pb-0.5"
          >
            LA GLIA winery
          </span>
        </header>

        {/* Main Typography: "Vino", "Radici", "Terra." appearing bottom-to-top (Terra. -> Radici -> Vino) */}
        <div className="mt-4 sm:mt-5 md:mt-6">
          <h1 className="font-sans font-bold text-white text-6xl sm:text-7xl md:text-[6.8rem] lg:text-[8.2rem] xl:text-[9rem] leading-[1.05] tracking-[-0.025em]">
            {heroLines.map((line) => (
              <span
                key={line.text}
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded
                    ? 'translate3d(0, 0, 0)'
                    : 'translate3d(-16px, 16px, 0)',
                  transition: `opacity 480ms cubic-bezier(0.22, 1, 0.36, 1) ${line.delayMs}ms, transform 480ms cubic-bezier(0.22, 1, 0.36, 1) ${line.delayMs}ms`,
                }}
                className="block"
              >
                {line.text}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Right Navigation Wheel aligned in line with the Hero text */}
      <MenuWheel onNavigate={handleNavigate} isLoaded={isLoaded} />
    </section>
  )
}
