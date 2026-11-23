import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import merlotBottleImg from '../assets/merlot-bottle.png'
import comingSoonBottleImg from '../assets/pngwing.com(1).png'
import wineBarIcon from '../assets/wine_bar_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'
import nutritionIcon from '../assets/nutrition_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'
import restaurantIcon from '../assets/restaurant_24dp_FFF9EE_FILL0_wght400_GRAD0_opsz24.svg'
import { useLanguage } from '../i18n/useLanguage'
import WineMobile from './WineMobile'

const CANVAS_W = 1045
const CANVAS_H = 512

// Exact horizontal coordinate of the lower-middle vertical line at the bottom of Company.jsx (532.5 / 1257)
// so the top vertical line in Wine.jsx aligns seamlessly with it across the section boundary.
const TOP_LINE_X_PCT = (532.5 / 1257) * 100

const RED_CARD_W = 801
const RED_CARD_H = 295

// Widths & horizontal coordinates (% of CANVAS_W = 1045)
const EXPANDED_WIDTH_PCT = (RED_CARD_W / CANVAS_W) * 100
const BASE_SQUEEZED_WIDTH_PCT = ((1006 - 891) / CANVAS_W) * 100
const BASE_RED_LEFT_PCT = (56 / CANVAS_W) * 100
const RIGHT_SLOT_LEFT_PCT = (891 / CANVAS_W) * 100
const BLUE_EXPANDED_LEFT_PCT = ((1006 - RED_CARD_W) / CANVAS_W) * 100

// Heights & vertical coordinates (% of CANVAS_H = 512)
const CARD_TOP_PCT = (108 / CANVAS_H) * 100
const CARD_HEIGHT_PCT = (RED_CARD_H / CANVAS_H) * 100

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

const DESCRIPTION_LINES = [
  'Lorem ipsum dolor sit amet consectetur',
  'adipiscing elit. Non nostrud ea aliquip',
  'adipiscing ipsum duis. At mollit adipiscing',
  'ullamco elit enim exercitation voluptate eu.',
  'Non adipiscing anim minim proident',
  'nostrud aliqua cupidatat. Vero laborum',
  'officia qui nulla nostrud excepteur fugiat',
  'lorem. Iusto deserunt elit lorem',
]

const WINE_SPECS = [
  {
    id: 'alcohol',
    icon: wineBarIcon,
    label: '13% vol.',
    topPx: 125,
    start: 0.56,
    end: 0.82,
  },
  {
    id: 'grape',
    icon: nutritionIcon,
    label: 'Solo Merlot',
    topPx: 162,
    start: 0.62,
    end: 0.88,
  },
  {
    id: 'pairing',
    icon: restaurantIcon,
    label: 'Cazzi e Mazzi',
    topPx: 199,
    start: 0.68,
    end: 0.94,
  },
]

const COMING_SOON_SPECS = [
  {
    id: 'alcohol',
    icon: wineBarIcon,
    label: '? % vol.',
    topPx: 125,
    start: 0.56,
    end: 0.82,
  },
  {
    id: 'grape',
    icon: nutritionIcon,
    label: 'In Affinamento',
    topPx: 162,
    start: 0.62,
    end: 0.88,
  },
  {
    id: 'pairing',
    icon: restaurantIcon,
    label: 'Prossimamente',
    topPx: 199,
    start: 0.68,
    end: 0.94,
  },
]

const DETAIL_CATEGORIES = [
  {
    id: 'cat-tl',
    lineLeft: 53.7,
    textLeft: 62.3,
    lineTop: 76.7,
    lineHeight: 52,
    catTop: 80,
    valTop: 105,
    category: 'CATEGORIA',
    value: 'Lorem ipsum',
    colIdx: 0,
  },
  {
    id: 'cat-bl',
    lineLeft: 53.7,
    textLeft: 62.3,
    lineTop: 161.1,
    lineHeight: 52.1,
    catTop: 165,
    valTop: 190,
    category: 'CATEGORIA',
    value: 'Lorem ipsum',
    colIdx: 0,
  },
  {
    id: 'cat-tm',
    lineLeft: 254.2,
    textLeft: 262,
    lineTop: 76.7,
    lineHeight: 52,
    catTop: 80,
    valTop: 105,
    category: 'CATEGORIA',
    value: 'Lorem ipsum',
    colIdx: 1,
  },
  {
    id: 'cat-bm',
    lineLeft: 254.2,
    textLeft: 262,
    lineTop: 161.1,
    lineHeight: 52.1,
    catTop: 165,
    valTop: 190,
    category: 'CATEGORIA',
    value: 'Lorem ipsum',
    colIdx: 1,
  },
]

const VINIFICAZIONE_LINES = [
  'Lorem ipsum sit dolor',
  'amet gozzi stragozzi punli',
  'Lorem ipsum sit dolor',
  'amet gozzi stragozzi punli',
  'Lorem ipsum sit dolor',
  'amet gozzi stragozzi punli',
]

const RED_SQUEEZED_BG =
  'linear-gradient(270deg, #BB4732 0%, #943726 35%, #662519 70%, #3A140D 100%)'
const BLUE_SQUEEZED_BG =
  'linear-gradient(90deg, #1B6091 0%, #164C73 35%, #10344E 70%, #092132 100%)'

function getLayoutConfig(active) {
  if (active === 'red') {
    return {
      red: {
        left: BASE_RED_LEFT_PCT,
        top: CARD_TOP_PCT,
        width: EXPANDED_WIDTH_PCT,
        height: CARD_HEIGHT_PCT,
        gradOpacity: 0,
        cardOpacity: 1,
        pointerEvents: 'auto',
        mode: 'expanded',
      },
      blue: {
        left: RIGHT_SLOT_LEFT_PCT,
        top: CARD_TOP_PCT,
        width: BASE_SQUEEZED_WIDTH_PCT,
        height: CARD_HEIGHT_PCT,
        gradOpacity: 1,
        cardOpacity: 1,
        pointerEvents: 'auto',
        mode: 'squeezed-right',
      },
    }
  }

  // active === 'blue': Red is squeezed on the left, Blue ("Prossimamente") expands on the right
  return {
    red: {
      left: BASE_RED_LEFT_PCT,
      top: CARD_TOP_PCT,
      width: BASE_SQUEEZED_WIDTH_PCT,
      height: CARD_HEIGHT_PCT,
      gradOpacity: 1,
      cardOpacity: 1,
      pointerEvents: 'auto',
      mode: 'squeezed-left',
    },
    blue: {
      left: BLUE_EXPANDED_LEFT_PCT,
      top: CARD_TOP_PCT,
      width: EXPANDED_WIDTH_PCT,
      height: CARD_HEIGHT_PCT,
      gradOpacity: 0,
      cardOpacity: 1,
      pointerEvents: 'auto',
      mode: 'expanded',
    },
  }
}

const COMPACT_WINE_QUERY = '(max-width: 1023px)'

function getIsCompactWineViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(COMPACT_WINE_QUERY).matches
}

export default function Wine({ onOpenWip }) {
  const [isCompact, setIsCompact] = useState(getIsCompactWineViewport)

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_WINE_QUERY)
    const handleChange = (e) => setIsCompact(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  if (isCompact) {
    return (
      <WineMobile
        onOpenWip={onOpenWip}
        descriptionLines={DESCRIPTION_LINES}
        wineSpecs={WINE_SPECS}
        comingSoonSpecs={COMING_SOON_SPECS}
        detailCategories={DETAIL_CATEGORIES}
        vinificazioneLines={VINIFICAZIONE_LINES}
      />
    )
  }

  return <WineDesktop onOpenWip={onOpenWip} />
}

function WineDesktop({ onOpenWip }) {
  const { t } = useLanguage()
  const sectionRef = useRef(null)

  // Red card refs
  const redShiftWrapRef = useRef(null)
  const redTiltCardRef = useRef(null)
  const redSqueezedGradientRef = useRef(null)
  const redInnerContentRef = useRef(null)
  const redBottleWrapRef = useRef(null)
  const redGlareRef = useRef(null)
  const redArrowRef = useRef(null)
  const redDetailOverlayRef = useRef(null)
  const redDetailEdgeRef = useRef(null)

  // Blue ("Prossimamente") card refs
  const blueShiftWrapRef = useRef(null)
  const blueTiltCardRef = useRef(null)
  const blueSqueezedGradientRef = useRef(null)
  const blueInnerContentRef = useRef(null)
  const blueBottleWrapRef = useRef(null)
  const blueGlareRef = useRef(null)
  const blueArrowRef = useRef(null)
  const blueDetailOverlayRef = useRef(null)
  const blueDetailEdgeRef = useRef(null)

  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const [progress, setProgress] = useState(0)

  // Which card is currently expanded: 'red' (default) or 'blue' (Prossimamente)
  const [activeCard, setActiveCard] = useState('red')
  const [hoveredDetailCard, setHoveredDetailCard] = useState(null)
  const [openDetails, setOpenDetails] = useState({
    red: false,
    blue: false,
  })
  const detailClipRef = useRef({
    red: 'inset(0 100% 0 0)',
    blue: 'inset(0 100% 0 0)',
  })
  const innerOpacityRef = useRef({
    red: 1,
    blue: 0,
  })

  const getCardRefs = (key) => {
    if (key === 'red') {
      return {
        shiftWrap: redShiftWrapRef.current,
        tiltCard: redTiltCardRef.current,
        gradient: redSqueezedGradientRef.current,
        inner: redInnerContentRef.current,
        bottle: redBottleWrapRef.current,
        glare: redGlareRef.current,
        arrow: redArrowRef.current,
        detailOverlay: redDetailOverlayRef.current,
        detailEdge: redDetailEdgeRef.current,
      }
    }
    return {
      shiftWrap: blueShiftWrapRef.current,
      tiltCard: blueTiltCardRef.current,
      gradient: blueSqueezedGradientRef.current,
      inner: blueInnerContentRef.current,
      bottle: blueBottleWrapRef.current,
      glare: blueGlareRef.current,
      arrow: blueArrowRef.current,
      detailOverlay: blueDetailOverlayRef.current,
      detailEdge: blueDetailEdgeRef.current,
    }
  }

  useLayoutEffect(() => {
    const initial = getLayoutConfig('red')

    ;['red', 'blue'].forEach((key) => {
      const refs = getCardRefs(key)
      const cfg = initial[key]

      if (refs.shiftWrap) {
        gsap.set(refs.shiftWrap, {
          left: `${cfg.left}%`,
          top: `${cfg.top}%`,
          width: `${cfg.width}%`,
          height: `${cfg.height}%`,
          opacity: cfg.cardOpacity,
          xPercent: 0,
        })
      }
      if (refs.gradient) {
        gsap.set(refs.gradient, { opacity: cfg.gradOpacity })
      }
      if (refs.inner) {
        gsap.set(refs.inner, { opacity: key === 'red' ? 1 : 0 })
      }
      if (refs.detailOverlay) {
        gsap.set(refs.detailOverlay, { clipPath: 'inset(0 100% 0 0)' })
      }
      if (refs.arrow) {
        gsap.set(refs.arrow, {
          opacity: 0,
          x: key === 'red' ? 16 : -16,
          scale: 0.78,
          rotation: 0,
        })
      }
    })
  }, [])

  useEffect(() => {
    let rafId = null

    const computeScrollTarget = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight

      // Begin reveal as Wine scrolls into the viewport and finish as it fills the screen
      const startY = vh * 0.62
      const endY = vh * 0.04

      const span = Math.max(140, startY - endY)
      let raw = (startY - rect.top) / span

      const docHeight = document.documentElement.scrollHeight
      if (window.scrollY + vh >= docHeight - 6 || rect.top <= 8) {
        raw = 1
      }

      targetProgressRef.current = clamp01(raw)
    }

    const animateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        const maxStep = 0.0042
        const damped = diff * 0.026
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

  // Vertical Left-to-Right reveal / close animation for "I Dettagli"
  const animateDetailsToggle = (cardKey, shouldOpen) => {
    const refs = getCardRefs(cardKey)
    const overlayEl = refs.detailOverlay
    const edgeEl = refs.detailEdge

    setOpenDetails((prev) => ({ ...prev, [cardKey]: shouldOpen }))

    if (!overlayEl) return

    const lines = overlayEl.querySelectorAll('[data-detail-line]')
    const items = overlayEl.querySelectorAll('[data-detail-item]')

    if (shouldOpen) {
      gsap.killTweensOf([overlayEl, edgeEl, ...lines, ...items])
      detailClipRef.current[cardKey] = 'inset(0 0% 0 0)'

      gsap.fromTo(
        overlayEl,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.72,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onUpdate: () => {
            if (overlayEl.style.clipPath) {
              detailClipRef.current[cardKey] = overlayEl.style.clipPath
            }
          },
          onComplete: () => {
            detailClipRef.current[cardKey] = 'inset(0 0% 0 0)'
          },
        }
      )

      if (edgeEl) {
        gsap.fromTo(
          edgeEl,
          { left: '0%', opacity: 0.95 },
          {
            left: '100%',
            opacity: 0,
            duration: 0.72,
            ease: 'power3.inOut',
            overwrite: 'auto',
          }
        )
      }

      if (lines.length) {
        gsap.fromTo(
          lines,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.5,
            stagger: 0.07,
            delay: 0.14,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        )
      }

      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.46,
            stagger: 0.045,
            delay: 0.16,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        )
      }
    } else {
      detailClipRef.current[cardKey] = 'inset(0 100% 0 0)'

      gsap.to(overlayEl, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.56,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onUpdate: () => {
          if (overlayEl.style.clipPath) {
            detailClipRef.current[cardKey] = overlayEl.style.clipPath
          }
        },
        onComplete: () => {
          detailClipRef.current[cardKey] = 'inset(0 100% 0 0)'
        },
      })

      if (edgeEl) {
        gsap.fromTo(
          edgeEl,
          { left: '100%', opacity: 0.85 },
          {
            left: '0%',
            opacity: 0,
            duration: 0.56,
            ease: 'power3.inOut',
            overwrite: 'auto',
          }
        )
      }
    }
  }

  // Expand / Squeeze transition between Red and Blue ("Prossimamente") cards
  const handleSelectCard = (targetCard) => {
    if (targetCard === activeCard) return

    // Close any open details overlay on non-target cards
    ;['red', 'blue'].forEach((key) => {
      if (key !== targetCard && openDetails[key]) {
        animateDetailsToggle(key, false)
      }
    })

    setActiveCard(targetCard)
    const layout = getLayoutConfig(targetCard)

    ;['red', 'blue'].forEach((key) => {
      const refs = getCardRefs(key)
      const cfg = layout[key]
      const isExpanding = key === targetCard

      // Reset 3D tilt, glare, and hover arrow
      if (refs.tiltCard) {
        gsap.to(refs.tiltCard, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          boxShadow: isExpanding
            ? '0px 10px 26px rgba(0, 0, 0, 0.24)'
            : '0 8px 22px rgba(0, 0, 0, 0.24)',
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.bottle) {
        gsap.to(refs.bottle, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.glare) {
        gsap.to(refs.glare, { opacity: 0, duration: 0.25, overwrite: 'auto' })
      }
      if (refs.arrow) {
        gsap.to(refs.arrow, {
          opacity: 0,
          x: key === 'red' ? 16 : -16,
          scale: 0.78,
          rotation: 0,
          duration: 0.24,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      // Morph card wrapper position & size
      if (refs.shiftWrap) {
        gsap.to(refs.shiftWrap, {
          left: `${cfg.left}%`,
          top: `${cfg.top}%`,
          width: `${cfg.width}%`,
          height: `${cfg.height}%`,
          opacity: cfg.cardOpacity,
          xPercent: 0,
          duration: 0.72,
          ease: 'power3.inOut',
          overwrite: 'auto',
        })
      }

      // Fade dark gradient in when squeezed, or out when expanded
      if (refs.gradient) {
        gsap.to(refs.gradient, {
          opacity: cfg.gradOpacity,
          duration: 0.72,
          ease: 'power3.inOut',
          overwrite: 'auto',
        })
      }

      // Fade inner wine content in/out
      if (refs.inner) {
        if (isExpanding) {
          gsap.fromTo(
            refs.inner,
            { opacity: innerOpacityRef.current[key] },
            {
              opacity: 1,
              duration: 0.46,
              delay: 0.24,
              ease: 'power2.out',
              overwrite: 'auto',
              onUpdate: () => {
                if (refs.inner) {
                  innerOpacityRef.current[key] = Number(
                    gsap.getProperty(refs.inner, 'opacity')
                  )
                }
              },
              onComplete: () => {
                innerOpacityRef.current[key] = 1
              },
            }
          )
        } else {
          gsap.to(refs.inner, {
            opacity: 0,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
            onUpdate: () => {
              if (refs.inner) {
                innerOpacityRef.current[key] = Number(
                  gsap.getProperty(refs.inner, 'opacity')
                )
              }
            },
            onComplete: () => {
              innerOpacityRef.current[key] = 0
            },
          })
        }
      }
    })
  }

  // GSAP 3D Tilt hover handlers for whichever card is currently expanded
  const handleExpandedMouseMove = (e, cardKey) => {
    if (activeCard !== cardKey) return
    const refs = getCardRefs(cardKey)
    const cardEl = refs.tiltCard
    const bottleEl = refs.bottle
    const glareEl = refs.glare

    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    const nx = relX - 0.5
    const ny = relY - 0.5

    gsap.to(cardEl, {
      rotateY: nx * 11,
      rotateX: -ny * 9.5,
      scale: 1.014,
      boxShadow: `${-nx * 18}px ${16 - ny * 14}px 38px rgba(0, 0, 0, 0.42)`,
      duration: 0.42,
      ease: 'power2.out',
      overwrite: 'auto',
    })

    if (bottleEl) {
      gsap.to(bottleEl, {
        x: nx * 9,
        y: ny * 7,
        rotation: nx * 2.2,
        scale: 1.035,
        duration: 0.42,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    if (glareEl) {
      gsap.to(glareEl, {
        opacity: 0.16,
        background: `radial-gradient(circle at ${relX * 100}% ${relY * 100}%, rgba(255, 249, 238, 0.55) 0%, rgba(255, 249, 238, 0) 62%)`,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      })
    }
  }

  const handleExpandedMouseLeave = (cardKey) => {
    if (activeCard !== cardKey) return
    const refs = getCardRefs(cardKey)
    const cardEl = refs.tiltCard
    const bottleEl = refs.bottle
    const glareEl = refs.glare

    if (cardEl) {
      gsap.to(cardEl, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.24)',
        duration: 0.68,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (bottleEl) {
      gsap.to(bottleEl, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.68,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    if (glareEl) {
      gsap.to(glareEl, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  // Hover handlers for non-expanded cards (squeezed vertical bars)
  const handleNonActiveMouseEnter = (cardKey) => {
    if (activeCard === cardKey) return
    const layout = getLayoutConfig(activeCard)
    const cfg = layout[cardKey]
    if (!cfg) return

    const refs = getCardRefs(cardKey)
    const activeRefs = getCardRefs(activeCard)

    const glowShadow =
      cardKey === 'red'
        ? '0 16px 36px rgba(187, 71, 50, 0.36)'
        : '0 16px 36px rgba(12, 140, 233, 0.3)'

    if (cfg.mode === 'squeezed-right') {
      const hoverWidth = cfg.width * 1.42
      const extraWidth = hoverWidth - cfg.width
      const hoverLeft = cfg.left - extraWidth + 1.55

      if (refs.shiftWrap) {
        gsap.to(refs.shiftWrap, {
          width: `${hoverWidth}%`,
          left: `${hoverLeft}%`,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.tiltCard) {
        gsap.to(refs.tiltCard, {
          boxShadow: glowShadow,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.arrow) {
        gsap.to(refs.arrow, {
          opacity: 1,
          x: 0,
          scale: 1,
          rotation: 0,
          duration: 0.42,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        })
      }
      if (activeRefs.shiftWrap) {
        gsap.to(activeRefs.shiftWrap, {
          xPercent: -1.8,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    } else if (cfg.mode === 'squeezed-left') {
      const hoverWidth = cfg.width * 1.42
      const hoverLeft = Math.max(1.2, cfg.left - 1.55)

      if (refs.shiftWrap) {
        gsap.to(refs.shiftWrap, {
          width: `${hoverWidth}%`,
          left: `${hoverLeft}%`,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.tiltCard) {
        gsap.to(refs.tiltCard, {
          boxShadow: glowShadow,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      if (refs.arrow) {
        gsap.to(refs.arrow, {
          opacity: 1,
          x: 0,
          scale: 1,
          rotation: 0,
          duration: 0.42,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        })
      }
      if (activeRefs.shiftWrap) {
        gsap.to(activeRefs.shiftWrap, {
          xPercent: 1.8,
          duration: 0.48,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    }
  }

  const handleNonActiveMouseLeave = (cardKey) => {
    if (activeCard === cardKey) return
    const layout = getLayoutConfig(activeCard)
    const cfg = layout[cardKey]
    if (!cfg) return

    const refs = getCardRefs(cardKey)
    const activeRefs = getCardRefs(activeCard)

    if (refs.shiftWrap) {
      gsap.to(refs.shiftWrap, {
        left: `${cfg.left}%`,
        top: `${cfg.top}%`,
        width: `${cfg.width}%`,
        height: `${cfg.height}%`,
        duration: 0.56,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    if (refs.tiltCard) {
      gsap.to(refs.tiltCard, {
        scale: 1,
        boxShadow: '0 8px 22px rgba(0, 0, 0, 0.24)',
        duration: 0.56,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
    if (refs.arrow) {
      gsap.to(refs.arrow, {
        opacity: 0,
        x: cardKey === 'red' ? 16 : -16,
        scale: 0.78,
        rotation: 0,
        duration: 0.34,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }
    if (activeRefs.shiftWrap) {
      gsap.to(activeRefs.shiftWrap, {
        xPercent: 0,
        duration: 0.56,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }

  // Phase 1: Outer architectural 1px white lines
  const topVertLineP = stage(progress, 0.0, 0.24)
  const topHorizLineP = stage(progress, 0.06, 0.36)

  // Phase 2: Section Heading ("I Nostri Vini")
  const titleP = stage(progress, 0.14, 0.5)

  // Phase 3: Red and Blue ("Prossimamente") card containers
  const redCardP = stage(progress, 0.22, 0.62)
  const blueCardP = stage(progress, 0.34, 0.74)

  // Phase 4: Inner elements of the wine card
  const wineNameP = stage(progress, 0.34, 0.66)
  const wineYearP = stage(progress, 0.4, 0.7)
  const innerTopLineP = stage(progress, 0.44, 0.76)
  const detailLinkP = stage(progress, 0.5, 0.8)
  const innerLeftVertLineP = stage(progress, 0.42, 0.78)
  const innerMidVertLineP = stage(progress, 0.54, 0.84)
  const bottleP = stage(progress, 0.46, 0.86)
  const priceP = stage(progress, 0.58, 0.9)
  const buyBtnP = stage(progress, 0.52, 0.86)

  // Shared renderer for the expanded wine card content + "I Dettagli" left-to-right overlay
  const renderWineCardContent = (cardKey) => {
    const isExpanded = activeCard === cardKey
    const isComingSoon = cardKey === 'blue'
    const innerRef =
      cardKey === 'red' ? redInnerContentRef : blueInnerContentRef
    const bottleRef =
      cardKey === 'red' ? redBottleWrapRef : blueBottleWrapRef
    const detailOverlayRef =
      cardKey === 'red' ? redDetailOverlayRef : blueDetailOverlayRef
    const detailEdgeRef =
      cardKey === 'red' ? redDetailEdgeRef : blueDetailEdgeRef
    const isDetailHovered = hoveredDetailCard === cardKey
    const isDetailOpen = openDetails[cardKey]

    const linesToRender = isComingSoon
      ? t.wine.comingSoonLines
      : DESCRIPTION_LINES
    const specTranslations = isComingSoon
      ? t.wine.specs.comingSoon
      : t.wine.specs.merlot
    const specsToRender = (isComingSoon ? COMING_SOON_SPECS : WINE_SPECS).map(
      (spec) => ({
        ...spec,
        label: specTranslations[spec.id] ?? spec.label,
      })
    )
    const bottleImgSrc = isComingSoon ? comingSoonBottleImg : merlotBottleImg
    const bottleAltText = isComingSoon
      ? t.wine.comingSoonBottleAlt
      : t.wine.merlotBottleAlt

    return (
      <div
        ref={innerRef}
        style={{
          width: `${EXPANDED_WIDTH_PCT}cqw`,
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
        className="relative h-full shrink-0"
      >
        {/* Top Row: Flex container so Title, Year, Hairline, and "In Dettaglio >" never overlap */}
        <div
          style={{
            left: `${(20 / RED_CARD_W) * 100}%`,
            right: `${((RED_CARD_W - 650) / RED_CARD_W) * 100}%`,
            top: `${(22 / RED_CARD_H) * 100}%`,
          }}
          className="absolute z-25 flex items-baseline gap-[clamp(10px,1.2cqw,18px)]"
        >
          <h3
            style={{
              opacity: wineNameP,
              transform: `translate3d(${(1 - wineNameP) * -14}px, ${(1 - wineNameP) * 14}px, 0)`,
            }}
            className="shrink-0 font-serif text-[clamp(24px,3.05cqw,44px)] font-bold text-[#FFF9EE] leading-none tracking-[0.01em] whitespace-nowrap"
          >
            {isComingSoon ? t.wine.comingSoonTitle : t.wine.merlotTitle}
          </h3>

          {!isComingSoon && (
            <span
              style={{
                opacity: wineYearP,
                transform: `translate3d(${(1 - wineYearP) * -10}px, ${(1 - wineYearP) * 12}px, 0)`,
              }}
              className="shrink-0 font-serif text-[clamp(18px,2.2cqw,32px)] font-bold text-[#FFF9EE] leading-none tracking-[0.015em]"
            >
              2023
            </span>
          )}

          {/* Horizontal line auto-filling remaining width cleanly */}
          <div
            aria-hidden="true"
            style={{
              transformOrigin: 'left center',
              transform: `scaleX(${innerTopLineP})`,
              opacity: innerTopLineP > 0.005 ? 1 : 0,
            }}
            className="pointer-events-none h-px flex-1 self-center bg-[#FFF9EE]/60"
          />

          {/* "In Dettaglio >" trigger on Red card, or "In Cantina" label on Coming Soon card */}
          {isComingSoon ? (
            <span
              style={{
                opacity: detailLinkP,
                transform: `translate3d(${(1 - detailLinkP) * 12}px, 0, 0)`,
              }}
              className="shrink-0 inline-flex items-center gap-[0.3em] font-serif text-[clamp(11px,1.1cqw,16px)] font-bold text-[#FFF9EE]/80 leading-none tracking-[0.02em] whitespace-nowrap"
            >
              {t.wine.inCellarBadge}
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                animateDetailsToggle(cardKey, true)
              }}
              onMouseEnter={() => setHoveredDetailCard(cardKey)}
              onMouseLeave={() => setHoveredDetailCard(null)}
              style={{
                opacity: detailLinkP,
                transform: `translate3d(${(1 - detailLinkP) * 12}px, 0, 0)`,
              }}
              className="shrink-0 inline-flex items-center gap-[0.3em] bg-transparent border-0 p-0 font-serif text-[clamp(11px,1.1cqw,16px)] font-bold text-[#FFF9EE] leading-none tracking-[0.02em] whitespace-nowrap cursor-pointer"
            >
              <span>{t.wine.inDetailBtn}</span>
              <span
                style={{
                  transform: isDetailHovered
                    ? 'translateX(3px)'
                    : 'translateX(0px)',
                  transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="inline-block font-normal"
              >
                &gt;
              </span>
            </button>
          )}
        </div>

        {/* Left Vertical Line beside the description paragraph */}
        <div
          aria-hidden="true"
          style={{
            left: `${(35.5 / RED_CARD_W) * 100}%`,
            top: `${(81 / RED_CARD_H) * 100}%`,
            height: `${((249 - 81) / RED_CARD_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${innerLeftVertLineP})`,
            opacity: innerLeftVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute w-px bg-[#FFF9EE]/55"
        />

        {/* Left Column: 8-line Serif Description Paragraph */}
        <div
          style={{
            left: `${(56 / RED_CARD_W) * 100}%`,
            top: `${(96 / RED_CARD_H) * 100}%`,
            width: `${((398 - 56) / RED_CARD_W) * 100}%`,
          }}
          className="absolute font-serif text-[clamp(11px,1.22cqw,18px)] font-normal text-[#FFF9EE] leading-[1.32] tracking-[0.01em]"
        >
          {linesToRender.map((line, idx) => {
            const lineStart = 0.44 + idx * 0.032
            const lineEnd = lineStart + 0.24
            const lineP = stage(progress, lineStart, lineEnd)

            return (
              <div
                key={idx}
                style={{
                  opacity: lineP,
                  transform: `translate3d(0, ${(1 - lineP) * 12}px, 0)`,
                }}
              >
                {line}
              </div>
            )
          })}
        </div>

        {/* Middle Vertical Line between description and specs */}
        <div
          aria-hidden="true"
          style={{
            left: `${(415 / RED_CARD_W) * 100}%`,
            top: `${(144 / RED_CARD_H) * 100}%`,
            height: `${((196 - 144) / RED_CARD_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${innerMidVertLineP})`,
            opacity: innerMidVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute w-px bg-[#FFF9EE]/55"
        />

        {/* Middle-Right Column: 3 Wine Spec Rows with custom SVG icons */}
        {specsToRender.map((spec) => {
          const specP = stage(progress, spec.start, spec.end)
          return (
            <div
              key={spec.id}
              style={{
                left: `${(445 / RED_CARD_W) * 100}%`,
                top: `${(spec.topPx / RED_CARD_H) * 100}%`,
                maxWidth: `${((656 - 445) / RED_CARD_W) * 100}%`,
                opacity: specP,
                transform: `translate3d(${(1 - specP) * 14}px, ${(1 - specP) * 8}px, 0)`,
              }}
              className="absolute flex items-center gap-[clamp(6px,0.65cqw,10px)] whitespace-nowrap"
            >
              <img
                src={spec.icon}
                alt=""
                aria-hidden="true"
                className="h-[clamp(14px,1.45cqw,21px)] w-[clamp(14px,1.45cqw,21px)] shrink-0 object-contain"
              />
              <span className="truncate font-serif text-[clamp(11px,1.22cqw,18px)] font-normal text-[#FFF9EE] leading-none tracking-[0.01em]">
                {spec.label}
              </span>
            </div>
          )
        })}

        {/* Right Column: Wine Bottle (Merlot bottle on Red card, pngwing.com(1).png silhouette on Coming Soon card) */}
        <div
          style={{
            left: `${(669 / RED_CARD_W) * 100}%`,
            top: `${(18 / RED_CARD_H) * 100}%`,
            width: `${(100 / RED_CARD_W) * 100}%`,
            height: `${(244 / RED_CARD_H) * 100}%`,
            opacity: bottleP,
            transform: `translate3d(${(1 - bottleP) * 18}px, ${(1 - bottleP) * 20}px, 0)`,
          }}
          className="pointer-events-none absolute z-20"
        >
          <div ref={bottleRef} className="h-full w-full will-change-transform">
            <img
              src={bottleImgSrc}
              alt={bottleAltText}
              className="h-full w-full object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Price label directly under the bottle */}
        <span
          style={{
            left: `${(719 / RED_CARD_W) * 100}%`,
            top: `${(268 / RED_CARD_H) * 100}%`,
            opacity: priceP,
            transform: `translate3d(-50%, ${(1 - priceP) * 10}px, 0)`,
          }}
          className="pointer-events-none absolute z-20 font-serif italic text-[clamp(9px,0.98cqw,14px)] font-normal text-[#FFF9EE]/75 leading-none tracking-[0.02em] whitespace-nowrap"
        >
          {isComingSoon ? t.wine.priceComingSoon : t.wine.priceMerlot}
        </span>

        {/* Vertical Left-to-Right "I Dettagli" Card Overlay (responsive 3-column grid to prevent overlap) */}
        <div
          ref={detailOverlayRef}
          onClick={(e) => {
            e.stopPropagation()
            animateDetailsToggle(cardKey, false)
          }}
          style={{
            pointerEvents: isDetailOpen ? 'auto' : 'none',
          }}
          className="absolute inset-0 z-30 flex flex-col bg-[#5A174F] px-[6%] py-[4.5%] cursor-pointer select-none overflow-hidden"
          role="region"
          aria-label={t.wine.detailsRegionAria}
        >
          {/* Centered Top Heading: "I Dettagli" */}
          <h4
            data-detail-item
            className="text-center font-serif text-[clamp(22px,2.65cqw,38px)] font-bold text-[#FFF9EE] leading-none tracking-[0.01em] whitespace-nowrap"
          >
            {t.wine.detailsTitle}
          </h4>

          {/* 3-Column Content Grid: 2 Category columns + Vinificazione column */}
          <div className="my-auto grid grid-cols-[1fr_1fr_1.35fr] items-stretch gap-x-[4%] pt-[2%]">
            {/* Left Category Column */}
            <div className="flex flex-col justify-between gap-[clamp(14px,2cqw,28px)]">
              {DETAIL_CATEGORIES.filter((item) => item.colIdx === 0).map(
                (item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col gap-[clamp(4px,0.55cqw,8px)] pl-[clamp(8px,0.9cqw,14px)]"
                  >
                    <div
                      data-detail-line
                      aria-hidden="true"
                      style={{ transformOrigin: 'center top' }}
                      className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#BD9EAF]/75"
                    />
                    <span
                      data-detail-item
                      className="font-serif text-[clamp(9px,0.98cqw,14px)] font-bold uppercase text-[#BD9EAF] leading-none tracking-[0.02em]"
                    >
                      {t.wine.categoryLabel}
                    </span>
                    <span
                      data-detail-item
                      className="font-serif text-[clamp(11px,1.12cqw,16px)] font-bold text-[#FFF9EE] leading-tight tracking-[0.01em]"
                    >
                      {item.value}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Middle Category Column */}
            <div className="flex flex-col justify-between gap-[clamp(14px,2cqw,28px)]">
              {DETAIL_CATEGORIES.filter((item) => item.colIdx === 1).map(
                (item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col gap-[clamp(4px,0.55cqw,8px)] pl-[clamp(8px,0.9cqw,14px)]"
                  >
                    <div
                      data-detail-line
                      aria-hidden="true"
                      style={{ transformOrigin: 'center top' }}
                      className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#BD9EAF]/75"
                    />
                    <span
                      data-detail-item
                      className="font-serif text-[clamp(9px,0.98cqw,14px)] font-bold uppercase text-[#BD9EAF] leading-none tracking-[0.02em]"
                    >
                      {t.wine.categoryLabel}
                    </span>
                    <span
                      data-detail-item
                      className="font-serif text-[clamp(11px,1.12cqw,16px)] font-bold text-[#FFF9EE] leading-tight tracking-[0.01em]"
                    >
                      {item.value}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* Right Column: Tall Vertical Line + "VINIFICAZIONE" + Description */}
            <div className="relative flex flex-col gap-[clamp(6px,0.75cqw,12px)] pl-[clamp(10px,1cqw,16px)]">
              <div
                data-detail-line
                aria-hidden="true"
                style={{ transformOrigin: 'center top' }}
                className="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#BD9EAF]/75"
              />
              <span
                data-detail-item
                className="font-serif text-[clamp(9px,0.98cqw,14px)] font-bold uppercase text-[#BD9EAF] leading-none tracking-[0.02em]"
              >
                {t.wine.vinificationLabel}
              </span>
              <div className="font-serif text-[clamp(10px,1.12cqw,16px)] font-bold text-[#FFF9EE] leading-[1.32] tracking-[0.01em]">
                {VINIFICAZIONE_LINES.map((line, idx) => (
                  <div key={idx} data-detail-item>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical sweeping edge highlight during left-to-right animation */}
        <div
          ref={detailEdgeRef}
          aria-hidden="true"
          style={{ left: '0%', opacity: 0 }}
          className="pointer-events-none absolute top-0 bottom-0 z-40 w-[2px] bg-[#FFF9EE]/80 shadow-[0_0_12px_rgba(255,249,238,0.8)]"
        />
      </div>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="vini"
      className="relative w-full min-h-dvh bg-[linear-gradient(180deg,#332D2B_0%,#282322_34%,#1E1A1A_68%,#141111_100%)] text-white select-none overflow-hidden"
    >
      {/* Uses the exact same max-w-[1440px] centered coordinate space as Company.jsx so the top vertical line aligns 1:1 */}
      <div
        style={{ containerType: 'inline-size' }}
        className="relative mx-auto w-full max-w-[1440px] aspect-[1045/512]"
      >
        {/* 1A. Top vertical 1px white line aligned with Company.jsx's bottom vertical line (532.5 / 1257) */}
        <div
          aria-hidden="true"
          style={{
            left: `${TOP_LINE_X_PCT}%`,
            top: '0%',
            height: `${(42 / CANVAS_H) * 100}%`,
            transformOrigin: 'center top',
            transform: `scaleY(${topVertLineP})`,
            opacity: topVertLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 w-px bg-white/65"
        />

        {/* 1B. Top-left horizontal 1px white line extending from the very left edge of the webpage to the top vertical line */}
        <div
          aria-hidden="true"
          style={{
            left: 'calc(50% - 50vw)',
            right: `${100 - TOP_LINE_X_PCT}%`,
            top: `${(41.5 / CANVAS_H) * 100}%`,
            transformOrigin: 'right center',
            transform: `scaleX(${topHorizLineP})`,
            opacity: topHorizLineP > 0.005 ? 1 : 0,
          }}
          className="pointer-events-none absolute z-20 h-px bg-white/65"
        />

        {/* 2. Section Heading: "I Nostri Vini" */}
        <h2
          style={{
            left: `${(465 / CANVAS_W) * 100}%`,
            top: `${(14 / CANVAS_H) * 100}%`,
            opacity: titleP,
            transform: `translate3d(${(1 - titleP) * -16}px, ${(1 - titleP) * 20}px, 0)`,
            clipPath: `inset(-15% ${(1 - titleP) * 100}% -15% 0)`,
          }}
          className="absolute font-serif text-[clamp(26px,3.2cqw,46px)] font-bold text-white leading-none tracking-[0.01em] whitespace-nowrap"
        >
          {t.wine.sectionTitle}
        </h2>

        {/* 3. Red Card (#BB4732) - Expanded initially, squeezed on left when Blue ("Prossimamente") is active */}
        <div
          ref={redShiftWrapRef}
          onClick={() => {
            if (activeCard !== 'red') handleSelectCard('red')
          }}
          onMouseEnter={() => handleNonActiveMouseEnter('red')}
          onMouseLeave={() => handleNonActiveMouseLeave('red')}
          className={`absolute ${activeCard === 'red' ? 'z-10' : 'z-20 cursor-pointer'} will-change-[width,height,left,top,transform]`}
          role={activeCard !== 'red' ? 'button' : undefined}
          tabIndex={activeCard !== 'red' ? 0 : undefined}
          aria-label={activeCard !== 'red' ? t.wine.prevWineAria : undefined}
        >
          <div
            style={{
              opacity: redCardP,
              transform: `translate3d(0, ${(1 - redCardP) * 28}px, 0)`,
              perspective: '1100px',
            }}
            className="h-full w-full"
          >
            <div
              ref={redTiltCardRef}
              onMouseMove={(e) => handleExpandedMouseMove(e, 'red')}
              onMouseLeave={() => handleExpandedMouseLeave('red')}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.24)',
              }}
              className="relative h-full w-full rounded-[clamp(14px,1.85vw,26px)] border border-black/80 bg-[#BB4732] overflow-hidden will-change-transform"
            >
              {/* Dark gradient overlay when Red card is squeezed */}
              <div
                ref={redSqueezedGradientRef}
                aria-hidden="true"
                style={{
                  opacity: 0,
                  background: RED_SQUEEZED_BG,
                }}
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
              />

              {/* Subtle cursor-following specular highlight overlay during tilt */}
              <div
                ref={redGlareRef}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
              />

              {renderWineCardContent('red')}

              {/* Mirrored Big #FFF9EE arrow revealed when Red card is squeezed on the left and hovered */}
              <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center">
                <svg
                  ref={redArrowRef}
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="pointer-events-none h-[clamp(36px,4.8vw,74px)] w-[clamp(36px,4.8vw,74px)] shrink-0"
                >
                  <path
                    d="M52 32H14M14 32L31 15M14 32L31 49"
                    stroke="#FFF9EE"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Blue ("Prossimamente" / Coming Soon) Card (#1B6091) - Squeezed on right initially, expands on click */}
        <div
          ref={blueShiftWrapRef}
          onClick={() => {
            if (activeCard !== 'blue') handleSelectCard('blue')
          }}
          onMouseEnter={() => handleNonActiveMouseEnter('blue')}
          onMouseLeave={() => handleNonActiveMouseLeave('blue')}
          className={`absolute ${activeCard === 'blue' ? 'z-10' : 'z-20 cursor-pointer'} will-change-[width,height,left,top,transform]`}
          role={activeCard !== 'blue' ? 'button' : undefined}
          tabIndex={activeCard !== 'blue' ? 0 : undefined}
          aria-label={
            activeCard !== 'blue' ? t.wine.nextWineAria : undefined
          }
        >
          <div
            style={{
              opacity: blueCardP,
              transform: `translate3d(${(1 - blueCardP) * 28}px, ${(1 - blueCardP) * 16}px, 0)`,
              perspective: '1100px',
            }}
            className="h-full w-full"
          >
            <div
              ref={blueTiltCardRef}
              onMouseMove={(e) => handleExpandedMouseMove(e, 'blue')}
              onMouseLeave={() => handleExpandedMouseLeave('blue')}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 8px 22px rgba(0, 0, 0, 0.24)',
              }}
              className="relative h-full w-full rounded-[clamp(14px,1.85vw,26px)] border-[clamp(2px,0.26vw,3.5px)] border-[#0C8CE9] bg-[#1B6091] overflow-hidden will-change-transform"
            >
              {/* Dark gradient overlay when Blue card is squeezed */}
              <div
                ref={blueSqueezedGradientRef}
                aria-hidden="true"
                style={{
                  opacity: 1,
                  background: BLUE_SQUEEZED_BG,
                }}
                className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
              />

              {/* Subtle cursor-following specular highlight overlay during tilt */}
              <div
                ref={blueGlareRef}
                aria-hidden="true"
                style={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
              />

              {renderWineCardContent('blue')}

              {/* Big #FFF9EE arrow revealed when Blue card is squeezed on the right and hovered */}
              <div className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center">
                <svg
                  ref={blueArrowRef}
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="pointer-events-none h-[clamp(36px,4.8vw,74px)] w-[clamp(36px,4.8vw,74px)] shrink-0"
                >
                  <path
                    d="M12 32H50M50 32L33 15M50 32L33 49"
                    stroke="#FFF9EE"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 4B. "Acquista" Pill Button below the bottom-left of the wine card */}
        <button
          type="button"
          disabled={activeCard === 'blue'}
          onClick={() => onOpenWip?.('shop')}
          style={{
            left: `${BASE_RED_LEFT_PCT}%`,
            top: `${(424 / CANVAS_H) * 100}%`,
            width: `${(134 / CANVAS_W) * 100}%`,
            height: `${(52 / CANVAS_H) * 100}%`,
            opacity: buyBtnP * (activeCard === 'blue' ? 0.5 : 1),
            transform: `translate3d(0, ${(1 - buyBtnP) * 18}px, 0)`,
          }}
          className={`absolute z-20 flex items-center justify-center gap-[clamp(6px,0.75cqw,11px)] rounded-[clamp(10px,1.2cqw,16px)] border-0 bg-[#FFF9EE] text-[#1D1919] shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition-all duration-300 ${
            activeCard === 'blue'
              ? 'cursor-not-allowed'
              : 'cursor-pointer hover:scale-[1.03] hover:bg-white active:scale-[0.98]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-[clamp(13px,1.35cqw,19px)] w-[clamp(13px,1.35cqw,19px)] shrink-0"
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
          <span className="font-sans text-[clamp(11px,1.15cqw,16px)] font-bold leading-none tracking-[0.01em] whitespace-nowrap">
            {t.wine.buyBtn}
          </span>
        </button>
      </div>
    </section>
  )
}
