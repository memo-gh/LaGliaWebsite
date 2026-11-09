import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      const heroSection = document.querySelector('main > section:first-of-type')
      const vh = window.innerHeight || document.documentElement.clientHeight

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect()
        const docHeight = document.documentElement.scrollHeight
        const maxScroll = Math.max(0, docHeight - vh)
        // Trigger once the hero section is scrolled past (or near the bottom if total scrollable height is shorter than 100dvh)
        const threshold = Math.min(rect.height * 0.75, maxScroll * 0.85)
        setIsVisible(window.scrollY > threshold && window.scrollY > 100)
      } else {
        setIsVisible(window.scrollY > vh * 0.75)
      }
    }

    checkScroll()
    window.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      )
    }
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Back to top"
      title="Torna su"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translate3d(0, 0, 0) scale(1)'
          : 'translate3d(0, 12px, 0) scale(0.9)',
        transition:
          'opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 360ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms ease, box-shadow 220ms ease',
      }}
      className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#BD3B28] text-white shadow-md shadow-black/30 hover:bg-[#a63322] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer ${
        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path
          d="M10 15.5V4.5M10 4.5L5.25 9.25M10 4.5L14.75 9.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
