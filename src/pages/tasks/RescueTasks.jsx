// import React, { useEffect, useState, useCallback, useRef } from 'react'
// import { useLocation } from 'react-router-dom'
// import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayersControl } from 'react-leaflet'
// import L from 'leaflet'
// import { taskAPI, alertAPI, disasterAPI } from '../../services/api'
// import { useAuth } from '../../contexts/AuthContext'
// import {
//   WrenchIcon,
//   MapPinIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   SignalIcon,
//   ListBulletIcon,
//   MapIcon,
//   ArrowPathIcon
// } from '@heroicons/react/24/outline'

// // ── Leaflet Asset Fix ─────────────────────────────────────────────
// // Some environments fail to load markers correctly. We use DivIcons or explicit URLs.
// import markerIcon from 'leaflet/dist/images/marker-icon.png'
// import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
// import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIconRetina,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// })
// L.Marker.prototype.options.icon = DefaultIcon

// // ── Custom Markers ────────────────────────────────────────────────
// const createDisasterIcon = (severity) => new L.DivIcon({
//   html: `<div class="disaster-ripple"><div class="disaster-ripple-inner shadow-lg"></div></div>`,
//   className: 'custom-disaster-marker',
//   iconSize: [12, 12],
//   iconAnchor: [6, 6]
// })

// const createAlertIcon = (severity) => new L.DivIcon({
//   html: `<div class="bg-amber-500 w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center alert-pulse"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
//   className: 'custom-alert-marker',
//   iconSize: [16, 16],
//   iconAnchor: [8, 8]
// })

// const createTaskIcon = (priority) => {
//   const colors = { critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' }
//   const color = colors[priority] || '#6366f1'
//   return new L.DivIcon({
//     html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4); transform: rotate(45deg);"></div>`,
//     className: 'custom-task-marker',
//     iconSize: [14, 14],
//     iconAnchor: [7, 7]
//   })
// }

// // ── Map Controller & Resizer ────────────────────────────────────────
// const MapController = ({ center, zoom }) => {
//   const map = useMap()
//   const lastCenter = useRef(null)
  
//   // Force a resize calculation 100ms after component mounts
//   // This fixes the 'fragmented tiles' issue in flex containers
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       map.invalidateSize()
//     }, 250)
//     return () => clearTimeout(timer)
//   }, [map])

//   useEffect(() => {
//     if (center && (!lastCenter.current || lastCenter.current[0] !== center[0] || lastCenter.current[1] !== center[1])) {
//       map.setView(center, zoom || 13, { animate: true })
//       lastCenter.current = center
//     }
//   }, [center, zoom, map])
//   return null
// }

// const RescueTasks = () => {
//   const { user } = useAuth()
//   const locationState = useLocation().state
  
//   // Data States
//   const [tasks, setTasks] = useState([])
//   const [alerts, setAlerts] = useState([])
//   const [disasters, setDisasters] = useState([])
  
//   // UI States
//   const [loading, setLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [filter, setFilter] = useState('all')
//   const [viewMode, setViewMode] = useState('split') // 'map', 'list', 'split'
//   const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
//   const [mapZoom, setMapZoom] = useState(5)
//   const [selectedItem, setSelectedItem] = useState(null) // Can be task, alert or disaster

//   const fetchAllMapData = useCallback(async (isSilent = false) => {
//     if (!isSilent) setLoading(true)
//     else setRefreshing(true)
    
//     try {
//       const [tasksRes, alertsRes, disastersRes] = await Promise.all([
//         (user?.role === 'ngo' || user?.role === 'rescue_team') ? taskAPI.getMyTasks() : taskAPI.getAll(filter !== 'all' ? { status: filter } : {}),
//         alertAPI.getAll({ active: true }),
//         disasterAPI.getAll({ status: 'active' })
//       ])

//       setTasks(tasksRes.data?.data?.tasks || [])
//       setAlerts(alertsRes.data?.data?.alerts || [])
//       setDisasters(disastersRes.data?.data?.disasters || disastersRes.data?.data || []) // Handle potential different API structures
      
//     } catch (error) {
//       console.error('Failed to fetch map data:', error)
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }, [user?.role, filter])

//   // Initial Load & State Focus
//   useEffect(() => {
//     fetchAllMapData()
    
//     if (locationState?.focusLocation) {
//       const { latitude, longitude } = locationState.focusLocation
//       if (latitude && longitude) {
//         setMapCenter([latitude, longitude])
//         setMapZoom(14)
//         setViewMode('split')
//       }
//     }
//   }, [fetchAllMapData, locationState])

//   // Real-time Polling (every 30 seconds)
//   useEffect(() => {
//     const id = setInterval(() => fetchAllMapData(true), 30000)
//     return () => clearInterval(id)
//   }, [fetchAllMapData])

//   const handleManualRefresh = () => fetchAllMapData()

//   const handleItemClick = (item, type) => {
//     const coords = item.location?.coordinates || item.targetLocation?.coordinates
//     if (coords && coords.latitude && coords.longitude) {
//       setMapCenter([coords.latitude, coords.longitude])
//       setMapZoom(15)
//       setSelectedItem({ ...item, mapType: type })
//     }
//   }

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-slate-500/20 text-slate-700',
//       assigned: 'bg-indigo-500/20 text-indigo-700',
//       in_progress: 'bg-amber-500/20 text-amber-700',
//       completed: 'bg-emerald-500/20 text-emerald-700',
//       active: 'bg-red-500/20 text-red-700 alert-pulse',
//       resolved: 'bg-emerald-500/20 text-emerald-700'
//     }
//     return colors[status] || 'bg-slate-500/20 text-slate-700'
//   }

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
//         <div className="relative w-16 h-16">
//           <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
//           <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//         </div>
//         <p className="text-slate-500 font-bold animate-pulse">Initializing Situation Map...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
//       {/* Header with Dashboard Controls */}
//       <div className="flex flex-wrap items-center justify-between gap-4 px-2">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
//             <SignalIcon className="h-7 w-7 text-red-600 animate-pulse" />
//             Situation Room
//           </h1>
//           <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
//             Real-time Disaster & Rescue Operations Map
//             {refreshing && <span className="ml-2 text-blue-600 animate-pulse">· Updating...</span>}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Refresh Button */}
//           <button 
//             onClick={handleManualRefresh}
//             className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-600 hover:text-blue-600 transition-all shadow-sm"
//           >
//             <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
//           </button>

//           {/* View Toggles */}
//           <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
//             {[
//               { id: 'map', icon: MapIcon },
//               { id: 'split', icon: null }, // Handled manually below
//               { id: 'list', icon: ListBulletIcon }
//             ].map((v) => (
//               <button 
//                 key={v.id}
//                 onClick={() => setViewMode(v.id)}
//                 className={`p-2 rounded-lg transition-all ${viewMode === v.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
//               >
//                 {v.id === 'split' ? (
//                   <div className="flex gap-0.5">
//                     <div className="w-2 h-4 border-2 border-current rounded-sm"></div>
//                     <div className="w-2 h-4 border-2 border-current rounded-sm"></div>
//                   </div>
//                 ) : <v.icon className="h-5 w-5" />}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Layout Area */}
//       <div className={`flex-1 flex flex-col lg:flex-row gap-4 min-h-0`}>
        
//         {/* Map Container */}
//         {(viewMode === 'map' || viewMode === 'split') && (
//           <div className={`${viewMode === 'split' ? 'lg:w-2/3' : 'w-full'} h-full rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative z-10 shadow-2xl bg-slate-900`}>
//             <MapContainer 
//               center={mapCenter} 
//               zoom={mapZoom} 
//               style={{ height: '100%', width: '100%' }}
//               zoomControl={false}
//             >
//               <TileLayer
//                 attribution='&copy; OpenStreetMap contributors &copy; CARTO'
//                 url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
//               />
//               <MapController center={mapCenter} zoom={mapZoom} />
//               <ZoomControl position="bottomleft" />
              
//               <LayersControl position="topright">
//                 <LayersControl.Overlay checked name="Rescue Tasks">
//                   <div className="tasks-layer">
//                     {tasks.map(task => {
//                       const coords = task.location?.coordinates
//                       if (!coords?.latitude) return null
//                       return (
//                         <Marker 
//                           key={`task-${task._id}`} 
//                           position={[coords.latitude, coords.longitude]}
//                           icon={createTaskIcon(task.priority)}
//                         >
//                           <Popup>
//                             <div className="p-2 max-w-[200px]">
//                               <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Rescue Task</div>
//                               <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
//                               <p className="text-[10px] text-slate-500 mt-1">{task.description?.substring(0, 60)}...</p>
//                               <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block font-bold ${getStatusColor(task.status)}`}>
//                                 {task.status.toUpperCase()}
//                               </div>
//                             </div>
//                           </Popup>
//                         </Marker>
//                       )
//                     })}
//                   </div>
//                 </LayersControl.Overlay>

//                 <LayersControl.Overlay checked name="Active Disasters">
//                   <div className="disasters-layer">
//                     {disasters.map(dis => {
//                       const coords = dis.location?.coordinates
//                       if (!coords?.latitude) return null
//                       return (
//                         <Marker 
//                           key={`dis-${dis._id}`} 
//                           position={[coords.latitude, coords.longitude]}
//                           icon={createDisasterIcon(dis.severity)}
//                         >
//                           <Popup>
//                             <div className="p-2">
//                               <div className="text-[10px] font-black text-red-600 uppercase mb-1 flex items-center gap-1">
//                                 <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
//                                 Major Disaster
//                               </div>
//                               <h4 className="font-bold text-sm text-slate-900">{dis.name}</h4>
//                               <div className="flex gap-2 mt-2">
//                                 <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">{dis.type}</span>
//                                 <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{dis.severity}</span>
//                               </div>
//                             </div>
//                           </Popup>
//                         </Marker>
//                       )
//                     })}
//                   </div>
//                 </LayersControl.Overlay>

//                 <LayersControl.Overlay checked name="Real-time Alerts">
//                   <div className="alerts-layer">
//                     {alerts.map(alert => {
//                       const coords = alert.targetLocation?.coordinates
//                       if (!coords?.latitude) return null
//                       return (
//                         <Marker 
//                           key={`alert-${alert._id}`} 
//                           position={[coords.latitude, coords.longitude]}
//                           icon={createAlertIcon(alert.severity)}
//                         >
//                           <Popup>
//                             <div className="p-2">
//                               <div className="text-[10px] font-black text-amber-600 uppercase mb-1">Live Alert</div>
//                               <h4 className="font-bold text-sm text-slate-900">{alert.title}</h4>
//                               <p className="text-[10px] text-slate-500 mt-1">{alert.message}</p>
//                             </div>
//                           </Popup>
//                         </Marker>
//                       )
//                     })}
//                   </div>
//                 </LayersControl.Overlay>
//               </LayersControl>
//             </MapContainer>

//             {/* Floating Stats Display */}
//             <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
//               <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
//                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"></div>
//                 <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">
//                   {disasters.length} ACTIVE DISASTERS
//                 </div>
//               </div>
//               <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
//                 <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
//                 <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">
//                   {alerts.length} BROADCAST ALERTS
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Sidebar Info List */}
//         {(viewMode === 'list' || viewMode === 'split') && (
//           <div className={`${viewMode === 'split' ? 'lg:w-1/3' : 'w-full'} flex flex-col gap-3 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-6`}>
            
//             {/* Legend/Info Section */}
//             <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-2">
//               <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Map Legend</h3>
//               <div className="grid grid-cols-1 gap-2">
//                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
//                   <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
//                   <span>ACTIVE DISASTER (RADIAL RIPPLE)</span>
//                 </div>
//                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
//                   <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
//                   <span>EMERGENCY ALERT (PULSING POINT)</span>
//                 </div>
//                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
//                   <div className="w-3 h-3 rounded bg-blue-500 rotate-45 transform shadow-sm"></div>
//                   <span>RESCUE TASK (DYNAMIC BOX)</span>
//                 </div>
//               </div>
//             </div>

//             {/* Items List */}
//             {[...disasters.map(d => ({ ...d, listType: 'disaster' })), 
//               ...alerts.map(a => ({ ...a, listType: 'alert' })),
//               ...tasks.map(t => ({ ...t, listType: 'task' }))
//             ].sort((a, b) => new Date(b.createdAt || b.ts || 0) - new Date(a.createdAt || a.ts || 0))
//              .map((item, idx) => (
//               <div 
//                 key={`${item.listType}-${item._id}-${idx}`}
//                 onClick={() => handleItemClick(item, item.listType)}
//                 className={`card cursor-pointer group transition-all duration-300 hover:translate-x-1 ${selectedItem?._id === item._id ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
//               >
//                 <div className="p-4">
//                   <div className="flex items-start gap-4">
//                     <div className={`p-2 rounded-xl flex-shrink-0 ${item.listType === 'disaster' ? 'bg-red-500/10 text-red-600' : item.listType === 'alert' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
//                       {item.listType === 'disaster' ? <SignalIcon className="h-5 w-5 animate-pulse" /> : item.listType === 'alert' ? <ExclamationTriangleIcon className="h-5 w-5" /> : <WrenchIcon className="h-5 w-5" />}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between gap-2">
//                         <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.name || item.title}</h4>
//                         <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getStatusColor(item.status || 'active')}`}>
//                           {item.listType}
//                         </span>
//                       </div>
//                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.description || item.message}</p>
//                       <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-slate-400 tracking-tight uppercase">
//                         <span className="flex items-center gap-1">
//                           <MapPinIcon className="h-3 w-3" />
//                           {item.location?.city || item.targetLocation?.city || 'Region Active'}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <ClockIcon className="h-3 w-3" />
//                           {new Date(item.createdAt || item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default RescueTasks



import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import { taskAPI, alertAPI, disasterAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  WrenchIcon, MapPinIcon, CalendarIcon, CheckCircleIcon, ClockIcon,
  ExclamationTriangleIcon, SignalIcon, ListBulletIcon, MapIcon,
  ArrowPathIcon, XMarkIcon, BellAlertIcon,
} from '@heroicons/react/24/outline'

// ── Leaflet asset fix ────────────────────────────────────────────
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon, iconRetinaUrl: markerIconRetina, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

// ── Custom marker icons ──────────────────────────────────────────
const createDisasterIcon = () => new L.DivIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 0 0 4px rgba(239,68,68,0.3),0 0 12px rgba(239,68,68,0.6);animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
})

const createAlertIcon = () => new L.DivIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#f59e0b;border:2px solid white;box-shadow:0 0 8px rgba(245,158,11,0.7);"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
})

const createTaskIcon = (priority) => {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#10b981' }
  const color = colors[priority] || '#6366f1'
  return new L.DivIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:4px;border:2px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);transform:rotate(45deg);"></div>`,
    className: '', iconSize: [14, 14], iconAnchor: [7, 7],
  })
}

// ── Special "focused alert" icon — large glowing ring ───────────
// Used when the admin clicks "View" on an alert from the Alerts page.
const SEVERITY_COLORS = {
  danger: { ring: 'rgba(239,68,68,0.35)', core: '#ef4444', glow: 'rgba(239,68,68,0.8)' },
  warning:{ ring: 'rgba(249,115,22,0.35)', core: '#f97316', glow: 'rgba(249,115,22,0.8)' },
  watch:  { ring: 'rgba(234,179,8,0.35)',  core: '#eab308', glow: 'rgba(234,179,8,0.8)'  },
  info:   { ring: 'rgba(59,130,246,0.35)', core: '#3b82f6', glow: 'rgba(59,130,246,0.8)' },
}
function createFocusedAlertIcon(severity = 'danger') {
  const c = SEVERITY_COLORS[severity] || SEVERITY_COLORS.danger
  return new L.DivIcon({
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:44px;height:44px;border-radius:50%;background:${c.ring};animation:focusedPing 1.4s ease-out infinite;"></div>
        <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:${c.ring};animation:focusedPing 1.4s ease-out 0.4s infinite;"></div>
        <div style="width:18px;height:18px;border-radius:50%;background:${c.core};border:3px solid white;box-shadow:0 0 14px ${c.glow};z-index:1;"></div>
      </div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  })
}

// ── CSS keyframes injected once ──────────────────────────────────
if (!document.getElementById('map-keyframes')) {
  const style = document.createElement('style')
  style.id = 'map-keyframes'
  style.textContent = `
    @keyframes focusedPing {
      0%   { transform: scale(0.8); opacity: 0.8; }
      70%  { transform: scale(1.6); opacity: 0; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ping {
      0%,100% { transform: scale(1); opacity: 1; }
      50%      { transform: scale(1.4); opacity: 0.6; }
    }
  `
  document.head.appendChild(style)
}

// ── MapController — flies to new center & fixes tile gaps ────────
const MapController = ({ center, zoom }) => {
  const map = useMap()
  const lastCenter = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250)
    return () => clearTimeout(t)
  }, [map])

  useEffect(() => {
    if (!center) return
    const [la, lo] = center
    if (!lastCenter.current || lastCenter.current[0] !== la || lastCenter.current[1] !== lo) {
      map.flyTo(center, zoom || 10, { animate: true, duration: 1.2 })
      lastCenter.current = center
    }
  }, [center, zoom, map])
  return null
}

// ── AutoOpenPopup — opens a marker's popup after mount ───────────
const AutoOpenPopup = ({ markerRef }) => {
  useEffect(() => {
    if (!markerRef.current) return
    const t = setTimeout(() => markerRef.current?.openPopup(), 900)
    return () => clearTimeout(t)
  }, [markerRef])
  return null
}

// ── Severity label helper ─────────────────────────────────────────
const SEV_LABEL = { danger: 'DANGER', warning: 'WARNING', watch: 'WATCH', info: 'INFO' }
const SEV_COLOR = {
  danger:  'bg-red-500/20 text-red-400 border-red-500/40',
  warning: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  watch:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  info:    'bg-blue-500/20 text-blue-400 border-blue-500/40',
}

// ── Main Component ────────────────────────────────────────────────
const RescueTasks = () => {
  const { user }        = useAuth()
  const locationState   = useLocation().state

  const [tasks,     setTasks]     = useState([])
  const [alerts,    setAlerts]    = useState([])
  const [disasters, setDisasters] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)
  const [filter,    setFilter]    = useState('all')
  const [viewMode,  setViewMode]  = useState('split')
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [mapZoom,   setMapZoom]   = useState(5)
  const [selectedItem, setSelectedItem] = useState(null)

  // ── Focused alert (navigated from AdminAlerts "View" button) ────
  // Stores the full alert payload sent via navigate() state so we can
  // render a dedicated glowing marker and auto-open its popup.
  const [focusedAlert, setFocusedAlert] = useState(null)
  const focusedMarkerRef = useRef(null)

  const fetchAllMapData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)
    try {
      const [tasksRes, alertsRes, disastersRes] = await Promise.all([
        (user?.role === 'ngo' || user?.role === 'rescue_team')
          ? taskAPI.getMyTasks()
          : taskAPI.getAll(filter !== 'all' ? { status: filter } : {}),
        alertAPI.getAll({ active: true }),
        disasterAPI.getAll({ status: 'active' }),
      ])
      setTasks(tasksRes.data?.data?.tasks || [])
      setAlerts(alertsRes.data?.data?.alerts || [])
      setDisasters(disastersRes.data?.data?.disasters || disastersRes.data?.data || [])
    } catch (e) {
      console.error('Failed to fetch map data:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.role, filter])

  // ── Initial load + handle focus state from AdminAlerts ──────────
  useEffect(() => {
    fetchAllMapData()

    if (locationState?.focusAlert) {
      // ✅ Store the focusAlert payload for the dedicated marker
      setFocusedAlert(locationState.focusAlert)
    }

    if (locationState?.focusLocation) {
      const { latitude, longitude } = locationState.focusLocation
      if (latitude && longitude) {
        setMapCenter([latitude, longitude])
        // Zoom level depends on disaster type — earthquakes get 8, weather zones get 7
        const zoom = locationState.focusAlert?.disasterType === 'Earthquake' ||
                     locationState.focusAlert?.disasterType === 'Tsunami' ? 8 : 7
        setMapZoom(zoom)
        setViewMode('split')
      }
    }
  }, [fetchAllMapData, locationState])

  // Auto-open focused marker popup whenever focusedAlert changes
  useEffect(() => {
    if (!focusedAlert) return
    const t = setTimeout(() => {
      try { focusedMarkerRef.current?.openPopup() } catch (_) {}
    }, 1200)
    return () => clearTimeout(t)
  }, [focusedAlert])

  // Real-time polling (30 s)
  useEffect(() => {
    const id = setInterval(() => fetchAllMapData(true), 30000)
    return () => clearInterval(id)
  }, [fetchAllMapData])

  const handleItemClick = (item, type) => {
    const coords = item.location?.coordinates || item.targetLocation?.coordinates
    if (coords?.latitude && coords?.longitude) {
      setMapCenter([coords.latitude, coords.longitude])
      setMapZoom(15)
      setSelectedItem({ ...item, mapType: type })
    }
  }

  const getStatusColor = status => ({
    pending:     'bg-slate-500/20 text-slate-700',
    assigned:    'bg-indigo-500/20 text-indigo-700',
    in_progress: 'bg-amber-500/20 text-amber-700',
    completed:   'bg-emerald-500/20 text-emerald-700',
    active:      'bg-red-500/20 text-red-700',
    resolved:    'bg-emerald-500/20 text-emerald-700',
  }[status] || 'bg-slate-500/20 text-slate-700')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-bold animate-pulse">Initializing Situation Map…</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <SignalIcon className="h-7 w-7 text-red-600 animate-pulse" />
            Situation Room
          </h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Real-time Disaster & Rescue Operations Map
            {refreshing && <span className="ml-2 text-blue-600 animate-pulse">· Updating…</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchAllMapData()} className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-600 hover:text-blue-600 transition-all shadow-sm">
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            {[{ id:'map', Icon:MapIcon }, { id:'split', Icon:null }, { id:'list', Icon:ListBulletIcon }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} className={`p-2 rounded-lg transition-all ${viewMode===v.id?'bg-blue-600 text-white shadow-lg':'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                {v.id === 'split'
                  ? <div className="flex gap-0.5"><div className="w-2 h-4 border-2 border-current rounded-sm"/><div className="w-2 h-4 border-2 border-current rounded-sm"/></div>
                  : <v.Icon className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Focused Alert Banner ─────────────────────────────────
          Shown when the admin navigated here by clicking "View" on an alert.
          Displays key info and lets the admin dismiss it.           */}
      {focusedAlert && (
        <div className={`mx-2 flex items-start gap-3 px-4 py-3 rounded-2xl border ${SEV_COLOR[focusedAlert.severity] || SEV_COLOR.info} bg-opacity-10`}
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <BellAlertIcon className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-80" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{focusedAlert.title}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${SEV_COLOR[focusedAlert.severity] || SEV_COLOR.info}`}>
                {SEV_LABEL[focusedAlert.severity] || 'ALERT'}
              </span>
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">{focusedAlert.disasterType}</span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">{focusedAlert.message}</p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-white/50 font-medium">
              <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3"/>{focusedAlert.location}</span>
              <span>{focusedAlert.source}</span>
              {focusedAlert.coordinates && (
                <span>{focusedAlert.coordinates.latitude.toFixed(3)}°, {focusedAlert.coordinates.longitude.toFixed(3)}°</span>
              )}
            </div>
          </div>
          <button onClick={() => setFocusedAlert(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            <XMarkIcon className="h-4 w-4 text-white/60" />
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

        {/* Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode==='split'?'lg:w-2/3':'w-full'} h-full rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative z-10 shadow-2xl bg-slate-900`}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height:'100%', width:'100%' }} zoomControl={false}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} zoom={mapZoom} />
              <ZoomControl position="bottomleft" />

              <LayersControl position="topright">
                {/* Rescue Tasks */}
                <LayersControl.Overlay checked name="Rescue Tasks">
                  <div>
                    {tasks.map(task => {
                      const c = task.location?.coordinates
                      if (!c?.latitude) return null
                      return (
                        <Marker key={`task-${task._id}`} position={[c.latitude, c.longitude]} icon={createTaskIcon(task.priority)}>
                          <Popup>
                            <div className="p-2 max-w-[200px]">
                              <div className="text-[10px] font-black text-blue-600 uppercase mb-1">Rescue Task</div>
                              <h4 className="font-bold text-sm">{task.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">{task.description?.substring(0,60)}…</p>
                              <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block font-bold ${getStatusColor(task.status)}`}>{task.status?.toUpperCase()}</div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                  </div>
                </LayersControl.Overlay>

                {/* Active Disasters */}
                <LayersControl.Overlay checked name="Active Disasters">
                  <div>
                    {disasters.map(dis => {
                      const c = dis.location?.coordinates
                      if (!c?.latitude) return null
                      return (
                        <Marker key={`dis-${dis._id}`} position={[c.latitude, c.longitude]} icon={createDisasterIcon()}>
                          <Popup>
                            <div className="p-2">
                              <div className="text-[10px] font-black text-red-600 uppercase mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 animate-ping"/>Major Disaster</div>
                              <h4 className="font-bold text-sm">{dis.name}</h4>
                              <div className="flex gap-2 mt-2">
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">{dis.type}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{dis.severity}</span>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                  </div>
                </LayersControl.Overlay>

                {/* Broadcast Alerts (saved in DB) */}
                <LayersControl.Overlay checked name="Broadcast Alerts">
                  <div>
                    {alerts.map(alert => {
                      // ✅ Check both coordinates fields (new DB saves targetLocation.coordinates)
                      const c = alert.targetLocation?.coordinates
                      if (!c?.latitude) return null
                      return (
                        <Marker key={`alert-${alert._id}`} position={[c.latitude, c.longitude]} icon={createAlertIcon()}>
                          <Popup>
                            <div className="p-2">
                              <div className="text-[10px] font-black text-amber-600 uppercase mb-1">Broadcast Alert</div>
                              <h4 className="font-bold text-sm">{alert.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">{alert.message}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                  </div>
                </LayersControl.Overlay>
              </LayersControl>

              {/* ── Focused Alert Marker ─────────────────────────────────
                  Rendered outside LayersControl so it's always visible.
                  Uses the glowing animated icon and auto-opens its popup. */}
              {focusedAlert?.coordinates?.latitude && focusedAlert?.coordinates?.longitude && (
                <Marker
                  position={[focusedAlert.coordinates.latitude, focusedAlert.coordinates.longitude]}
                  icon={createFocusedAlertIcon(focusedAlert.severity)}
                  ref={focusedMarkerRef}
                  zIndexOffset={1000}
                >
                  <Popup minWidth={220} maxWidth={280}>
                    <div className="p-3">
                      <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block"/>
                        Live Alert — {focusedAlert.disasterType}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug mb-1">{focusedAlert.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{focusedAlert.message}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1"><MapPinIcon className="h-3 w-3"/>{focusedAlert.location}</div>
                        <div>Source: <span className="font-semibold text-slate-600">{focusedAlert.source}</span></div>
                        {focusedAlert.coordinates && (
                          <div>{focusedAlert.coordinates.latitude.toFixed(4)}°N, {focusedAlert.coordinates.longitude.toFixed(4)}°E</div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Floating stats */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]"/>
                <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">{disasters.length} Active Disasters</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]"/>
                <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-widest uppercase">{alerts.length} Broadcast Alerts</div>
              </div>
              {focusedAlert && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"/>
                  <div className="text-[10px] font-black text-blue-600 tracking-widest uppercase">Viewing Live Alert</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar list */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode==='split'?'lg:w-1/3':'w-full'} flex flex-col gap-3 min-h-0 overflow-y-auto pr-2 pb-6`}>
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-2">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Map Legend</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { color: 'bg-red-500',   label: 'ACTIVE DISASTER (PULSING RED)'      },
                  { color: 'bg-amber-500', label: 'BROADCAST ALERT (AMBER POINT)'      },
                  { color: 'bg-blue-500',  label: 'RESCUE TASK (COLOURED DIAMOND)'     },
                  { color: 'bg-white border-2 border-blue-400 shadow-[0_0_8px_#3b82f6]', label: 'FOCUSED ALERT (GLOWING RING)' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`}/>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              ...disasters.map(d => ({ ...d, listType: 'disaster' })),
              ...alerts.map(a    => ({ ...a, listType: 'alert'    })),
              ...tasks.map(t     => ({ ...t, listType: 'task'     })),
            ]
              .sort((a, b) => new Date(b.createdAt || b.ts || 0) - new Date(a.createdAt || a.ts || 0))
              .map((item, idx) => (
                <div
                  key={`${item.listType}-${item._id}-${idx}`}
                  onClick={() => handleItemClick(item, item.listType)}
                  className={`rounded-2xl border cursor-pointer group transition-all duration-300 hover:translate-x-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 ${selectedItem?._id === item._id ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200/50 dark:border-slate-700/50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${item.listType==='disaster'?'bg-red-500/10 text-red-600':item.listType==='alert'?'bg-amber-500/10 text-amber-600':'bg-blue-500/10 text-blue-600'}`}>
                      {item.listType==='disaster'?<SignalIcon className="h-5 w-5 animate-pulse"/>:item.listType==='alert'?<ExclamationTriangleIcon className="h-5 w-5"/>:<WrenchIcon className="h-5 w-5"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.name || item.title}</h4>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getStatusColor(item.status || 'active')}`}>{item.listType}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{item.description || item.message}</p>
                      <div className="mt-3 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3"/>{item.location?.city || item.targetLocation?.city || 'Region Active'}</span>
                        <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/>{new Date(item.createdAt || item.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default RescueTasks