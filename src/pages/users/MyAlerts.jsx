// import React, { useEffect, useState, useCallback } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import {
//   BellAlertIcon, MapPinIcon, ClockIcon,
//   ShieldExclamationIcon, CheckCircleIcon,
//   ExclamationTriangleIcon, InformationCircleIcon,
//   EyeIcon, ArrowPathIcon,
// } from '@heroicons/react/24/outline'
// import { alertAPI } from '../../services/api'

// const SEV = {
//   danger:  { label:'DANGER',  badge:'bg-red-50 text-red-700 border-red-200',    border:'border-l-red-500',    row:'bg-red-50/30',     icon:'text-red-500',    glow:'shadow-red-100'    },
//   warning: { label:'WARNING', badge:'bg-orange-50 text-orange-700 border-orange-200', border:'border-l-orange-400', row:'bg-orange-50/20', icon:'text-orange-500', glow:'shadow-orange-100' },
//   watch:   { label:'WATCH',   badge:'bg-yellow-50 text-yellow-700 border-yellow-200', border:'border-l-yellow-400', row:'bg-yellow-50/20', icon:'text-yellow-500', glow:'shadow-yellow-100' },
//   info:    { label:'INFO',    badge:'bg-blue-50 text-blue-700 border-blue-200',   border:'border-l-blue-400',   row:'bg-blue-50/20',    icon:'text-blue-500',   glow:'shadow-blue-100'   },
// }
// const TYPE_STYLE = {
//   Earthquake:{ bg:'bg-orange-100', text:'text-orange-700', letter:'E' },
//   Flood:     { bg:'bg-cyan-100',   text:'text-cyan-700',   letter:'F' },
//   Cyclone:   { bg:'bg-red-100',    text:'text-red-700',    letter:'C' },
//   Advisory:  { bg:'bg-purple-100', text:'text-purple-700', letter:'A' },
// }

// function timeAgo(ts){ const d=Date.now()-new Date(ts).getTime(),m=Math.floor(d/60000); if(m<1)return'Just now'; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago` }
// function getAlertTimestamp(alert){ return alert.timeline?.issuedAt || alert.issuedAt || alert.createdAt }

// function SevIcon({ severity }){
//   if(severity==='danger'||severity==='warning') return <ExclamationTriangleIcon className={`h-5 w-5 ${SEV[severity]?.icon}`}/>
//   if(severity==='watch') return <ShieldExclamationIcon className="h-5 w-5 text-yellow-500"/>
//   return <InformationCircleIcon className="h-5 w-5 text-blue-500"/>
// }

// function AlertCard({ alert, onRead }){
//   const navigate = useNavigate()
//   const s = SEV[alert.severity] || SEV.info
//   const t = TYPE_STYLE[alert.disasterType] || {bg:'bg-white/40 dark:bg-black/20',text:'text-slate-600 dark:text-slate-300',letter:'?'}
//   const isNew = !alert.read

//   const handleViewOnMap = () => {
//     const location = alert.targetLocation?.coordinates || { latitude: 20.5937, longitude: 78.9629 }
//     navigate('/dashboard/tasks', { 
//       state: { 
//         focusLocation: location,
//         focusTitle: alert.title,
//         focusType: 'alert'
//       } 
//     })
//   }

//   return (
//     <div className={`relative border-l-4 ${s.border} rounded-r-2xl shadow-sm hover:shadow-lg ${s.glow} transition-all duration-200 ${s.row} ${isNew?'ring-1 ring-blue-200':''}`}>
//       {/* NEW badge */}
//       {isNew && (
//         <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md shadow-blue-200">
//           NEW
//         </div>
//       )}

//       <div className="p-5">
//         <div className="flex items-start gap-4">
//           {/* Type avatar */}
//           <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
//             <span className={`text-lg font-black ${t.text}`}>{t.letter}</span>
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-3">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                   <h3 className={`font-bold text-sm ${isNew?'text-slate-900 dark:text-white':'text-slate-700 dark:text-slate-200'}`}>{alert.title}</h3>
//                   <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${s.badge}`}>{s.label}</span>
//                   <span className={`text-xs px-2 py-0.5 rounded-lg ${t.bg} ${t.text} font-semibold`}>{alert.disasterType}</span>
//                 </div>
//                 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
//               </div>
//               {/* Read button */}
//               <div className="flex flex-col items-end gap-2">
//                 {isNew && (
//                   <button onClick={()=>onRead(alert._id)}
//                     className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
//                     <EyeIcon className="h-3.5 w-3.5"/>Mark read
//                   </button>
//                 )}
//                 {!isNew && <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0"/>}
                
//                 {/* VIEW ON MAP BUTTON */}
//                 <button 
//                   onClick={handleViewOnMap}
//                   className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all flex-shrink-0"
//                 >
//                   <MapPinIcon className="h-3.5 w-3.5"/>View Map
//                 </button>
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
//               <span className="flex items-center gap-1.5"><MapPinIcon className="h-3.5 w-3.5"/>{alert.targetLocation?.city}</span>
//               <span className="flex items-center gap-1.5"><ClockIcon className="h-3.5 w-3.5"/>
//                 {new Date(getAlertTimestamp(alert)).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
//               </span>
//               <span className="font-medium text-slate-500 dark:text-slate-400">Source: {alert.source}</span>
//               <span className="ml-auto font-medium text-slate-500 dark:text-slate-400">{timeAgo(getAlertTimestamp(alert))}</span>
//             </div>

//             {/* Safety advice */}
//             {(alert.severity==='danger'||alert.severity==='warning') && (
//               <div className="mt-3 p-3 bg-white/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
//                 <ExclamationTriangleIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${s.icon}`}/>
//                 <span>
//                   {alert.severity==='danger'
//                     ? 'Immediate action may be required. Follow instructions from local authorities and stay away from affected areas.'
//                     : 'Stay alert and monitor updates from local authorities. Prepare emergency kit if in affected area.'}
//                 </span>
//               </div>
//             )}

//             {(alert.disaster?._id || alert._id) && (
//               <div className="mt-3 flex items-center justify-between gap-3">
//                 <div className="text-xs text-slate-500 dark:text-slate-400">
//                   {alert.disaster?.name
//                     ? `Linked disaster: ${alert.disaster.name}`
//                     : 'Open this alert for the full situation details'}
//                 </div>
//                 <Link
//                   to={alert.disaster?._id ? `/dashboard/disasters/${alert.disaster._id}` : `/dashboard/alerts/${alert._id}`}
//                   className="text-xs font-bold text-blue-600 hover:text-blue-800"
//                 >
//                   View details
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// const MyAlerts = () => {
//   const [alerts,     setAlerts]     = useState([])
//   const [loading,    setLoading]    = useState(true)
//   const [filter,     setFilter]     = useState('all')
//   const [lastFetch,  setLastFetch]  = useState(null)
//   const [clock,      setClock]      = useState('')

//   useEffect(()=>{ const tick=()=>{ const ist=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'})); setClock(`${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${String(ist.getSeconds()).padStart(2,'0')}`) }; tick(); const id=setInterval(tick,1000); return()=>clearInterval(id) },[])

//   const fetchMyAlerts = useCallback(async()=>{
//     setLoading(true)
//     try {
//       const r = await alertAPI.getMyAlerts()
//       setAlerts(r.data?.data?.alerts || [])
//       setLastFetch(new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'}))
//     } catch(e) {
//       console.error('Failed to fetch alerts:', e)
//       setAlerts([])
//     } finally { setLoading(false) }
//   },[])

//   useEffect(()=>{ fetchMyAlerts() },[fetchMyAlerts])
//   // Poll every 60 seconds for new alerts
//   useEffect(()=>{ const id=setInterval(fetchMyAlerts,60000); return()=>clearInterval(id) },[fetchMyAlerts])

//   const markRead = async(id) => {
//     try {
//       await alertAPI.markRead(id)
//       setAlerts(prev => prev.map(a => a._id===id ? {...a,read:true} : a))
//     } catch(e){ console.error(e) }
//   }

//   const markAllRead = async() => {
//     const unread = alerts.filter(a=>!a.read)
//     await Promise.all(unread.map(a=>alertAPI.markRead(a._id).catch(()=>{})))
//     setAlerts(prev=>prev.map(a=>({...a,read:true})))
//   }

//   const counts = alerts.reduce((acc,a)=>{ acc[a.severity]=(acc[a.severity]||0)+1; return acc },{danger:0,warning:0,watch:0,info:0})
//   const unreadCount = alerts.filter(a=>!a.read).length
//   const filtered = filter==='all'?alerts:filter==='unread'?alerts.filter(a=>!a.read):alerts.filter(a=>a.severity===filter)

//   return (
//     <div className="min-h-screen bg-white/30 dark:bg-black/10/70">

//       {/* Header */}
//       <div className="bg-white dark:bg-slate-800/60 border-b border-slate-200/40 dark:border-slate-700/40 sticky top-0 z-20 shadow-sm">
//         <div className="px-8 py-4 flex items-center justify-between">
//           <div>
//             <div className="flex items-center gap-2 mb-0.5">
//               <BellAlertIcon className="h-5 w-5 text-blue-600"/>
//               <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Alerts</h1>
//               {unreadCount>0 && (
//                 <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
//                   {unreadCount} new
//                 </span>
//               )}
//             </div>
//             <p className="text-xs text-slate-400 dark:text-slate-500">
//               Disaster alerts sent to you by administrators
//               {lastFetch && <span className="ml-2 text-green-600 font-medium">· Updated {lastFetch} IST</span>}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:flex items-center gap-2 bg-gray-900 text-green-400 px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
//               {clock} IST
//             </div>
//             {unreadCount>0 && (
//               <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
//                 <CheckCircleIcon className="h-4 w-4"/>Mark all read
//               </button>
//             )}
//             <button onClick={fetchMyAlerts} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all">
//               <ArrowPathIcon className={`h-4 w-4 ${loading?'animate-spin':''}`}/>
//               {loading?'Loading…':'Refresh'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6 space-y-5">

//         {/* Summary cards */}
//         {!loading && alerts.length>0 && (
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               {level:'danger', label:'Danger',  count:counts.danger  },
//               {level:'warning',label:'Warning', count:counts.warning },
//               {level:'watch',  label:'Watch',   count:counts.watch   },
//               {level:'info',   label:'Info',    count:counts.info    },
//             ].map(c=>{
//               return (
//                 <div key={c.level} className="bg-white dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-2xl p-5">
//                   <div className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">{c.label.toUpperCase()}</div>
//                   <div className={`text-4xl font-black ${c.count>0?`text-${c.level==='danger'?'red':c.level==='warning'?'orange':c.level==='watch'?'yellow':'blue'}-600`:'text-gray-200'}`}>
//                     {c.count}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         {/* Filter tabs */}
//         {!loading && alerts.length>0 && (
//           <div className="flex items-center gap-2 flex-wrap">
//             {[
//               {key:'all',     label:'All Alerts', count:alerts.length},
//               {key:'unread',  label:'Unread',     count:unreadCount},
//               {key:'danger',  label:'Danger',     count:counts.danger},
//               {key:'warning', label:'Warning',    count:counts.warning},
//               {key:'watch',   label:'Watch',      count:counts.watch},
//               {key:'info',    label:'Info',       count:counts.info},
//             ].filter(t=>t.count>0||t.key==='all').map(t=>{
//               const active=filter===t.key
//               return (
//                 <button key={t.key} onClick={()=>setFilter(t.key)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active?t.key==='unread'?'bg-red-500 text-white shadow-lg':t.key==='all'?'bg-gray-900 text-white shadow-lg':SEV[t.key]?.pill+' shadow-lg'||'bg-gray-900 text-white':'bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-slate-200/60 dark:border-slate-700/50'}`}>
//                   {t.label}
//                   <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active?'bg-white/25 text-white':'bg-white/40 dark:bg-black/20 text-slate-500 dark:text-slate-400'}`}>{t.count}</span>
//                 </button>
//               )
//             })}
//           </div>
//         )}

//         {/* Alert list */}
//         {loading ? (
//           <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/40 dark:border-slate-700/40 py-20 flex flex-col items-center gap-4">
//             <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"/>
//             <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading your alerts…</p>
//           </div>
//         ) : filtered.length===0 ? (
//           <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/40 dark:border-slate-700/40 py-20 flex flex-col items-center gap-4">
//             <div className="w-16 h-16 rounded-2xl bg-white/30 dark:bg-black/10 flex items-center justify-center">
//               <BellAlertIcon className="h-8 w-8 text-slate-300 dark:text-slate-600"/>
//             </div>
//             <div className="text-center">
//               <p className="text-base font-semibold text-slate-600 dark:text-slate-300">
//                 {filter==='all'?'No alerts yet':'No '+filter+' alerts'}
//               </p>
//               <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
//                 {filter==='all'
//                   ?'Administrators will send disaster alerts here when needed'
//                   :'Try selecting a different filter above'}
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             <div className="text-xs text-slate-400 dark:text-slate-500 font-medium px-1">
//               {filtered.length} alert{filtered.length!==1?'s':''} · Sorted by severity & time
//             </div>
//             {filtered.map(alert=>(
//               <AlertCard key={alert._id} alert={alert} onRead={markRead}/>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default MyAlerts


import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BellAlertIcon, MapPinIcon, ClockIcon,
  ShieldExclamationIcon, CheckCircleIcon,
  ExclamationTriangleIcon, InformationCircleIcon,
  EyeIcon, ArrowPathIcon, XMarkIcon,
  ArrowTopRightOnSquareIcon, ChevronRightIcon,
  FireIcon, CloudIcon, GlobeAltIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { alertAPI } from '../../services/api'

/* ─── Severity config ─────────────────────────────────────── */
const SEV = {
  danger:  {
    label: 'DANGER',
    badge: 'bg-red-100 text-red-700 border-red-300',
    border: 'border-l-red-500',
    row: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-500',
    glow: 'shadow-red-100 dark:shadow-red-900/20',
    dot: 'bg-red-500',
    drawerBg: 'from-red-50 to-white dark:from-red-950/40 dark:to-slate-900',
    pill: 'bg-red-600 text-white',
  },
  warning: {
    label: 'WARNING',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    border: 'border-l-orange-500',
    row: 'bg-orange-50 dark:bg-orange-950/30',
    icon: 'text-orange-500',
    glow: 'shadow-orange-100 dark:shadow-orange-900/20',
    dot: 'bg-orange-500',
    drawerBg: 'from-orange-50 to-white dark:from-orange-950/40 dark:to-slate-900',
    pill: 'bg-orange-500 text-white',
  },
  watch: {
    label: 'WATCH',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    border: 'border-l-yellow-500',
    row: 'bg-yellow-50 dark:bg-yellow-950/20',
    icon: 'text-yellow-600',
    glow: 'shadow-yellow-100 dark:shadow-yellow-900/20',
    dot: 'bg-yellow-500',
    drawerBg: 'from-yellow-50 to-white dark:from-yellow-950/40 dark:to-slate-900',
    pill: 'bg-yellow-500 text-white',
  },
  info: {
    label: 'INFO',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    border: 'border-l-blue-500',
    row: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-500',
    glow: 'shadow-blue-100 dark:shadow-blue-900/20',
    dot: 'bg-blue-500',
    drawerBg: 'from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900',
    pill: 'bg-blue-600 text-white',
  },
}

/* ─── Disaster type config ────────────────────────────────── */
const getTypeStyle = (type) => {
  const map = {
    Earthquake: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', Icon: GlobeAltIcon },
    Flood:      { bg: 'bg-cyan-100 dark:bg-cyan-900/40',     text: 'text-cyan-700 dark:text-cyan-300',     Icon: CloudIcon },
    Cyclone:    { bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-700 dark:text-red-300',       Icon: ShieldExclamationIcon },
    Advisory:   { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', Icon: DocumentTextIcon },
    'Heat Wave':{ bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-700 dark:text-amber-300',   Icon: FireIcon },
    Fire:       { bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-700 dark:text-red-300',       Icon: FireIcon },
  }
  return map[type] || { bg: 'bg-slate-100 dark:bg-slate-700/60', text: 'text-slate-600 dark:text-slate-300', Icon: InformationCircleIcon }
}

/* ─── Helpers ─────────────────────────────────────────────── */
function timeAgo(ts) {
  const d = Date.now() - new Date(ts).getTime(), m = Math.floor(d / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
function getAlertTimestamp(alert) {
  return alert.timeline?.issuedAt || alert.issuedAt || alert.createdAt
}
function fmtDate(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/* ─── Detail Drawer ───────────────────────────────────────── */
function DetailDrawer({ alert, onClose, onRead }) {
  if (!alert) return null
  const s = SEV[alert.severity] || SEV.info
  const t = getTypeStyle(alert.disasterType)
  const ts = getAlertTimestamp(alert)
  const isNew = !alert.read

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col bg-white dark:bg-slate-900 overflow-hidden">

        {/* Drawer header */}
        <div className={`bg-gradient-to-br ${s.drawerBg} border-b border-slate-200/60 dark:border-slate-700/60 p-5 flex-shrink-0`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
                <t.Icon className={`h-5 w-5 ${t.text}`} />
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.badge}`}>{s.label}</span>
                <span className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full ${t.bg} ${t.text}`}>{alert.disasterType}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white leading-tight">
            {alert.title}
          </h2>

          {isNew && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">New — not yet read</span>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Message */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Alert Message</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
              {alert.message}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Location</p>
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.targetLocation?.city || 'N/A'}</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Source</p>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.source || 'N/A'}</span>
            </div>
            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Issued At</p>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fmtDate(ts)}</span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 font-medium">{timeAgo(ts)}</span>
              </div>
            </div>
          </div>

          {/* Safety advice */}
          {(alert.severity === 'danger' || alert.severity === 'warning') && (
            <div className={`rounded-xl p-4 border ${alert.severity === 'danger' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className={`h-4 w-4 flex-shrink-0 ${s.icon}`} />
                <p className={`text-xs font-bold uppercase tracking-widest ${s.icon}`}>Safety Advice</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {alert.severity === 'danger'
                  ? 'Immediate action may be required. Follow instructions from local authorities and stay away from affected areas.'
                  : 'Stay alert and monitor updates from local authorities. Prepare emergency kit if in affected area.'}
              </p>
            </div>
          )}

          {/* Linked disaster */}
          {alert.disaster?.name && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700/40">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Linked Disaster</p>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.disaster.name}</span>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/60 p-4 flex-shrink-0 bg-white dark:bg-slate-900 flex items-center gap-3">
          {isNew && (
            <button
              onClick={() => onRead(alert._id)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2.5 rounded-xl transition-colors border border-blue-200/60 dark:border-blue-800/40"
            >
              <EyeIcon className="h-4 w-4" /> Mark as read
            </button>
          )}
          <Link
            to={alert.disaster?._id ? `/dashboard/disasters/${alert.disaster._id}` : `/dashboard/alerts/${alert._id}`}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ml-auto"
            onClick={onClose}
          >
            Full Details <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  )
}

/* ─── Alert Card ──────────────────────────────────────────── */
function AlertCard({ alert, onRead, onViewDetails }) {
  const navigate = useNavigate()
  const s = SEV[alert.severity] || SEV.info
  const t = getTypeStyle(alert.disasterType)
  const isNew = !alert.read
  const ts = getAlertTimestamp(alert)

  const handleViewOnMap = (e) => {
    e.stopPropagation()
    const location = alert.targetLocation?.coordinates || { latitude: 20.5937, longitude: 78.9629 }
    navigate('/dashboard/tasks', {
      state: { focusLocation: location, focusTitle: alert.title, focusType: 'alert' }
    })
  }

  return (
    <div
      onClick={() => onViewDetails(alert)}
      className={`relative border-l-4 ${s.border} rounded-r-2xl shadow-sm hover:shadow-lg ${s.glow} transition-all duration-200 ${s.row} ${isNew ? 'ring-2 ring-blue-300 dark:ring-blue-600/50' : ''} cursor-pointer group`}
    >
      {isNew && (
        <div className="absolute -top-2.5 -right-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md shadow-blue-200 dark:shadow-blue-900/40 z-10">
          NEW
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Type avatar */}
          <div className={`w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <t.Icon className={`h-6 w-6 ${t.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className={`font-black text-sm ${isNew ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {alert.title}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${s.badge}`}>{s.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${t.bg} ${t.text}`}>{alert.disasterType}</span>
                </div>
                {/* Message — now properly visible */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {alert.message}
                </p>
              </div>

              {/* Right-side actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {isNew
                  ? <button
                      onClick={(e) => { e.stopPropagation(); onRead(alert._id) }}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors border border-blue-200/60 dark:border-blue-800/40"
                    >
                      <EyeIcon className="h-3.5 w-3.5" /> Mark read
                    </button>
                  : <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                }
                <button
                  onClick={handleViewOnMap}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 transition-all"
                >
                  <MapPinIcon className="h-3.5 w-3.5" /> View Map
                </button>
              </div>
            </div>

            {/* Meta row — high-contrast */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <MapPinIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-500" />
                {alert.targetLocation?.city || 'Unknown location'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <ClockIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-500" />
                {new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Source: <span className="font-bold">{alert.source}</span>
              </span>
              <span className={`ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full ${s.dot === 'bg-red-500' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : s.dot === 'bg-orange-500' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : s.dot === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                {timeAgo(ts)}
              </span>
            </div>

            {/* Safety banner for danger/warning */}
            {(alert.severity === 'danger' || alert.severity === 'warning') && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${alert.severity === 'danger' ? 'bg-red-100/70 dark:bg-red-950/40 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300' : 'bg-orange-100/70 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/40 text-orange-700 dark:text-orange-300'}`}>
                <ExclamationTriangleIcon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${s.icon}`} />
                <span className="font-medium">
                  {alert.severity === 'danger'
                    ? 'Immediate action may be required. Follow local authority instructions.'
                    : 'Stay alert. Monitor updates and prepare emergency kit if in affected area.'}
                </span>
              </div>
            )}

            {/* View details CTA */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {alert.disaster?.name ? `Linked disaster: ${alert.disaster.name}` : 'Click this card to view full alert details'}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                View details <ChevronRightIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────── */
const MyAlerts = () => {
  const [alerts,     setAlerts]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [lastFetch,  setLastFetch]  = useState(null)
  const [clock,      setClock]      = useState('')
  const [selected,   setSelected]   = useState(null)   // drawer state

  useEffect(() => {
    const tick = () => {
      const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      setClock(`${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${String(ist.getSeconds()).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  const fetchMyAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const r = await alertAPI.getMyAlerts()
      setAlerts(r.data?.data?.alerts || [])
      setLastFetch(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (e) {
      console.error('Failed to fetch alerts:', e)
      setAlerts([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMyAlerts() }, [fetchMyAlerts])
  useEffect(() => { const id = setInterval(fetchMyAlerts, 60000); return () => clearInterval(id) }, [fetchMyAlerts])

  const markRead = async (id) => {
    try {
      await alertAPI.markRead(id)
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, read: true } : a))
      if (selected?._id === id) setSelected(prev => ({ ...prev, read: true }))
    } catch (e) { console.error(e) }
  }

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read)
    await Promise.all(unread.map(a => alertAPI.markRead(a._id).catch(() => {})))
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
    if (selected) setSelected(prev => ({ ...prev, read: true }))
  }

  const counts = alerts.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc }, { danger: 0, warning: 0, watch: 0, info: 0 })
  const unreadCount = alerts.filter(a => !a.read).length
  const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.read) : alerts.filter(a => a.severity === filter)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 relative">

      {/* ── Sticky Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <BellAlertIcon className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Alerts</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm shadow-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Disaster alerts sent to you by administrators
              {lastFetch && <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">· Updated {lastFetch} IST</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-green-400 px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {clock} IST
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-200/60 dark:border-blue-800/40"
              >
                <CheckCircleIcon className="h-4 w-4" /> Mark all read
              </button>
            )}
            <button
              onClick={fetchMyAlerts}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 space-y-5">

        {/* ── Summary cards ── */}
        {!loading && alerts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: 'danger',  label: 'Danger',  count: counts.danger,  color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-950/40',    border: 'border-red-200 dark:border-red-800/40' },
              { level: 'warning', label: 'Warning', count: counts.warning, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800/40' },
              { level: 'watch',   label: 'Watch',   count: counts.watch,   color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-yellow-200 dark:border-yellow-800/40' },
              { level: 'info',    label: 'Info',    count: counts.info,    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/40',   border: 'border-blue-200 dark:border-blue-800/40' },
            ].map(c => (
              <button
                key={c.level}
                onClick={() => setFilter(c.count > 0 ? c.level : 'all')}
                className={`${c.bg} border ${c.border} rounded-2xl p-5 text-left transition-all hover:shadow-md ${filter === c.level ? 'ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-600' : ''}`}
              >
                <div className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2">{c.label.toUpperCase()}</div>
                <div className={`text-4xl font-black ${c.count > 0 ? c.color : 'text-slate-300 dark:text-slate-700'}`}>{c.count}</div>
              </button>
            ))}
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && alerts.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all',     label: 'All Alerts', count: alerts.length },
              { key: 'unread',  label: 'Unread',     count: unreadCount },
              { key: 'danger',  label: 'Danger',     count: counts.danger },
              { key: 'warning', label: 'Warning',    count: counts.warning },
              { key: 'watch',   label: 'Watch',      count: counts.watch },
              { key: 'info',    label: 'Info',       count: counts.info },
            ].filter(t => t.count > 0 || t.key === 'all').map(t => {
              const active = filter === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    active
                      ? t.key === 'unread' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/30'
                      : t.key === 'all'    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg'
                      : SEV[t.key]         ? `${SEV[t.key].pill} border-transparent shadow-lg`
                      : 'bg-slate-900 text-white border-slate-900 shadow-lg'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active ? 'bg-white/25 text-inherit' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {t.count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Alert list ── */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/40 py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading your alerts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/40 py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700/40 flex items-center justify-center">
              <BellAlertIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-600 dark:text-slate-300">
                {filter === 'all' ? 'No alerts yet' : `No ${filter} alerts`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {filter === 'all'
                  ? 'Administrators will send disaster alerts here when needed'
                  : 'Try selecting a different filter above'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
              {filtered.length} alert{filtered.length !== 1 ? 's' : ''} · Sorted by severity &amp; time · Click any card to view details
            </div>
            {filtered.map(alert => (
              <AlertCard
                key={alert._id}
                alert={alert}
                onRead={markRead}
                onViewDetails={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <DetailDrawer
          alert={selected}
          onClose={() => setSelected(null)}
          onRead={markRead}
        />
      )}
    </div>
  )
}

export default MyAlerts