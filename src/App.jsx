import { useLayoutEffect, useState } from 'react'
import Hero from './components/Hero/Hero'
import Terroir from './components/terroir'
import Company from './components/Company'
import Wine from './components/Wine'
import Events from './components/Events'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import LoadingScreen from './components/LoadingScreen'
import WIP from './components/WIP'
import { LanguageProvider } from './i18n/LanguageContext'
import './App.css'

function App() {
  const [isHeroReady, setIsHeroReady] = useState(false)
  const [isWipOpen, setIsWipOpen] = useState(false)

  const openWip = () => setIsWipOpen(true)
  const closeWip = () => setIsWipOpen(false)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      )
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <LanguageProvider>
      <main className="bg-[#0A0A0A]">
        <LoadingScreen onStartExit={() => setIsHeroReady(true)} />
        <Hero isReady={isHeroReady} />
        <Terroir />
        <Company />
        <Wine onOpenWip={openWip} />
        <Events onOpenWip={openWip} />
        <Footer />
        <ScrollToTop />
        <WIP isOpen={isWipOpen} onClose={closeWip} />
      </main>
    </LanguageProvider>
  )
}

export default App
