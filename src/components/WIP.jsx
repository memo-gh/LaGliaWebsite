import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import coloredLaGliaLogo from '../assets/coloredLaGliaLogo.svg'
import { useLanguage } from '../i18n/useLanguage'

export default function WIP({ isOpen, onClose }) {
  const { t } = useLanguage()
  const overlayRef = useRef(null)
  const cardRef = useRef(null)
  const timelineRef = useRef(null)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const handleRequestClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const overlayEl = overlayRef.current
    const cardEl = cardRef.current

    if (!overlayEl || !cardEl) {
      isClosingRef.current = false
      onCloseRef.current?.()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isClosingRef.current = false
        onCloseRef.current?.()
      },
    })

    tl.to(cardEl, {
      opacity: 0,
      scale: 0.9,
      y: 18,
      duration: 0.28,
      ease: 'back.in(1.4)',
    }).to(
      overlayEl,
      {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        webkitBackdropFilter: 'blur(0px)',
        duration: 0.24,
        ease: 'power2.in',
      },
      0.06
    )

    timelineRef.current = tl
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return

    isClosingRef.current = false
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const overlayEl = overlayRef.current
    const cardEl = cardRef.current

    if (overlayEl && cardEl) {
      const items = cardEl.querySelectorAll('[data-wip-item]')

      gsap.set(overlayEl, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        webkitBackdropFilter: 'blur(0px)',
      })
      gsap.set(cardEl, {
        opacity: 0,
        scale: 0.88,
        y: 26,
      })
      gsap.set(items, {
        opacity: 0,
        y: 12,
      })

      const tl = gsap.timeline()
      tl.to(overlayEl, {
        opacity: 1,
        backdropFilter: 'blur(10px)',
        webkitBackdropFilter: 'blur(10px)',
        duration: 0.34,
        ease: 'power2.out',
      })
        .to(
          cardEl,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.46,
            ease: 'back.out(1.6)',
          },
          0.04
        )
        .to(
          items,
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.05,
            ease: 'power2.out',
          },
          0.14
        )

      timelineRef.current = tl
    }

    return () => {
      document.body.style.overflow = prevOverflow
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      isClosingRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleRequestClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleRequestClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wip-modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          handleRequestClose()
        }
      }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 sm:p-8 select-none"
    >
      <div
        ref={cardRef}
        className="relative flex w-full max-w-[780px] flex-col items-center rounded-[20px] bg-[#FFEACC] px-7 py-8 sm:px-14 sm:py-11 text-center text-[#1E1B18] shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      >
        {/* Top Colored La Glia Logo */}
        <img
          data-wip-item
          src={coloredLaGliaLogo}
          alt="La Glia logo"
          className="h-[clamp(64px,7vw,92px)] w-[clamp(64px,7vw,92px)] object-contain shrink-0"
        />

        {/* Two-line Monospace Heading */}
        <h3
          id="wip-modal-title"
          data-wip-item
          className="mt-[clamp(18px,2.4vw,30px)] mb-0 font-mono text-[clamp(16px,2.05vw,26px)] font-normal leading-[1.45] tracking-[0.01em] text-[#1E1B18]"
        >
          <span className="block">{t.wip.titleLine1}</span>
          <span className="block">{t.wip.titleLine2}</span>
        </h3>

        {/* Three-line Contact Info */}
        <p
          data-wip-item
          className="mt-[clamp(24px,3.2vw,42px)] mb-0 font-mono text-[clamp(12px,1.25vw,16.5px)] font-normal leading-[1.55] tracking-[0.01em] text-[#1E1B18]"
        >
          <span className="block">{t.wip.bodyLine1}</span>
          <span className="block">
            {t.wip.bodyLine2Prefix}
            <a
              href="mailto:info@laglia.com"
              className="text-inherit no-underline hover:underline underline-offset-4"
            >
              info@laglia.com
            </a>
          </span>
          <span className="block">
            {t.wip.bodyLine3Prefix}
            <a
              href="tel:+393770888927"
              className="text-inherit no-underline hover:underline underline-offset-4"
            >
              3770888927
            </a>
            .
          </span>
        </p>

        {/* Bottom Outlined Terracotta Close Button */}
        <button
          type="button"
          data-wip-item
          onClick={handleRequestClose}
          className="mt-[clamp(26px,3.4vw,44px)] min-w-[clamp(132px,14vw,176px)] cursor-pointer rounded-[10px] border-[1.5px] border-[#BB4732] bg-transparent px-8 py-2.5 font-mono text-[clamp(13px,1.2vw,16px)] font-normal uppercase tracking-[0.06em] text-[#BB4732] transition-colors duration-200 ease-out hover:bg-[#BB4732] hover:text-[#FFEACC] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB4732] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFEACC]"
        >
          {t.wip.closeBtn}
        </button>
      </div>
    </div>
  )
}
