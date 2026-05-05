import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',      sectionId: null },
  // { label: 'About',     sectionId: 'about' },
  { label: 'Features',  sectionId: 'features' },
  { label: 'Donations', sectionId: 'donations' },
  { label: 'Stats',     sectionId: 'stats' },
  { label: 'Contact',   sectionId: 'contact' },
]

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('Home')
  const [isMobileMenuOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const isLanding = location.pathname === '/'

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  /* shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* highlight active section while scrolling (only on landing page) */
  useEffect(() => {
    if (!isLanding) return
    const ids = NAV_LINKS.map(l => l.sectionId).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const matched = NAV_LINKS.find(l => l.sectionId === entry.target.id)
            if (matched) setActiveItem(matched.label)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [isLanding])

  const handleNavClick = (link) => {
    setActiveItem(link.label)
    setMobileOpen(false)

    if (!link.sectionId) {
      // Home — scroll to top
      if (!isLanding) {
        navigate('/')
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    // Section link
    if (!isLanding) {
      // Go to landing page first, then scroll
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(link.sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } else {
      const el = document.getElementById(link.sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, width: '100%',
      background: '#0F111A',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
      transition: 'box-shadow 0.25s',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link
          to="/"
          onClick={() => { setActiveItem('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #F178B6, #8146FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
        DM<span style={{ color: '#F178B6' }}>S</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="dms-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              style={{
                background: activeItem === link.label ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer',
                color: activeItem === link.label ? '#fff' : 'rgba(255,255,255,0.55)',
                fontSize: 13, fontWeight: 500,
                padding: '7px 14px', borderRadius: 8, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeItem !== link.label) e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              onMouseLeave={e => { if (activeItem !== link.label) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="dms-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/login"
            style={{
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', padding: '7px 14px', borderRadius: 8, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', fontSize: 13, fontWeight: 700, color: '#fff',
              background: 'linear-gradient(135deg, #8146FF, #A051FF)',
              borderRadius: 9, textDecoration: 'none',
              boxShadow: '0 0 18px rgba(129,70,255,0.35)', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="dms-nav-mobile"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 6, display: 'none' }}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div style={{
          background: '#0F111A',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 16px 20px',
        }}>
          {NAV_LINKS.map(link => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: activeItem === link.label ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: 'none', cursor: 'pointer',
                color: activeItem === link.label ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: 15, fontWeight: 500,
                padding: '11px 14px', borderRadius: 9, marginBottom: 2,
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0' }} />

          <Link
            to="/login"
            style={{
              display: 'block', textAlign: 'center', padding: '11px',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
              fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none', marginBottom: 8,
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
              padding: '12px', background: 'linear-gradient(135deg, #8146FF, #A051FF)',
              borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
            }}
          >
            Get Started
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      <style>{`
        .dms-nav-desktop { display: flex !important; }
        .dms-nav-mobile  { display: none  !important; }
        @media (max-width: 768px) {
          .dms-nav-desktop { display: none  !important; }
          .dms-nav-mobile  { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

export default Navbar