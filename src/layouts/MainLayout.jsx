
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