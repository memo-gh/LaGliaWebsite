import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

const CANVAS_W = 1045
const WINE_BOTTOM_OFFSET_H = 42.5
const CANVAS_H = 190 + WINE_BOTTOM_OFFSET_H

// Exact horizontal coordinate of the stepped architectural connector line (604.5 / 1045)
const TOP_LINE_X_PCT = (604.5 / CANVAS_W) * 100
const TOP_RIGHT_HORIZ_LINE_Y_PCT = (0.5 / CANVAS_H) * 100
const TOP_LEFT_HORIZ_LINE_Y_PCT = ((22 + WINE_BOTTOM_OFFSET_H) / CANVAS_H) * 100
const COL_TOP_PCT = ((76 + WINE_BOTTOM_OFFSET_H) / CANVAS_H) * 100
const COL_HEIGHT_PCT = (66 / CANVAS_H) * 100

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

export default function Footer() {
  const { t } = useLanguage()
  const footerRef = useRef(null)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = footerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      const startY = vh * 0.96
      const endY = vh * 0.68
      const span = Math.max(80, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.012
        const damped = diff * 0.06
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

  // Architectural top connector lines (moved from Wine.jsx bottom + Footer.jsx top)
  const topRightHorizP = stage(progress, 0.0, 0.28)
  const topVertP = stage(progress, 0.08, 0.42)
  const topLeftHorizP = stage(progress, 0.2, 0.56)

  // 3 Columns reveal stages
  const col1LineP = stage(progress, 0.28, 0.66)
  const col1TextP = stage(progress, 0.34, 0.74)

  const col2LineP = stage(progress, 0.38, 0.76)
  const col2TextP = stage(progress, 0.44, 0.86)

  const col3LineP = stage(progress, 0.48, 0.88)
  const col3TextP = stage(progress, 0.54, 0.96)

  return (
    <footer
      ref={footerRef}
      id="contattaci"
      className="relative w-full bg-[linear-gradient(180deg,#141111_0%,#241B19_32%,#3A2622_68%,#4A2F29_100%)] text-[#FFF9EE] select-none overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-[1440px] aspect-[1045/232.5]">
        {/* 1A. Top-right horizontal 1px white line extending all the way to the right edge of the webpage */}
        <div
          aria-hidden="true"
          style={{
            left: `${TOP_LINE_X_PCT}%`,
            right: 'calc(50% - 50vw)',
            top: `${TOP_RIGHT_HORIZ_LINE_Y_PCT}%`,
            transformOrigin: 'left center',
            transform: `scaleX(${topRightHorizP})`,
            opacity: topRightHorizP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 1B. Top vertical 1px white line uniting the top-right and top-left horizontal lines */}
        <div
          aria-hidden="true"
          style={{
            left: `${TOP_LINE_X_PCT}%`,
            top: `${TOP_RIGHT_HORIZ_LINE_Y_PCT}%`,
            height: `${TOP_LEFT_HORIZ_LINE_Y_PCT - TOP_RIGHT_HORIZ_LINE_Y_PCT}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${topVertP})`,
            opacity: topVertP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1C. Top-left horizontal 1px white line extending from the left edge of the viewport to the vertical line */}
        <div
          aria-hidden="true"
          style={{
            left: 'calc(50% - 50vw)',
            right: `${100 - TOP_LINE_X_PCT}%`,
            top: `${TOP_LEFT_HORIZ_LINE_Y_PCT}%`,
            transformOrigin: 'right center',
            transform: `scaleX(${topLeftHorizP})`,
            opacity: topLeftHorizP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* Column 1: TENUTA */}
        <div
          style={{
            left: `${(24 / CANVAS_W) * 100}%`,
            top: `${COL_TOP_PCT}%`,
            height: `${COL_HEIGHT_PCT}%`,
          }}
          className="absolute flex items-start"
        >
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'center top',
              transform: `scaleY(${col1LineP})`,
              opacity: col1LineP > 0.005 ? 1 : 0,
            }}
            className="h-full w-px shrink-0 bg-[#FFF9EE]/60"
          />
          <div
            style={{
              opacity: col1TextP,
              transform: `translate3d(${(1 - col1TextP) * -10}px, ${(1 - col1TextP) * 8}px, 0)`,
            }}
            className="ml-[clamp(8px,0.9vw,14px)] flex flex-col justify-between h-full py-[1px] font-serif"
          >
            <span className="text-[clamp(9px,1.02vw,15px)] font-bold uppercase tracking-[0.04em] text-[#B8ABA6] leading-none">
              {t.footer.estateHeader}
            </span>
            <p className="m-0 text-[clamp(10px,1.15vw,17px)] font-bold text-[#FFF9EE] leading-none tracking-[0.015em] whitespace-nowrap">
              La Glia | Via Magrete 12
            </p>
            <p className="m-0 text-[clamp(10px,1.15vw,17px)] font-bold text-[#FFF9EE] leading-none tracking-[0.015em] whitespace-nowrap">
              {t.footer.countryLine}
            </p>
          </div>
        </div>

        {/* Column 2: CONTATTI */}
        <div
          style={{
            left: `${(374 / CANVAS_W) * 100}%`,
            top: `${COL_TOP_PCT}%`,
            height: `${COL_HEIGHT_PCT}%`,
          }}
          className="absolute flex items-start"
        >
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'center top',
              transform: `scaleY(${col2LineP})`,
              opacity: col2LineP > 0.005 ? 1 : 0,
            }}
            className="h-full w-px shrink-0 bg-[#FFF9EE]/60"
          />
          <div
            style={{
              opacity: col2TextP,
              transform: `translate3d(${(1 - col2TextP) * -10}px, ${(1 - col2TextP) * 8}px, 0)`,
            }}
            className="ml-[clamp(8px,0.9vw,14px)] flex flex-col justify-between h-full py-[1px] font-serif select-text"
          >
            <span className="text-[clamp(9px,1.02vw,15px)] font-bold uppercase tracking-[0.04em] text-[#B8ABA6] leading-none select-none">
              {t.footer.contactsHeader}
            </span>
            <a
              href="mailto:info@laglia.com"
              className="text-[clamp(10px,1.15vw,17px)] font-bold text-[#FFF9EE] underline decoration-[#FFF9EE]/80 underline-offset-[3px] hover:text-white hover:decoration-white transition-colors leading-none tracking-[0.015em] whitespace-nowrap"
            >
              info@laglia.com
            </a>
            <a
              href="tel:+393770888927"
              className="text-[clamp(10px,1.15vw,17px)] font-bold text-[#FFF9EE] no-underline hover:text-white transition-colors leading-none tracking-[0.015em] whitespace-nowrap"
            >
              +39 377 088 8927
            </a>
          </div>
        </div>

        {/* Column 3: LINKS */}
        <div
          style={{
            left: `${(720 / CANVAS_W) * 100}%`,
            top: `${COL_TOP_PCT}%`,
            height: `${COL_HEIGHT_PCT}%`,
          }}
          className="absolute flex items-start"
        >
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'center top',
              transform: `scaleY(${col3LineP})`,
              opacity: col3LineP > 0.005 ? 1 : 0,
            }}
            className="h-full w-px shrink-0 bg-[#FFF9EE]/60"
          />
          <div
            style={{
              opacity: col3TextP,
              transform: `translate3d(${(1 - col3TextP) * -10}px, ${(1 - col3TextP) * 8}px, 0)`,
            }}
            className="ml-[clamp(12px,1.4vw,22px)] flex flex-col justify-between h-full py-[1px] font-serif"
          >
            <span className="text-[clamp(9px,1.02vw,15px)] font-bold uppercase tracking-[0.04em] text-[#B8ABA6] leading-none">
              LINKS
            </span>

            <div className="flex items-center gap-[clamp(10px,1.35vw,20px)]">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-[#FFF9EE]/90 hover:text-white hover:scale-110 transition-all duration-200"
              >
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[clamp(18px,2.1vw,30px)] w-[clamp(18px,2.1vw,30px)]"
                >
                  <rect
                    x="2.5"
                    y="2.5"
                    width="23"
                    height="23"
                    rx="6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="5.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle cx="20.4" cy="7.6" r="1.2" fill="currentColor" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-[#FFF9EE]/90 hover:text-white hover:scale-110 transition-all duration-200"
              >
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[clamp(18px,2.1vw,30px)] w-[clamp(18px,2.1vw,30px)]"
                >
                  <path
                    d="M16.5 25V15.6H19.6L20.1 11.8H16.5V9.4C16.5 8.3 16.9 7.5 18.5 7.5H20.3V4.1C19.4 4 18.2 3.9 16.9 3.9C13.8 3.9 11.7 5.7 11.7 9.1V11.8H8.5V15.6H11.7V25H16.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-[#FFF9EE]/90 hover:text-white hover:scale-110 transition-all duration-200"
              >
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[clamp(18px,2.1vw,30px)] w-[clamp(18px,2.1vw,30px)]"
                >
                  <rect
                    x="2.5"
                    y="2.5"
                    width="23"
                    height="23"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M9.2 12.2V19.5M9.2 8.8V8.9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.2 19.5V15.2C13.2 13.5 14.3 12.2 16 12.2C17.6 12.2 18.6 13.3 18.6 15.2V19.5M13.2 12.2V19.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/memo-gh/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-[#FFF9EE]/90 hover:text-white hover:scale-110 transition-all duration-200"
              >
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[clamp(18px,2.1vw,30px)] w-[clamp(18px,2.1vw,30px)]"
                >
                  <path
                    d="M11.2 22.8C7.2 24 7.2 20.6 5.5 20.1M16.8 25V21.1C16.9 20 16.5 19 15.8 18.3C19.2 17.9 22.8 16.6 22.8 10.8C22.8 9.3 22.2 7.9 21.2 6.8C21.7 5.4 21.6 3.8 21 2.5C21 2.5 19.7 2.1 16.8 4C14.3 3.4 11.7 3.4 9.2 4C6.3 2.1 5 2.5 5 2.5C4.4 3.8 4.3 5.4 4.8 6.8C3.8 7.9 3.2 9.3 3.2 10.8C3.2 16.6 6.8 17.9 10.2 18.3C9.5 19 9.1 20 9.2 21.1V25"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
