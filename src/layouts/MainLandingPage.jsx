export default function MainLayout() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

 useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setScrolled(true)
    } else {
      setScrolled(false)
    }
  }

  window.addEventListener("scroll", handleScroll)

  // 👇 IMPORTANT: initial check
  handleScroll()

  return () => window.removeEventListener("scroll", handleScroll)
}, [])
  useEffect(() => setOpen(false), [location])

  const dark = isLanding && !scrolled

  const navLinks = [['Home','/'],['About','/#about'],['Features','/#features'],['Donation','/#donation'],['Stats','/#stats'],['Contact','/#contact']]

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', width:'100%' }}>

      
      {/* News ticker */}
  
     

    {/* Sticky header */}
<motion.header
  initial={{ y: -80, opacity: 0 }}
  animate={{
    y: 0,
    opacity: 1,
    scale: scrolled ? 0.985 : 1,
  }}
  transition={{
    duration: 0.7,
    ease: "easeOut",
  }}
 style={{
  position: "fixed",
  top: 0,
  left: 0,
  right: 0, 
  zIndex: 999,
  width: "100vw",
  backdropFilter: "blur(2px)",

  // 🎯 Transparent → Glass transition
background: scrolled
  ? dark
    ? "linear-gradient(135deg, rgba(0,255,200,0.10), rgba(0,150,255,0.08))"
    : "linear-gradient(135deg, rgba(0,255,200,0.18), rgba(0,150,255,0.12))"
  : "transparent",


WebkitBackdropFilter: scrolled ? "blur(2px)" : "blur(0px)",

borderBottom: scrolled
  ? "1px solid rgba(0,255,200,0.25)"
  : "1px solid transparent",

boxShadow: scrolled
  ? "0 8px 32px rgba(0, 255, 200, 0.18), inset 0 0 12px rgba(0,255,200,0.08)"
  : "none",

  transition:
    "background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border-bottom 0.4s ease",
}}
>
  <div className={`aqua-glow-wrapper ${scrolled ? "scrolled" : ""}`}>
        <div style={{  margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58 }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:36, height:36, background:'#2563eb', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(37,99,235,0.4)' }}>
                <ShieldCheckIcon style={{ width:20, height:20, color:'#fff' }} />
              </div>
              <span style={{ position:'absolute', top:-2, right:-2, width:9, height:9, background:'#22c55e', borderRadius:'50%', border:`2px solid ${dark?'#020617':'#fff'}`, animation:'dmsBlink 2s ease infinite' }} />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, color:dark?'#fff':'#111827', letterSpacing:'-0.3px', lineHeight:1.2 }}>DMS</div>
              <div style={{ fontSize:10, color:dark?'rgba(255,255,255,0.45)':'#9ca3af', letterSpacing:'0.8px', fontWeight:500 }}>Disaster Management</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="dms-desktop-nav" style={{ display:'flex', alignItems:'center', gap:2 }}>
            {navLinks.map(([n,h]) => (
              <a key={n} href={h}
                style={{ padding:'6px 14px', fontSize:13, fontWeight:500, color:dark?'rgba(255,255,255,0.78)':'#4b5563', borderRadius:8, textDecoration:'none', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background=dark?'rgba(255,255,255,0.1)':'#f3f4f6'; e.currentTarget.style.color=dark?'#fff':'#111' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=dark?'rgba(255,255,255,0.78)':'#4b5563' }}>
                {n}
              </a>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="dms-desktop-auth" style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="dms-btn-nav">Dashboard <ArrowRightIcon style={{ width:13, height:13 }} /></Link>
            ) : <>
              <Link to="/login" style={{ fontSize:13, fontWeight:600, color:dark?'#fff':'#374151', textDecoration:'none', padding:'8px 12px' }}>Log in</Link>
              <Link to="/register" className="dms-btn-nav">Get Started <ArrowRightIcon style={{ width:13, height:13 }} /></Link>
            </>}
          </div>

          {/* Hamburger */}
          <button className="dms-hamburger" onClick={() => setOpen(true)}
            style={{ background:'transparent', border:'none', cursor:'pointer', color:dark?'#fff':'#4b5563', padding:6, display:'none' }}>
            <Bars3Icon style={{ width:24, height:24 }} />
          </button>
        </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }} onClick={() => setOpen(false)} />
<motion.div
  initial={{ x: "100%", opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: "100%", opacity: 0 }}
  transition={{ type: "spring", stiffness: 120, damping: 20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #f3f4f6' }}>
              <span style={{ fontWeight:900, fontSize:15, color:'#111' }}>DMS</span>
              <button onClick={() => setOpen(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#6b7280' }}>
                <XMarkIcon style={{ width:22, height:22 }} />
              </button>
            </div>
            <nav style={{ flex:1, padding:'10px 12px' }}>
              {navLinks.map(([n,h]) => (
                <a key={n} href={h} onClick={() => setOpen(false)}
                  style={{ display:'block', padding:'11px 14px', fontSize:14, fontWeight:500, color:'#374151', borderRadius:9, textDecoration:'none', marginBottom:2 }}
                  onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {n}
                </a>
              ))}
            </nav>
            <div style={{ padding:'14px 16px', borderTop:'1px solid #f3f4f6', display:'flex', flexDirection:'column', gap:9 }}>
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} style={{ display:'flex', justifyContent:'center', gap:6, padding:'11px', background:'#2563eb', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none' }}>
                  Dashboard <ArrowRightIcon style={{ width:13, height:13, marginTop:2 }} />
                </Link>
              ) : <>
                <Link to="/login" onClick={() => setOpen(false)} style={{ display:'flex', justifyContent:'center', padding:'11px', border:'1.5px solid #e5e7eb', borderRadius:10, fontSize:13, fontWeight:600, color:'#374151', textDecoration:'none' }}>Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} style={{ display:'flex', justifyContent:'center', gap:6, padding:'11px', background:'#2563eb', borderRadius:10, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none' }}>
                  Get Started <ArrowRightIcon style={{ width:13, height:13, marginTop:2 }} />
                </Link>
              </>}
            </div>
            <div style={{ background:'#fff5f5', borderTop:'1px solid #fecaca', padding:'12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#dc2626', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Emergency</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[['National','112'],['Ambulance','108'],['Fire','101'],['Police','100']].map(([l,n]) => (
                  <a key={l} href={'tel:'+n} style={{ display:'flex', justifyContent:'space-between', background:'#fff', border:'1px solid #fecaca', borderRadius:7, padding:'7px 10px', textDecoration:'none' }}>
                    <span style={{ fontSize:10, color:'#6b7280' }}>{l}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:'#dc2626' }}>{n}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <main style={{ flex:1, width:'100%' }}>
        <Outlet />
      </main>

    
      {/* ══ ALL GLOBAL STYLES ══════════════════════════════════════ */}
      <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body, #root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }

        /* ── Keyframes ── */
        @keyframes dmsUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes dmsBlink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes dmsTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ── Ticker ── */
        .dms-ticker { animation: dmsTicker 50s linear infinite; }

        /* ── Reusable classes ── */
        .dms-inner { max-width: 1280px; margin: 0 auto; }
        .dms-h2    { font-size: 36px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 14px; }
        .dms-card  { background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); border-radius: 20px; padding: 26px; transition: all 0.3s; cursor: default; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .dms-card:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-color: rgba(255,255,255,0.8); }
        .dms-label { display: inline-block; font-size: 10px; font-weight: 700; padding: 5px 14px; border-radius: 100px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }
        .dms-label-blue { background: rgba(59,130,246,0.15); color: #1d4ed8; backdrop-filter: blur(4px); }

        /* ── Buttons ── */
        .dms-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #2563eb; color: #fff; padding: 13px 26px;
          border-radius: 11px; font-weight: 700; font-size: 14px;
          text-decoration: none; box-shadow: 0 6px 22px rgba(37,99,235,0.45);
          transition: all 0.18s;
        }
        .dms-btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

        .dms-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1.5px solid rgba(255,255,255,0.18); color: #e2e8f0;
          padding: 13px 26px; border-radius: 11px; font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.18s; backdrop-filter: blur(6px);
        }
        .dms-btn-outline:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

        .dms-btn-nav {
          display: flex; align-items: center; gap: 6px;
          background: #2563eb; color: #fff; padding: 8px 18px;
          border-radius: 9px; font-size: 13px; font-weight: 600;
          text-decoration: none; box-shadow: 0 3px 10px rgba(37,99,235,0.35);
          transition: background 0.15s;
        }
        .dms-btn-nav:hover { background: #1d4ed8; }

        .dms-cta-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #1d4ed8; padding: 14px 30px;
          border-radius: 12px; font-weight: 800; font-size: 14px;
          text-decoration: none; box-shadow: 0 8px 24px rgba(0,0,0,0.2); transition: all 0.18s;
        }
        .dms-cta-white:hover { background: #f0f9ff; transform: translateY(-2px); }

        .dms-cta-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          border: 2px solid rgba(255,255,255,0.3); color: #fff;
          padding: 14px 30px; border-radius: 12px; font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.18s;
        }
        .dms-cta-ghost:hover { border-color: rgba(255,255,255,0.65); background: rgba(255,255,255,0.08); }

        /* ── Responsive nav ── */
        .dms-desktop-nav  { display: flex !important; }
        .dms-desktop-auth { display: flex !important; }
        .dms-hamburger    { display: none !important; }

        @media (max-width: 1023px) {
          .dms-desktop-nav  { display: none !important; }
          .dms-desktop-auth { display: none !important; }
          .dms-hamburger    { display: block !important; }
        }

        /* ── Responsive grids — data-grid ACTUALLY WORKS NOW ── */
        @media (max-width: 1023px) {
          [data-grid="4"] { grid-template-columns: repeat(2,1fr) !important; }
          [data-grid="3"] { grid-template-columns: repeat(2,1fr) !important; }
          [data-grid="6"] { grid-template-columns: repeat(3,1fr) !important; }
          [data-grid="2"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          .dms-h2         { font-size: 30px !important; }
        }

        @media (max-width: 640px) {
          [data-grid="4"] { grid-template-columns: repeat(2,1fr) !important; }
          [data-grid="3"] { grid-template-columns: 1fr !important; }
          [data-grid="6"] { grid-template-columns: repeat(2,1fr) !important; }
          [data-grid="2"] { grid-template-columns: 1fr !important; }
          .dms-h2         { font-size: 26px !important; }
        }
      `}</style>
    </div>
  )
}