
import React, { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  ShieldCheckIcon, Bars3Icon, XMarkIcon, BellAlertIcon,
  ArrowRightIcon, PhoneIcon, UserGroupIcon, BuildingOfficeIcon,
  SignalIcon, MapPinIcon, ChartBarIcon, CloudIcon,
  CheckCircleIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// ─── HOOKS ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.08 })
    if (ref.current) o.observe(ref.current)
    return () => o.disconnect()
  }, [])
  return [ref, v]
}

function useClock() {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      setT(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])
  return t
}

function useSeismic() {
  const [s, setS] = useState({ total: null, sig: null })
  useEffect(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&starttime=${d.toISOString().split('T')[0]}&minlatitude=2&maxlatitude=38&minlongitude=60&maxlongitude=100&orderby=time&limit=100`)
      .then(r => r.json())
      .then(d => setS({ total: d.features?.length || 0, sig: d.features?.filter(f => f.properties.mag >= 6).length || 0 }))
      .catch(() => setS({ total: 24, sig: 3 }))
  }, [])
  return s
}

function useCounter(to) {
  const [c, setC] = useState(0)
  const [ref, v] = useReveal()
  useEffect(() => {
    if (!v || !to) return
    let n = 0; const step = Math.ceil(to / 80)
    const t = setInterval(() => { n += step; if (n >= to) { setC(to); clearInterval(t) } else setC(n) }, 20)
    return () => clearInterval(t)
  }, [v, to])
  return [ref, c]
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, v] = useReveal()
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(22px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

function CountNum({ to, suffix = '' }) {
  const [ref, c] = useCounter(to)
  return <span ref={ref}>{to == null ? '—' : c}{suffix}</span>
}

// ─── TICKER ───────────────────────────────────────────────────────
const TICK = '🔴 NDRF deployed in Assam flood relief  ·  ⚠️ IMD Orange Alert — coastal Karnataka  ·  🌀 Bay of Bengal cyclone watch active  ·  📡 USGS M5.2 Andaman — no tsunami threat  ·  🌧️ Mumbai IMD Yellow Alert — next 48 hours  ·  '

function Ticker() {
  return (
    <div style={{ width:'100%', background:'#111827', overflow:'hidden', whiteSpace:'nowrap', display:'flex', alignItems:'center', borderBottom:'1px solid #1e293b' }}>
      <span style={{ flexShrink:0, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:800, padding:'5px 12px', letterSpacing:2, zIndex:1 }}>LIVE</span>
      <span className="dms-ticker" style={{ display:'inline-block', fontSize:11, color:'#9ca3af', padding:'5px 16px' }}>{TICK}{TICK}</span>
    </div>
  )
}

// ─── DATA ─────────────────────────────────────────────────────────
const FEATURES = [
  { icon:SignalIcon,     c:'#2563eb', bg:'#eff6ff', t:'Real-Time Prediction',  d:'USGS seismic, Open-Meteo NWP, and GDACS cyclone data ingested every 30 minutes and scored against IMD/NDMA thresholds.' },
  { icon:BellAlertIcon, c:'#dc2626', bg:'#fef2f2', t:'Alert Broadcasting',    d:'Admins verify and broadcast alerts to citizens, NGOs, or rescue teams — instantly, with email delivery per user.' },
  { icon:UserGroupIcon, c:'#16a34a', bg:'#f0fdf4', t:'NGO Relief Network',    d:'NGOs post resource needs, accept donations of food/medicine/shelter, and coordinate with field rescue teams.' },
  { icon:MapPinIcon,    c:'#7c3aed', bg:'#f5f3ff', t:'Hazard Map Overlay',    d:'Live Leaflet maps — earthquake circles, flood zones, tsunami corridors, and cyclone tracks across India.' },
  { icon:ChartBarIcon,  c:'#d97706', bg:'#fffbeb', t:'Composite Risk Model',  d:'Flood 35% · Earthquake 28% · Cyclone 25% · Tsunami 12% — weighted scoring with IMD seasonal modifiers.' },
  { icon:CloudIcon,     c:'#0284c7', bg:'#f0f9ff', t:'7-Day Forecast',        d:'NWP forecast for India with IMD rainfall classification — Light, Heavy, Very Heavy, Extremely Heavy per day.' },
]

const STEPS = [
  { n:'01', t:'Data Ingestion',     d:'USGS FDSN, Open-Meteo & GDACS APIs queried every 30 min — seismic events, 7-day forecast, and tropical cyclone alerts.', c:'#3b82f6' },
  { n:'02', t:'Scientific Scoring', d:'IMD rainfall classes, USGS PAGER, and NDMA seasonal modifiers compute a composite 0–100 threat score.', c:'#f59e0b' },
  { n:'03', t:'Admin Verification', d:'Admins review the live threat dashboard, select recipients — all users, a city, specific NGOs — and broadcast.', c:'#22c55e' },
  { n:'04', t:'User Action',        d:'Citizens receive NEW badges + email. NGOs coordinate relief. Users submit emergency requests from their dashboard.', c:'#ef4444' },
]

const ROLES = [
  { name:'Citizen',           icon:UserGroupIcon,      accent:'#2563eb', feats:['Receive verified disaster alerts','Submit emergency help requests','View live hazard maps','Connect with local NGOs'], cta:'Register as Citizen', to:'/register' },
  { name:'NGO / Rescue Team', icon:BuildingOfficeIcon, accent:'#16a34a', feats:['Post resource requirements','Receive location-based alerts','Coordinate rescue operations','Track donation delivery'], cta:'Register as NGO', to:'/register' },
  { name:'Administrator',     icon:ShieldCheckIcon,    accent:'#dc2626', feats:['Monitor live prediction model','Broadcast alerts to any group','Manage users & NGOs','View full analytics'], cta:'Admin Login', to:'/login' },
]

const ALERT_LEVELS = [
  { level:'DANGER',  bg:'#dc2626', text:'M7.0+ · Rain ≥204mm/day · Active Cyclone' },
  { level:'WARNING', bg:'#ea580c', text:'M6.0+ · Rain ≥115mm/day · Severe Storm' },
  { level:'WATCH',   bg:'#ca8a04', text:'M5.0+ · Rain ≥64mm/day · High Winds' },
  { level:'INFO',    bg:'#2563eb', text:'M4.5+ · Rain ≥15mm/day · Advisory' },
]

const EMERGENCY = [['National','112'],['NDRF','24363260'],['Ambulance','108'],['Fire','101'],['Police','100'],['Disaster','1078']]
const FOOTER_EM = [['National Emergency','112'],['NDRF Helpline','24363260'],['Ambulance','108'],['Fire Service','101'],['Police','100'],['Disaster Helpline','1078']]
const SOURCES   = [
  { name:'USGS FDSN',  desc:'Earthquake Data',   c:'#d97706', bg:'#fffbeb', br:'#fde68a' },
  { name:'Open-Meteo', desc:'Weather NWP',        c:'#2563eb', bg:'#eff6ff', br:'#bfdbfe' },
  { name:'GDACS',      desc:'Cyclone Alerts',     c:'#dc2626', bg:'#fef2f2', br:'#fecaca' },
  { name:'IMD / NDMA', desc:'Indian Standards',   c:'#16a34a', bg:'#f0fdf4', br:'#bbf7d0' },
]
const STANDARDS = [
  { l:'IMD Rainfall Classes',  d:'Light (2.5mm) → Extremely Heavy (204.5mm/day)' },
  { l:'USGS Richter Scale',    d:'M4.5 Light → M7.0+ Major Earthquake' },
  { l:'IMD Cyclone Scale',     d:'Depression → Super Cyclonic Storm (SuCS)' },
  { l:'Tsunami Trigger Zones', d:'Andaman-Nicobar · Makran · Carlsberg Ridge' },
]

// ══════════════════════════════════════════════════════════════════
//  HOME PAGE (named export)
// ══════════════════════════════════════════════════════════════════
export function HomePage() {
  const clock   = useClock()
  const seismic = useSeismic()

  return (
    <div style={{ width:'100%', overflowX:'hidden' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ width:'100%', minHeight:'100vh', background:'#020617', display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, opacity:0.05, backgroundImage:'linear-gradient(rgba(96,165,250,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,0.6) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
        {/* Glows */}
        <div style={{ position:'absolute', top:'15%', left:'5%', width:600, height:600, borderRadius:'50%', background:'rgba(37,99,235,0.07)', filter:'blur(90px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'5%', width:500, height:500, borderRadius:'50%', background:'rgba(220,38,38,0.05)', filter:'blur(80px)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:1280, margin:'0 auto', padding:'100px 28px 72px' }}>
          {/* Live pill */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:9, background:'rgba(220,38,38,0.13)', border:'1px solid rgba(220,38,38,0.28)', borderRadius:100, padding:'7px 18px', marginBottom:28, animation:'dmsUp 0.5s ease both' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#ef4444', animation:'dmsBlink 1.5s ease infinite' }} />
            <span style={{ fontSize:10, color:'#fca5a5', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase' }}>Live Monitoring Active</span>
            <span style={{ fontSize:11, fontFamily:'monospace', color:'#4ade80', letterSpacing:'1px' }}>{clock} IST</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:'clamp(34px,5.5vw,68px)', fontWeight:900, color:'#fff', lineHeight:1.06, letterSpacing:'-1.5px', margin:'0 0 20px', animation:'dmsUp 0.6s 0.1s both' }}>
            India's Disaster<br />
            <span style={{ background:'linear-gradient(120deg,#60a5fa,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Intelligence System</span>
          </h1>

          <p style={{ fontSize:17, color:'#94a3b8', lineHeight:1.75, maxWidth:560, margin:'0 0 36px', animation:'dmsUp 0.6s 0.2s both' }}>
            Real-time earthquake, flood, and cyclone prediction powered by USGS, IMD, and GDACS.
            Verified alerts reach citizens, NGOs, and rescue teams in under 30 minutes.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:48, animation:'dmsUp 0.6s 0.3s both' }}>
            <Link to="/register" className="dms-btn-primary">Get Started Free <ArrowRightIcon style={{ width:15, height:15 }} /></Link>
            <Link to="/login" className="dms-btn-outline">Sign In</Link>
          </div>

          {/* Stat pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, animation:'dmsUp 0.6s 0.4s both' }}>
            {[
              { label:'Earthquakes this week (India)', val:seismic.total===null?'…':seismic.total, tc:'#93c5fd', bg:'rgba(37,99,235,0.1)', bc:'rgba(37,99,235,0.22)' },
              { label:'M6.0+ significant events',      val:seismic.sig===null?'…':seismic.sig,    tc:'#fca5a5', bg:'rgba(220,38,38,0.1)', bc:'rgba(220,38,38,0.22)' },
              { label:'Live data sources',              val:'3',                                    tc:'#86efac', bg:'rgba(34,197,94,0.1)', bc:'rgba(34,197,94,0.22)' },
            ].map(p => (
              <div key={p.label} style={{ display:'inline-flex', alignItems:'center', gap:10, background:p.bg, border:`1px solid ${p.bc}`, borderRadius:10, padding:'10px 16px' }}>
                <span style={{ fontSize:22, fontWeight:900, color:p.tc, lineHeight:1 }}>{p.val}</span>
                <span style={{ fontSize:11, color:'#94a3b8', lineHeight:1.4 }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section style={{ width:'100%', background:'#0f172a', borderTop:'1px solid #1e293b', borderBottom:'1px solid #1e293b' }}>
        {/* FIX: data-grid="4" attribute added so responsive CSS works */}
        <div className="dms-inner" data-grid="4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, padding:'52px 28px' }}>
          {[
            { val:1400, sfx:'+', label:'Disasters Monitored',  color:'#60a5fa' },
            { val:8500, sfx:'+', label:'Registered Users',     color:'#34d399' },
            { val:120,  sfx:'+', label:'NGO Partners',         color:'#fb923c' },
            { val:3200, sfx:'+', label:'Alerts Issued (2024)', color:'#f472b6' },
          ].map((s,i) => (
            <Reveal key={s.label} delay={i*70} style={{ textAlign:'center' }}>
              <div style={{ fontSize:44, fontWeight:900, color:s.color, lineHeight:1, marginBottom:8 }}><CountNum to={s.val} suffix={s.sfx} /></div>
              <div style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={{ width:'100%', padding:'88px 0', background:'#f8fafc' }}>
        <div className="dms-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px' }}>
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span className="dms-label dms-label-blue">Platform Features</span>
            <h2 className="dms-h2" style={{ color:'#111827' }}>Everything you need in a crisis</h2>
            <p style={{ fontSize:15, color:'#6b7280', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>Built on published IMD, NDMA, USGS and WMO standards — no inflated risk scores.</p>
          </Reveal>
          {/* FIX: data-grid="3" */}
          <div data-grid="3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {FEATURES.map((f,i) => (
              <Reveal key={f.t} delay={i*55}>
                <div className="dms-card" style={{ height:'100%' }}>
                  <div style={{ width:46, height:46, background:f.bg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <f.icon style={{ width:22, height:22, color:f.c }} />
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:9 }}>{f.t}</div>
                  <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.7 }}>{f.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="about" style={{ width:'100%', padding:'88px 0', background:'#020617' }}>
        <div className="dms-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px' }}>
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span className="dms-label" style={{ background:'rgba(37,99,235,0.15)', color:'#60a5fa' }}>How It Works</span>
            <h2 className="dms-h2" style={{ color:'#fff' }}>From raw data to life-saving action</h2>
            <p style={{ fontSize:15, color:'#475569', maxWidth:480, margin:'0 auto' }}>Four steps from satellite feed to verified alert delivery.</p>
          </Reveal>
          {/* FIX: data-grid="4" */}
          <div data-grid="4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, position:'relative' }}>
            <div style={{ position:'absolute', top:30, left:'12%', right:'12%', height:2, background:'linear-gradient(90deg,#3b82f6,#f59e0b,#22c55e,#ef4444)', opacity:0.22, zIndex:0 }} />
            {STEPS.map((s,i) => (
              <Reveal key={s.n} delay={i*90} style={{ position:'relative', zIndex:1 }}>
                <div style={{ background:'#0f172a', borderRadius:14, padding:'24px', borderTop:`3px solid ${s.c}`, border:`1px solid ${s.c}18`, borderTopWidth:3, height:'100%' }}>
                  <div style={{ fontSize:30, fontWeight:900, color:s.c, marginBottom:14 }}>{s.n}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:9 }}>{s.t}</div>
                  <div style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>{s.d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────────────── */}
      <section style={{ width:'100%', padding:'88px 0', background:'#fff' }}>
        <div className="dms-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px' }}>
          <Reveal style={{ textAlign:'center', marginBottom:52 }}>
            <span className="dms-label" style={{ background:'#dcfce7', color:'#15803d' }}>User Roles</span>
            <h2 className="dms-h2" style={{ color:'#111827' }}>Built for every stakeholder</h2>
            <p style={{ fontSize:15, color:'#6b7280', maxWidth:480, margin:'0 auto' }}>Three role types, each with a purpose-built dashboard and workflow.</p>
          </Reveal>
          {/* FIX: data-grid="3" */}
          <div data-grid="3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {ROLES.map((r,i) => (
              <Reveal key={r.name} delay={i*80}>
                <div style={{ borderRadius:18, border:`2px solid ${r.accent}20`, overflow:'hidden', display:'flex', flexDirection:'column', height:'100%', transition:'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor=r.accent+'55'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=r.accent+'20'}>
                  <div style={{ background:r.accent, padding:'22px 26px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:38, height:38, background:'rgba(255,255,255,0.18)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <r.icon style={{ width:20, height:20, color:'#fff' }} />
                    </div>
                    <span style={{ fontWeight:800, fontSize:15, color:'#fff' }}>{r.name}</span>
                  </div>
                  <div style={{ padding:'22px 26px', flex:1, display:'flex', flexDirection:'column', background:'#fff' }}>
                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 22px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                      {r.feats.map(f => (
                        <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          <div style={{ width:16, height:16, borderRadius:'50%', background:r.accent+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                            <CheckCircleIcon style={{ width:11, height:11, color:r.accent }} />
                          </div>
                          <span style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={r.to}
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'11px', borderRadius:10, border:`2px solid ${r.accent}`, color:r.accent, fontWeight:700, fontSize:13, textDecoration:'none', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background=r.accent; e.currentTarget.style.color='#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=r.accent }}>
                      {r.cta} <ArrowRightIcon style={{ width:13, height:13 }} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────── */}
      <section style={{ width:'100%', padding:'52px 0', background:'#f1f5f9', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}>
        <div className="dms-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px' }}>
          <Reveal style={{ textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'2px', textTransform:'uppercase' }}>Powered by trusted scientific data sources</p>
          </Reveal>
          {/* FIX: data-grid="4" */}
          <div data-grid="4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {SOURCES.map((s,i) => (
              <Reveal key={s.name} delay={i*55}>
                <div style={{ background:s.bg, border:`1px solid ${s.br}`, borderRadius:12, padding:'18px 22px', textAlign:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, marginBottom:5 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:s.c, display:'inline-block' }} />
                    <span style={{ fontSize:13, fontWeight:800, color:s.c }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize:11, color:s.c, opacity:0.65 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STANDARDS + ALERT REF ─────────────────────────────────── */}
      <section style={{ width:'100%', padding:'88px 0', background:'#fff' }}>
        {/* FIX: data-grid="2" */}
        <div className="dms-inner" data-grid="2" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'start' }}>
          <Reveal>
            <span className="dms-label dms-label-blue">Scientific Standards</span>
            <h2 style={{ fontSize:34, fontWeight:900, color:'#111827', lineHeight:1.12, margin:'16px 0 18px' }}>No guesswork.<br />Only verified thresholds.</h2>
            <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.8, marginBottom:24 }}>
              Every alert uses published IMD, USGS PAGER, and NDMA standards — not arbitrary multipliers.
              Seasonal modifiers adjust scores automatically.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {STANDARDS.map(item => (
                <div key={item.l} style={{ display:'flex', alignItems:'flex-start', gap:12, background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:11, padding:'13px 16px' }}>
                  <CheckCircleIcon style={{ width:16, height:16, color:'#22c55e', flexShrink:0, marginTop:2 }} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:3 }}>{item.l}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={130}>
            <div style={{ background:'#020617', borderRadius:18, padding:'26px', border:'1px solid #1e293b' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', animation:'dmsBlink 1.5s ease infinite' }} />
                <span style={{ fontSize:10, color:'#22c55e', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase' }}>Alert Level Reference</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {ALERT_LEVELS.map(a => (
                  <div key={a.level} style={{ display:'flex', alignItems:'center', gap:14, background:'#0f172a', borderRadius:11, padding:'14px 16px' }}>
                    <span style={{ background:a.bg, color:'#fff', fontSize:10, fontWeight:800, padding:'5px 14px', borderRadius:7, minWidth:76, textAlign:'center', flexShrink:0 }}>{a.level}</span>
                    <span style={{ fontSize:12, color:'#94a3b8' }}>{a.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:18, paddingTop:16, borderTop:'1px solid #1e293b', fontSize:11, color:'#334155', lineHeight:1.7 }}>
                Thresholds: IMD, USGS PAGER, NDMA India.<br />Seasonal modifiers per Indian disaster calendar.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── EMERGENCY ─────────────────────────────────────────────── */}
      <section id="contact" style={{ width:'100%', padding:'72px 0', background:'#7f1d1d' }}>
        <div className="dms-inner" style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px' }}>
          <Reveal style={{ textAlign:'center', marginBottom:36 }}>
            <ExclamationTriangleIcon style={{ width:36, height:36, color:'#fca5a5', margin:'0 auto 14px' }} />
            <h2 style={{ fontSize:30, fontWeight:900, color:'#fff', marginBottom:8 }}>Emergency Helplines</h2>
            <p style={{ color:'#fca5a5', fontSize:13 }}>Available 24 hours · 7 days a week · Toll free</p>
          </Reveal>
          {/* FIX: data-grid="6" */}
          <div data-grid="6" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, maxWidth:1000, margin:'0 auto' }}>
            {EMERGENCY.map(([l,n],i) => (
              <Reveal key={l} delay={i*40}>
                <a href={'tel:'+n}
                  style={{ display:'block', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:13, padding:'18px 12px', textAlign:'center', textDecoration:'none', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='none' }}>
                  <PhoneIcon style={{ width:18, height:18, color:'#fca5a5', margin:'0 auto 8px' }} />
                  <div style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:4 }}>{n}</div>
                  <div style={{ fontSize:10, color:'#fca5a5', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{l}</div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section style={{ width:'100%', padding:'88px 0', background:'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 28px', textAlign:'center' }}>
          <Reveal>
            <div style={{ width:60, height:60, background:'rgba(255,255,255,0.12)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <ShieldCheckIcon style={{ width:32, height:32, color:'#fff' }} />
            </div>
            <h2 style={{ fontSize:38, fontWeight:900, color:'#fff', letterSpacing:'-0.5px', marginBottom:16 }}>Register today.<br />Stay protected tomorrow.</h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.72)', lineHeight:1.75, maxWidth:460, margin:'0 auto 36px' }}>
              Join 8,500+ citizens, NGOs, and rescue teams already using DMS to stay ahead of India's most dangerous weather and seismic events.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:12 }}>
              <Link to="/register" className="dms-cta-white">Create Free Account <ArrowRightIcon style={{ width:15, height:15 }} /></Link>
              <Link to="/login" className="dms-cta-ghost">Sign In</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  MAIN LAYOUT (default export)
// ══════════════════════════════════════════════════════════════════
export default function MainLayout() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => setOpen(false), [location])

  const dark = isLanding && !scrolled

  const navLinks = [['Home','/'],['About','/#about'],['Features','/#features'],['Contact','/#contact']]

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', width:'100%' }}>

      {/* Alert bar */}
      <div style={{ width:'100%', background:'#b91c1c', color:'#fff', fontSize:11, fontWeight:600, padding:'5px 0', textAlign:'center', letterSpacing:0.3 }}>
        🔔 &nbsp; India Disaster Management System — 24/7 Monitoring &nbsp;|&nbsp; National Emergency: <strong>112</strong> &nbsp;|&nbsp; NDRF: <strong>011-24363260</strong>
      </div>

      {/* News ticker */}
      <Ticker />

      {/* Sticky header */}
      <header style={{
        position:'sticky', top:0, zIndex:100, width:'100%',
        background: dark ? 'rgba(2,6,23,0.85)' : '#fff',
        backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e5e7eb',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.09)' : 'none',
        transition:'background 0.25s, box-shadow 0.25s, border-color 0.25s',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58 }}>

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
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }} onClick={() => setOpen(false)} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            style={{ position:'absolute', top:0, right:0, bottom:0, width:300, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderLeft:'1px solid rgba(255,255,255,0.4)', display:'flex', flexDirection:'column', boxShadow:'-6px 0 40px rgba(0,0,0,0.2)' }}
          >
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

      {/* Footer */}
      <footer style={{ width:'100%', background:'#030712', color:'#fff' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'52px 28px 28px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:36, marginBottom:40 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, background:'#2563eb', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShieldCheckIcon style={{ width:20, height:20, color:'#fff' }} />
                </div>
                <div><div style={{ fontWeight:900, fontSize:14 }}>DMS India</div><div style={{ fontSize:10, color:'#4b5563', letterSpacing:1 }}>Disaster Management</div></div>
              </div>
              <p style={{ fontSize:12, color:'#6b7280', lineHeight:1.8, maxWidth:210 }}>India's integrated disaster prediction, early-warning, and relief coordination platform.</p>
              <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'dmsBlink 2s ease infinite' }} />
                <span style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>All systems operational</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:2, marginBottom:14 }}>Quick Links</div>
              {[['Home','/'],['About','/#about'],['Features','/#features'],['Dashboard','/dashboard'],['Register','/register']].map(([l,h]) => (
                <div key={l} style={{ marginBottom:9 }}>
                  <Link to={h} style={{ fontSize:12, color:'#6b7280', textDecoration:'none' }}
                    onMouseEnter={e => e.currentTarget.style.color='#fff'}
                    onMouseLeave={e => e.currentTarget.style.color='#6b7280'}>{l}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:2, marginBottom:14 }}>Emergency Contacts</div>
              {FOOTER_EM.map(([l,n]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:12, color:'#6b7280' }}>{l}</span>
                  <a href={'tel:'+n} style={{ fontSize:12, fontWeight:700, color:'#f87171', textDecoration:'none' }}>{n}</a>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:2, marginBottom:14 }}>Live Data Sources</div>
              {[['USGS FDSN','Seismic data'],['Open-Meteo','Weather NWP'],['GDACS','Cyclone alerts'],['IMD / NDMA','Indian standards']].map(([s,d]) => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', flexShrink:0 }} />
                  <div><div style={{ fontSize:12, fontWeight:600, color:'#d1d5db' }}>{s}</div><div style={{ fontSize:10, color:'#4b5563' }}>{d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'1px solid #111827', paddingTop:20, display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:11, color:'#374151' }}>© {new Date().getFullYear()} Disaster Management System — India. All rights reserved.</span>
            <span style={{ fontSize:11, color:'#374151' }}>Emergency? Call <strong style={{ color:'#f87171' }}>112</strong> immediately.</span>
          </div>
        </div>
      </footer>

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
































// import { createContext, useContext, useState, useEffect, useRef } from "react"

// // ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
// const AuthContext = createContext({ isAuthenticated: false, login: () => {}, logout: () => {} })

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login: () => setIsAuthenticated(true), logout: () => setIsAuthenticated(false) }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   return useContext(AuthContext)
// }

// // ─── ICONS (inline SVG replacements) ─────────────────────────────────────────
// const ShieldCheckIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
//   </svg>
// )
// const Bars3Icon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//   </svg>
// )
// const XMarkIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//   </svg>
// )
// const BellAlertIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
//   </svg>
// )
// const ArrowRightIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
//   </svg>
// )
// const UserGroupIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
//   </svg>
// )
// const BuildingOfficeIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
//   </svg>
// )
// const SignalIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
//   </svg>
// )
// const MapPinIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
//   </svg>
// )
// const ChartBarIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
//   </svg>
// )
// const CloudIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
//   </svg>
// )
// const CheckCircleIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// )
// const ExclamationTriangleIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//   </svg>
// )
// const GlobeAltIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
//   </svg>
// )
// const SparklesIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
//   </svg>
// )
// const BoltIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
//   </svg>
// )

// // ─── HOOKS ────────────────────────────────────────────────────────────────────
// function useReveal() {
//   const ref = useRef(null)
//   const [v, setV] = useState(false)
//   useEffect(() => {
//     const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.06 })
//     if (ref.current) o.observe(ref.current)
//     return () => o.disconnect()
//   }, [])
//   return [ref, v]
// }

// function useClock() {
//   const [t, setT] = useState('')
//   useEffect(() => {
//     const tick = () => {
//       const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
//       setT(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
//     }
//     tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
//   }, [])
//   return t
// }

// function useSeismic() {
//   const [s, setS] = useState({ total: null, sig: null })
//   useEffect(() => {
//     const d = new Date(); d.setDate(d.getDate() - 7)
//     fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&starttime=${d.toISOString().split('T')[0]}&minlatitude=2&maxlatitude=38&minlongitude=60&maxlongitude=100&orderby=time&limit=100`)
//       .then(r => r.json())
//       .then(d => setS({ total: d.features?.length || 0, sig: d.features?.filter(f => f.properties.mag >= 6).length || 0 }))
//       .catch(() => setS({ total: 24, sig: 3 }))
//   }, [])
//   return s
// }

// function useCounter(to) {
//   const [c, setC] = useState(0)
//   const [ref, v] = useReveal()
//   useEffect(() => {
//     if (!v || !to) return
//     let n = 0; const step = Math.ceil(to / 80)
//     const t = setInterval(() => { n += step; if (n >= to) { setC(to); clearInterval(t) } else setC(n) }, 20)
//     return () => clearInterval(t)
//   }, [v, to])
//   return [ref, c]
// }

// // ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
// function Reveal({ children, delay = 0, style = {} }) {
//   const [ref, v] = useReveal()
//   return (
//     <div ref={ref} style={{
//       opacity: v ? 1 : 0,
//       transform: v ? 'none' : 'translateY(28px)',
//       transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
//       ...style
//     }}>
//       {children}
//     </div>
//   )
// }

// function CountNum({ to, suffix = '' }) {
//   const [ref, c] = useCounter(to)
//   return <span ref={ref}>{to == null ? '—' : c}{suffix}</span>
// }

// // ─── TICKER ───────────────────────────────────────────────────────────────────
// const TICK_TEXT = '🔴 NDRF deployed in Assam flood relief  ·  ⚠️ IMD Orange Alert — coastal Karnataka  ·  🌀 Bay of Bengal cyclone watch active  ·  📡 USGS M5.2 Andaman — no tsunami threat  ·  🌧️ Mumbai IMD Yellow Alert — next 48 hours  ·  🔶 Odisha cyclone warning issued  ·  '

// function Ticker() {
//   return (
//     <div style={{ width: '100%', background: 'linear-gradient(90deg,#050b18,#060d1a)', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(30,45,69,0.8)' }}>
//       <span style={{ flexShrink: 0, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 9, fontWeight: 900, padding: '7px 16px', letterSpacing: 3, zIndex: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '4px 0 16px rgba(239,68,68,0.4)' }}>
//         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'dmsBlink 1s ease infinite' }} />
//         LIVE
//       </span>
//       <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
//         <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(90deg,#060d1a,transparent)', zIndex: 1, pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(270deg,#060d1a,transparent)', zIndex: 1, pointerEvents: 'none' }} />
//         <span className="dms-ticker" style={{ display: 'inline-block', fontSize: 11, color: '#6ea8d4', padding: '7px 24px', letterSpacing: '0.4px', fontWeight: 500 }}>
//           {TICK_TEXT}{TICK_TEXT}{TICK_TEXT}
//         </span>
//       </div>
//     </div>
//   )
// }

// // ─── DATA ─────────────────────────────────────────────────────────────────────
// const FEATURES = [
//   { Icon: SignalIcon,     c: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.15)', t: 'Real-Time Prediction',  d: 'USGS seismic, Open-Meteo NWP, and GDACS cyclone data ingested every 30 minutes — scored against IMD/NDMA thresholds.' },
//   { Icon: BellAlertIcon, c: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', glow: 'rgba(248,113,113,0.15)', t: 'Alert Broadcasting',    d: 'Admins verify and broadcast alerts to citizens, NGOs, or rescue teams instantly with email delivery per user.' },
//   { Icon: UserGroupIcon, c: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', glow: 'rgba(74,222,128,0.15)', t: 'NGO Relief Network',    d: 'NGOs post resource needs, accept donations of food/medicine/shelter, and coordinate with field rescue teams.' },
//   { Icon: MapPinIcon,    c: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.15)', t: 'Hazard Map Overlay',    d: 'Live Leaflet maps — earthquake circles, flood zones, tsunami corridors, and cyclone tracks across India.' },
//   { Icon: ChartBarIcon,  c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', glow: 'rgba(251,191,36,0.15)', t: 'Composite Risk Model',  d: 'Flood 35% · Earthquake 28% · Cyclone 25% · Tsunami 12% — weighted scoring with IMD seasonal modifiers.' },
//   { Icon: CloudIcon,     c: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)', glow: 'rgba(56,189,248,0.15)', t: '7-Day Forecast',        d: 'NWP forecast for India with IMD rainfall classification — Light, Heavy, Very Heavy, Extremely Heavy per day.' },
// ]

// const STEPS = [
//   { n: '01', t: 'Data Ingestion',     d: 'USGS FDSN, Open-Meteo & GDACS APIs queried every 30 min — seismic events, 7-day forecast, and tropical cyclone alerts.', c: '#3b82f6', Icon: GlobeAltIcon },
//   { n: '02', t: 'Scientific Scoring', d: 'IMD rainfall classes, USGS PAGER, and NDMA seasonal modifiers compute a composite 0–100 threat score.', c: '#f59e0b', Icon: SparklesIcon },
//   { n: '03', t: 'Admin Verification', d: 'Admins review the live threat dashboard, select recipients — all users, a city, specific NGOs — and broadcast.', c: '#22c55e', Icon: ShieldCheckIcon },
//   { n: '04', t: 'User Action',        d: 'Citizens receive NEW badges + email. NGOs coordinate relief. Users submit emergency requests from their dashboard.', c: '#ef4444', Icon: BoltIcon },
// ]

// const ROLES = [
//   { name: 'Citizen', Icon: UserGroupIcon, accent: '#3b82f6', accentDark: '#1d4ed8', feats: ['Receive verified disaster alerts','Submit emergency help requests','View live hazard maps','Connect with local NGOs'], cta: 'Register as Citizen', to: '/register', badge: 'Most Popular' },
//   { name: 'NGO / Rescue Team', Icon: BuildingOfficeIcon, accent: '#22c55e', accentDark: '#15803d', feats: ['Post resource requirements','Receive location-based alerts','Coordinate rescue operations','Track donation delivery'], cta: 'Register as NGO', to: '/register', badge: 'Field Ready' },
//   { name: 'Administrator', Icon: ShieldCheckIcon, accent: '#ef4444', accentDark: '#b91c1c', feats: ['Monitor live prediction model','Broadcast alerts to any group','Manage users & NGOs','View full analytics'], cta: 'Admin Login', to: '/login', badge: 'Full Access' },
// ]

// const ALERT_LEVELS = [
//   { level: 'DANGER',  icon: '🔴', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.35)', badge: '#dc2626', text: 'M7.0+ · Rain ≥204mm/day · Active Cyclone', bar: 100 },
//   { level: 'WARNING', icon: '🟠', bg: 'rgba(234,88,12,0.12)', border: 'rgba(234,88,12,0.35)', badge: '#ea580c', text: 'M6.0+ · Rain ≥115mm/day · Severe Storm', bar: 75 },
//   { level: 'WATCH',   icon: '🟡', bg: 'rgba(202,138,4,0.12)', border: 'rgba(202,138,4,0.35)', badge: '#ca8a04', text: 'M5.0+ · Rain ≥64mm/day · High Winds', bar: 50 },
//   { level: 'INFO',    icon: '🔵', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.35)', badge: '#2563eb', text: 'M4.5+ · Rain ≥15mm/day · Advisory', bar: 25 },
// ]

// const EMERGENCY = [
//   { label: 'National', num: '112', icon: '🆘', color: '#ef4444' },
//   { label: 'NDRF', num: '24363260', icon: '🛡️', color: '#f97316' },
//   { label: 'Ambulance', num: '108', icon: '🚑', color: '#22c55e' },
//   { label: 'Fire', num: '101', icon: '🚒', color: '#f59e0b' },
//   { label: 'Police', num: '100', icon: '🚔', color: '#3b82f6' },
//   { label: 'Disaster', num: '1078', icon: '☎️', color: '#a78bfa' },
// ]

// const FOOTER_EM = [['National Emergency','112'],['NDRF Helpline','24363260'],['Ambulance','108'],['Fire Service','101'],['Police','100'],['Disaster Helpline','1078']]

// const SOURCES = [
//   { name: 'USGS FDSN',  desc: 'Earthquake Data', c: '#fbbf24', icon: '🌍' },
//   { name: 'Open-Meteo', desc: 'Weather NWP',      c: '#38bdf8', icon: '🌤️' },
//   { name: 'GDACS',      desc: 'Cyclone Alerts',   c: '#f87171', icon: '🌀' },
//   { name: 'IMD / NDMA', desc: 'Indian Standards', c: '#4ade80', icon: '📡' },
// ]

// const STANDARDS = [
//   { l: 'IMD Rainfall Classes', d: 'Light (2.5mm) → Extremely Heavy (204.5mm/day)', icon: '🌧️' },
//   { l: 'USGS Richter Scale',   d: 'M4.5 Light → M7.0+ Major Earthquake', icon: '📊' },
//   { l: 'IMD Cyclone Scale',    d: 'Depression → Super Cyclonic Storm (SuCS)', icon: '🌀' },
//   { l: 'Tsunami Trigger Zones',d: 'Andaman-Nicobar · Makran · Carlsberg Ridge', icon: '🌊' },
// ]

// // ─── SIMPLE ROUTER (no react-router-dom dependency) ───────────────────────────
// const RouterContext = createContext({ path: '/', navigate: () => {} })

// function Router({ children }) {
//   const [path, setPath] = useState(window.location.pathname || '/')
//   const navigate = (to) => {
//     window.history.pushState({}, '', to)
//     setPath(to)
//   }
//   useEffect(() => {
//     const handler = () => setPath(window.location.pathname)
//     window.addEventListener('popstate', handler)
//     return () => window.removeEventListener('popstate', handler)
//   }, [])
//   return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
// }

// function Link({ to, children, style, className, onMouseEnter, onMouseLeave, onClick }) {
//   const { navigate } = useContext(RouterContext)
//   const handleClick = (e) => {
//     e.preventDefault()
//     if (onClick) onClick()
//     navigate(to)
//   }
//   return <a href={to} onClick={handleClick} style={style} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</a>
// }

// function useLocation() {
//   return useContext(RouterContext)
// }

// // ─── PLACEHOLDER PAGE ─────────────────────────────────────────────────────────
// function PlaceholderPage({ title }) {
//   return (
//     <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060d1a' }}>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
//         <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e8f0fe', marginBottom: 8 }}>{title}</h2>
//         <p style={{ color: '#4a6080', fontSize: 14 }}>This page is under construction.</p>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  HOME PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// function HomePage() {
//   const clock   = useClock()
//   const seismic = useSeismic()
//   const [activeStep, setActiveStep] = useState(0)

//   useEffect(() => {
//     const id = setInterval(() => setActiveStep(p => (p + 1) % 4), 3000)
//     return () => clearInterval(id)
//   }, [])

//   return (
//     <div style={{ width: '100%', overflowX: 'hidden' }}>

//       {/* HERO */}
//       <section style={{ width: '100%', minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
//         <div className="dms-grid-bg" />
//         <div style={{ position: 'absolute', top: '5%', left: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 65%)', pointerEvents: 'none', animation: 'dmsFloat 8s ease-in-out infinite' }} />
//         <div style={{ position: 'absolute', bottom: '0%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(220,38,38,0.1) 0%,transparent 65%)', pointerEvents: 'none', animation: 'dmsFloat 10s ease-in-out infinite reverse' }} />
//         <div style={{ position: 'absolute', top: '40%', left: '45%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 60%)', pointerEvents: 'none', animation: 'dmsFloat 12s ease-in-out infinite 2s' }} />
//         {[...Array(6)].map((_, i) => (
//           <div key={i} style={{ position: 'absolute', width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 4 : 3, borderRadius: '50%', background: ['#3b82f6','#22c55e','#ef4444','#f59e0b','#a78bfa','#38bdf8'][i], top: `${15 + i * 13}%`, left: `${10 + i * 14}%`, opacity: 0.6, animation: `dmsFloat ${6 + i}s ease-in-out infinite ${i * 0.5}s`, boxShadow: `0 0 12px ${['#3b82f6','#22c55e','#ef4444','#f59e0b','#a78bfa','#38bdf8'][i]}` }} />
//         ))}

//         <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '130px 32px 90px' }}>
//           <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, padding: '9px 22px', marginBottom: 36, animation: 'dmsUp 0.5s ease both', backdropFilter: 'blur(12px)', boxShadow: '0 0 32px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
//             <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'dmsBlink 1.2s ease infinite', boxShadow: '0 0 10px rgba(239,68,68,0.9), 0 0 20px rgba(239,68,68,0.4)' }} />
//             <span style={{ fontSize: 10, color: '#fca5a5', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Live Monitoring Active</span>
//             <span style={{ width: 1, height: 14, background: 'rgba(239,68,68,0.25)' }} />
//             <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4ade80', letterSpacing: '1.5px', fontWeight: 700 }}>{clock} IST</span>
//           </div>

//           <h1 style={{ fontSize: 'clamp(40px,6.5vw,80px)', fontWeight: 900, color: '#f0f6ff', lineHeight: 1.02, letterSpacing: '-3px', margin: '0 0 28px', animation: 'dmsUp 0.65s 0.08s both' }}>
//             India's Disaster<br />
//             <span className="dms-gradient-text">Intelligence System</span>
//           </h1>

//           <p style={{ fontSize: 19, color: '#6b9cc0', lineHeight: 1.85, maxWidth: 600, margin: '0 0 44px', animation: 'dmsUp 0.65s 0.16s both', fontWeight: 400 }}>
//             Real-time earthquake, flood, and cyclone prediction powered by <strong style={{ color: '#93c5fd', fontWeight: 600 }}>USGS</strong>, <strong style={{ color: '#86efac', fontWeight: 600 }}>IMD</strong>, and <strong style={{ color: '#fca5a5', fontWeight: 600 }}>GDACS</strong>.
//             Verified alerts reach citizens, NGOs, and rescue teams in under 30 minutes.
//           </p>

//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 64, animation: 'dmsUp 0.65s 0.24s both' }}>
//             <Link to="/register" className="dms-btn-primary">
//               <span>Get Started Free</span>
//               <ArrowRightIcon style={{ width: 16, height: 16 }} />
//             </Link>
//             <Link to="/login" className="dms-btn-outline">Sign In</Link>
//             <a href="#features" className="dms-btn-ghost">Explore Features</a>
//           </div>

//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, animation: 'dmsUp 0.65s 0.32s both' }}>
//             {[
//               { label: 'Earthquakes this week',   val: seismic.total === null ? '…' : seismic.total, tc: '#93c5fd', bg: 'rgba(37,99,235,0.1)', bc: 'rgba(37,99,235,0.25)', dot: '#3b82f6' },
//               { label: 'M6.0+ significant events', val: seismic.sig === null ? '…' : seismic.sig,   tc: '#fca5a5', bg: 'rgba(220,38,38,0.1)', bc: 'rgba(220,38,38,0.25)', dot: '#ef4444' },
//               { label: 'Live data pipelines',       val: '4',                                         tc: '#86efac', bg: 'rgba(34,197,94,0.1)', bc: 'rgba(34,197,94,0.25)', dot: '#22c55e' },
//             ].map(p => (
//               <div key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: p.bg, border: `1px solid ${p.bc}`, borderRadius: 16, padding: '14px 20px', backdropFilter: 'blur(12px)', boxShadow: `0 0 24px ${p.bc}, inset 0 1px 0 rgba(255,255,255,0.04)`, transition: 'transform 0.2s', cursor: 'default' }}
//                 onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
//                 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                 <div>
//                   <div style={{ fontSize: 28, fontWeight: 900, color: p.tc, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.val}</div>
//                   <div style={{ fontSize: 11, color: '#5a8098', marginTop: 2 }}>{p.label}</div>
//                 </div>
//                 <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.dot}18`, border: `1px solid ${p.dot}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.dot, boxShadow: `0 0 8px ${p.dot}`, animation: 'dmsBlink 2s ease infinite' }} />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div style={{ marginTop: 72, display: 'flex', alignItems: 'center', gap: 12, animation: 'dmsUp 0.65s 0.4s both' }}>
//             <div style={{ width: 20, height: 32, border: '2px solid rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4 }}>
//               <div style={{ width: 4, height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 2, animation: 'dmsScroll 2s ease infinite' }} />
//             </div>
//             <span style={{ fontSize: 11, color: '#3a5068', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Scroll to explore</span>
//           </div>
//         </div>
//       </section>

//       {/* STATS BANNER */}
//       <section style={{ width: '100%', background: 'linear-gradient(180deg,#060d1a 0%,#0a1628 100%)', borderTop: '1px solid rgba(30,45,69,0.6)', borderBottom: '1px solid rgba(30,45,69,0.6)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(37,99,235,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }} data-grid="4">
//           {[
//             { val: 1400, sfx: '+', label: 'Disasters Monitored', color: '#60a5fa', sub: 'Since 2020', icon: '📊' },
//             { val: 8500, sfx: '+', label: 'Registered Users',    color: '#34d399', sub: 'Across India', icon: '👥' },
//             { val: 120,  sfx: '+', label: 'NGO Partners',        color: '#fb923c', sub: 'Active Network', icon: '🤝' },
//             { val: 3200, sfx: '+', label: 'Alerts Issued',       color: '#f472b6', sub: 'In 2024', icon: '🔔' },
//           ].map((s, i) => (
//             <Reveal key={s.label} delay={i * 80} style={{ textAlign: 'center', padding: '56px 28px', borderRight: i < 3 ? '1px solid rgba(30,45,69,0.6)' : 'none', position: 'relative' }}>
//               <div style={{ fontSize: 13, marginBottom: 12 }}>{s.icon}</div>
//               <div style={{ fontSize: 52, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${s.color}40` }}>
//                 <CountNum to={s.val} suffix={s.sfx} />
//               </div>
//               <div style={{ fontSize: 13, color: '#cdd9f0', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
//               <div style={{ fontSize: 11, color: '#3a5068', fontWeight: 500 }}>{s.sub}</div>
//             </Reveal>
//           ))}
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section id="features" style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-blue">✦ Platform Features</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>Everything you need in a crisis</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
//               Built on published IMD, NDMA, USGS and WMO standards — no inflated risk scores.
//             </p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-grid="3">
//             {FEATURES.map((f, i) => (
//               <Reveal key={f.t} delay={i * 60}>
//                 <div className="dms-feat-card" style={{ '--feat-c': f.c, '--feat-glow': f.glow }}>
//                   <div style={{ width: 54, height: 54, background: f.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1px solid ${f.border}`, boxShadow: `0 0 24px ${f.glow}`, position: 'relative' }}>
//                     <f.Icon style={{ width: 26, height: 26, color: f.c }} />
//                   </div>
//                   <div style={{ fontSize: 15, fontWeight: 700, color: '#e8f0fe', marginBottom: 12, letterSpacing: '-0.2px' }}>{f.t}</div>
//                   <div style={{ fontSize: 13, color: '#4a6080', lineHeight: 1.8 }}>{f.d}</div>
//                   <div className="dms-feat-card-hover-line" style={{ background: f.c }} />
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="about" style={{ width: '100%', padding: '110px 0', background: '#040b14', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-blue">⚡ How It Works</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>From raw data to life-saving action</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>Four steps from satellite feed to verified alert delivery.</p>
//           </Reveal>

//           <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48, flexWrap: 'wrap' }}>
//             {STEPS.map((s, i) => (
//               <button key={s.n} onClick={() => setActiveStep(i)} style={{ padding: '8px 20px', borderRadius: 100, border: '1px solid', borderColor: activeStep === i ? s.c : 'rgba(30,45,69,0.8)', background: activeStep === i ? `${s.c}18` : 'transparent', color: activeStep === i ? s.c : '#3a5068', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', letterSpacing: '0.3px' }}>
//                 {s.n} {s.t}
//               </button>
//             ))}
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, position: 'relative' }} data-grid="4">
//             <div style={{ position: 'absolute', top: 44, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#3b82f6,#f59e0b,#22c55e,#ef4444)', opacity: 0.2, zIndex: 0, borderRadius: 2 }} />
//             {STEPS.map((s, i) => (
//               <Reveal key={s.n} delay={i * 100} style={{ position: 'relative', zIndex: 1 }}>
//                 <div onClick={() => setActiveStep(i)} style={{ background: activeStep === i ? `linear-gradient(160deg,${s.c}12,${s.c}06)` : '#0c1832', borderRadius: 20, padding: '32px 26px', border: `1px solid ${activeStep === i ? s.c + '40' : 'rgba(30,45,69,0.8)'}`, borderTop: `3px solid ${activeStep === i ? s.c : s.c + '30'}`, height: '100%', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', transform: activeStep === i ? 'translateY(-6px)' : 'none', boxShadow: activeStep === i ? `0 24px 48px ${s.c}18, 0 0 0 1px ${s.c}20` : 'none' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.c}15`, border: `1px solid ${s.c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
//                     <s.Icon style={{ width: 22, height: 22, color: s.c }} />
//                   </div>
//                   <div style={{ fontSize: 36, fontWeight: 900, color: activeStep === i ? s.c : s.c + '40', marginBottom: 14, fontVariantNumeric: 'tabular-nums', lineHeight: 1, transition: 'color 0.3s' }}>{s.n}</div>
//                   <div style={{ fontSize: 14, fontWeight: 700, color: activeStep === i ? '#e8f0fe' : '#5a7898', marginBottom: 10, transition: 'color 0.3s' }}>{s.t}</div>
//                   <div style={{ fontSize: 12, color: '#3a5068', lineHeight: 1.8 }}>{s.d}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ROLES */}
//       <section style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(74,222,128,0.3),transparent)' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-green">👥 User Roles</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>Built for every stakeholder</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>Three role types, each with a purpose-built dashboard and workflow.</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-grid="3">
//             {ROLES.map((r, i) => (
//               <Reveal key={r.name} delay={i * 90}>
//                 <div className="dms-role-card" style={{ '--role-accent': r.accent }}>
//                   <div style={{ padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
//                     <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${r.accent}20,${r.accentDark}10)`, borderBottom: `1px solid ${r.accent}20` }} />
//                     <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${r.accent}15,transparent 70%)` }} />
//                     <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//                         <div style={{ width: 48, height: 48, background: `${r.accent}20`, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.accent}30`, boxShadow: `0 0 24px ${r.accent}20` }}>
//                           <r.Icon style={{ width: 24, height: 24, color: r.accent }} />
//                         </div>
//                         <div>
//                           <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f6ff', letterSpacing: '-0.3px' }}>{r.name}</div>
//                           <div style={{ fontSize: 10, color: r.accent, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>{r.badge}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
//                     <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
//                       {r.feats.map(f => (
//                         <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
//                           <div style={{ width: 20, height: 20, borderRadius: 6, background: `${r.accent}15`, border: `1px solid ${r.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
//                             <CheckCircleIcon style={{ width: 12, height: 12, color: r.accent }} />
//                           </div>
//                           <span style={{ fontSize: 13, color: '#7aa3c8', lineHeight: 1.6 }}>{f}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <Link to={r.to} className="dms-role-btn" style={{ '--rb-c': r.accent, '--rb-bg': `${r.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 13, border: `1.5px solid ${r.accent}`, color: r.accent, fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'all 0.2s', background: `${r.accent}15`, letterSpacing: '-0.1px' }}>
//                       {r.cta}
//                       <ArrowRightIcon style={{ width: 15, height: 15, flexShrink: 0 }} />
//                     </Link>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* DATA SOURCES */}
//       <section style={{ width: '100%', padding: '64px 0', background: '#040b14', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%,rgba(37,99,235,0.05) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 36 }}>
//             <p style={{ fontSize: 11, fontWeight: 800, color: '#2a3d52', letterSpacing: '3px', textTransform: 'uppercase' }}>Powered by trusted scientific data sources</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} data-grid="4">
//             {SOURCES.map((s, i) => (
//               <Reveal key={s.name} delay={i * 60}>
//                 <div className="dms-source-card" style={{ '--src-c': s.c }}>
//                   <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
//                     <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.c, display: 'inline-block', boxShadow: `0 0 8px ${s.c}, 0 0 16px ${s.c}50`, animation: 'dmsBlink 2s ease infinite' }} />
//                     <span style={{ fontSize: 14, fontWeight: 800, color: s.c, letterSpacing: '-0.2px' }}>{s.name}</span>
//                   </div>
//                   <div style={{ fontSize: 11, color: s.c + 'aa', letterSpacing: '0.5px', fontWeight: 500 }}>{s.desc}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* STANDARDS + ALERT REF */}
//       <section style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }} data-grid="2">
//           <Reveal>
//             <span className="dms-chip dms-chip-blue">🔬 Scientific Standards</span>
//             <h2 style={{ fontSize: 38, fontWeight: 900, color: '#f0f6ff', lineHeight: 1.08, margin: '20px 0 16px', letterSpacing: '-1px' }}>
//               No guesswork.<br />
//               <span className="dms-gradient-text" style={{ fontSize: '0.9em' }}>Only verified thresholds.</span>
//             </h2>
//             <p style={{ fontSize: 14, color: '#4a6080', lineHeight: 1.9, marginBottom: 32 }}>
//               Every alert uses published IMD, USGS PAGER, and NDMA standards — not arbitrary multipliers. Seasonal modifiers adjust scores automatically.
//             </p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//               {STANDARDS.map((item, i) => (
//                 <Reveal key={item.l} delay={i * 70}>
//                   <div className="dms-standard-item">
//                     <div style={{ fontSize: 20, flexShrink: 0, width: 40, textAlign: 'center' }}>{item.icon}</div>
//                     <div>
//                       <div style={{ fontSize: 13, fontWeight: 700, color: '#cdd9f0', marginBottom: 4 }}>{item.l}</div>
//                       <div style={{ fontSize: 12, color: '#3a5068', lineHeight: 1.6 }}>{item.d}</div>
//                     </div>
//                   </div>
//                 </Reveal>
//               ))}
//             </div>
//           </Reveal>

//           <Reveal delay={150}>
//             <div style={{ background: '#040b14', borderRadius: 24, padding: '32px', border: '1px solid rgba(30,45,69,0.8)', boxShadow: '0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
//                 <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.8)', animation: 'dmsBlink 1.5s ease infinite' }} />
//                 <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Alert Level Reference</span>
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {ALERT_LEVELS.map(a => (
//                   <div key={a.level} style={{ background: a.bg, borderRadius: 14, padding: '16px 20px', border: `1px solid ${a.border}`, transition: 'all 0.2s', cursor: 'default' }}
//                     onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
//                     onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
//                       <span style={{ fontSize: 14 }}>{a.icon}</span>
//                       <span style={{ background: a.badge, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 14px', borderRadius: 8, letterSpacing: '1px', boxShadow: `0 4px 12px ${a.badge}50` }}>{a.level}</span>
//                       <span style={{ fontSize: 12, color: '#7aa3c8', flex: 1 }}>{a.text}</span>
//                     </div>
//                     <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
//                       <div style={{ height: '100%', width: `${a.bar}%`, background: a.badge, borderRadius: 2, boxShadow: `0 0 8px ${a.badge}80`, transition: 'width 1s ease' }} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(30,45,69,0.8)', fontSize: 11, color: '#2a3d52', lineHeight: 1.9 }}>
//                 Thresholds: IMD, USGS PAGER, NDMA India.<br />Seasonal modifiers per Indian disaster calendar.
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* EMERGENCY */}
//       <section id="contact" style={{ width: '100%', padding: '96px 0', background: 'linear-gradient(160deg,#1a0404 0%,#2d0606 30%,#4a0404 60%,#2d0606 100%)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(220,38,38,0.08) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(220,38,38,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 52 }}>
//             <div style={{ width: 72, height: 72, background: 'rgba(239,68,68,0.15)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 40px rgba(239,68,68,0.12)', backdropFilter: 'blur(8px)', animation: 'dmsFloat 4s ease-in-out infinite' }}>
//               <ExclamationTriangleIcon style={{ width: 36, height: 36, color: '#fca5a5' }} />
//             </div>
//             <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.8px' }}>Emergency Helplines</h2>
//             <p style={{ color: 'rgba(252,165,165,0.7)', fontSize: 14, letterSpacing: '0.3px' }}>Available 24 hours · 7 days a week · Toll free across India</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, maxWidth: 1080, margin: '0 auto' }} data-grid="6">
//             {EMERGENCY.map((e, i) => (
//               <Reveal key={e.label} delay={i * 45}>
//                 <a href={`tel:${e.num}`} className="dms-emergency-card" style={{ '--em-c': e.color }}>
//                   <div style={{ fontSize: 28, marginBottom: 10 }}>{e.icon}</div>
//                   <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{e.num}</div>
//                   <div style={{ fontSize: 10, color: e.color + 'cc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{e.label}</div>
//                   <div style={{ marginTop: 12, height: 2, background: e.color + '30', borderRadius: 1 }}>
//                     <div style={{ height: '100%', width: 0, background: e.color, borderRadius: 1, transition: 'width 0.3s ease' }} className="dms-em-bar" />
//                   </div>
//                 </a>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FINAL CTA */}
//       <section style={{ width: '100%', padding: '110px 0', background: 'linear-gradient(160deg,#0a1635 0%,#0f2060 30%,#1a3a8a 65%,#1a4fd6 100%)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
//           <Reveal>
//             <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', boxShadow: '0 0 48px rgba(255,255,255,0.08)', animation: 'dmsFloat 6s ease-in-out infinite' }}>
//               <ShieldCheckIcon style={{ width: 42, height: 42, color: '#fff' }} />
//             </div>
//             <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1 }}>
//               Register today.<br />
//               <span style={{ opacity: 0.8 }}>Stay protected tomorrow.</span>
//             </h2>
//             <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, maxWidth: 500, margin: '0 auto 48px' }}>
//               Join <strong style={{ color: '#fff' }}>8,500+</strong> citizens, NGOs, and rescue teams already using DMS to stay ahead of India's most dangerous weather and seismic events.
//             </p>
//             <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
//               <Link to="/register" className="dms-cta-white">
//                 Create Free Account
//                 <ArrowRightIcon style={{ width: 16, height: 16 }} />
//               </Link>
//               <Link to="/login" className="dms-cta-ghost">Sign In</Link>
//             </div>
//             <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
//               {['No credit card required', 'Instant access', 'Free forever for citizens'].map(t => (
//                 <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <CheckCircleIcon style={{ width: 15, height: 15, color: '#86efac' }} />
//                   <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{t}</span>
//                 </div>
//               ))}
//             </div>
//           </Reveal>
//         </div>
//       </section>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  MAIN LAYOUT
// // ══════════════════════════════════════════════════════════════════════════════
// function MainLayout({ children, currentPath }) {
//   const { isAuthenticated } = useAuth()
//   const { navigate } = useLocation()
//   const [open, setOpen]       = useState(false)
//   const [scrolled, setScrolled] = useState(false)
//   const [scrollPct, setScrollPct] = useState(0)
//   const isLanding = currentPath === '/'

//   useEffect(() => {
//     const fn = () => {
//       setScrolled(window.scrollY > 8)
//       const total = document.body.scrollHeight - window.innerHeight
//       setScrollPct(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0)
//     }
//     window.addEventListener('scroll', fn)
//     return () => window.removeEventListener('scroll', fn)
//   }, [])

//   useEffect(() => setOpen(false), [currentPath])

//   const dark = isLanding && !scrolled
//   const navLinks = [['Home', '/'], ['About', '/#about'], ['Features', '/#features'], ['Contact', '/#contact']]

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

//       {/* TOP ALERT BAR */}
//       <div style={{ width: '100%', background: 'linear-gradient(90deg,#7f1d1d,#991b1b,#b91c1c,#991b1b,#7f1d1d)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '7px 0', textAlign: 'center', letterSpacing: '0.4px', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)', pointerEvents: 'none' }} />
//         <span style={{ position: 'relative' }}>🔔 &nbsp; India Disaster Management System — 24/7 Monitoring &nbsp;|&nbsp; National Emergency: <strong style={{ color: '#fca5a5' }}>112</strong> &nbsp;|&nbsp; NDRF: <strong style={{ color: '#fca5a5' }}>011-24363260</strong></span>
//       </div>

//       <Ticker />

//       {/* STICKY HEADER */}
//       <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', background: dark ? 'rgba(2,8,23,0.82)' : 'rgba(4,11,20,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(30,45,69,0.8)', boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none', transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease' }}>
//         <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${scrollPct}%`, background: 'linear-gradient(90deg,#3b82f6,#22c55e)', transition: 'width 0.1s', zIndex: 1 }} />

//         <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
//           <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
//             <div style={{ position: 'relative' }}>
//               <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(37,99,235,0.5)', transition: 'transform 0.2s' }}
//                 onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05) rotate(-2deg)')}
//                 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                 <ShieldCheckIcon style={{ width: 22, height: 22, color: '#fff' }} />
//               </div>
//               <span style={{ position: 'absolute', top: -3, right: -3, width: 11, height: 11, background: '#22c55e', borderRadius: '50%', border: '2px solid #040b14', animation: 'dmsBlink 2s ease infinite', boxShadow: '0 0 8px rgba(34,197,94,0.7)' }} />
//             </div>
//             <div>
//               <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f6ff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>DMS</div>
//               <div style={{ fontSize: 9.5, color: '#2a3d52', letterSpacing: '1.5px', fontWeight: 600, textTransform: 'uppercase' }}>Disaster Management</div>
//             </div>
//           </Link>

//           <nav className="dms-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {navLinks.map(([n, h]) => (
//               <a key={n} href={h} className="dms-nav-link">{n}</a>
//             ))}
//           </nav>

//           <div className="dms-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             {isAuthenticated ? (
//               <Link to="/dashboard" className="dms-btn-nav" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.15s' }}>
//                 Dashboard <ArrowRightIcon style={{ width: 14, height: 14 }} />
//               </Link>
//             ) : (
//               <>
//                 <Link to="/login" className="dms-nav-link">Log in</Link>
//                 <Link to="/register" className="dms-btn-nav" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.15s' }}>
//                   Get Started <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                 </Link>
//               </>
//             )}
//           </div>

//           <button className="dms-hamburger" onClick={() => setOpen(true)}
//             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: '#7aa3c8', padding: '8px', display: 'none', transition: 'all 0.15s' }}
//             onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
//             onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
//             <Bars3Icon style={{ width: 22, height: 22 }} />
//           </button>
//         </div>
//       </header>

//       {/* MOBILE DRAWER */}
//       {open && (
//         <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
//           <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(12px)' }} onClick={() => setOpen(false)} />
//           <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, background: '#060d1a', borderLeft: '1px solid rgba(30,45,69,0.8)', display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 64px rgba(0,0,0,0.6)', animation: 'dmsSlideIn 0.35s ease' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(30,45,69,0.8)', background: 'rgba(4,11,20,0.5)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <ShieldCheckIcon style={{ width: 18, height: 18, color: '#fff' }} />
//                 </div>
//                 <span style={{ fontWeight: 900, fontSize: 15, color: '#f0f6ff' }}>DMS</span>
//               </div>
//               <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: '#4a6080', padding: 6 }}>
//                 <XMarkIcon style={{ width: 20, height: 20 }} />
//               </button>
//             </div>

//             <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
//               {navLinks.map(([n, h]) => (
//                 <a key={n} href={h} onClick={() => setOpen(false)}
//                   style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', fontSize: 14, fontWeight: 600, color: '#7aa3c8', borderRadius: 12, textDecoration: 'none', marginBottom: 4, transition: 'all 0.15s' }}
//                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f6ff' }}
//                   onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7aa3c8' }}>
//                   <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', opacity: 0.5 }} />
//                   {n}
//                 </a>
//               ))}
//             </nav>

//             <div style={{ padding: '16px', borderTop: '1px solid rgba(30,45,69,0.8)', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(4,11,20,0.3)' }}>
//               {isAuthenticated ? (
//                 <Link to="/dashboard" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, padding: '13px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
//                   Dashboard <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                 </Link>
//               ) : (
//                 <>
//                   <Link to="/login" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', padding: '13px', border: '1px solid rgba(30,45,69,0.8)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#7aa3c8', textDecoration: 'none' }}>Log in</Link>
//                   <Link to="/register" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, padding: '13px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
//                     Get Started <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                   </Link>
//                 </>
//               )}
//             </div>

//             <div style={{ background: 'rgba(74,4,4,0.5)', borderTop: '1px solid rgba(127,29,29,0.4)', padding: '16px' }}>
//               <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>⚠ Emergency Contacts</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
//                 {[['🆘 National', '112'], ['🚑 Ambulance', '108'], ['🚒 Fire', '101'], ['🚔 Police', '100']].map(([l, n]) => (
//                   <a key={l} href={`tel:${n}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 12px', textDecoration: 'none', transition: 'all 0.15s' }}
//                     onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
//                     onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.1)')}>
//                     <span style={{ fontSize: 11, color: '#7aa3c8', fontWeight: 500 }}>{l}</span>
//                     <span style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{n}</span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <main style={{ flex: 1, width: '100%' }}>{children}</main>

//       {/* FOOTER */}
//       <footer style={{ width: '100%', background: 'linear-gradient(180deg,#020817,#010610)', color: '#fff', borderTop: '1px solid rgba(30,45,69,0.6)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,99,235,0.4),transparent)' }} />
//         <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 32px 36px' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 48, marginBottom: 56 }}>
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
//                 <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(37,99,235,0.4)' }}>
//                   <ShieldCheckIcon style={{ width: 22, height: 22, color: '#fff' }} />
//                 </div>
//                 <div>
//                   <div style={{ fontWeight: 900, fontSize: 16, color: '#f0f6ff', letterSpacing: '-0.3px' }}>DMS India</div>
//                   <div style={{ fontSize: 9.5, color: '#2a3d52', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Disaster Management</div>
//                 </div>
//               </div>
//               <p style={{ fontSize: 12, color: '#2a3d52', lineHeight: 1.9, maxWidth: 230 }}>India's integrated disaster prediction, early-warning, and relief coordination platform.</p>
//               <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '8px 14px', width: 'fit-content' }}>
//                 <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'dmsBlink 2s ease infinite', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
//                 <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>All systems operational</span>
//               </div>
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Quick Links</div>
//               {[['Home', '/'], ['About', '/#about'], ['Features', '/#features'], ['Dashboard', '/dashboard'], ['Register', '/register']].map(([l, h]) => (
//                 <div key={l} style={{ marginBottom: 12 }}>
//                   <a href={h} style={{ fontSize: 13, color: '#2a3d52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.15s' }}
//                     onMouseEnter={e => (e.currentTarget.style.color = '#7aa3c8')}
//                     onMouseLeave={e => (e.currentTarget.style.color = '#2a3d52')}>
//                     <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2a3d52', flexShrink: 0 }} />
//                     {l}
//                   </a>
//                 </div>
//               ))}
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Emergency Contacts</div>
//               {FOOTER_EM.map(([l, n]) => (
//                 <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
//                   <span style={{ fontSize: 12, color: '#2a3d52' }}>{l}</span>
//                   <a href={`tel:${n}`} style={{ fontSize: 13, fontWeight: 800, color: '#f87171', textDecoration: 'none', letterSpacing: '-0.3px' }}>{n}</a>
//                 </div>
//               ))}
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Live Data Sources</div>
//               {[['USGS FDSN','Seismic data','#fbbf24','🌍'],['Open-Meteo','Weather NWP','#38bdf8','🌤️'],['GDACS','Cyclone alerts','#f87171','🌀'],['IMD / NDMA','Indian standards','#4ade80','📡']].map(([s, d, c, icon]) => (
//                 <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//                   <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c}10`, border: `1px solid ${c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
//                   <div>
//                     <div style={{ fontSize: 12, fontWeight: 700, color: '#4a6080' }}>{s}</div>
//                     <div style={{ fontSize: 10, color: '#2a3d52' }}>{d}</div>
//                   </div>
//                   <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, animation: 'dmsBlink 2.5s ease infinite', flexShrink: 0 }} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div style={{ borderTop: '1px solid rgba(30,45,69,0.6)', paddingTop: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
//             <span style={{ fontSize: 11, color: '#1e2d45' }}>© {new Date().getFullYear()} Disaster Management System — India. All rights reserved.</span>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//               <span style={{ fontSize: 11, color: '#1e2d45' }}>Emergency? Call <strong style={{ color: '#f87171', fontSize: 13 }}>112</strong> immediately.</span>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* GLOBAL STYLES */}
//       <style>{`
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         body, #root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
//         body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

//         @keyframes dmsUp     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
//         @keyframes dmsBlink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
//         @keyframes dmsTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
//         @keyframes dmsFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
//         @keyframes dmsScroll { 0%{transform:translateY(0);opacity:1} 80%{transform:translateY(12px);opacity:0} 100%{transform:translateY(0);opacity:0} }
//         @keyframes dmsSlideIn{ from{transform:translateX(100%)} to{transform:translateX(0)} }
//         @keyframes dmsShimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }

//         .dms-ticker { animation: dmsTicker 80s linear infinite; }

//         .dms-grid-bg {
//           position: absolute; inset: 0; opacity: 0.05;
//           background-image: linear-gradient(rgba(59,130,246,0.8) 1px,transparent 1px), linear-gradient(90deg,rgba(59,130,246,0.8) 1px,transparent 1px);
//           background-size: 56px 56px;
//           mask-image: radial-gradient(ellipse at 50% 40%,black 30%,transparent 75%);
//           -webkit-mask-image: radial-gradient(ellipse at 50% 40%,black 30%,transparent 75%);
//         }

//         .dms-gradient-text {
//           background: linear-gradient(130deg,#60a5fa 0%,#34d399 45%,#818cf8 80%,#f472b6 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text; animation: dmsShimmer 5s linear infinite;
//         }

//         .dms-chip { display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;padding:6px 18px;border-radius:100px;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px; }
//         .dms-chip-blue  { background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.2);box-shadow:0 0 20px rgba(59,130,246,0.08); }
//         .dms-chip-green { background:rgba(74,222,128,0.1);color:#4ade80;border:1px solid rgba(74,222,128,0.18);box-shadow:0 0 20px rgba(74,222,128,0.06); }

//         .dms-inner { max-width:1280px;margin:0 auto; }
//         .dms-h2 { font-size:42px;font-weight:900;letter-spacing:-1.2px;margin-bottom:18px;line-height:1.05; }

//         .dms-feat-card { background:#0a1628;border:1px solid rgba(30,45,69,0.8);border-radius:20px;padding:32px;height:100%;cursor:default;position:relative;overflow:hidden;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s,border-color 0.35s; }
//         .dms-feat-card::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),var(--feat-glow,transparent) 0%,transparent 60%);opacity:0;transition:opacity 0.4s;border-radius:20px;pointer-events:none; }
//         .dms-feat-card:hover { transform:translateY(-6px);box-shadow:0 28px 56px rgba(0,0,0,0.5); }
//         .dms-feat-card:hover::before { opacity:1; }
//         .dms-feat-card-hover-line { position:absolute;bottom:0;left:0;right:0;height:2px;opacity:0;transition:opacity 0.35s; }
//         .dms-feat-card:hover .dms-feat-card-hover-line { opacity:1; }

//         .dms-role-card { border-radius:22px;border:1px solid rgba(30,45,69,0.8);overflow:hidden;display:flex;flex-direction:column;height:100%;background:#0a1628;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s,border-color 0.35s; }
//         .dms-role-card:hover { transform:translateY(-6px);box-shadow:0 32px 64px rgba(0,0,0,0.5); }

//         .dms-source-card { background:rgba(10,22,40,0.8);border:1px solid rgba(30,45,69,0.6);border-radius:16px;padding:24px 20px;text-align:center;transition:transform 0.25s,box-shadow 0.25s,border-color 0.25s;backdrop-filter:blur(8px); }
//         .dms-source-card:hover { transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4);border-color:var(--src-c,#60a5fa); }

//         .dms-standard-item { display:flex;align-items:flex-start;gap:16px;background:rgba(10,22,40,0.8);border:1px solid rgba(30,45,69,0.6);border-radius:14px;padding:18px 20px;transition:all 0.2s; }
//         .dms-standard-item:hover { border-color:rgba(59,130,246,0.3);transform:translateX(4px);box-shadow:0 8px 24px rgba(0,0,0,0.3); }

//         .dms-emergency-card { display:block;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px 16px;text-align:center;text-decoration:none;transition:all 0.25s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden; }
//         .dms-emergency-card::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,var(--em-c,#ef4444)15 0%,transparent 60%);opacity:0;transition:opacity 0.3s; }
//         .dms-emergency-card:hover { transform:translateY(-6px);border-color:var(--em-c,#ef4444);box-shadow:0 20px 48px rgba(0,0,0,0.4); }
//         .dms-emergency-card:hover::before { opacity:1; }
//         .dms-emergency-card:hover .dms-em-bar { width:100% !important; }

//         .dms-nav-link { padding:8px 16px;font-size:13px;font-weight:500;color:rgba(160,190,220,0.75);border-radius:10px;text-decoration:none;transition:all 0.15s;letter-spacing:0.1px; }
//         .dms-nav-link:hover { background:rgba(255,255,255,0.07);color:#f0f6ff; }

//         .dms-btn-primary { display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:15px 30px;border-radius:13px;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 8px 28px rgba(37,99,235,0.45),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.2s;letter-spacing:-0.1px;position:relative;overflow:hidden; }
//         .dms-btn-primary:hover { transform:translateY(-3px);box-shadow:0 14px 36px rgba(37,99,235,0.6); }
//         .dms-btn-outline { display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(255,255,255,0.12);color:#cdd9f0;padding:15px 30px;border-radius:13px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;backdrop-filter:blur(8px);background:rgba(255,255,255,0.03); }
//         .dms-btn-outline:hover { border-color:rgba(255,255,255,0.3);color:#fff;background:rgba(255,255,255,0.07);transform:translateY(-2px); }
//         .dms-btn-ghost { display:inline-flex;align-items:center;gap:10px;color:rgba(160,190,220,0.7);padding:15px 20px;border-radius:13px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s; }
//         .dms-btn-ghost:hover { color:#f0f6ff;background:rgba(255,255,255,0.04);transform:translateY(-2px); }

//         .dms-cta-white { display:inline-flex;align-items:center;gap:10px;background:#fff;color:#1e40af;padding:16px 34px;border-radius:14px;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 12px 36px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.5);transition:all 0.25s;letter-spacing:-0.2px; }
//         .dms-cta-white:hover { background:#eff6ff;transform:translateY(-3px);box-shadow:0 20px 48px rgba(0,0,0,0.4); }
//         .dms-cta-ghost { display:inline-flex;align-items:center;gap:10px;border:2px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);padding:16px 34px;border-radius:14px;font-weight:600;font-size:15px;text-decoration:none;transition:all 0.25s;backdrop-filter:blur(8px);background:rgba(255,255,255,0.04); }
//         .dms-cta-ghost:hover { border-color:rgba(255,255,255,0.45);color:#fff;background:rgba(255,255,255,0.1);transform:translateY(-2px); }

//         .dms-desktop-nav  { display:flex !important; }
//         .dms-desktop-auth { display:flex !important; }
//         .dms-hamburger    { display:none !important; }

//         @media (max-width:1023px) {
//           .dms-desktop-nav  { display:none !important; }
//           .dms-desktop-auth { display:none !important; }
//           .dms-hamburger    { display:flex !important; }
//           [data-grid="4"]   { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="3"]   { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="6"]   { grid-template-columns:repeat(3,1fr) !important; }
//           [data-grid="2"]   { grid-template-columns:1fr !important;gap:48px !important; }
//           .dms-h2           { font-size:32px !important; }
//         }
//         @media (max-width:640px) {
//           [data-grid="4"]  { grid-template-columns:1fr 1fr !important; }
//           [data-grid="3"]  { grid-template-columns:1fr !important; }
//           [data-grid="6"]  { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="2"]  { grid-template-columns:1fr !important; }
//           .dms-h2          { font-size:26px !important; }
//         }
//       `}</style>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  APP ROOT
// // ══════════════════════════════════════════════════════════════════════════════
// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppInner />
//       </Router>
//     </AuthProvider>
//   )
// }

// function AppInner() {
//   const { path } = useLocation()

//   let pageContent
//   if (path === '/') pageContent = <HomePage />
//   else if (path === '/register') pageContent = <PlaceholderPage title="Register" />
//   else if (path === '/login') pageContent = <PlaceholderPage title="Login" />
//   else if (path === '/dashboard') pageContent = <PlaceholderPage title="Dashboard" />
//   else pageContent = <PlaceholderPage title="Page Not Found" />

//   return (
//     <MainLayout currentPath={path}>
//       {pageContent}
//     </MainLayout>
//   )
// }





// import { createContext, useContext, useState, useEffect, useRef } from "react"

// // ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
// const AuthContext = createContext({ isAuthenticated: false, login: () => {}, logout: () => {} })

// export function AuthProvider({ children }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login: () => setIsAuthenticated(true), logout: () => setIsAuthenticated(false) }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   return useContext(AuthContext)
// }

// // ─── ICONS (inline SVG replacements) ─────────────────────────────────────────
// const ShieldCheckIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
//   </svg>
// )
// const Bars3Icon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//   </svg>
// )
// const XMarkIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//   </svg>
// )
// const BellAlertIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
//   </svg>
// )
// const ArrowRightIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
//   </svg>
// )
// const UserGroupIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
//   </svg>
// )
// const BuildingOfficeIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
//   </svg>
// )
// const SignalIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
//   </svg>
// )
// const MapPinIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
//   </svg>
// )
// const ChartBarIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
//   </svg>
// )
// const CloudIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
//   </svg>
// )
// const CheckCircleIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// )
// const ExclamationTriangleIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//   </svg>
// )
// const GlobeAltIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
//   </svg>
// )
// const SparklesIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
//   </svg>
// )
// const BoltIcon = ({ style }) => (
//   <svg style={style} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
//   </svg>
// )

// // ─── HOOKS ────────────────────────────────────────────────────────────────────
// function useReveal() {
//   const ref = useRef(null)
//   const [v, setV] = useState(false)
//   useEffect(() => {
//     const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: 0.06 })
//     if (ref.current) o.observe(ref.current)
//     return () => o.disconnect()
//   }, [])
//   return [ref, v]
// }

// function useClock() {
//   const [t, setT] = useState('')
//   useEffect(() => {
//     const tick = () => {
//       const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
//       setT(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
//     }
//     tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
//   }, [])
//   return t
// }

// function useSeismic() {
//   const [s, setS] = useState({ total: null, sig: null })
//   useEffect(() => {
//     const d = new Date(); d.setDate(d.getDate() - 7)
//     fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&starttime=${d.toISOString().split('T')[0]}&minlatitude=2&maxlatitude=38&minlongitude=60&maxlongitude=100&orderby=time&limit=100`)
//       .then(r => r.json())
//       .then(d => setS({ total: d.features?.length || 0, sig: d.features?.filter(f => f.properties.mag >= 6).length || 0 }))
//       .catch(() => setS({ total: 24, sig: 3 }))
//   }, [])
//   return s
// }

// function useCounter(to) {
//   const [c, setC] = useState(0)
//   const [ref, v] = useReveal()
//   useEffect(() => {
//     if (!v || !to) return
//     let n = 0; const step = Math.ceil(to / 80)
//     const t = setInterval(() => { n += step; if (n >= to) { setC(to); clearInterval(t) } else setC(n) }, 20)
//     return () => clearInterval(t)
//   }, [v, to])
//   return [ref, c]
// }

// // ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
// function Reveal({ children, delay = 0, style = {} }) {
//   const [ref, v] = useReveal()
//   return (
//     <div ref={ref} style={{
//       opacity: v ? 1 : 0,
//       transform: v ? 'none' : 'translateY(28px)',
//       transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
//       ...style
//     }}>
//       {children}
//     </div>
//   )
// }

// function CountNum({ to, suffix = '' }) {
//   const [ref, c] = useCounter(to)
//   return <span ref={ref}>{to == null ? '—' : c}{suffix}</span>
// }

// // ─── TICKER ───────────────────────────────────────────────────────────────────
// const TICK_TEXT = '🔴 NDRF deployed in Assam flood relief  ·  ⚠️ IMD Orange Alert — coastal Karnataka  ·  🌀 Bay of Bengal cyclone watch active  ·  📡 USGS M5.2 Andaman — no tsunami threat  ·  🌧️ Mumbai IMD Yellow Alert — next 48 hours  ·  🔶 Odisha cyclone warning issued  ·  '

// function Ticker() {
//   return (
//     <div style={{ width: '100%', background: 'linear-gradient(90deg,#050b18,#060d1a)', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(30,45,69,0.8)' }}>
//       <span style={{ flexShrink: 0, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 9, fontWeight: 900, padding: '7px 16px', letterSpacing: 3, zIndex: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '4px 0 16px rgba(239,68,68,0.4)' }}>
//         <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'dmsBlink 1s ease infinite' }} />
//         LIVE
//       </span>
//       <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
//         <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(90deg,#060d1a,transparent)', zIndex: 1, pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(270deg,#060d1a,transparent)', zIndex: 1, pointerEvents: 'none' }} />
//         <span className="dms-ticker" style={{ display: 'inline-block', fontSize: 11, color: '#6ea8d4', padding: '7px 24px', letterSpacing: '0.4px', fontWeight: 500 }}>
//           {TICK_TEXT}{TICK_TEXT}{TICK_TEXT}
//         </span>
//       </div>
//     </div>
//   )
// }

// // ─── DATA ─────────────────────────────────────────────────────────────────────
// const FEATURES = [
//   { Icon: SignalIcon,     c: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.15)', t: 'Real-Time Prediction',  d: 'USGS seismic, Open-Meteo NWP, and GDACS cyclone data ingested every 30 minutes — scored against IMD/NDMA thresholds.' },
//   { Icon: BellAlertIcon, c: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', glow: 'rgba(248,113,113,0.15)', t: 'Alert Broadcasting',    d: 'Admins verify and broadcast alerts to citizens, NGOs, or rescue teams instantly with email delivery per user.' },
//   { Icon: UserGroupIcon, c: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', glow: 'rgba(74,222,128,0.15)', t: 'NGO Relief Network',    d: 'NGOs post resource needs, accept donations of food/medicine/shelter, and coordinate with field rescue teams.' },
//   { Icon: MapPinIcon,    c: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.15)', t: 'Hazard Map Overlay',    d: 'Live Leaflet maps — earthquake circles, flood zones, tsunami corridors, and cyclone tracks across India.' },
//   { Icon: ChartBarIcon,  c: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', glow: 'rgba(251,191,36,0.15)', t: 'Composite Risk Model',  d: 'Flood 35% · Earthquake 28% · Cyclone 25% · Tsunami 12% — weighted scoring with IMD seasonal modifiers.' },
//   { Icon: CloudIcon,     c: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)', glow: 'rgba(56,189,248,0.15)', t: '7-Day Forecast',        d: 'NWP forecast for India with IMD rainfall classification — Light, Heavy, Very Heavy, Extremely Heavy per day.' },
// ]

// const STEPS = [
//   { n: '01', t: 'Data Ingestion',     d: 'USGS FDSN, Open-Meteo & GDACS APIs queried every 30 min — seismic events, 7-day forecast, and tropical cyclone alerts.', c: '#3b82f6', Icon: GlobeAltIcon },
//   { n: '02', t: 'Scientific Scoring', d: 'IMD rainfall classes, USGS PAGER, and NDMA seasonal modifiers compute a composite 0–100 threat score.', c: '#f59e0b', Icon: SparklesIcon },
//   { n: '03', t: 'Admin Verification', d: 'Admins review the live threat dashboard, select recipients — all users, a city, specific NGOs — and broadcast.', c: '#22c55e', Icon: ShieldCheckIcon },
//   { n: '04', t: 'User Action',        d: 'Citizens receive NEW badges + email. NGOs coordinate relief. Users submit emergency requests from their dashboard.', c: '#ef4444', Icon: BoltIcon },
// ]

// const ROLES = [
//   { name: 'Citizen', Icon: UserGroupIcon, accent: '#3b82f6', accentDark: '#1d4ed8', feats: ['Receive verified disaster alerts','Submit emergency help requests','View live hazard maps','Connect with local NGOs'], cta: 'Register as Citizen', to: '/register', badge: 'Most Popular' },
//   { name: 'NGO / Rescue Team', Icon: BuildingOfficeIcon, accent: '#22c55e', accentDark: '#15803d', feats: ['Post resource requirements','Receive location-based alerts','Coordinate rescue operations','Track donation delivery'], cta: 'Register as NGO', to: '/register', badge: 'Field Ready' },
//   { name: 'Administrator', Icon: ShieldCheckIcon, accent: '#ef4444', accentDark: '#b91c1c', feats: ['Monitor live prediction model','Broadcast alerts to any group','Manage users & NGOs','View full analytics'], cta: 'Admin Login', to: '/login', badge: 'Full Access' },
// ]

// const ALERT_LEVELS = [
//   { level: 'DANGER',  icon: '🔴', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.35)', badge: '#dc2626', text: 'M7.0+ · Rain ≥204mm/day · Active Cyclone', bar: 100 },
//   { level: 'WARNING', icon: '🟠', bg: 'rgba(234,88,12,0.12)', border: 'rgba(234,88,12,0.35)', badge: '#ea580c', text: 'M6.0+ · Rain ≥115mm/day · Severe Storm', bar: 75 },
//   { level: 'WATCH',   icon: '🟡', bg: 'rgba(202,138,4,0.12)', border: 'rgba(202,138,4,0.35)', badge: '#ca8a04', text: 'M5.0+ · Rain ≥64mm/day · High Winds', bar: 50 },
//   { level: 'INFO',    icon: '🔵', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.35)', badge: '#2563eb', text: 'M4.5+ · Rain ≥15mm/day · Advisory', bar: 25 },
// ]

// const EMERGENCY = [
//   { label: 'National', num: '112', icon: '🆘', color: '#ef4444' },
//   { label: 'NDRF', num: '24363260', icon: '🛡️', color: '#f97316' },
//   { label: 'Ambulance', num: '108', icon: '🚑', color: '#22c55e' },
//   { label: 'Fire', num: '101', icon: '🚒', color: '#f59e0b' },
//   { label: 'Police', num: '100', icon: '🚔', color: '#3b82f6' },
//   { label: 'Disaster', num: '1078', icon: '☎️', color: '#a78bfa' },
// ]

// const FOOTER_EM = [['National Emergency','112'],['NDRF Helpline','24363260'],['Ambulance','108'],['Fire Service','101'],['Police','100'],['Disaster Helpline','1078']]

// const SOURCES = [
//   { name: 'USGS FDSN',  desc: 'Earthquake Data', c: '#fbbf24', icon: '🌍' },
//   { name: 'Open-Meteo', desc: 'Weather NWP',      c: '#38bdf8', icon: '🌤️' },
//   { name: 'GDACS',      desc: 'Cyclone Alerts',   c: '#f87171', icon: '🌀' },
//   { name: 'IMD / NDMA', desc: 'Indian Standards', c: '#4ade80', icon: '📡' },
// ]

// const STANDARDS = [
//   { l: 'IMD Rainfall Classes', d: 'Light (2.5mm) → Extremely Heavy (204.5mm/day)', icon: '🌧️' },
//   { l: 'USGS Richter Scale',   d: 'M4.5 Light → M7.0+ Major Earthquake', icon: '📊' },
//   { l: 'IMD Cyclone Scale',    d: 'Depression → Super Cyclonic Storm (SuCS)', icon: '🌀' },
//   { l: 'Tsunami Trigger Zones',d: 'Andaman-Nicobar · Makran · Carlsberg Ridge', icon: '🌊' },
// ]

// // ─── SIMPLE ROUTER (no react-router-dom dependency) ───────────────────────────
// const RouterContext = createContext({ path: '/', navigate: () => {} })

// function Router({ children }) {
//   const [path, setPath] = useState(window.location.pathname || '/')
//   const navigate = (to) => {
//     window.history.pushState({}, '', to)
//     setPath(to)
//   }
//   useEffect(() => {
//     const handler = () => setPath(window.location.pathname)
//     window.addEventListener('popstate', handler)
//     return () => window.removeEventListener('popstate', handler)
//   }, [])
//   return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
// }

// function Link({ to, children, style, className, onMouseEnter, onMouseLeave, onClick }) {
//   const { navigate } = useContext(RouterContext)
//   const handleClick = (e) => {
//     e.preventDefault()
//     if (onClick) onClick()
//     navigate(to)
//   }
//   return <a href={to} onClick={handleClick} style={style} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</a>
// }

// function useLocation() {
//   return useContext(RouterContext)
// }

// // ─── PLACEHOLDER PAGE ─────────────────────────────────────────────────────────
// function PlaceholderPage({ title }) {
//   return (
//     <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060d1a' }}>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
//         <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e8f0fe', marginBottom: 8 }}>{title}</h2>
//         <p style={{ color: '#4a6080', fontSize: 14 }}>This page is under construction.</p>
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  DISASTER IMAGE SLIDER
// // ══════════════════════════════════════════════════════════════════════════════
// const DISASTER_SLIDES = [
//   {
//     url: 'https://images.unsplash.com/photo-1504192010706-dd7f569ee2be?w=1400&q=80',
//     label: 'Flood Relief — Assam, 2024',
//     tag: 'FLOOD',
//     tagColor: '#38bdf8',
//     desc: 'NDRF teams conducting rescue operations across 14 affected districts',
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1400&q=80',
//     label: 'Cyclone Aftermath — Odisha Coast',
//     tag: 'CYCLONE',
//     tagColor: '#f87171',
//     desc: 'Category 4 landfall with 180 km/h winds — 2.1 lakh people evacuated',
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1587502537147-4fe1cf3d8036?w=1400&q=80',
//     label: 'Earthquake Response — Uttarakhand',
//     tag: 'EARTHQUAKE',
//     tagColor: '#fbbf24',
//     desc: 'M6.1 tremor triggers landslides — 3 districts on high alert',
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?w=1400&q=80',
//     label: 'Wildfire Emergency — Uttarakhand Forests',
//     tag: 'WILDFIRE',
//     tagColor: '#fb923c',
//     desc: 'Over 1,200 hectares engulfed — Air Force deployed for aerial dousing',
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=1400&q=80',
//     label: 'Tsunami Warning Drill — Andaman Islands',
//     tag: 'TSUNAMI',
//     tagColor: '#a78bfa',
//     desc: 'National-level simulation exercise with 40,000 participants across coastal India',
//   },
// ]

// function DisasterSlider() {
//   const [idx, setIdx] = useState(0)
//   const [transitioning, setTransitioning] = useState(false)
//   const timerRef = useRef(null)

//   const goTo = (next) => {
//     if (transitioning) return
//     setTransitioning(true)
//     setTimeout(() => {
//       setIdx(next)
//       setTransitioning(false)
//     }, 380)
//   }

//   const prev = () => goTo((idx - 1 + DISASTER_SLIDES.length) % DISASTER_SLIDES.length)
//   const next = () => goTo((idx + 1) % DISASTER_SLIDES.length)

//   useEffect(() => {
//     timerRef.current = setInterval(() => {
//       setTransitioning(true)
//       setTimeout(() => {
//         setIdx(p => (p + 1) % DISASTER_SLIDES.length)
//         setTransitioning(false)
//       }, 380)
//     }, 5000)
//     return () => clearInterval(timerRef.current)
//   }, [])

//   const s = DISASTER_SLIDES[idx]

//   return (
//     <div style={{ width: '100%', background: '#010812', position: 'relative', overflow: 'hidden' }}>
//       {/* Image */}
//       <div style={{
//         width: '100%', height: 520, position: 'relative', overflow: 'hidden',
//         opacity: transitioning ? 0 : 1,
//         transform: transitioning ? 'scale(1.02)' : 'scale(1)',
//         transition: 'opacity 0.38s ease, transform 0.38s ease',
//       }}>
//         <img
//           src={s.url}
//           alt={s.label}
//           style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55) saturate(0.85)' }}
//         />
//         {/* Dark vignette overlays */}
//         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(1,8,18,0.82) 0%, transparent 50%, rgba(1,8,18,0.4) 100%)' }} />
//         <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,8,18,0.95) 0%, transparent 55%)' }} />

//         {/* Content overlay */}
//         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '36px 48px 44px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
//             <span style={{ background: s.tagColor, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: 6, letterSpacing: '1.5px', boxShadow: `0 2px 12px ${s.tagColor}60` }}>{s.tag}</span>
//             <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
//             <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.5px' }}>LIVE INCIDENT COVERAGE</span>
//           </div>
//           <h3 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 900, color: '#f0f6ff', margin: '0 0 10px', letterSpacing: '-0.5px', lineHeight: 1.1, maxWidth: 620 }}>{s.label}</h3>
//           <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
//         </div>

//         {/* Slide counter top-right */}
//         <div style={{ position: 'absolute', top: 24, right: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
//           <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{String(idx + 1).padStart(2,'0')}</span>
//           <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>/</span>
//           <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>{String(DISASTER_SLIDES.length).padStart(2,'0')}</span>
//         </div>
//       </div>

//       {/* Controls */}
//       <div style={{ position: 'absolute', bottom: 44, right: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
//         <button onClick={prev} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', backdropFilter: 'blur(8px)' }}
//           onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
//           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
//         </button>
//         <button onClick={next} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', backdropFilter: 'blur(8px)' }}
//           onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
//           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
//           <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
//         </button>
//       </div>

//       {/* Dot indicators */}
//       <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
//         {DISASTER_SLIDES.map((_, i) => (
//           <button key={i} onClick={() => goTo(i)} style={{ width: i === idx ? 24 : 7, height: 7, borderRadius: 4, background: i === idx ? s.tagColor : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
//         ))}
//       </div>

//       {/* Progress bar */}
//       <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)' }}>
//         <div key={idx} style={{ height: '100%', background: s.tagColor, animation: 'dmsProgress 5s linear forwards', transformOrigin: 'left' }} />
//       </div>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  TEAM / DESIGNER PROFILE SLIDER
// // ══════════════════════════════════════════════════════════════════════════════
// const TEAM_MEMBERS = [
//   {
//     photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
//     name: 'Arjun Mehta',
//     role: 'Lead Systems Architect',
//     location: 'New Delhi, India',
//     bio: 'Built the USGS-to-NDMA data pipeline and the composite risk scoring engine. 9 years in disaster tech.',
//     skills: ['USGS FDSN', 'Risk Modeling', 'Python', 'GIS'],
//     accent: '#3b82f6',
//   },
//   {
//     photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
//     name: 'Priya Nair',
//     role: 'UX & Frontend Lead',
//     location: 'Bengaluru, India',
//     bio: 'Designed the alert broadcast UI and the live hazard map overlay system. Former IMD dashboard designer.',
//     skills: ['React', 'Figma', 'Leaflet.js', 'Design Systems'],
//     accent: '#a78bfa',
//   },
//   {
//     photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
//     name: 'Rahul Sharma',
//     role: 'Backend & DevOps Engineer',
//     location: 'Mumbai, India',
//     bio: 'Manages the real-time API ingestion layer and cloud infrastructure for 24/7 uptime across all alert services.',
//     skills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
//     accent: '#22c55e',
//   },
//   {
//     photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
//     name: 'Ananya Reddy',
//     role: 'Data Science & ML Engineer',
//     location: 'Hyderabad, India',
//     bio: 'Trains the cyclone severity prediction models using GDACS historical data and IMD reanalysis datasets.',
//     skills: ['TensorFlow', 'PyTorch', 'GDACS API', 'Forecasting'],
//     accent: '#f87171',
//   },
//   {
//     photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
//     name: 'Vikram Joshi',
//     role: 'NGO Partnerships & Operations',
//     location: 'Chennai, India',
//     bio: 'Manages relationships with 120+ field NGOs, coordinating deployment logistics and resource allocation during active disasters.',
//     skills: ['Operations', 'NGO Networks', 'NDMA Liaison', 'Relief Logistics'],
//     accent: '#fbbf24',
//   },
// ]

// function TeamSlider() {
//   const [idx, setIdx] = useState(0)
//   const [transitioning, setTransitioning] = useState(false)

//   const goTo = (next) => {
//     if (transitioning || next === idx) return
//     setTransitioning(true)
//     setTimeout(() => { setIdx(next); setTransitioning(false) }, 320)
//   }
//   const prev = () => goTo((idx - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length)
//   const next = () => goTo((idx + 1) % TEAM_MEMBERS.length)

//   const m = TEAM_MEMBERS[idx]

//   return (
//     <section style={{ width: '100%', background: '#040b14', padding: '80px 0', borderTop: '1px solid rgba(30,45,69,0.6)', position: 'relative', overflow: 'hidden' }}>
//       {/* Subtle ambient bg */}
//       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${m.accent}08 0%,transparent 60%)`, transition: 'background 0.5s ease', pointerEvents: 'none' }} />

//       <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
//         <Reveal style={{ textAlign: 'center', marginBottom: 52 }}>
//           <span className="dms-chip dms-chip-blue">👷 Meet the Team</span>
//           <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>The people behind DMS</h2>
//           <p style={{ fontSize: 15, color: '#4a6080', maxWidth: 460, margin: '0 auto', lineHeight: 1.8 }}>Engineers, scientists, and disaster response specialists building India's early-warning infrastructure.</p>
//         </Reveal>

//         {/* Thumbnails row */}
//         <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
//           {TEAM_MEMBERS.map((tm, i) => (
//             <button key={i} onClick={() => goTo(i)} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s', transform: i === idx ? 'translateY(-4px)' : 'none', opacity: i === idx ? 1 : 0.45 }}>
//               <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${i === idx ? tm.accent : 'rgba(30,45,69,0.8)'}`, boxShadow: i === idx ? `0 0 0 3px ${tm.accent}28` : 'none', transition: 'all 0.25s' }}>
//                 <img src={tm.photo} alt={tm.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
//               </div>
//               <span style={{ fontSize: 10, color: i === idx ? tm.accent : '#3a5068', fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{tm.name.split(' ')[0]}</span>
//             </button>
//           ))}
//         </div>

//         {/* Main card */}
//         <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, background: '#0a1628', borderRadius: 24, border: `1px solid rgba(30,45,69,0.8)`, overflow: 'hidden', opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(12px)' : 'none', transition: 'opacity 0.32s ease, transform 0.32s ease', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
//           {/* Photo side */}
//           <div style={{ position: 'relative', overflow: 'hidden', minHeight: 360 }}>
//             <img src={m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
//             <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, transparent 60%, #0a1628 100%), linear-gradient(to top, rgba(10,22,40,0.7) 0%, transparent 50%)` }} />
//             {/* Location badge */}
//             <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(10,22,40,0.85)', border: '1px solid rgba(30,45,69,0.8)', borderRadius: 10, padding: '6px 12px', backdropFilter: 'blur(8px)' }}>
//               <svg width="11" height="11" fill="none" stroke={m.accent} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
//               <span style={{ fontSize: 11, color: '#7aa3c8', fontWeight: 500 }}>{m.location}</span>
//             </div>
//           </div>

//           {/* Info side */}
//           <div style={{ padding: '36px 36px 36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${m.accent}15`, border: `1px solid ${m.accent}30`, borderRadius: 8, padding: '4px 12px', marginBottom: 16, width: 'fit-content' }}>
//               <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.accent, boxShadow: `0 0 6px ${m.accent}` }} />
//               <span style={{ fontSize: 10, color: m.accent, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{m.role}</span>
//             </div>

//             <h3 style={{ fontSize: 28, fontWeight: 900, color: '#f0f6ff', margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{m.name}</h3>
//             <p style={{ fontSize: 13.5, color: '#5a7898', lineHeight: 1.85, margin: '0 0 24px' }}>{m.bio}</p>

//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//               {m.skills.map(sk => (
//                 <span key={sk} style={{ fontSize: 11, fontWeight: 600, color: '#7aa3c8', background: 'rgba(30,45,69,0.6)', border: '1px solid rgba(30,45,69,0.8)', borderRadius: 7, padding: '5px 12px', letterSpacing: '0.2px' }}>{sk}</span>
//               ))}
//             </div>

//             {/* Nav buttons inside card */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
//               <button onClick={prev} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(30,45,69,0.6)', border: '1px solid rgba(30,45,69,0.8)', color: '#7aa3c8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}
//                 onMouseEnter={e => { e.currentTarget.style.background = m.accent + '25'; e.currentTarget.style.color = m.accent }}
//                 onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,45,69,0.6)'; e.currentTarget.style.color = '#7aa3c8' }}>
//                 <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
//               </button>
//               <span style={{ fontSize: 12, color: '#2a3d52', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} of {TEAM_MEMBERS.length}</span>
//               <button onClick={next} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(30,45,69,0.6)', border: '1px solid rgba(30,45,69,0.8)', color: '#7aa3c8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}
//                 onMouseEnter={e => { e.currentTarget.style.background = m.accent + '25'; e.currentTarget.style.color = m.accent }}
//                 onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,45,69,0.6)'; e.currentTarget.style.color = '#7aa3c8' }}>
//                 <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  HOME PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// function HomePage() {
//   const clock   = useClock()
//   const seismic = useSeismic()
//   const [activeStep, setActiveStep] = useState(0)

//   useEffect(() => {
//     const id = setInterval(() => setActiveStep(p => (p + 1) % 4), 3000)
//     return () => clearInterval(id)
//   }, [])

//   return (
//     <div style={{ width: '100%', overflowX: 'hidden' }}>

//       {/* HERO */}
//       <section style={{ width: '100%', minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
//         <div className="dms-grid-bg" />
//         <div style={{ position: 'absolute', top: '5%', left: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 65%)', pointerEvents: 'none', animation: 'dmsFloat 8s ease-in-out infinite' }} />
//         <div style={{ position: 'absolute', bottom: '0%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(220,38,38,0.1) 0%,transparent 65%)', pointerEvents: 'none', animation: 'dmsFloat 10s ease-in-out infinite reverse' }} />
//         <div style={{ position: 'absolute', top: '40%', left: '45%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 60%)', pointerEvents: 'none', animation: 'dmsFloat 12s ease-in-out infinite 2s' }} />
//         {[...Array(6)].map((_, i) => (
//           <div key={i} style={{ position: 'absolute', width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 4 : 3, borderRadius: '50%', background: ['#3b82f6','#22c55e','#ef4444','#f59e0b','#a78bfa','#38bdf8'][i], top: `${15 + i * 13}%`, left: `${10 + i * 14}%`, opacity: 0.6, animation: `dmsFloat ${6 + i}s ease-in-out infinite ${i * 0.5}s`, boxShadow: `0 0 12px ${['#3b82f6','#22c55e','#ef4444','#f59e0b','#a78bfa','#38bdf8'][i]}` }} />
//         ))}

//         <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '130px 32px 90px' }}>
//           <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, padding: '9px 22px', marginBottom: 36, animation: 'dmsUp 0.5s ease both', backdropFilter: 'blur(12px)', boxShadow: '0 0 32px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
//             <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'dmsBlink 1.2s ease infinite', boxShadow: '0 0 10px rgba(239,68,68,0.9), 0 0 20px rgba(239,68,68,0.4)' }} />
//             <span style={{ fontSize: 10, color: '#fca5a5', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Live Monitoring Active</span>
//             <span style={{ width: 1, height: 14, background: 'rgba(239,68,68,0.25)' }} />
//             <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4ade80', letterSpacing: '1.5px', fontWeight: 700 }}>{clock} IST</span>
//           </div>

//           <h1 style={{ fontSize: 'clamp(40px,6.5vw,80px)', fontWeight: 900, color: '#f0f6ff', lineHeight: 1.02, letterSpacing: '-3px', margin: '0 0 28px', animation: 'dmsUp 0.65s 0.08s both' }}>
//             India's Disaster<br />
//             <span className="dms-gradient-text">Intelligence System</span>
//           </h1>

//           <p style={{ fontSize: 19, color: '#6b9cc0', lineHeight: 1.85, maxWidth: 600, margin: '0 0 44px', animation: 'dmsUp 0.65s 0.16s both', fontWeight: 400 }}>
//             Real-time earthquake, flood, and cyclone prediction powered by <strong style={{ color: '#93c5fd', fontWeight: 600 }}>USGS</strong>, <strong style={{ color: '#86efac', fontWeight: 600 }}>IMD</strong>, and <strong style={{ color: '#fca5a5', fontWeight: 600 }}>GDACS</strong>.
//             Verified alerts reach citizens, NGOs, and rescue teams in under 30 minutes.
//           </p>

//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 64, animation: 'dmsUp 0.65s 0.24s both' }}>
//             <Link to="/register" className="dms-btn-primary">
//               <span>Get Started Free</span>
//               <ArrowRightIcon style={{ width: 16, height: 16 }} />
//             </Link>
//             <Link to="/login" className="dms-btn-outline">Sign In</Link>
//             <a href="#features" className="dms-btn-ghost">Explore Features</a>
//           </div>

//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, animation: 'dmsUp 0.65s 0.32s both' }}>
//             {[
//               { label: 'Earthquakes this week',   val: seismic.total === null ? '…' : seismic.total, tc: '#93c5fd', bg: 'rgba(37,99,235,0.1)', bc: 'rgba(37,99,235,0.25)', dot: '#3b82f6' },
//               { label: 'M6.0+ significant events', val: seismic.sig === null ? '…' : seismic.sig,   tc: '#fca5a5', bg: 'rgba(220,38,38,0.1)', bc: 'rgba(220,38,38,0.25)', dot: '#ef4444' },
//               { label: 'Live data pipelines',       val: '4',                                         tc: '#86efac', bg: 'rgba(34,197,94,0.1)', bc: 'rgba(34,197,94,0.25)', dot: '#22c55e' },
//             ].map(p => (
//               <div key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: p.bg, border: `1px solid ${p.bc}`, borderRadius: 16, padding: '14px 20px', backdropFilter: 'blur(12px)', boxShadow: `0 0 24px ${p.bc}, inset 0 1px 0 rgba(255,255,255,0.04)`, transition: 'transform 0.2s', cursor: 'default' }}
//                 onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
//                 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                 <div>
//                   <div style={{ fontSize: 28, fontWeight: 900, color: p.tc, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{p.val}</div>
//                   <div style={{ fontSize: 11, color: '#5a8098', marginTop: 2 }}>{p.label}</div>
//                 </div>
//                 <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.dot}18`, border: `1px solid ${p.dot}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.dot, boxShadow: `0 0 8px ${p.dot}`, animation: 'dmsBlink 2s ease infinite' }} />
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div style={{ marginTop: 72, display: 'flex', alignItems: 'center', gap: 12, animation: 'dmsUp 0.65s 0.4s both' }}>
//             <div style={{ width: 20, height: 32, border: '2px solid rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4 }}>
//               <div style={{ width: 4, height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 2, animation: 'dmsScroll 2s ease infinite' }} />
//             </div>
//             <span style={{ fontSize: 11, color: '#3a5068', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Scroll to explore</span>
//           </div>
//         </div>
//       </section>

//       {/* DISASTER IMAGE SLIDER */}
//       <DisasterSlider />

//       {/* STATS BANNER */}
//       <section style={{ width: '100%', background: 'linear-gradient(180deg,#060d1a 0%,#0a1628 100%)', borderTop: '1px solid rgba(30,45,69,0.6)', borderBottom: '1px solid rgba(30,45,69,0.6)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(37,99,235,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }} data-grid="4">
//           {[
//             { val: 1400, sfx: '+', label: 'Disasters Monitored', color: '#60a5fa', sub: 'Since 2020', icon: '📊' },
//             { val: 8500, sfx: '+', label: 'Registered Users',    color: '#34d399', sub: 'Across India', icon: '👥' },
//             { val: 120,  sfx: '+', label: 'NGO Partners',        color: '#fb923c', sub: 'Active Network', icon: '🤝' },
//             { val: 3200, sfx: '+', label: 'Alerts Issued',       color: '#f472b6', sub: 'In 2024', icon: '🔔' },
//           ].map((s, i) => (
//             <Reveal key={s.label} delay={i * 80} style={{ textAlign: 'center', padding: '56px 28px', borderRight: i < 3 ? '1px solid rgba(30,45,69,0.6)' : 'none', position: 'relative' }}>
//               <div style={{ fontSize: 13, marginBottom: 12 }}>{s.icon}</div>
//               <div style={{ fontSize: 52, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${s.color}40` }}>
//                 <CountNum to={s.val} suffix={s.sfx} />
//               </div>
//               <div style={{ fontSize: 13, color: '#cdd9f0', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
//               <div style={{ fontSize: 11, color: '#3a5068', fontWeight: 500 }}>{s.sub}</div>
//             </Reveal>
//           ))}
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section id="features" style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-blue">✦ Platform Features</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>Everything you need in a crisis</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
//               Built on published IMD, NDMA, USGS and WMO standards — no inflated risk scores.
//             </p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-grid="3">
//             {FEATURES.map((f, i) => (
//               <Reveal key={f.t} delay={i * 60}>
//                 <div className="dms-feat-card" style={{ '--feat-c': f.c, '--feat-glow': f.glow }}>
//                   <div style={{ width: 54, height: 54, background: f.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1px solid ${f.border}`, boxShadow: `0 0 24px ${f.glow}`, position: 'relative' }}>
//                     <f.Icon style={{ width: 26, height: 26, color: f.c }} />
//                   </div>
//                   <div style={{ fontSize: 15, fontWeight: 700, color: '#e8f0fe', marginBottom: 12, letterSpacing: '-0.2px' }}>{f.t}</div>
//                   <div style={{ fontSize: 13, color: '#4a6080', lineHeight: 1.8 }}>{f.d}</div>
//                   <div className="dms-feat-card-hover-line" style={{ background: f.c }} />
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="about" style={{ width: '100%', padding: '110px 0', background: '#040b14', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-blue">⚡ How It Works</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>From raw data to life-saving action</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>Four steps from satellite feed to verified alert delivery.</p>
//           </Reveal>

//           <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48, flexWrap: 'wrap' }}>
//             {STEPS.map((s, i) => (
//               <button key={s.n} onClick={() => setActiveStep(i)} style={{ padding: '8px 20px', borderRadius: 100, border: '1px solid', borderColor: activeStep === i ? s.c : 'rgba(30,45,69,0.8)', background: activeStep === i ? `${s.c}18` : 'transparent', color: activeStep === i ? s.c : '#3a5068', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s', letterSpacing: '0.3px' }}>
//                 {s.n} {s.t}
//               </button>
//             ))}
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, position: 'relative' }} data-grid="4">
//             <div style={{ position: 'absolute', top: 44, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#3b82f6,#f59e0b,#22c55e,#ef4444)', opacity: 0.2, zIndex: 0, borderRadius: 2 }} />
//             {STEPS.map((s, i) => (
//               <Reveal key={s.n} delay={i * 100} style={{ position: 'relative', zIndex: 1 }}>
//                 <div onClick={() => setActiveStep(i)} style={{ background: activeStep === i ? `linear-gradient(160deg,${s.c}12,${s.c}06)` : '#0c1832', borderRadius: 20, padding: '32px 26px', border: `1px solid ${activeStep === i ? s.c + '40' : 'rgba(30,45,69,0.8)'}`, borderTop: `3px solid ${activeStep === i ? s.c : s.c + '30'}`, height: '100%', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', transform: activeStep === i ? 'translateY(-6px)' : 'none', boxShadow: activeStep === i ? `0 24px 48px ${s.c}18, 0 0 0 1px ${s.c}20` : 'none' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.c}15`, border: `1px solid ${s.c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
//                     <s.Icon style={{ width: 22, height: 22, color: s.c }} />
//                   </div>
//                   <div style={{ fontSize: 36, fontWeight: 900, color: activeStep === i ? s.c : s.c + '40', marginBottom: 14, fontVariantNumeric: 'tabular-nums', lineHeight: 1, transition: 'color 0.3s' }}>{s.n}</div>
//                   <div style={{ fontSize: 14, fontWeight: 700, color: activeStep === i ? '#e8f0fe' : '#5a7898', marginBottom: 10, transition: 'color 0.3s' }}>{s.t}</div>
//                   <div style={{ fontSize: 12, color: '#3a5068', lineHeight: 1.8 }}>{s.d}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ROLES */}
//       <section style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(74,222,128,0.3),transparent)' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 72 }}>
//             <span className="dms-chip dms-chip-green">👥 User Roles</span>
//             <h2 className="dms-h2" style={{ color: '#f0f6ff' }}>Built for every stakeholder</h2>
//             <p style={{ fontSize: 16, color: '#4a6080', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>Three role types, each with a purpose-built dashboard and workflow.</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-grid="3">
//             {ROLES.map((r, i) => (
//               <Reveal key={r.name} delay={i * 90}>
//                 <div className="dms-role-card" style={{ '--role-accent': r.accent }}>
//                   <div style={{ padding: '28px 28px 24px', position: 'relative', overflow: 'hidden' }}>
//                     <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${r.accent}20,${r.accentDark}10)`, borderBottom: `1px solid ${r.accent}20` }} />
//                     <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${r.accent}15,transparent 70%)` }} />
//                     <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//                         <div style={{ width: 48, height: 48, background: `${r.accent}20`, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${r.accent}30`, boxShadow: `0 0 24px ${r.accent}20` }}>
//                           <r.Icon style={{ width: 24, height: 24, color: r.accent }} />
//                         </div>
//                         <div>
//                           <div style={{ fontSize: 16, fontWeight: 800, color: '#f0f6ff', letterSpacing: '-0.3px' }}>{r.name}</div>
//                           <div style={{ fontSize: 10, color: r.accent, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>{r.badge}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
//                     <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
//                       {r.feats.map(f => (
//                         <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
//                           <div style={{ width: 20, height: 20, borderRadius: 6, background: `${r.accent}15`, border: `1px solid ${r.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
//                             <CheckCircleIcon style={{ width: 12, height: 12, color: r.accent }} />
//                           </div>
//                           <span style={{ fontSize: 13, color: '#7aa3c8', lineHeight: 1.6 }}>{f}</span>
//                         </li>
//                       ))}
//                     </ul>
//                     <Link to={r.to} className="dms-role-btn" style={{ '--rb-c': r.accent, '--rb-bg': `${r.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 13, border: `1.5px solid ${r.accent}`, color: r.accent, fontWeight: 700, fontSize: 13, textDecoration: 'none', transition: 'all 0.2s', background: `${r.accent}15`, letterSpacing: '-0.1px' }}>
//                       {r.cta}
//                       <ArrowRightIcon style={{ width: 15, height: 15, flexShrink: 0 }} />
//                     </Link>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* DATA SOURCES */}
//       <section style={{ width: '100%', padding: '64px 0', background: '#040b14', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%,rgba(37,99,235,0.05) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 36 }}>
//             <p style={{ fontSize: 11, fontWeight: 800, color: '#2a3d52', letterSpacing: '3px', textTransform: 'uppercase' }}>Powered by trusted scientific data sources</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} data-grid="4">
//             {SOURCES.map((s, i) => (
//               <Reveal key={s.name} delay={i * 60}>
//                 <div className="dms-source-card" style={{ '--src-c': s.c }}>
//                   <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
//                     <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.c, display: 'inline-block', boxShadow: `0 0 8px ${s.c}, 0 0 16px ${s.c}50`, animation: 'dmsBlink 2s ease infinite' }} />
//                     <span style={{ fontSize: 14, fontWeight: 800, color: s.c, letterSpacing: '-0.2px' }}>{s.name}</span>
//                   </div>
//                   <div style={{ fontSize: 11, color: s.c + 'aa', letterSpacing: '0.5px', fontWeight: 500 }}>{s.desc}</div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* STANDARDS + ALERT REF */}
//       <section style={{ width: '100%', padding: '110px 0', background: '#060d1a', position: 'relative', overflow: 'hidden' }}>
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }} data-grid="2">
//           <Reveal>
//             <span className="dms-chip dms-chip-blue">🔬 Scientific Standards</span>
//             <h2 style={{ fontSize: 38, fontWeight: 900, color: '#f0f6ff', lineHeight: 1.08, margin: '20px 0 16px', letterSpacing: '-1px' }}>
//               No guesswork.<br />
//               <span className="dms-gradient-text" style={{ fontSize: '0.9em' }}>Only verified thresholds.</span>
//             </h2>
//             <p style={{ fontSize: 14, color: '#4a6080', lineHeight: 1.9, marginBottom: 32 }}>
//               Every alert uses published IMD, USGS PAGER, and NDMA standards — not arbitrary multipliers. Seasonal modifiers adjust scores automatically.
//             </p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//               {STANDARDS.map((item, i) => (
//                 <Reveal key={item.l} delay={i * 70}>
//                   <div className="dms-standard-item">
//                     <div style={{ fontSize: 20, flexShrink: 0, width: 40, textAlign: 'center' }}>{item.icon}</div>
//                     <div>
//                       <div style={{ fontSize: 13, fontWeight: 700, color: '#cdd9f0', marginBottom: 4 }}>{item.l}</div>
//                       <div style={{ fontSize: 12, color: '#3a5068', lineHeight: 1.6 }}>{item.d}</div>
//                     </div>
//                   </div>
//                 </Reveal>
//               ))}
//             </div>
//           </Reveal>

//           <Reveal delay={150}>
//             <div style={{ background: '#040b14', borderRadius: 24, padding: '32px', border: '1px solid rgba(30,45,69,0.8)', boxShadow: '0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
//                 <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.8)', animation: 'dmsBlink 1.5s ease infinite' }} />
//                 <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Alert Level Reference</span>
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {ALERT_LEVELS.map(a => (
//                   <div key={a.level} style={{ background: a.bg, borderRadius: 14, padding: '16px 20px', border: `1px solid ${a.border}`, transition: 'all 0.2s', cursor: 'default' }}
//                     onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
//                     onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
//                       <span style={{ fontSize: 14 }}>{a.icon}</span>
//                       <span style={{ background: a.badge, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 14px', borderRadius: 8, letterSpacing: '1px', boxShadow: `0 4px 12px ${a.badge}50` }}>{a.level}</span>
//                       <span style={{ fontSize: 12, color: '#7aa3c8', flex: 1 }}>{a.text}</span>
//                     </div>
//                     <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
//                       <div style={{ height: '100%', width: `${a.bar}%`, background: a.badge, borderRadius: 2, boxShadow: `0 0 8px ${a.badge}80`, transition: 'width 1s ease' }} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(30,45,69,0.8)', fontSize: 11, color: '#2a3d52', lineHeight: 1.9 }}>
//                 Thresholds: IMD, USGS PAGER, NDMA India.<br />Seasonal modifiers per Indian disaster calendar.
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* EMERGENCY */}
//       <section id="contact" style={{ width: '100%', padding: '96px 0', background: 'linear-gradient(160deg,#1a0404 0%,#2d0606 30%,#4a0404 60%,#2d0606 100%)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(220,38,38,0.08) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(220,38,38,0.08) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div className="dms-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
//           <Reveal style={{ textAlign: 'center', marginBottom: 52 }}>
//             <div style={{ width: 72, height: 72, background: 'rgba(239,68,68,0.15)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 40px rgba(239,68,68,0.12)', backdropFilter: 'blur(8px)', animation: 'dmsFloat 4s ease-in-out infinite' }}>
//               <ExclamationTriangleIcon style={{ width: 36, height: 36, color: '#fca5a5' }} />
//             </div>
//             <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.8px' }}>Emergency Helplines</h2>
//             <p style={{ color: 'rgba(252,165,165,0.7)', fontSize: 14, letterSpacing: '0.3px' }}>Available 24 hours · 7 days a week · Toll free across India</p>
//           </Reveal>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, maxWidth: 1080, margin: '0 auto' }} data-grid="6">
//             {EMERGENCY.map((e, i) => (
//               <Reveal key={e.label} delay={i * 45}>
//                 <a href={`tel:${e.num}`} className="dms-emergency-card" style={{ '--em-c': e.color }}>
//                   <div style={{ fontSize: 28, marginBottom: 10 }}>{e.icon}</div>
//                   <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 5, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{e.num}</div>
//                   <div style={{ fontSize: 10, color: e.color + 'cc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{e.label}</div>
//                   <div style={{ marginTop: 12, height: 2, background: e.color + '30', borderRadius: 1 }}>
//                     <div style={{ height: '100%', width: 0, background: e.color, borderRadius: 1, transition: 'width 0.3s ease' }} className="dms-em-bar" />
//                   </div>
//                 </a>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* TEAM SLIDER */}
//       <TeamSlider />

//       {/* FINAL CTA */}
//       <section style={{ width: '100%', padding: '110px 0', background: 'linear-gradient(160deg,#0a1635 0%,#0f2060 30%,#1a3a8a 65%,#1a4fd6 100%)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
//         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />
//         <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
//           <Reveal>
//             <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', boxShadow: '0 0 48px rgba(255,255,255,0.08)', animation: 'dmsFloat 6s ease-in-out infinite' }}>
//               <ShieldCheckIcon style={{ width: 42, height: 42, color: '#fff' }} />
//             </div>
//             <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1 }}>
//               Register today.<br />
//               <span style={{ opacity: 0.8 }}>Stay protected tomorrow.</span>
//             </h2>
//             <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, maxWidth: 500, margin: '0 auto 48px' }}>
//               Join <strong style={{ color: '#fff' }}>8,500+</strong> citizens, NGOs, and rescue teams already using DMS to stay ahead of India's most dangerous weather and seismic events.
//             </p>
//             <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
//               <Link to="/register" className="dms-cta-white">
//                 Create Free Account
//                 <ArrowRightIcon style={{ width: 16, height: 16 }} />
//               </Link>
//               <Link to="/login" className="dms-cta-ghost">Sign In</Link>
//             </div>
//             <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
//               {['No credit card required', 'Instant access', 'Free forever for citizens'].map(t => (
//                 <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <CheckCircleIcon style={{ width: 15, height: 15, color: '#86efac' }} />
//                   <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{t}</span>
//                 </div>
//               ))}
//             </div>
//           </Reveal>
//         </div>
//       </section>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  MAIN LAYOUT
// // ══════════════════════════════════════════════════════════════════════════════
// function MainLayout({ children, currentPath }) {
//   const { isAuthenticated } = useAuth()
//   const { navigate } = useLocation()
//   const [open, setOpen]       = useState(false)
//   const [scrolled, setScrolled] = useState(false)
//   const [scrollPct, setScrollPct] = useState(0)
//   const isLanding = currentPath === '/'

//   useEffect(() => {
//     const fn = () => {
//       setScrolled(window.scrollY > 8)
//       const total = document.body.scrollHeight - window.innerHeight
//       setScrollPct(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0)
//     }
//     window.addEventListener('scroll', fn)
//     return () => window.removeEventListener('scroll', fn)
//   }, [])

//   useEffect(() => setOpen(false), [currentPath])

//   const dark = isLanding && !scrolled
//   const navLinks = [['Home', '/'], ['About', '/#about'], ['Features', '/#features'], ['Contact', '/#contact']]

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

//       {/* TOP ALERT BAR */}
//       <div style={{ width: '100%', background: 'linear-gradient(90deg,#7f1d1d,#991b1b,#b91c1c,#991b1b,#7f1d1d)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '7px 0', textAlign: 'center', letterSpacing: '0.4px', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)', pointerEvents: 'none' }} />
//         <span style={{ position: 'relative' }}>🔔 &nbsp; India Disaster Management System — 24/7 Monitoring &nbsp;|&nbsp; National Emergency: <strong style={{ color: '#fca5a5' }}>112</strong> &nbsp;|&nbsp; NDRF: <strong style={{ color: '#fca5a5' }}>011-24363260</strong></span>
//       </div>

//       <Ticker />

//       {/* STICKY HEADER */}
//       <header style={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', background: dark ? 'rgba(2,8,23,0.82)' : 'rgba(4,11,20,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(30,45,69,0.8)', boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none', transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease' }}>
//         <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: `${scrollPct}%`, background: 'linear-gradient(90deg,#3b82f6,#22c55e)', transition: 'width 0.1s', zIndex: 1 }} />

//         <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
//           <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
//             <div style={{ position: 'relative' }}>
//               <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(37,99,235,0.5)', transition: 'transform 0.2s' }}
//                 onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05) rotate(-2deg)')}
//                 onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
//                 <ShieldCheckIcon style={{ width: 22, height: 22, color: '#fff' }} />
//               </div>
//               <span style={{ position: 'absolute', top: -3, right: -3, width: 11, height: 11, background: '#22c55e', borderRadius: '50%', border: '2px solid #040b14', animation: 'dmsBlink 2s ease infinite', boxShadow: '0 0 8px rgba(34,197,94,0.7)' }} />
//             </div>
//             <div>
//               <div style={{ fontSize: 16, fontWeight: 900, color: '#f0f6ff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>DMS</div>
//               <div style={{ fontSize: 9.5, color: '#2a3d52', letterSpacing: '1.5px', fontWeight: 600, textTransform: 'uppercase' }}>Disaster Management</div>
//             </div>
//           </Link>

//           <nav className="dms-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {navLinks.map(([n, h]) => (
//               <a key={n} href={h} className="dms-nav-link">{n}</a>
//             ))}
//           </nav>

//           <div className="dms-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             {isAuthenticated ? (
//               <Link to="/dashboard" className="dms-btn-nav" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.15s' }}>
//                 Dashboard <ArrowRightIcon style={{ width: 14, height: 14 }} />
//               </Link>
//             ) : (
//               <>
//                 <Link to="/login" className="dms-nav-link">Log in</Link>
//                 <Link to="/register" className="dms-btn-nav" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.15s' }}>
//                   Get Started <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                 </Link>
//               </>
//             )}
//           </div>

//           <button className="dms-hamburger" onClick={() => setOpen(true)}
//             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: '#7aa3c8', padding: '8px', display: 'none', transition: 'all 0.15s' }}
//             onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
//             onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
//             <Bars3Icon style={{ width: 22, height: 22 }} />
//           </button>
//         </div>
//       </header>

//       {/* MOBILE DRAWER */}
//       {open && (
//         <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
//           <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(12px)' }} onClick={() => setOpen(false)} />
//           <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 320, background: '#060d1a', borderLeft: '1px solid rgba(30,45,69,0.8)', display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 64px rgba(0,0,0,0.6)', animation: 'dmsSlideIn 0.35s ease' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(30,45,69,0.8)', background: 'rgba(4,11,20,0.5)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <ShieldCheckIcon style={{ width: 18, height: 18, color: '#fff' }} />
//                 </div>
//                 <span style={{ fontWeight: 900, fontSize: 15, color: '#f0f6ff' }}>DMS</span>
//               </div>
//               <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: '#4a6080', padding: 6 }}>
//                 <XMarkIcon style={{ width: 20, height: 20 }} />
//               </button>
//             </div>

//             <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
//               {navLinks.map(([n, h]) => (
//                 <a key={n} href={h} onClick={() => setOpen(false)}
//                   style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', fontSize: 14, fontWeight: 600, color: '#7aa3c8', borderRadius: 12, textDecoration: 'none', marginBottom: 4, transition: 'all 0.15s' }}
//                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f6ff' }}
//                   onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7aa3c8' }}>
//                   <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', opacity: 0.5 }} />
//                   {n}
//                 </a>
//               ))}
//             </nav>

//             <div style={{ padding: '16px', borderTop: '1px solid rgba(30,45,69,0.8)', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(4,11,20,0.3)' }}>
//               {isAuthenticated ? (
//                 <Link to="/dashboard" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, padding: '13px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
//                   Dashboard <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                 </Link>
//               ) : (
//                 <>
//                   <Link to="/login" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', padding: '13px', border: '1px solid rgba(30,45,69,0.8)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#7aa3c8', textDecoration: 'none' }}>Log in</Link>
//                   <Link to="/register" onClick={() => setOpen(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7, padding: '13px', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
//                     Get Started <ArrowRightIcon style={{ width: 14, height: 14 }} />
//                   </Link>
//                 </>
//               )}
//             </div>

//             <div style={{ background: 'rgba(74,4,4,0.5)', borderTop: '1px solid rgba(127,29,29,0.4)', padding: '16px' }}>
//               <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>⚠ Emergency Contacts</div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
//                 {[['🆘 National', '112'], ['🚑 Ambulance', '108'], ['🚒 Fire', '101'], ['🚔 Police', '100']].map(([l, n]) => (
//                   <a key={l} href={`tel:${n}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 12px', textDecoration: 'none', transition: 'all 0.15s' }}
//                     onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.18)')}
//                     onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.1)')}>
//                     <span style={{ fontSize: 11, color: '#7aa3c8', fontWeight: 500 }}>{l}</span>
//                     <span style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{n}</span>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <main style={{ flex: 1, width: '100%' }}>{children}</main>

//       {/* FOOTER */}
//       <footer style={{ width: '100%', background: 'linear-gradient(180deg,#020817,#010610)', color: '#fff', borderTop: '1px solid rgba(30,45,69,0.6)', position: 'relative', overflow: 'hidden' }}>
//         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(37,99,235,0.4),transparent)' }} />
//         <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 32px 36px' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 48, marginBottom: 56 }}>
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
//                 <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(37,99,235,0.4)' }}>
//                   <ShieldCheckIcon style={{ width: 22, height: 22, color: '#fff' }} />
//                 </div>
//                 <div>
//                   <div style={{ fontWeight: 900, fontSize: 16, color: '#f0f6ff', letterSpacing: '-0.3px' }}>DMS India</div>
//                   <div style={{ fontSize: 9.5, color: '#2a3d52', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Disaster Management</div>
//                 </div>
//               </div>
//               <p style={{ fontSize: 12, color: '#2a3d52', lineHeight: 1.9, maxWidth: 230 }}>India's integrated disaster prediction, early-warning, and relief coordination platform.</p>
//               <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '8px 14px', width: 'fit-content' }}>
//                 <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'dmsBlink 2s ease infinite', boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
//                 <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>All systems operational</span>
//               </div>
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Quick Links</div>
//               {[['Home', '/'], ['About', '/#about'], ['Features', '/#features'], ['Dashboard', '/dashboard'], ['Register', '/register']].map(([l, h]) => (
//                 <div key={l} style={{ marginBottom: 12 }}>
//                   <a href={h} style={{ fontSize: 13, color: '#2a3d52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.15s' }}
//                     onMouseEnter={e => (e.currentTarget.style.color = '#7aa3c8')}
//                     onMouseLeave={e => (e.currentTarget.style.color = '#2a3d52')}>
//                     <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#2a3d52', flexShrink: 0 }} />
//                     {l}
//                   </a>
//                 </div>
//               ))}
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Emergency Contacts</div>
//               {FOOTER_EM.map(([l, n]) => (
//                 <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
//                   <span style={{ fontSize: 12, color: '#2a3d52' }}>{l}</span>
//                   <a href={`tel:${n}`} style={{ fontSize: 13, fontWeight: 800, color: '#f87171', textDecoration: 'none', letterSpacing: '-0.3px' }}>{n}</a>
//                 </div>
//               ))}
//             </div>

//             <div>
//               <div style={{ fontSize: 9.5, fontWeight: 800, color: '#2a3d52', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: 20 }}>Live Data Sources</div>
//               {[['USGS FDSN','Seismic data','#fbbf24','🌍'],['Open-Meteo','Weather NWP','#38bdf8','🌤️'],['GDACS','Cyclone alerts','#f87171','🌀'],['IMD / NDMA','Indian standards','#4ade80','📡']].map(([s, d, c, icon]) => (
//                 <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//                   <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c}10`, border: `1px solid ${c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
//                   <div>
//                     <div style={{ fontSize: 12, fontWeight: 700, color: '#4a6080' }}>{s}</div>
//                     <div style={{ fontSize: 10, color: '#2a3d52' }}>{d}</div>
//                   </div>
//                   <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}`, animation: 'dmsBlink 2.5s ease infinite', flexShrink: 0 }} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div style={{ borderTop: '1px solid rgba(30,45,69,0.6)', paddingTop: 28, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
//             <span style={{ fontSize: 11, color: '#1e2d45' }}>© {new Date().getFullYear()} Disaster Management System — India. All rights reserved.</span>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//               <span style={{ fontSize: 11, color: '#1e2d45' }}>Emergency? Call <strong style={{ color: '#f87171', fontSize: 13 }}>112</strong> immediately.</span>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* GLOBAL STYLES */}
//       <style>{`
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         body, #root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden; }
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
//         body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

//         @keyframes dmsUp     { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
//         @keyframes dmsBlink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
//         @keyframes dmsTicker { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
//         @keyframes dmsFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
//         @keyframes dmsScroll { 0%{transform:translateY(0);opacity:1} 80%{transform:translateY(12px);opacity:0} 100%{transform:translateY(0);opacity:0} }
//         @keyframes dmsSlideIn{ from{transform:translateX(100%)} to{transform:translateX(0)} }
//         @keyframes dmsShimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
//         @keyframes dmsProgress{ from{width:0%} to{width:100%} }

//         .dms-ticker { animation: dmsTicker 80s linear infinite; }

//         .dms-grid-bg {
//           position: absolute; inset: 0; opacity: 0.05;
//           background-image: linear-gradient(rgba(59,130,246,0.8) 1px,transparent 1px), linear-gradient(90deg,rgba(59,130,246,0.8) 1px,transparent 1px);
//           background-size: 56px 56px;
//           mask-image: radial-gradient(ellipse at 50% 40%,black 30%,transparent 75%);
//           -webkit-mask-image: radial-gradient(ellipse at 50% 40%,black 30%,transparent 75%);
//         }

//         .dms-gradient-text {
//           background: linear-gradient(130deg,#60a5fa 0%,#34d399 45%,#818cf8 80%,#f472b6 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text; animation: dmsShimmer 5s linear infinite;
//         }

//         .dms-chip { display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;padding:6px 18px;border-radius:100px;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px; }
//         .dms-chip-blue  { background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.2);box-shadow:0 0 20px rgba(59,130,246,0.08); }
//         .dms-chip-green { background:rgba(74,222,128,0.1);color:#4ade80;border:1px solid rgba(74,222,128,0.18);box-shadow:0 0 20px rgba(74,222,128,0.06); }

//         .dms-inner { max-width:1280px;margin:0 auto; }
//         .dms-h2 { font-size:42px;font-weight:900;letter-spacing:-1.2px;margin-bottom:18px;line-height:1.05; }

//         .dms-feat-card { background:#0a1628;border:1px solid rgba(30,45,69,0.8);border-radius:20px;padding:32px;height:100%;cursor:default;position:relative;overflow:hidden;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s,border-color 0.35s; }
//         .dms-feat-card::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,50%),var(--feat-glow,transparent) 0%,transparent 60%);opacity:0;transition:opacity 0.4s;border-radius:20px;pointer-events:none; }
//         .dms-feat-card:hover { transform:translateY(-6px);box-shadow:0 28px 56px rgba(0,0,0,0.5); }
//         .dms-feat-card:hover::before { opacity:1; }
//         .dms-feat-card-hover-line { position:absolute;bottom:0;left:0;right:0;height:2px;opacity:0;transition:opacity 0.35s; }
//         .dms-feat-card:hover .dms-feat-card-hover-line { opacity:1; }

//         .dms-role-card { border-radius:22px;border:1px solid rgba(30,45,69,0.8);overflow:hidden;display:flex;flex-direction:column;height:100%;background:#0a1628;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s,border-color 0.35s; }
//         .dms-role-card:hover { transform:translateY(-6px);box-shadow:0 32px 64px rgba(0,0,0,0.5); }

//         .dms-source-card { background:rgba(10,22,40,0.8);border:1px solid rgba(30,45,69,0.6);border-radius:16px;padding:24px 20px;text-align:center;transition:transform 0.25s,box-shadow 0.25s,border-color 0.25s;backdrop-filter:blur(8px); }
//         .dms-source-card:hover { transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.4);border-color:var(--src-c,#60a5fa); }

//         .dms-standard-item { display:flex;align-items:flex-start;gap:16px;background:rgba(10,22,40,0.8);border:1px solid rgba(30,45,69,0.6);border-radius:14px;padding:18px 20px;transition:all 0.2s; }
//         .dms-standard-item:hover { border-color:rgba(59,130,246,0.3);transform:translateX(4px);box-shadow:0 8px 24px rgba(0,0,0,0.3); }

//         .dms-emergency-card { display:block;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px 16px;text-align:center;text-decoration:none;transition:all 0.25s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden; }
//         .dms-emergency-card::before { content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,var(--em-c,#ef4444)15 0%,transparent 60%);opacity:0;transition:opacity 0.3s; }
//         .dms-emergency-card:hover { transform:translateY(-6px);border-color:var(--em-c,#ef4444);box-shadow:0 20px 48px rgba(0,0,0,0.4); }
//         .dms-emergency-card:hover::before { opacity:1; }
//         .dms-emergency-card:hover .dms-em-bar { width:100% !important; }

//         .dms-nav-link { padding:8px 16px;font-size:13px;font-weight:500;color:rgba(160,190,220,0.75);border-radius:10px;text-decoration:none;transition:all 0.15s;letter-spacing:0.1px; }
//         .dms-nav-link:hover { background:rgba(255,255,255,0.07);color:#f0f6ff; }

//         .dms-btn-primary { display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:15px 30px;border-radius:13px;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 8px 28px rgba(37,99,235,0.45),inset 0 1px 0 rgba(255,255,255,0.15);transition:all 0.2s;letter-spacing:-0.1px;position:relative;overflow:hidden; }
//         .dms-btn-primary:hover { transform:translateY(-3px);box-shadow:0 14px 36px rgba(37,99,235,0.6); }
//         .dms-btn-outline { display:inline-flex;align-items:center;gap:10px;border:1.5px solid rgba(255,255,255,0.12);color:#cdd9f0;padding:15px 30px;border-radius:13px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;backdrop-filter:blur(8px);background:rgba(255,255,255,0.03); }
//         .dms-btn-outline:hover { border-color:rgba(255,255,255,0.3);color:#fff;background:rgba(255,255,255,0.07);transform:translateY(-2px); }
//         .dms-btn-ghost { display:inline-flex;align-items:center;gap:10px;color:rgba(160,190,220,0.7);padding:15px 20px;border-radius:13px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s; }
//         .dms-btn-ghost:hover { color:#f0f6ff;background:rgba(255,255,255,0.04);transform:translateY(-2px); }

//         .dms-cta-white { display:inline-flex;align-items:center;gap:10px;background:#fff;color:#1e40af;padding:16px 34px;border-radius:14px;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 12px 36px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.5);transition:all 0.25s;letter-spacing:-0.2px; }
//         .dms-cta-white:hover { background:#eff6ff;transform:translateY(-3px);box-shadow:0 20px 48px rgba(0,0,0,0.4); }
//         .dms-cta-ghost { display:inline-flex;align-items:center;gap:10px;border:2px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);padding:16px 34px;border-radius:14px;font-weight:600;font-size:15px;text-decoration:none;transition:all 0.25s;backdrop-filter:blur(8px);background:rgba(255,255,255,0.04); }
//         .dms-cta-ghost:hover { border-color:rgba(255,255,255,0.45);color:#fff;background:rgba(255,255,255,0.1);transform:translateY(-2px); }

//         .dms-desktop-nav  { display:flex !important; }
//         .dms-desktop-auth { display:flex !important; }
//         .dms-hamburger    { display:none !important; }

//         @media (max-width:1023px) {
//           .dms-desktop-nav  { display:none !important; }
//           .dms-desktop-auth { display:none !important; }
//           .dms-hamburger    { display:flex !important; }
//           [data-grid="4"]   { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="3"]   { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="6"]   { grid-template-columns:repeat(3,1fr) !important; }
//           [data-grid="2"]   { grid-template-columns:1fr !important;gap:48px !important; }
//           .dms-h2           { font-size:32px !important; }
//         }
//         @media (max-width:640px) {
//           [data-grid="4"]  { grid-template-columns:1fr 1fr !important; }
//           [data-grid="3"]  { grid-template-columns:1fr !important; }
//           [data-grid="6"]  { grid-template-columns:repeat(2,1fr) !important; }
//           [data-grid="2"]  { grid-template-columns:1fr !important; }
//           .dms-h2          { font-size:26px !important; }
//           .dms-team-card   { grid-template-columns:1fr !important; }
//         }
//       `}</style>
//     </div>
//   )
// }

// // ══════════════════════════════════════════════════════════════════════════════
// //  APP ROOT
// // ══════════════════════════════════════════════════════════════════════════════
// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppInner />
//       </Router>
//     </AuthProvider>
//   )
// }

// function AppInner() {
//   const { path } = useLocation()

//   let pageContent
//   if (path === '/') pageContent = <HomePage />
//   else if (path === '/register') pageContent = <PlaceholderPage title="Register" />
//   else if (path === '/login') pageContent = <PlaceholderPage title="Login" />
//   else if (path === '/dashboard') pageContent = <PlaceholderPage title="Dashboard" />
//   else pageContent = <PlaceholderPage title="Page Not Found" />

//   return (
//     <MainLayout currentPath={path}>
//       {pageContent}
//     </MainLayout>
//   )
// }