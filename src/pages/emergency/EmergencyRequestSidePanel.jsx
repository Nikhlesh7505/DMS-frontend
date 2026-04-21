import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserIcon,
  ClipboardIcon,
  PhoneArrowUpRightIcon,
  MapIcon,
  DocumentDuplicateIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const StatusBadge = ({ status, getStatusColor }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(status) || 'bg-slate-100 text-slate-600'}`}>
    {status?.replace('_', ' ')}
  </span>
)

const SeverityBadge = ({ severity, getPriorityColor }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(severity) || 'bg-slate-100 text-slate-600'}`}>
    {severity}
  </span>
)

const Field = ({ label, value, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 leading-none mb-1">{label}</span>
    <span className="text-[13px] font-medium text-slate-700 leading-tight truncate">{value || '—'}</span>
  </div>
)

const SpecialNeedChip = ({ label, isActive, colorClass }) => (
  <div className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all ${
    isActive 
      ? `${colorClass} border-transparent` 
      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
  }`}>
    {label}
  </div>
)

const EmergencyRequestSidePanel = ({ 
  isOpen, 
  onClose, 
  request, 
  userRole, 
  getStatusColor, 
  getPriorityColor,
  onAction,
  actionLoading 
}) => {
  const [viewMode, setViewMode] = useState('summary') // 'summary' or 'full'
  const [note, setNote] = useState('')

  if (!isOpen || !request) return null

  const isResponder = userRole === 'ngo' || userRole === 'rescue_team' || userRole === 'admin'
  
  // Urgency indicator border color
  const severityBorder = request.priority === 'critical' ? 'border-red-500' : request.priority === 'high' ? 'border-amber-500' : 'border-slate-300'

  const handleStatusChange = (newStatus) => {
    onAction(request._id, 'status_change', { status: newStatus, note: note || `Status changed to ${newStatus.replace('_', ' ')}` })
    setNote('')
  }

  const handlePostUpdate = () => {
    onAction(request._id, 'status_change', { status: request.status, note })
    setNote('')
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
  }

  const steps = ['pending', 'acknowledged', 'assigned', 'in_progress', 'resolved']
  const currentStepIndex = steps.indexOf(request.status)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l-8 ${severityBorder}`}
        >
          {/* Action Bar Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => copyToClipboard(request.requestId)}
                className="p-1 px-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 flex items-center gap-1.5"
                title="Copy ID"
              >
                <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Copy ID</span>
              </button>
              <button 
                className="p-1 px-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 flex items-center gap-1.5"
                title="Call Requester"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Call</span>
              </button>
              <button 
                className="p-1 px-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 flex items-center gap-1.5"
                title="View Map"
              >
                <MapPinIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Map</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex p-0.5 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setViewMode('summary')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'summary' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Summary
                </button>
                <button 
                  onClick={() => setViewMode('full')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'full' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Details
                </button>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-all">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
            {/* Header Content */}
            <header>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">{request.requestId || 'REQ-ID'}</span>
                <StatusBadge status={request.status} getStatusColor={getStatusColor} />
                <SeverityBadge severity={request.priority} getPriorityColor={getPriorityColor} />
                <span className="text-[11px] font-bold text-slate-400">|</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">{request.peopleAffected} Affected</span>
                </div>
              </div>
              <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">{request.type?.replace('_', ' ')}</h1>
              <p className={`mt-2 text-[13px] text-slate-600 leading-snug ${viewMode === 'full' ? 'whitespace-pre-line' : 'line-clamp-2'}`}>
                {request.description}
              </p>
            </header>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Row 1: Location + Requester */}
              <section className="bg-slate-50/50 border border-slate-100 rounded-[12px] p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <MapPinIcon className="w-3 h-3 text-indigo-500" /> Location
                  </h3>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Map</button>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  <Field label="Address" value={request.location?.address} className="col-span-2" />
                  <Field label="City" value={request.location?.city} />
                  <Field label="State" value={request.location?.state} />
                  <Field label="Landmark" value={request.location?.landmark} className="col-span-2" />
                </div>
              </section>

              <section className="bg-slate-50/50 border border-slate-100 rounded-[12px] p-4 flex flex-col h-full">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3 border-b border-slate-200/50 pb-2">
                  <UserIcon className="w-3 h-3 text-indigo-500" /> Requester
                </h3>
                <div className="grid grid-cols-1 gap-y-3">
                  <Field label="Name" value={request.citizen?.name || request.citizenInfo?.name} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Phone" value={request.citizen?.phone || request.citizenInfo?.phone} />
                    <Field label="Alternative" value={request.citizenInfo?.alternativeContact} />
                  </div>
                  <Field label="Email" value={request.citizen?.email || request.citizenInfo?.email} />
                </div>
              </section>

              {/* Row 2: Special Needs + Timeline */}
              <section className="bg-slate-50/50 border border-slate-100 rounded-[12px] p-4 flex flex-col h-full">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3 border-b border-slate-200/50 pb-2">
                  <ClipboardIcon className="w-3 h-3 text-indigo-500" /> Special Needs
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <SpecialNeedChip 
                    label="Injuries" 
                    isActive={request.specialRequirements?.medical?.hasInjuries} 
                    colorClass="bg-red-100 text-red-700 border-red-200" 
                  />
                  <SpecialNeedChip 
                    label="Ambulance" 
                    isActive={request.specialRequirements?.medical?.needsAmbulance} 
                    colorClass="bg-red-100 text-red-700 border-red-200" 
                  />
                  <SpecialNeedChip 
                    label="Mobility" 
                    isActive={request.specialRequirements?.accessibility?.hasMobilityIssues} 
                    colorClass="bg-amber-100 text-amber-700 border-amber-200" 
                  />
                  <SpecialNeedChip 
                    label="Translator" 
                    isActive={request.specialRequirements?.language?.needsTranslator} 
                    colorClass="bg-amber-100 text-amber-700 border-amber-200" 
                  />
                </div>
                {viewMode === 'full' && request.specialRequirements?.medical?.hasInjuries && (
                  <Field label="Injury Details" value={request.specialRequirements?.medical?.injuryDetails} className="mb-3" />
                )}
                <Field label="Language" value={request.specialRequirements?.language?.preferred} />
              </section>

              <section className="bg-slate-50/50 border border-slate-100 rounded-[12px] p-4 flex flex-col h-full">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3 border-b border-slate-200/50 pb-2">
                  <ClockIcon className="w-3 h-3 text-indigo-500" /> Timeline
                </h3>
                {/* Visual Progress Stepper */}
                <div className="flex items-center justify-between mb-4 px-1">
                  {steps.map((step, i) => (
                    <React.Fragment key={step}>
                      <div 
                        className={`w-2 h-2 rounded-full ${i <= currentStepIndex ? 'bg-indigo-500' : 'bg-slate-200'}`} 
                        title={step.replace('_', ' ')}
                      />
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-[1px] ${i < currentStepIndex ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <Field label="Reported" value={request.timeline?.reportedAt ? new Date(request.timeline.reportedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'} />
                  <Field label="Resolved" value={request.timeline?.resolvedAt ? new Date(request.timeline.resolvedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'} />
                </div>
              </section>
            </div>

            {/* Assignment Section (Horizontal Row) */}
            <section className={viewMode === 'full' ? 'block' : 'hidden'}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Assignment & Resolution</h3>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-100 rounded-[12px] p-4">
                <Field label="Assigned To" value={request.assignment?.assignedTo?.name || request.assignment?.assignedTeam} />
                <Field label="Assigned By" value={request.assignment?.assignedBy?.name} />
                <Field label="Resolved By" value={request.resolution?.resolvedBy?.name} />
                <Field label="Outcome" value={request.resolution?.outcome} />
              </div>
            </section>

            {/* Responder Console */}
            {isResponder && request.status !== 'resolved' && (
              <section className="bg-indigo-50/40 border border-indigo-100/50 rounded-[16px] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 italic">Action Console</h3>
                  <div className="flex gap-1">
                    {['in_progress', 'en_route', 'on_scene'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={actionLoading[request._id]}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                          request.status === status 
                            ? 'bg-indigo-600 border-transparent text-white shadow-sm' 
                            : 'bg-white border-indigo-200 text-indigo-600 hover:bg-slate-50'
                        }`}
                      >
                        {status.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                    <button 
                      onClick={() => onAction(request._id, 'resolve')}
                      disabled={actionLoading[request._id]}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent shadow-sm"
                    >
                      RESOLVE
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Progress notes... (e.g. 'Arriving with 5 kits')"
                    className="w-full bg-white border border-indigo-100 rounded-[12px] px-4 py-2.5 text-[13px] focus:ring-2 focus:ring-indigo-400 outline-none resize-none transition-all placeholder:text-slate-300"
                    rows="2"
                  />
                  <button 
                    onClick={handlePostUpdate}
                    disabled={!note.trim() || actionLoading[request._id]}
                    className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-black disabled:opacity-20 transition-all opacity-0 group-focus-within:opacity-100"
                  >
                    {actionLoading[request._id] ? '...' : 'POST UPDATE'}
                  </button>
                </div>
              </section>
            )}

            {/* Activity Log (Recent Updates) */}
            {viewMode === 'full' && (
              <section className="flex flex-col min-h-[150px]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Activity Log</h3>
                <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {(request.updates || []).slice().reverse().map((update, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col p-3 bg-white border border-slate-100 rounded-[12px] border-l-4 ${
                        update.status === 'resolved' ? 'border-l-emerald-500' : 
                        update.status === 'in_progress' ? 'border-l-amber-500' : 
                        update.status === 'assigned' ? 'border-l-blue-500' : 
                        'border-l-indigo-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{update.status?.replace('_', ' ') || 'UPDATE'}</span>
                        <span className="text-[10px] text-slate-300 font-bold">{new Date(update.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-[13px] text-slate-700 font-medium leading-tight">{update.note}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <UserIcon className="w-2.5 h-2.5 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{update.updatedBy?.name}</span>
                      </div>
                    </div>
                  ))}
                  {(request.updates || []).length === 0 && (
                    <div className="text-center py-8 bg-slate-50 rounded-[12px] border border-dashed border-slate-200">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No activity logged yet</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EmergencyRequestSidePanel
