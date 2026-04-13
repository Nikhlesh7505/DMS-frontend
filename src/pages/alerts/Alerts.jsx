// import React, { useEffect, useState, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import {
//   BellAlertIcon, MapPinIcon, ClockIcon, ShieldExclamationIcon,
//   ArrowPathIcon, SignalIcon, CheckCircleIcon, PaperAirplaneIcon,
//   UserGroupIcon, XMarkIcon, CheckIcon, ChevronRightIcon,
//   MagnifyingGlassIcon, FunnelIcon, TrashIcon,
// } from '@heroicons/react/24/outline'
// import { alertAPI, userAPI } from '../../services/api'

// // ── Scientific thresholds ────────────────────────────────────────
// const FLOOD_RAIN = [
//   { min:204.5, level:'danger',  tag:'Extremely Heavy Rain', imd:'Red Alert'    },
//   { min:115.6, level:'warning', tag:'Very Heavy Rain',      imd:'Orange Alert' },
//   { min:64.5,  level:'watch',   tag:'Heavy Rain',           imd:'Yellow Alert' },
//   { min:15.6,  level:'info',    tag:'Moderate Rain',        imd:'Normal'       },
// ]
// const EQ_MAG = [
//   { min:7.0, level:'danger',  label:'Major Earthquake'    },
//   { min:6.0, level:'warning', label:'Strong Earthquake'   },
//   { min:5.0, level:'watch',   label:'Moderate Earthquake' },
//   { min:4.5, level:'info',    label:'Light Earthquake'    },
// ]
// const TSUNAMI_ZONES = [
//   { latMin:6,  latMax:14, lonMin:92, lonMax:96  },
//   { latMin:22, latMax:28, lonMin:57, lonMax:65  },
//   { latMin:-8, latMax:6,  lonMin:95, lonMax:106 },
//   { latMin:5,  latMax:15, lonMin:57, lonMax:70  },
// ]

// function getDynStart(days){ const d=new Date(); d.setDate(d.getDate()-days); return d.toISOString().split('T')[0] }
// function timeAgo(ts){ const d=Date.now()-ts,m=Math.floor(d/60000); if(m<1)return'Just now'; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago` }

// function buildLiveAlerts(eqFeatures, wxData, cyFeatures){
//   const alerts=[]
//   if(eqFeatures?.length){
//     const sortedEarthquakes = [...eqFeatures].sort((a,b)=>b.properties.mag-a.properties.mag)
//     sortedEarthquakes.slice(0,12).forEach(q=>{
//       const mag=q.properties.mag,cat=EQ_MAG.find(t=>mag>=t.min); if(!cat)return
//       const depth=q.geometry.coordinates[2],lat=q.geometry.coordinates[1],lon=q.geometry.coordinates[0]
//       const inZone=TSUNAMI_ZONES.some(z=>lat>=z.latMin&&lat<=z.latMax&&lon>=z.lonMin&&lon<=z.lonMax)
//       let severity=cat.level
//       if(mag>=6.5&&depth<100&&inZone) severity='danger'
//       alerts.push({ _id:`eq-${q.id}`, title:`${cat.label} — M${mag.toFixed(1)}`, message:`Depth ${depth.toFixed(0)} km${inZone&&mag>=6.5?' · ⚠ Tsunami-capable zone':''}${q.properties.alert&&q.properties.alert!=='green'?` · USGS Alert: ${q.properties.alert.toUpperCase()}`:''}`, severity, disasterType:'Earthquake', source:'USGS', location:q.properties.place, issuedAt:new Date(q.properties.time).toISOString(), ts:q.properties.time })
//     })
//   }
//   if(wxData?.daily){
//     const rain=wxData.daily.precipitation_sum||[],wind=wxData.daily.windspeed_10m_max||[],dates=wxData.daily.time||[]
//     rain.forEach((r,i)=>{ const cat=FLOOD_RAIN.find(t=>r>=t.min); if(!cat)return; alerts.push({ _id:`flood-${i}`, title:`${cat.tag} Forecast`, message:`${r.toFixed(1)} mm/day · Wind ${(wind[i]||0).toFixed(0)} km/h · IMD: ${cat.imd}`, severity:cat.level, disasterType:'Flood', source:'Open-Meteo', location:'Central India (20.5°N 78.9°E)', issuedAt:new Date(dates[i]).toISOString(), ts:new Date(dates[i]).getTime() }) })
//   }
//   if(cyFeatures?.length){
//     cyFeatures.forEach((c,i)=>{ const nm=c.properties?.name||'Tropical Cyclone'; alerts.push({ _id:`cy-${i}`, title:`Active Cyclone — ${nm}`, message:'GDACS Red Alert · Active tropical cyclone · Seek shelter immediately', severity:'danger', disasterType:'Cyclone', source:'GDACS', location:'Indian Ocean basin', issuedAt:new Date().toISOString(), ts:Date.now() }) })
//   }
//   const order={danger:0,warning:1,watch:2,info:3}
//   return alerts.sort((a,b)=>(order[a.severity]-order[b.severity])||(b.ts-a.ts))
// }

// // ── Design tokens ────────────────────────────────────────────────
// const SEV = {
//   danger:  { label:'DANGER',  pill:'bg-red-600 text-white',    badge:'bg-red-500/10 text-red-400 border-red-500/30',    border:'border-l-red-500',    row:'bg-red-500/5 dark:bg-red-950/40 hover:bg-red-500/10 dark:hover:bg-red-950/60',    dot:'bg-red-500'    },
//   warning: { label:'WARNING', pill:'bg-orange-500 text-white', badge:'bg-orange-500/10 text-orange-400 border-orange-500/30', border:'border-l-orange-400', row:'bg-orange-500/5 dark:bg-orange-950/40 hover:bg-orange-500/10 dark:hover:bg-orange-950/60', dot:'bg-orange-400' },
//   watch:   { label:'WATCH',   pill:'bg-yellow-500 text-white', badge:'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', border:'border-l-yellow-400', row:'bg-yellow-500/5 dark:bg-yellow-950/40 hover:bg-yellow-500/10 dark:hover:bg-yellow-950/60', dot:'bg-yellow-400' },
//   info:    { label:'INFO',    pill:'bg-blue-500 text-white',   badge:'bg-blue-500/10 text-blue-400 border-blue-500/30',   border:'border-l-blue-400',   row:'bg-blue-500/5 dark:bg-blue-950/40 hover:bg-blue-500/10 dark:hover:bg-blue-950/60',    dot:'bg-blue-400'   },
// }
// const TYPE_STYLE = {
//   Earthquake:{ bg:'bg-orange-100', text:'text-orange-700', letter:'E' },
//   Flood:     { bg:'bg-cyan-100',   text:'text-cyan-700',   letter:'F' },
//   Cyclone:   { bg:'bg-red-100',    text:'text-red-700',    letter:'C' },
//   Advisory:  { bg:'bg-purple-100', text:'text-purple-700', letter:'A' },
// }
// const ALERT_TYPE_MAP = {
//   Earthquake: 'earthquake_warning',
//   Flood: 'flood_warning',
//   Cyclone: 'cyclone_alert',
//   Advisory: 'safety_advisory',
// }

// // ── Send Alert Modal ─────────────────────────────────────────────
// function SendAlertModal({ alert, users, onClose, onSent }){
//   const [selectedUsers, setSelectedUsers] = useState([])
//   const [sendToAll,     setSendToAll]     = useState(false)
//   const [search,        setSearch]        = useState('')
//   const [sending,       setSending]       = useState(false)
//   const [sent,          setSent]          = useState(false)
//   const [error,         setError]         = useState(null)

//   const filtered = users.filter(u =>
//     u.name?.toLowerCase().includes(search.toLowerCase()) ||
//     u.email?.toLowerCase().includes(search.toLowerCase())
//   )

//   const toggleUser = (id) => setSelectedUsers(prev =>
//     prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]
//   )

//   const handleSend = async () => {
//     if (!sendToAll && selectedUsers.length === 0) {
//       setError('Please select at least one user or choose Send to All'); return
//     }
//     setSending(true); setError(null)
//     try {
//       const issuedAt = new Date().toISOString()
//       const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

//       // POST to your backend — saves alert to DB and associates with users
//       await alertAPI.create({
//         title:         alert.title,
//         message:       alert.message,
//         type:          ALERT_TYPE_MAP[alert.disasterType] || 'safety_advisory',
//         severity:      alert.severity,
//         disasterType:  alert.disasterType,
//         source:        alert.source,
//         targetLocation:{
//           city: alert.location || 'Targeted Users',
//           state: alert.location || 'Targeted Users',
//         },
//         sentToAll:     sendToAll,
//         sentToUsers:   sendToAll ? [] : selectedUsers,
//         timeline: {
//           issuedAt,
//           effectiveFrom: issuedAt,
//           expiresAt,
//         },
//         status:        'active',
//         liveSource:    true,
//       })
//       setSent(true)
//       setTimeout(() => { onSent(); onClose() }, 1800)
//     } catch(e) {
//       const backendErrors = e?.response?.data?.errors
//       const detail = Array.isArray(backendErrors) && backendErrors.length > 0
//         ? backendErrors.map((item) => item?.message || item).filter(Boolean).join(', ')
//         : null
//       setError(detail || e?.response?.data?.message || 'Failed to send alert. Check your backend.')
//       setSending(false)
//     }
//   }

//   const s = SEV[alert.severity] || SEV.info
//   const t = TYPE_STYLE[alert.disasterType] || { bg:'bg-white/40 dark:bg-black/20', text:'text-slate-600 dark:text-slate-300', letter:'?' }

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-xl max-h-[90vh] flex flex-col">

//         {/* Modal header */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-200/40 dark:border-slate-700/40">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
//               <PaperAirplaneIcon className="h-5 w-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-base font-bold text-slate-900 dark:text-white">Send Alert to Users</h2>
//               <p className="text-xs text-slate-400 dark:text-slate-500">Select recipients from registered users</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white/40 dark:bg-black/20 rounded-lg transition-colors">
//             <XMarkIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
//           </button>
//         </div>

//         {/* Alert preview */}
//         <div className={`mx-6 mt-5 border-l-4 ${s.border} rounded-r-xl p-4 ${s.row}`}>
//           <div className="flex items-start gap-3">
//             <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}>
//               <span className={`font-black text-sm ${t.text}`}>{t.letter}</span>
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</span>
//                 <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${s.badge}`}>{s.label}</span>
//               </div>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
//               <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
//                 <MapPinIcon className="h-3 w-3" />{alert.location}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Send to all toggle */}
//         <div className="mx-6 mt-4">
//           <button
//             onClick={() => { setSendToAll(v => !v); setSelectedUsers([]) }}
//             className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
//               sendToAll ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-200/60 dark:hover:border-slate-600'
//             }`}
//           >
//             <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sendToAll ? 'bg-blue-600 border-blue-600' : 'border-slate-200/60 dark:border-slate-700/50'}`}>
//               {sendToAll && <CheckIcon className="h-3 w-3 text-white" />}
//             </div>
//             <UserGroupIcon className={`h-5 w-5 ${sendToAll ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`} />
//             <div className="text-left">
//               <div className={`text-sm font-semibold ${sendToAll ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>Send to All Registered Users</div>
//               <div className="text-xs text-slate-400 dark:text-slate-500">{users.length} users in database</div>
//             </div>
//           </button>
//         </div>

//         {/* Quick select by role */}
//         {!sendToAll && (
//           <div className="mx-6 mt-3 flex items-center gap-2">
//             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">Quick Select:</span>
//             {['ngo', 'rescue_team', 'citizen'].map(role => (
//               <button
//                 key={role}
//                 onClick={() => {
//                   const roleUsers = users.filter(u => u.role === role).map(u => u._id)
//                   const allSelected = roleUsers.every(id => selectedUsers.includes(id))
//                   if (allSelected) {
//                     setSelectedUsers(prev => prev.filter(id => !roleUsers.includes(id)))
//                   } else {
//                     setSelectedUsers(prev => [...new Set([...prev, ...roleUsers])])
//                   }
//                 }}
//                 className={`text-[10px] font-black px-2 py-1 rounded-md border transition-all uppercase tracking-tighter ${
//                   users.filter(u => u.role === role).every(u => selectedUsers.includes(u._id)) && users.some(u => u.role === role)
//                     ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
//                     : 'bg-white dark:bg-black/20 border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-blue-300'
//                 }`}
//               >
//                 All {role.replace('_', ' ')}s
//               </button>
//             ))}
//           </div>
//         )}

//         {/* User search + list */}
//         {!sendToAll && (
//           <div className="mx-6 mt-3 flex-1 overflow-hidden flex flex-col min-h-0">
//             <div className="relative mb-2">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
//               <input
//                 type="text" placeholder="Search users…"
//                 value={search} onChange={e=>setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-400"
//               />
//             </div>
//             <div className="overflow-y-auto flex-1 space-y-1 pr-1" style={{maxHeight:200}}>
//               {filtered.length === 0 ? (
//                 <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">No users found</p>
//               ) : filtered.map(u => {
//                 const checked = selectedUsers.includes(u._id)
//                 return (
//                   <button key={u._id} onClick={() => toggleUser(u._id)}
//                     className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-white/30 dark:bg-black/10 border border-transparent'}`}>
//                     <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-200/60 dark:border-slate-700/50'}`}>
//                       {checked && <CheckIcon className="h-3 w-3 text-white" />}
//                     </div>
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
//                       <span className="text-white text-xs font-bold">{u.name?.charAt(0)?.toUpperCase()||'U'}</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</div>
//                       <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email}</div>
//                     </div>
//                     {u.role && <span className="text-xs bg-white/40 dark:bg-black/20 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{u.role}</span>}
//                   </button>
//                 )
//               })}
//             </div>
//             {selectedUsers.length > 0 && (
//               <div className="pt-2 text-xs text-blue-600 font-semibold">
//                 {selectedUsers.length} user{selectedUsers.length!==1?'s':''} selected
//               </div>
//             )}
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{error}</div>
//         )}

//         {/* Footer */}
//         <div className="p-6 pt-4 border-t border-slate-200/40 dark:border-slate-700/40 flex gap-3">
//           <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:bg-black/10 transition-colors">
//             Cancel
//           </button>
//           <button
//             onClick={handleSend} disabled={sending||sent}
//             className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
//               sent ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
//             } disabled:opacity-70`}
//           >
//             {sent ? (
//               <><CheckCircleIcon className="h-4 w-4" />Alert Sent!</>
//             ) : sending ? (
//               <><ArrowPathIcon className="h-4 w-4 animate-spin" />Sending…</>
//             ) : (
//               <><PaperAirplaneIcon className="h-4 w-4" />Send Alert</>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Alert row ────────────────────────────────────────────────────
// function AlertRow({ alert, onSend }){
//   const navigate = useNavigate()
//   const s = SEV[alert.severity] || SEV.info
//   const t = TYPE_STYLE[alert.disasterType] || { bg:'bg-white/40 dark:bg-black/20', text:'text-slate-600 dark:text-slate-300', letter:'?' }
//   const [expanded, setExpanded] = useState(false)

//   const handleViewOnMap = () => {
//     // If coordinates are missing, try to use task location or default
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
//     <div className={`border-l-4 ${s.border} rounded-r-xl shadow-sm hover:shadow-md transition-all ${s.row}`}>
//       <div className="flex items-center gap-4 px-5 py-4">
//         <div className={`w-11 h-11 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
//           <span className={`text-base font-black ${t.text}`}>{t.letter}</span>
//         </div>
//         <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>setExpanded(e=>!e)}>
//           <div className="flex items-center gap-2 flex-wrap">
//             <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</span>
//             <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${t.bg} ${t.text}`}>{alert.disasterType}</span>
//           </div>
//           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
//           <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
//             <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{alert.location}</span>
//             <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{timeAgo(alert.ts)}</span>
//             <span className="font-medium">{alert.source}</span>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 flex-shrink-0">
//           <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${s.badge}`}>{s.label}</span>
          
//           {/* VIEW ON MAP BUTTON */}
//           <button
//             onClick={handleViewOnMap}
//             className="flex items-center gap-1.5 bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all"
//           >
//             <MapPinIcon className="h-3.5 w-3.5" />
//             View
//           </button>

//           {/* SEND BUTTON */}
//           <button
//             onClick={() => onSend(alert)}
//             className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-blue-200 transition-all"
//           >
//             <PaperAirplaneIcon className="h-3.5 w-3.5" />
//             Send
//           </button>
//           <button onClick={()=>setExpanded(e=>!e)}>
//             <ChevronRightIcon className={`h-4 w-4 text-slate-300 dark:text-slate-600 transition-transform ${expanded?'rotate-90':''}`} />
//           </button>
//         </div>
//       </div>
//       {expanded && (
//         <div className="px-5 pb-4 border-t border-slate-200/40 dark:border-slate-700/40/60">
//           <div className="flex gap-6 pt-3 text-xs">
//             {[['Source',alert.source],['Severity',alert.severity],['Region','India Subcontinent'],['Standard','IMD / NDMA / USGS']].map(([k,v])=>(
//               <div key={k}><div className="text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">{k}</div><div className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{v}</div></div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function SourcePill({ label, status }){
//   const dot = status==='ok'?'bg-green-400':status==='loading'?'bg-yellow-400':status==='error'?'bg-red-400':'bg-gray-300'
//   const cls = status==='ok'?'bg-green-50 border-green-200 text-green-700':status==='loading'?'bg-yellow-50 border-yellow-200 text-yellow-700':'bg-red-50 border-red-200 text-red-600'
//   return (
//     <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
//       <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status==='loading'?'animate-pulse':''}`}/>
//       {label}
//       {status==='ok' && <CheckCircleIcon className="h-3 w-3"/>}
//     </span>
//   )
// }

// // ── MAIN ─────────────────────────────────────────────────────────
// const AdminAlerts = () => {
//   const [liveAlerts,   setLiveAlerts]   = useState([])
//   const [sentAlerts,   setSentAlerts]   = useState([])
//   const [users,        setUsers]        = useState([])
//   const [loading,      setLoading]      = useState(true)
//   const [filter,       setFilter]       = useState('all')
//   const [tab,          setTab]          = useState('live')   // 'live' | 'sent'
//   const [sendModal,    setSendModal]    = useState(null)     // alert object
//   const [lastUpdated,  setLastUpdated]  = useState(null)
//   const [clock,        setClock]        = useState('')
//   const [sources,      setSources]      = useState({ usgs:'pending', wx:'pending', gdacs:'pending' })
//   const [countdown,    setCountdown]    = useState(300)
//   const [toastMsg,     setToastMsg]     = useState(null)
//   const [cleaningDuplicates, setCleaningDuplicates] = useState(false)
//   const [deletingAlertIds, setDeletingAlertIds] = useState([])

//   // Clock
//   useEffect(()=>{ const tick=()=>{ const ist=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'})); setClock(`${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${String(ist.getSeconds()).padStart(2,'0')}`) }; tick(); const id=setInterval(tick,1000); return()=>clearInterval(id) },[])

//   // Fetch live disasters + registered users + already-sent alerts
//   const fetchAll = useCallback(async()=>{
//     setLoading(true)
//     setSources({usgs:'loading',wx:'loading',gdacs:'loading'})
//     let eqF=[],wxD=null,cyF=[]

//     try{ const r=await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&starttime=${getDynStart(30)}&minlatitude=2&maxlatitude=38&minlongitude=60&maxlongitude=100&orderby=time&limit=300`); const d=await r.json(); eqF=d.features||[]; setSources(s=>({...s,usgs:'ok'})) }catch{ setSources(s=>({...s,usgs:'error'})) }
//     try{ const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=20.5&longitude=78.9&daily=precipitation_sum,windspeed_10m_max&forecast_days=7&timezone=Asia%2FKolkata'); wxD=await r.json(); setSources(s=>({...s,wx:'ok'})) }catch{ setSources(s=>({...s,wx:'error'})) }
//     try{
//       const r=await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/EVENTS?eventtype=TC&alertlevel=Red')
//       const tx=await r.text()
//       try{
//         const d=JSON.parse(tx)
//         cyF=d?.features||[]
//       }catch{
//         cyF=[]
//       }
//       setSources(s=>({...s,gdacs:'ok'}))
//     }catch{
//       setSources(s=>({...s,gdacs:'error'}))
//     }

//     setLiveAlerts(buildLiveAlerts(eqF,wxD,cyF))
//     setLastUpdated(new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit'}))

//     // Fetch registered users from your backend
//     try{ const r=await userAPI.getAll({ limit: 200 }); setUsers(r.data?.data?.users||r.data||[]) }catch{ setUsers([]) }

//     // Fetch already-sent alerts from your backend
//     try{ const r=await alertAPI.getAll({ sentByAdmin: true, limit: 200 }); setSentAlerts(r.data?.data?.alerts||r.data||[]) }catch{ setSentAlerts([]) }

//     setLoading(false)
//     setCountdown(300)
//   },[])

//   useEffect(()=>{ fetchAll() },[fetchAll])
//   useEffect(()=>{ if(loading)return; const id=setInterval(()=>setCountdown(c=>{ if(c<=1){fetchAll();return 300} return c-1 }),1000); return()=>clearInterval(id) },[loading,fetchAll])

//   const showToast = (text, type='success') => {
//     setToastMsg({ text, type })
//     setTimeout(()=>setToastMsg(null),3500)
//   }

//   const handleDeleteAlert = async (alertId, title) => {
//     const confirmed = window.confirm(`Delete alert "${title}"? This also removes its linked notifications.`)
//     if (!confirmed) return

//     setDeletingAlertIds(prev => [...prev, alertId])
//     try {
//       const response = await alertAPI.delete(alertId)
//       showToast(response.data?.message || 'Alert deleted successfully')
//       await fetchAll()
//     } catch (error) {
//       const message = error?.response?.data?.message || 'Failed to delete alert.'
//       showToast(message, 'error')
//     } finally {
//       setDeletingAlertIds(prev => prev.filter(id => id !== alertId))
//     }
//   }

//   const handleCleanupDuplicates = async () => {
//     const confirmed = window.confirm(
//       'Remove duplicate alerts created by repeated failed sends? The newest matching alert will be kept.'
//     )
//     if (!confirmed) return

//     setCleaningDuplicates(true)
//     try {
//       const response = await alertAPI.cleanupDuplicates()
//       const removedCount = response.data?.data?.removedCount || 0
//       showToast(
//         removedCount > 0
//           ? `Removed ${removedCount} duplicate alerts`
//           : 'No duplicate alerts found'
//       )
//       await fetchAll()
//     } catch (error) {
//       const message = error?.response?.data?.message || 'Failed to clean duplicate alerts.'
//       showToast(message, 'error')
//     } finally {
//       setCleaningDuplicates(false)
//     }
//   }

//   const counts = liveAlerts.reduce((a,x)=>{ a[x.severity]=(a[x.severity]||0)+1; return a },{danger:0,warning:0,watch:0,info:0})
//   const filtered = filter==='all'?liveAlerts:liveAlerts.filter(a=>a.severity===filter)
//   const mins=Math.floor(countdown/60), secs=String(countdown%60).padStart(2,'0')

//   return (
//     <div className="min-h-screen">

//       {/* Toast */}
//       {toastMsg && (
//         <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce-once ${
//           toastMsg.type === 'error'
//             ? 'bg-red-600 text-white shadow-red-200'
//             : 'bg-green-600 text-white shadow-green-200'
//         }`}>
//           <CheckCircleIcon className="h-5 w-5 flex-shrink-0"/>
//           <span className="text-sm font-semibold">{toastMsg.text}</span>
//         </div>
//       )}

//       {/* Send modal */}
//       {sendModal && (
//         <SendAlertModal
//           alert={sendModal} users={users}
//           onClose={()=>setSendModal(null)}
//           onSent={()=>{ showToast('Alert sent to users successfully!'); fetchAll() }}
//         />
//       )}

//       {/* Header */}
//       <div className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-20 shadow-sm">
//         <div className="px-8 py-4 flex items-center justify-between">
//           <div>
//             <div className="flex items-center gap-2 mb-0.5">
//               <ShieldExclamationIcon className="h-5 w-5 text-blue-600"/>
//               <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Alerts</h1>
//               <span className="text-slate-300 dark:text-slate-600 text-lg">·</span>
//               <span className="text-sm text-slate-400 dark:text-slate-500">Admin Panel</span>
//               <span className="ml-2 text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">ADMIN</span>
//             </div>
//             <p className="text-xs text-slate-400 dark:text-slate-500">
//               Fetch live disaster data and send alerts to registered users
//               {lastUpdated && <span className="ml-2 text-green-600 font-medium">· Updated {lastUpdated} IST</span>}
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:flex items-center gap-2 bg-gray-900 text-green-400 px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
//               {clock} IST
//             </div>
//             <div className="text-xs text-slate-400 dark:text-slate-500 text-center hidden md:block">
//               <div className="font-mono font-bold text-slate-600 dark:text-slate-300">{mins}:{secs}</div>
//               <div>auto-refresh</div>
//             </div>
//             <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all">
//               <ArrowPathIcon className={`h-4 w-4 ${loading?'animate-spin':''}`}/>
//               {loading?'Fetching…':'Refresh'}
//             </button>
//           </div>
//         </div>
//         {/* Source pills */}
//         <div className="px-8 pb-3 flex flex-wrap items-center gap-2">
//           <SignalIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500"/>
//           <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 font-medium">Live sources:</span>
//           <SourcePill label="USGS Earthquakes"   status={sources.usgs}/>
//           <SourcePill label="Open-Meteo Weather" status={sources.wx}/>
//           <SourcePill label="GDACS Cyclones"      status={sources.gdacs}/>
//           <div className="ml-auto flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
//             <span className="flex items-center gap-1.5"><UserGroupIcon className="h-3.5 w-3.5"/>{users.length} registered users</span>
//             <span className="flex items-center gap-1.5"><BellAlertIcon className="h-3.5 w-3.5"/>{sentAlerts.length} alerts sent</span>
//           </div>
//         </div>
//       </div>

//       <div className="px-8 py-6 space-y-5">

//         {/* Tabs: Live vs Sent */}
//         <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl p-1 w-fit">
//           {[['live','Live Disasters'],['sent','Sent Alerts']].map(([key,label])=>(
//             <button key={key} onClick={()=>setTab(key)}
//               className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab===key?'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm':'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}>
//               {key==='live'?<SignalIcon className="h-4 w-4"/>:<PaperAirplaneIcon className="h-4 w-4"/>}
//               {label}
//               {key==='sent' && sentAlerts.length>0 && (
//                 <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{sentAlerts.length}</span>
//               )}
//             </button>
//           ))}
//         </div>

//         {tab === 'live' ? (
//           <>
//             {/* Stat cards */}
//             <div className="grid grid-cols-4 gap-4">
//               {['danger','warning','watch','info'].map(level=>{
//                 const s=SEV[level]; const cnt=counts[level]||0; const active=filter===level
//                 return (
//                   <button key={level} onClick={()=>setFilter(f=>f===level?'all':level)}
//                     className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 ${active?`bg-gradient-to-br ${level==='danger'?'from-red-600 to-red-700':level==='warning'?'from-orange-500 to-amber-500':level==='watch'?'from-yellow-500 to-yellow-400':'from-blue-500 to-blue-600'} shadow-xl scale-105 text-white`:'bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'}`}>
//                     <div className={`text-xs font-bold tracking-widest mb-3 ${active?'text-white/80':'text-slate-400 dark:text-slate-500'}`}>{s.label}</div>
//                     <div className={`text-4xl font-black leading-none ${active?'text-white':cnt>0?'text-slate-800 dark:text-slate-100':'text-gray-200'}`}>{cnt}</div>
//                     <div className={`text-xs mt-2 ${active?'text-white/70':'text-slate-400 dark:text-slate-500'}`}>alert{cnt!==1?'s':''}</div>
//                     {cnt>0&&!active&&<div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${s.dot}`}/>}
//                   </button>
//                 )
//               })}
//             </div>

//             {/* Filter tabs */}
//             <div className="flex items-center gap-2 flex-wrap">
//               {[{key:'all',label:'All',count:liveAlerts.length},{key:'danger',label:'Danger',count:counts.danger},{key:'warning',label:'Warning',count:counts.warning},{key:'watch',label:'Watch',count:counts.watch},{key:'info',label:'Info',count:counts.info}].map(t=>{
//                 const active=filter===t.key; const s=SEV[t.key]
//                 return (
//                   <button key={t.key} onClick={()=>setFilter(t.key)}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active?t.key==='all'?'bg-slate-900 text-white shadow-lg':s?.pill+' shadow-lg':'bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
//                     {t.label}
//                     <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active?'bg-white/25 text-white':'bg-white/40 dark:bg-black/20 text-slate-500 dark:text-slate-400'}`}>{t.count}</span>
//                   </button>
//                 )
//               })}
//               {!loading && <div className="ml-auto text-xs text-slate-400 dark:text-slate-500">{filtered.length} alerts · Click <PaperAirplaneIcon className="h-3 w-3 inline text-blue-600"/> Send to broadcast to users</div>}
//             </div>

//             {/* Live alert list */}
//             {loading ? (
//               <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-20 flex flex-col items-center gap-4">
//                 <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"/>
//                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Fetching live disaster data…</p>
//               </div>
//             ) : filtered.length===0 ? (
//               <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-16 text-center">
//                 <BellAlertIcon className="h-10 w-10 text-gray-200 mx-auto mb-3"/>
//                 <p className="text-slate-500 dark:text-slate-400 font-medium">No alerts found</p>
//               </div>
//             ) : (
//               <div className="space-y-2.5">
//                 {filtered.map((alert,i)=>(
//                   <AlertRow key={alert._id} alert={alert} index={i} onSend={a=>setSendModal(a)}/>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : (
//           /* ── Sent Alerts tab ─────────────────────────── */
//           <div className="space-y-3">
//             <div className="flex items-center justify-between gap-3 px-1">
//               <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
//                 {sentAlerts.length} alert{sentAlerts.length!==1?'s':''} sent by you to registered users
//               </div>
//               {sentAlerts.length > 1 && (
//                 <button
//                   onClick={handleCleanupDuplicates}
//                   disabled={cleaningDuplicates}
//                   className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-60"
//                 >
//                   <FunnelIcon className={`h-4 w-4 ${cleaningDuplicates ? 'animate-pulse' : ''}`} />
//                   {cleaningDuplicates ? 'Cleaningâ€¦' : 'Clean Duplicates'}
//                 </button>
//               )}
//             </div>
//             {sentAlerts.length===0 ? (
//               <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-16 text-center">
//                 <PaperAirplaneIcon className="h-10 w-10 text-gray-200 mx-auto mb-3"/>
//                 <p className="text-slate-500 dark:text-slate-400 font-medium">No alerts sent yet</p>
//                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Go to Live Disasters tab and click Send on any alert</p>
//               </div>
//             ) : sentAlerts.map(a=>{
//               const issuedAt = a.timeline?.issuedAt || a.issuedAt || a.createdAt
//               const s=SEV[a.severity]||SEV.info; const t=TYPE_STYLE[a.disasterType || a.type]||{bg:'bg-white/40 dark:bg-black/20',text:'text-slate-600 dark:text-slate-300',letter:'?'}
//               return (
//                 <div key={a._id} className={`border-l-4 ${s.border} ${s.row} rounded-r-xl p-5 shadow-sm`}>
//                   <div className="flex items-start gap-4">
//                     <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
//                       <span className={`font-black ${t.text}`}>{t.letter}</span>
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap mb-1">
//                         <span className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</span>
//                         <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${s.badge}`}>{s.label}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 dark:text-slate-400">{a.message}</p>
//                       <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
//                         <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3"/>{a.targetLocation?.city}</span>
//                         <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/>{new Date(issuedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
//                         <span className={`flex items-center gap-1 font-medium ${a.sentToAll?'text-blue-600':'text-purple-600'}`}>
//                           <UserGroupIcon className="h-3 w-3"/>
//                           {a.sentToAll?`All ${users.length} users`:`${a.sentToUsers?.length||0} user${(a.sentToUsers?.length||0)!==1?'s':''}`}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-end gap-2 flex-shrink-0">
//                       <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(new Date(issuedAt).getTime())}</span>
//                       <button
//                         onClick={() => handleDeleteAlert(a._id, a.title)}
//                         disabled={deletingAlertIds.includes(a._id)}
//                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200/70 text-red-600 hover:bg-red-50 disabled:opacity-60"
//                       >
//                         <TrashIcon className="h-3.5 w-3.5" />
//                         {deletingAlertIds.includes(a._id) ? 'Deletingâ€¦' : 'Delete'}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AdminAlerts


import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellAlertIcon, MapPinIcon, ClockIcon, ShieldExclamationIcon,
  ArrowPathIcon, SignalIcon, CheckCircleIcon, PaperAirplaneIcon,
  UserGroupIcon, XMarkIcon, CheckIcon, ChevronRightIcon,
  MagnifyingGlassIcon, FunnelIcon, TrashIcon,
} from '@heroicons/react/24/outline'
import { alertAPI, userAPI } from '../../services/api'

// ── India Weather Zones (5 regions) ──────────────────────────────
const WEATHER_ZONES = [
  { id: 'north',   name: 'North India',   lat: 28.6, lon: 77.2 },
  { id: 'central', name: 'Central India', lat: 20.5, lon: 78.9 },
  { id: 'south',   name: 'South India',   lat: 13.0, lon: 80.3 },
  { id: 'east',    name: 'East India',    lat: 22.5, lon: 88.3 },
  { id: 'west',    name: 'West India',    lat: 23.0, lon: 72.5 },
]

// ── Scientific thresholds ────────────────────────────────────────
const RAIN_THRESH = [
  { min: 204.5, level: 'danger',  disasterType: 'Flood',      tag: 'Extremely Heavy Rain — Flood Risk',  imd: 'Red Alert'    },
  { min: 115.6, level: 'warning', disasterType: 'Flood',      tag: 'Very Heavy Rain — Flood Warning',    imd: 'Orange Alert' },
  { min: 64.5,  level: 'watch',   disasterType: 'Heavy Rain', tag: 'Heavy Rain',                         imd: 'Yellow Alert' },
  { min: 15.6,  level: 'info',    disasterType: 'Heavy Rain', tag: 'Moderate Rain',                      imd: 'Normal'       },
]
const HEAT_THRESH = [
  { min: 47, level: 'danger',  tag: 'Severe Heat Wave',  imd: 'Red Alert'    },
  { min: 44, level: 'warning', tag: 'Heat Wave',         imd: 'Orange Alert' },
  { min: 40, level: 'watch',   tag: 'Heat Wave Warning', imd: 'Yellow Alert' },
  { min: 37, level: 'info',    tag: 'Hot Day Advisory',  imd: 'Normal'       },
]
const COLD_THRESH = [
  { max: 0, level: 'danger',  tag: 'Severe Cold Wave',  imd: 'Red Alert'    },
  { max: 2, level: 'warning', tag: 'Cold Wave',         imd: 'Orange Alert' },
  { max: 4, level: 'watch',   tag: 'Cold Wave Warning', imd: 'Yellow Alert' },
  { max: 7, level: 'info',    tag: 'Cold Day Advisory', imd: 'Normal'       },
]
const WIND_THRESH = [
  { min: 89, level: 'danger',  tag: 'Violent Storm Winds',    scale: 'Beaufort 11+' },
  { min: 62, level: 'warning', tag: 'Gale Force Winds',       scale: 'Beaufort 9-10'},
  { min: 50, level: 'watch',   tag: 'Strong Wind Warning',    scale: 'Beaufort 7-8' },
  { min: 39, level: 'info',    tag: 'Strong Breeze Advisory', scale: 'Beaufort 6'   },
]
const EQ_MAG = [
  { min: 7.0, level: 'danger',  label: 'Major Earthquake'    },
  { min: 6.0, level: 'warning', label: 'Strong Earthquake'   },
  { min: 5.0, level: 'watch',   label: 'Moderate Earthquake' },
  { min: 4.5, level: 'info',    label: 'Light Earthquake'    },
]
const TSUNAMI_ZONES = [
  { latMin: 6,  latMax: 14, lonMin: 92, lonMax: 96  },
  { latMin: 22, latMax: 28, lonMin: 57, lonMax: 65  },
  { latMin: -8, latMax: 6,  lonMin: 95, lonMax: 106 },
  { latMin: 5,  latMax: 15, lonMin: 57, lonMax: 70  },
]
const WX_CODE_ALERTS = {
  99: { disasterType: 'Thunderstorm',  tag: 'Thunderstorm with Heavy Hail',  level: 'danger'  },
  97: { disasterType: 'Thunderstorm',  tag: 'Thunderstorm with Hail',        level: 'danger'  },
  96: { disasterType: 'Thunderstorm',  tag: 'Thunderstorm with Slight Hail', level: 'warning' },
  95: { disasterType: 'Thunderstorm',  tag: 'Thunderstorm',                  level: 'watch'   },
  77: { disasterType: 'Snowstorm',     tag: 'Heavy Snow Grains',             level: 'warning' },
  75: { disasterType: 'Snowstorm',     tag: 'Heavy Snowfall',                level: 'warning' },
  73: { disasterType: 'Snowstorm',     tag: 'Moderate Snowfall',             level: 'watch'   },
  71: { disasterType: 'Snowstorm',     tag: 'Light Snowfall',                level: 'info'    },
  67: { disasterType: 'Freezing Rain', tag: 'Heavy Freezing Rain',           level: 'warning' },
  66: { disasterType: 'Freezing Rain', tag: 'Light Freezing Rain',           level: 'watch'   },
  48: { disasterType: 'Dense Fog',     tag: 'Freezing Fog',                  level: 'warning' },
  45: { disasterType: 'Dense Fog',     tag: 'Dense Fog',                     level: 'watch'   },
}
const FOG_THRESH = [
  { max: 50,   level: 'danger',  tag: 'Zero Visibility Fog'   },
  { max: 200,  level: 'warning', tag: 'Very Dense Fog'        },
  { max: 500,  level: 'watch',   tag: 'Dense Fog Warning'     },
  { max: 1000, level: 'info',    tag: 'Moderate Fog Advisory' },
]

// ── Helpers ──────────────────────────────────────────────────────
function getDynStart(days) {
  const d = new Date(); d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}
function timeAgo(ts) {
  const d = Date.now() - ts, m = Math.floor(d / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
function dailyMinVis(hourlyVis = [], hourlyTimes = []) {
  const map = {}
  hourlyTimes.forEach((t, i) => {
    const day = t.slice(0, 10)
    if (map[day] === undefined || hourlyVis[i] < map[day]) map[day] = hourlyVis[i]
  })
  return Object.values(map)
}

// ── Build all live alerts ────────────────────────────────────────
function buildLiveAlerts(eqFeatures, wxZoneData, cyFeatures) {
  const alerts = []
  const order = { danger: 0, warning: 1, watch: 2, info: 3 }

  // 1 + 2. Earthquakes & derived Tsunami (USGS)
  if (eqFeatures?.length) {
    const sorted = [...eqFeatures].sort((a, b) => b.properties.mag - a.properties.mag)
    sorted.slice(0, 15).forEach(q => {
      const mag = q.properties.mag
      const cat = EQ_MAG.find(t => mag >= t.min)
      if (!cat) return
      const [lon, lat, depth] = q.geometry.coordinates
      const inZone = TSUNAMI_ZONES.some(
        z => lat >= z.latMin && lat <= z.latMax && lon >= z.lonMin && lon <= z.lonMax
      )
      const usgsAlert = q.properties.alert
      const elevatedSeverity = mag >= 6.5 && depth < 100 && inZone
      const coords = { latitude: lat, longitude: lon }

      alerts.push({
        _id: `eq-${q.id}`,
        title: `${cat.label} — M${mag.toFixed(1)}`,
        message: `Depth ${depth.toFixed(0)} km · ${q.properties.place}${
          usgsAlert && usgsAlert !== 'green' ? ` · USGS: ${usgsAlert.toUpperCase()}` : ''
        }`,
        severity: elevatedSeverity ? 'danger' : cat.level,
        disasterType: 'Earthquake',
        source: 'USGS',
        location: q.properties.place,
        coordinates: coords,
        issuedAt: new Date(q.properties.time).toISOString(),
        ts: q.properties.time,
      })

      if (elevatedSeverity) {
        alerts.push({
          _id: `tsunami-${q.id}`,
          title: `Tsunami Watch — M${mag.toFixed(1)} Trigger`,
          message: `M${mag.toFixed(1)} quake at ${depth.toFixed(0)} km depth in tsunami zone · Evacuate coasts immediately`,
          severity: mag >= 7.5 ? 'danger' : 'warning',
          disasterType: 'Tsunami',
          source: 'USGS / NDWC',
          location: q.properties.place,
          coordinates: coords,
          issuedAt: new Date(q.properties.time).toISOString(),
          ts: q.properties.time,
        })
      }
    })
  }

  // 3-10. Weather alerts (Open-Meteo — per India zone)
  wxZoneData.forEach(({ zone, data }) => {
    if (!data?.daily) return
    const {
      temperature_2m_max: tMax   = [],
      temperature_2m_min: tMin   = [],
      precipitation_sum:  rain   = [],
      windspeed_10m_max:  wind   = [],
      weathercode:        wxCode = [],
      time:               dates  = [],
    } = data.daily
    const minVisArr = dailyMinVis(data.hourly?.visibility, data.hourly?.time)
    const coords = { latitude: zone.lat, longitude: zone.lon }

    dates.forEach((date, i) => {
      const baseTs = new Date(date).getTime()

      const rainCat = RAIN_THRESH.find(t => (rain[i] || 0) >= t.min)
      if (rainCat) alerts.push({ _id: `rain-${zone.id}-${i}`, title: `${rainCat.tag} — ${zone.name}`, message: `${rain[i]?.toFixed(1)} mm/day · Wind ${wind[i]?.toFixed(0)} km/h · IMD: ${rainCat.imd}`, severity: rainCat.level, disasterType: rainCat.disasterType, source: 'Open-Meteo / IMD', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })

      const heatCat = HEAT_THRESH.find(t => (tMax[i] || 0) >= t.min)
      if (heatCat) alerts.push({ _id: `heat-${zone.id}-${i}`, title: `${heatCat.tag} — ${zone.name}`, message: `Max temp ${tMax[i]?.toFixed(1)}°C · IMD: ${heatCat.imd} · Avoid midday sun, stay hydrated`, severity: heatCat.level, disasterType: 'Heat Wave', source: 'Open-Meteo / IMD', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })

      const coldCat = COLD_THRESH.find(t => (tMin[i] ?? 99) <= t.max)
      if (coldCat) alerts.push({ _id: `cold-${zone.id}-${i}`, title: `${coldCat.tag} — ${zone.name}`, message: `Min temp ${tMin[i]?.toFixed(1)}°C · IMD: ${coldCat.imd} · Keep warm, protect livestock`, severity: coldCat.level, disasterType: 'Cold Wave', source: 'Open-Meteo / IMD', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })

      const windCat = WIND_THRESH.find(t => (wind[i] || 0) >= t.min)
      if (windCat) alerts.push({ _id: `wind-${zone.id}-${i}`, title: `${windCat.tag} — ${zone.name}`, message: `Max wind ${wind[i]?.toFixed(0)} km/h · ${windCat.scale} · Secure loose objects`, severity: windCat.level, disasterType: 'High Wind', source: 'Open-Meteo / IMD', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })

      const wx = WX_CODE_ALERTS[wxCode[i]]
      if (wx) alerts.push({ _id: `wx-${zone.id}-${i}-${wxCode[i]}`, title: `${wx.tag} — ${zone.name}`, message: `WMO Code ${wxCode[i]} · Forecast for ${date} · Take shelter, restrict travel`, severity: wx.level, disasterType: wx.disasterType, source: 'Open-Meteo / IMD', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })

      const vis = minVisArr[i]
      if (vis !== undefined) {
        const fogCat = FOG_THRESH.find(t => vis <= t.max)
        if (fogCat) alerts.push({ _id: `fog-${zone.id}-${i}`, title: `${fogCat.tag} — ${zone.name}`, message: `Min visibility ${vis?.toFixed(0)} m · Reduce speed drastically, use fog lights`, severity: fogCat.level, disasterType: 'Dense Fog', source: 'Open-Meteo', location: zone.name, coordinates: coords, issuedAt: new Date(date).toISOString(), ts: baseTs })
      }
    })
  })

  // 11. Cyclones (GDACS)
  cyFeatures?.forEach((c, i) => {
    const nm    = c.properties?.name || 'Tropical Cyclone'
    const gcLon = c.geometry?.coordinates?.[0]
    const gcLat = c.geometry?.coordinates?.[1]
    alerts.push({
      _id: `cy-${i}`,
      title: `Active Cyclone — ${nm}`,
      message: 'GDACS Red Alert · Active tropical cyclone · Evacuate coastal areas immediately',
      severity: 'danger',
      disasterType: 'Cyclone',
      source: 'GDACS',
      location: 'Indian Ocean basin',
      coordinates: (gcLat && gcLon)
        ? { latitude: gcLat, longitude: gcLon }
        : { latitude: 15.0, longitude: 75.0 },
      issuedAt: new Date().toISOString(),
      ts: Date.now(),
    })
  })

  return alerts.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.ts - a.ts))
}

// ── Design tokens ────────────────────────────────────────────────
const SEV = {
  danger:  { label: 'DANGER',  pill: 'bg-red-600 text-white',    badge: 'bg-red-500/10 text-red-400 border-red-500/30',         border: 'border-l-red-500',    row: 'bg-red-500/5 dark:bg-red-950/40 hover:bg-red-500/10 dark:hover:bg-red-950/60',       dot: 'bg-red-500'    },
  warning: { label: 'WARNING', pill: 'bg-orange-500 text-white', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', border: 'border-l-orange-400', row: 'bg-orange-500/5 dark:bg-orange-950/40 hover:bg-orange-500/10 dark:hover:bg-orange-950/60', dot: 'bg-orange-400' },
  watch:   { label: 'WATCH',   pill: 'bg-yellow-500 text-white', badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', border: 'border-l-yellow-400', row: 'bg-yellow-500/5 dark:bg-yellow-950/40 hover:bg-yellow-500/10 dark:hover:bg-yellow-950/60', dot: 'bg-yellow-400' },
  info:    { label: 'INFO',    pill: 'bg-blue-500 text-white',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       border: 'border-l-blue-400',   row: 'bg-blue-500/5 dark:bg-blue-950/40 hover:bg-blue-500/10 dark:hover:bg-blue-950/60',     dot: 'bg-blue-400'   },
}
const TYPE_STYLE = {
  Earthquake:      { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', letter: 'EQ' },
  Tsunami:         { bg: 'bg-blue-200 dark:bg-blue-900/40',     text: 'text-blue-800 dark:text-blue-300',     letter: 'TS' },
  Flood:           { bg: 'bg-cyan-100 dark:bg-cyan-900/30',     text: 'text-cyan-700 dark:text-cyan-400',     letter: 'FL' },
  'Heavy Rain':    { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-400',       letter: 'HR' },
  Cyclone:         { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400',       letter: 'CY' },
  'Heat Wave':     { bg: 'bg-red-100 dark:bg-red-900/20',       text: 'text-rose-700 dark:text-rose-400',     letter: 'HW' },
  'Cold Wave':     { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-300',       letter: 'CW' },
  'High Wind':     { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-700 dark:text-teal-400',     letter: 'WN' },
  Thunderstorm:    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', letter: 'TH' },
  Snowstorm:       { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', letter: 'SN' },
  'Dense Fog':     { bg: 'bg-slate-200 dark:bg-slate-700/40',   text: 'text-slate-600 dark:text-slate-300',   letter: 'FG' },
  'Freezing Rain': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', letter: 'FR' },
  Advisory:        { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', letter: 'AD' },
}
const ALERT_TYPE_MAP = {
  Earthquake:      'earthquake_warning',
  Tsunami:         'tsunami_warning',
  Flood:           'flood_warning',
  'Heavy Rain':    'flood_warning',        // mapped to valid enum
  Cyclone:         'cyclone_alert',
  'Heat Wave':     'heatwave_warning',     // ✅ fixed (no underscore)
  'Cold Wave':     'safety_advisory',      // fallback
  'High Wind':     'storm_warning',        // ✅ fixed
  Thunderstorm:    'storm_warning',
  Snowstorm:       'storm_warning',
  'Dense Fog':     'safety_advisory',
  'Freezing Rain': 'storm_warning',
  Advisory:        'safety_advisory',
}

// ── Send Alert Modal ─────────────────────────────────────────────
function SendAlertModal({ alert, users, onClose, onSent }) {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [sendToAll,     setSendToAll]     = useState(false)
  const [search,        setSearch]        = useState('')
  const [sending,       setSending]       = useState(false)
  const [sent,          setSent]          = useState(false)
  const [error,         setError]         = useState(null)

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleUser = (id) => setSelectedUsers(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

 const handleSend = async () => {
  if (!sendToAll && selectedUsers.length === 0) {
    setError('Please select at least one user or choose Send to All')
    return
  }

  setSending(true)
  setError(null)

  try {
    const issuedAt  = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await alertAPI.create({
      title:        alert.title,
      message:      alert.message,
      type:         ALERT_TYPE_MAP[alert.disasterType] || 'safety_advisory',
      severity:     alert.severity,
      disasterType: alert.disasterType,
      source:       alert.source,

      targetLocation: {
        city:  alert.location || 'Targeted Users',
        state: alert.location || 'Targeted Users',
        coordinates: alert.coordinates || null,
      },

      sentToAll:   sendToAll,
      sentToUsers: sendToAll ? [] : selectedUsers,

      timeline: {
        issuedAt,
        effectiveFrom: issuedAt,
        expiresAt,
      },

      status:     'active',
      liveSource: true,

      // ✅ IMPORTANT FIX
      issuedBy: localStorage.getItem('userId'), // or from auth context
    })

    setSent(true)
    setTimeout(() => {
      onSent()
      onClose()
    }, 1800)

  } catch (e) {
    const backendErrors = e?.response?.data?.errors

    const detail = Array.isArray(backendErrors) && backendErrors.length > 0
      ? backendErrors.map(item => item?.message || item).join(', ')
      : null

    setError(detail || e?.response?.data?.message || 'Failed to send alert.')
    setSending(false)
  }
}

  const s = SEV[alert.severity] || SEV.info
  const t = TYPE_STYLE[alert.disasterType] || { bg: 'bg-white/40 dark:bg-black/20', text: 'text-slate-600 dark:text-slate-300', letter: '?' }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/40 dark:border-slate-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Send Alert to Users</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Select recipients from registered users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <XMarkIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Alert preview */}
        <div className={`mx-6 mt-5 border-l-4 ${s.border} rounded-r-xl p-4 ${s.row}`}>
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`font-black text-xs ${t.text}`}>{t.letter}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${s.badge}`}>{s.label}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />{alert.location}
              </p>
            </div>
          </div>
        </div>

        {/* Send to all toggle */}
        <div className="mx-6 mt-4">
          <button
            onClick={() => { setSendToAll(v => !v); setSelectedUsers([]) }}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
              sendToAll ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-200/60 dark:hover:border-slate-600'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sendToAll ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
              {sendToAll && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
            <UserGroupIcon className={`h-5 w-5 ${sendToAll ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`} />
            <div className="text-left">
              <div className={`text-sm font-semibold ${sendToAll ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>Send to All Registered Users</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{users.length} users in database</div>
            </div>
          </button>
        </div>

        {/* Quick select by role */}
        {!sendToAll && (
          <div className="mx-6 mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1">Quick Select:</span>
            {['ngo', 'rescue_team', 'citizen'].map(role => {
              const roleUsers = users.filter(u => u.role?.toLowerCase() === role.toLowerCase()).map(u => u._id)
              const allSelected = roleUsers.length > 0 && roleUsers.every(id => selectedUsers.includes(id))
              return (
                <button
                  key={role}
                  onClick={() => {
                    if (allSelected) setSelectedUsers(prev => prev.filter(id => !roleUsers.includes(id)))
                    else setSelectedUsers(prev => [...new Set([...prev, ...roleUsers])])
                  }}
                  className={`text-[10px] font-black px-2 py-1 rounded-md border transition-all uppercase tracking-tighter ${
                    allSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-white dark:bg-black/20 border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-blue-300'
                  }`}
                >
                  All {role.replace('_', ' ')}s
                </button>
              )
            })}
          </div>
        )}

        {/* User search + list */}
        {!sendToAll && (
          <div className="mx-6 mt-3 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="relative mb-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text" placeholder="Search users…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-400 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="overflow-y-auto flex-1 space-y-1 pr-1" style={{ maxHeight: 200 }}>
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">No users found</p>
              ) : filtered.map(u => {
                const checked = selectedUsers.includes(u._id)
                return (
                  <button key={u._id} onClick={() => toggleUser(u._id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${checked ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {checked && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{u.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{u.email}</div>
                    </div>
                    {u.role && <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">{u.role}</span>}
                  </button>
                )
              })}
            </div>
            {selectedUsers.length > 0 && (
              <div className="pt-2 text-xs text-blue-600 font-semibold">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">{error}</div>
        )}

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-200/40 dark:border-slate-700/40 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSend} disabled={sending || sent}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              sent ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
            } disabled:opacity-70`}
          >
            {sent ? (
              <><CheckCircleIcon className="h-4 w-4" />Alert Sent!</>
            ) : sending ? (
              <><ArrowPathIcon className="h-4 w-4 animate-spin" />Sending…</>
            ) : (
              <><PaperAirplaneIcon className="h-4 w-4" />Send Alert</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Alert row ────────────────────────────────────────────────────
function AlertRow({ alert, onSend }) {
  const navigate = useNavigate()
  const s = SEV[alert.severity] || SEV.info
  const t = TYPE_STYLE[alert.disasterType] || { bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-600 dark:text-slate-300', letter: '??' }
  const [expanded, setExpanded] = useState(false)

  const handleViewOnMap = () => {
    const coords = alert.coordinates || { latitude: 20.5937, longitude: 78.9629 }
    navigate('/dashboard/tasks', {
      state: {
        focusLocation: coords,
        focusTitle:    alert.title,
        focusType:     'alert',
        focusAlert: {
          _id:          alert._id,
          title:        alert.title,
          message:      alert.message,
          severity:     alert.severity,
          disasterType: alert.disasterType,
          source:       alert.source,
          location:     alert.location,
          coordinates:  coords,
        },
      },
    })
  }

  return (
    <div className={`border-l-4 ${s.border} rounded-r-xl shadow-sm hover:shadow-md transition-all ${s.row}`}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`w-11 h-11 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-xs font-black ${t.text}`}>{t.letter}</span>
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${t.bg} ${t.text}`}>{alert.disasterType}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{alert.location}</span>
            <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{timeAgo(alert.ts)}</span>
            <span className="font-medium">{alert.source}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${s.badge}`}>{s.label}</span>

          {/* VIEW ON MAP BUTTON */}
          <button
            onClick={handleViewOnMap}
            className="flex items-center gap-1.5 bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all"
          >
            <MapPinIcon className="h-3.5 w-3.5" />
            View
          </button>

          {/* SEND BUTTON */}
          <button
            onClick={() => onSend(alert)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-blue-200 transition-all"
          >
            <PaperAirplaneIcon className="h-3.5 w-3.5" />
            Send
          </button>
          <button onClick={() => setExpanded(e => !e)}>
            <ChevronRightIcon className={`h-4 w-4 text-slate-300 dark:text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-200/40 dark:border-slate-700/40">
          <div className="flex flex-wrap gap-6 pt-3 text-xs">
            {[
              ['Source',      alert.source],
              ['Severity',    alert.severity],
              ['Type',        alert.disasterType],
              ['Coordinates', alert.coordinates ? `${alert.coordinates.latitude.toFixed(3)}°, ${alert.coordinates.longitude.toFixed(3)}°` : 'N/A'],
              ['Standard',    'IMD / NDMA / USGS'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wide">{k}</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SourcePill({ label, status }) {
  const dot = status === 'ok' ? 'bg-green-400' : status === 'loading' ? 'bg-yellow-400' : status === 'error' ? 'bg-red-400' : 'bg-gray-300'
  const cls = status === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : status === 'loading' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-600'
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'loading' ? 'animate-pulse' : ''}`} />
      {label}
      {status === 'ok' && <CheckCircleIcon className="h-3 w-3" />}
    </span>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────
const AdminAlerts = () => {
  const [liveAlerts,   setLiveAlerts]   = useState([])
  const [sentAlerts,   setSentAlerts]   = useState([])
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('all')
  const [typeFilter,   setTypeFilter]   = useState('all')   // ← NEW
  const [tab,          setTab]          = useState('live')
  const [sendModal,    setSendModal]    = useState(null)
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [clock,        setClock]        = useState('')
  const [sources,      setSources]      = useState({ usgs: 'pending', wx: 'pending', gdacs: 'pending' })
  const [countdown,    setCountdown]    = useState(300)
  const [toastMsg,     setToastMsg]     = useState(null)
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false)
  const [deletingAlertIds,   setDeletingAlertIds]   = useState([])

  // Clock (IST)
  useEffect(() => {
    const tick = () => {
      const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      setClock(`${String(ist.getHours()).padStart(2,'0')}:${String(ist.getMinutes()).padStart(2,'0')}:${String(ist.getSeconds()).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  // Fetch everything
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setSources({ usgs: 'loading', wx: 'loading', gdacs: 'loading' })
    let eqF = [], wxZoneData = [], cyF = []

    // USGS earthquakes
    try {
      const r = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&starttime=${getDynStart(30)}&minlatitude=2&maxlatitude=38&minlongitude=60&maxlongitude=100&orderby=time&limit=300`)
      eqF = (await r.json()).features || []
      setSources(s => ({ ...s, usgs: 'ok' }))
    } catch { setSources(s => ({ ...s, usgs: 'error' })) }

    // Open-Meteo — all 5 India zones
    let wxOk = false
    for (const zone of WEATHER_ZONES) {
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lon}` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode` +
          `&hourly=visibility&forecast_days=7&timezone=Asia%2FKolkata`
        )
        wxZoneData.push({ zone, data: await r.json() })
        wxOk = true
      } catch { /* skip failed zone */ }
    }
    setSources(s => ({ ...s, wx: wxOk ? 'ok' : 'error' }))

    // GDACS cyclones
    try {
      const r  = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms')
      const tx = await r.text()
      try { cyF = JSON.parse(tx)?.features || [] } catch { cyF = [] }
      setSources(s => ({ ...s, gdacs: 'ok' }))
    } catch { setSources(s => ({ ...s, gdacs: 'error' })) }

    setLiveAlerts(buildLiveAlerts(eqF, wxZoneData, cyF))
    setLastUpdated(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }))

    try { const r = await userAPI.getAll({ limit: 1000 }); setUsers(r.data?.data?.users || r.data || []) } catch { setUsers([]) }
    try { const r = await alertAPI.getAll({ sentByAdmin: true, limit: 200 }); setSentAlerts(r.data?.data?.alerts || r.data || []) } catch { setSentAlerts([]) }

    setLoading(false)
    setCountdown(300)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    if (loading) return
    const id = setInterval(() => setCountdown(c => { if (c <= 1) { fetchAll(); return 300 } return c - 1 }), 1000)
    return () => clearInterval(id)
  }, [loading, fetchAll])

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleDeleteAlert = async (alertId, title) => {
    if (!window.confirm(`Delete alert "${title}"? This also removes its linked notifications.`)) return
    setDeletingAlertIds(p => [...p, alertId])
    try {
      showToast((await alertAPI.delete(alertId)).data?.message || 'Alert deleted successfully')
      await fetchAll()
    } catch (e) { showToast(e?.response?.data?.message || 'Failed to delete alert.', 'error') }
    finally { setDeletingAlertIds(p => p.filter(id => id !== alertId)) }
  }

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('Remove duplicate alerts created by repeated failed sends? The newest matching alert will be kept.')) return
    setCleaningDuplicates(true)
    try {
      const n = (await alertAPI.cleanupDuplicates()).data?.data?.removedCount || 0
      showToast(n > 0 ? `Removed ${n} duplicate alerts` : 'No duplicate alerts found')
      await fetchAll()
    } catch (e) { showToast(e?.response?.data?.message || 'Failed to clean duplicate alerts.', 'error') }
    finally { setCleaningDuplicates(false) }
  }

  const counts = liveAlerts.reduce((a, x) => { a[x.severity] = (a[x.severity] || 0) + 1; return a }, { danger: 0, warning: 0, watch: 0, info: 0 })
  const availableTypes = ['all', ...Array.from(new Set(liveAlerts.map(a => a.disasterType))).sort()]
  const filtered = liveAlerts.filter(a =>
    (filter === 'all' || a.severity === filter) &&
    (typeFilter === 'all' || a.disasterType === typeFilter)
  )
  const mins = Math.floor(countdown / 60), secs = String(countdown % 60).padStart(2, '0')

  return (
    <div className="min-h-screen">

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl ${
          toastMsg.type === 'error' ? 'bg-red-600 shadow-red-200' : 'bg-green-600 shadow-green-200'
        } text-white`}>
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* Send modal */}
      {sendModal && (
        <SendAlertModal
          alert={sendModal} users={users}
          onClose={() => setSendModal(null)}
          onSent={() => { showToast('Alert sent to users successfully!'); fetchAll() }}
        />
      )}

      {/* Header */}
      <div className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-20 shadow-sm">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldExclamationIcon className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Alerts</h1>
              <span className="text-slate-300 dark:text-slate-600 text-lg">·</span>
              <span className="text-sm text-slate-400 dark:text-slate-500">Admin Panel</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">ADMIN</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Live monitoring · 11 hazard types · 5 India weather zones
              {lastUpdated && <span className="ml-2 text-green-600 font-medium">· Updated {lastUpdated} IST</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-900 text-green-400 px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {clock} IST
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center hidden md:block">
              <div className="font-mono font-bold text-slate-600 dark:text-slate-300">{mins}:{secs}</div>
              <div>auto-refresh</div>
            </div>
            <button onClick={fetchAll} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all">
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Fetching…' : 'Refresh'}
            </button>
          </div>
        </div>
        {/* Source pills */}
        <div className="px-8 pb-3 flex flex-wrap items-center gap-2">
          <SignalIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 font-medium">Live sources:</span>
          <SourcePill label="USGS Earthquakes"                    status={sources.usgs} />
          <SourcePill label={`Open-Meteo (${WEATHER_ZONES.length} zones)`} status={sources.wx}   />
          <SourcePill label="GDACS Cyclones"                      status={sources.gdacs} />
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><UserGroupIcon className="h-3.5 w-3.5" />{users.length} registered users</span>
            <span className="flex items-center gap-1.5"><BellAlertIcon className="h-3.5 w-3.5" />{sentAlerts.length} alerts sent</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Tabs: Live vs Sent */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl p-1 w-fit">
          {[['live', 'Live Disasters'], ['sent', 'Sent Alerts']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {key === 'live' ? <SignalIcon className="h-4 w-4" /> : <PaperAirplaneIcon className="h-4 w-4" />}
              {label}
              {key === 'sent' && sentAlerts.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{sentAlerts.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'live' ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-4">
              {['danger', 'warning', 'watch', 'info'].map(level => {
                const s = SEV[level], cnt = counts[level] || 0, active = filter === level
                return (
                  <button key={level} onClick={() => setFilter(f => f === level ? 'all' : level)}
                    className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 ${active ? `bg-gradient-to-br ${level === 'danger' ? 'from-red-600 to-red-700' : level === 'warning' ? 'from-orange-500 to-amber-500' : level === 'watch' ? 'from-yellow-500 to-yellow-400' : 'from-blue-500 to-blue-600'} shadow-xl scale-105 text-white` : 'bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <div className={`text-xs font-bold tracking-widest mb-3 ${active ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{s.label}</div>
                    <div className={`text-4xl font-black leading-none ${active ? 'text-white' : cnt > 0 ? 'text-slate-800 dark:text-slate-100' : 'text-gray-200'}`}>{cnt}</div>
                    <div className={`text-xs mt-2 ${active ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>alert{cnt !== 1 ? 's' : ''}</div>
                    {cnt > 0 && !active && <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${s.dot}`} />}
                  </button>
                )
              })}
            </div>

            {/* Severity filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: liveAlerts.length },
                { key: 'danger',  label: 'Danger',  count: counts.danger  },
                { key: 'warning', label: 'Warning', count: counts.warning },
                { key: 'watch',   label: 'Watch',   count: counts.watch   },
                { key: 'info',    label: 'Info',     count: counts.info    },
              ].map(t => {
                const active = filter === t.key, s = SEV[t.key]
                return (
                  <button key={t.key} onClick={() => setFilter(t.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active ? t.key === 'all' ? 'bg-slate-900 text-white shadow-lg' : s?.pill + ' shadow-lg' : 'bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    {t.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{t.count}</span>
                  </button>
                )
              })}
              {!loading && (
                <div className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                  {filtered.length} alerts · Click <PaperAirplaneIcon className="h-3 w-3 inline text-blue-600" /> Send to broadcast to users
                </div>
              )}
            </div>

            {/* Disaster type filter row ← NEW */}
            <div className="flex items-center gap-2 flex-wrap">
              <FunnelIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1">Type:</span>
              {availableTypes.map(type => {
                const active  = typeFilter === type
                const tStyle  = TYPE_STYLE[type]
                const cnt     = type === 'all' ? liveAlerts.length : liveAlerts.filter(a => a.disasterType === type).length
                return (
                  <button key={type} onClick={() => setTypeFilter(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? `${tStyle?.bg || 'bg-slate-900 dark:bg-slate-100'} ${tStyle?.text || 'text-white dark:text-slate-900'} border-current shadow-sm`
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                    {type === 'all' ? 'All Types' : type}
                    <span className={`text-[10px] px-1 py-0.5 rounded font-bold ${active ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-700'}`}>{cnt}</span>
                  </button>
                )
              })}
            </div>

            {/* Live alert list */}
            {loading ? (
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-20 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Fetching live disaster data…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-16 text-center">
                <BellAlertIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No alerts match the selected filters</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(alert => (
                  <AlertRow key={alert._id} alert={alert} onSend={a => setSendModal(a)} />
                ))}
              </div>
            )}
          </>
        ) : (
          /* ── Sent Alerts tab ──────────────────────────────────────── */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {sentAlerts.length} alert{sentAlerts.length !== 1 ? 's' : ''} sent by you to registered users
              </div>
              {sentAlerts.length > 1 && (
                <button
                  onClick={handleCleanupDuplicates}
                  disabled={cleaningDuplicates}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-60"
                >
                  <FunnelIcon className={`h-4 w-4 ${cleaningDuplicates ? 'animate-pulse' : ''}`} />
                  {cleaningDuplicates ? 'Cleaning…' : 'Clean Duplicates'}
                </button>
              )}
            </div>
            {sentAlerts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 py-16 text-center">
                <PaperAirplaneIcon className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No alerts sent yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Go to Live Disasters tab and click Send on any alert</p>
              </div>
            ) : sentAlerts.map(a => {
              const issuedAt = a.timeline?.issuedAt || a.issuedAt || a.createdAt
              const s = SEV[a.severity] || SEV.info
              const t = TYPE_STYLE[a.disasterType || a.type] || { bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-600 dark:text-slate-300', letter: '??' }
              return (
                <div key={a._id} className={`border-l-4 ${s.border} ${s.row} rounded-r-xl p-5 shadow-sm`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`font-black text-xs ${t.text}`}>{t.letter}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{a.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${s.badge}`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.message}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{a.targetLocation?.city}</span>
                        <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{new Date(issuedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`flex items-center gap-1 font-medium ${a.sentToAll ? 'text-blue-600' : 'text-purple-600'}`}>
                          <UserGroupIcon className="h-3 w-3" />
                          {a.sentToAll ? `All ${users.length} users` : `${a.sentToUsers?.length || 0} user${(a.sentToUsers?.length || 0) !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(new Date(issuedAt).getTime())}</span>
                      <button
                        onClick={() => handleDeleteAlert(a._id, a.title)}
                        disabled={deletingAlertIds.includes(a._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200/70 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        {deletingAlertIds.includes(a._id) ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAlerts