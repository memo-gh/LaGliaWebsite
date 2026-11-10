import { useLayoutEffect } from 'react'
import Hero from './components/Hero/Hero'
import Terroir from './components/terroir'
import Company from './components/Company'
import Wine from './components/Wine'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

function App() {
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
    <main className="bg-[#0A0A0A]">
      <Hero />
      <Terroir />
      <Company />
      <Wine />
      <ScrollToTop />
    </main>
  )
}

export default App
