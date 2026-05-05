import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  MapPinIcon, 
  PhoneIcon, 
  UserIcon,
  ClipboardIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

/* ── tiny sub-components ─────────────────────────────────────── */

const StatusBadge = ({ status, getStatusColor }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-sm ${getStatusColor(status) || 'bg-slate-500/20 text-slate-600'}`}>
    {status?.replace('_', ' ')}
  </span>
)

const SeverityBadge = ({ severity, getPriorityColor }) => (
  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-sm ${getPriorityColor(severity) || 'bg-slate-500/20 text-slate-600'}`}>
    {severity}
  </span>
)

const Field = ({ label, value, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1.5">{label}</span>
    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">{value || '—'}</span>
  </div>
)

const SpecialNeedChip = ({ label, isActive, colorClass }) => (
  <div className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all backdrop-blur-sm ${
    isActive 
      ? `${colorClass} border border-white/30 shadow-sm` 
      : 'bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40 text-slate-400 opacity-60'
  }`}>
    {label}
  </div>
)

/* ── glass section wrapper ───────────────────────────────────── */
const GlassSection = ({ icon: Icon, title, action, children, className = '' }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-700/40 rounded-[20px] p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.3)] overflow-hidden ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
          {Icon && (
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
              <Icon className="w-3 h-3 text-white" />
            </div>
          )}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  </motion.section>
)

/* ── main component ──────────────────────────────────────────── */

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
  const [note, setNote] = useState('')

  if (!isOpen || !request) return null

  const isResponder = userRole === 'ngo' || userRole === 'rescue_team' || userRole === 'admin'
  
  const severityGlow = request.priority === 'critical' 
    ? 'shadow-[inset_4px_0_0_#ef4444,0_0_40px_-12px_rgba(239,68,68,0.15)]' 
    : request.priority === 'high' 
    ? 'shadow-[inset_4px_0_0_#f59e0b,0_0_40px_-12px_rgba(245,158,11,0.15)]' 
    : 'shadow-[inset_4px_0_0_#6366f1,0_0_40px_-12px_rgba(99,102,241,0.1)]'

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

  const formatLanguage = (val) => {
    const map = { en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', other: 'Other' }
    return map[val] || val || '—'
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative h-full w-full max-w-2xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl flex flex-col border-l border-slate-200/50 dark:border-slate-700/40 ${severityGlow}`}
        >
          {/* ── Action Bar ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/50 dark:border-slate-700/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl">
            <div className="flex items-center gap-1">
              {[
                { icon: DocumentDuplicateIcon, label: 'Copy ID', onClick: () => copyToClipboard(request.requestId) },
                { icon: PhoneIcon, label: 'Call', onClick: () => {} },
                { icon: MapPinIcon, label: 'Map', onClick: () => {} },
              ].map(btn => (
                <motion.button
                  key={btn.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={btn.onClick}
                  className="p-1.5 px-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/40 flex items-center gap-1.5 backdrop-blur-sm"
                  title={btn.label}
                >
                  <btn.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">{btn.label}</span>
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all border border-slate-200/40 dark:border-slate-700/30"
              >
                <XMarkIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* ── Content ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-5">
            {/* Header */}
            <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-mono font-bold text-indigo-500/70 dark:text-indigo-400/70 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{request.requestId || 'REQ-ID'}</span>
                <StatusBadge status={request.status} getStatusColor={getStatusColor} />
                <SeverityBadge severity={request.priority} getPriorityColor={getPriorityColor} />
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <div className="flex items-center gap-1.5 text-slate-500">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">{request.peopleAffected} Affected</span>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">{request.type?.replace('_', ' ')}</h1>
              <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {request.description}
              </p>
            </motion.header>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              <GlassSection
                icon={MapPinIcon}
                title="Location"
                action={<button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View Map</button>}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                  <Field label="Address" value={request.location?.address} className="col-span-2" />
                  <Field label="City" value={request.location?.city} />
                  <Field label="State" value={request.location?.state} />
                  <Field label="Landmark" value={request.location?.landmark} className="col-span-2" />
                </div>
              </GlassSection>

              <GlassSection icon={UserIcon} title="Requester">
                <div className="grid grid-cols-1 gap-y-3">
                  <Field label="Name" value={request.citizen?.name || request.citizenInfo?.name} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone" value={request.citizen?.phone || request.citizenInfo?.phone} />
                    <Field label="Alternative" value={request.citizenInfo?.alternativeContact} />
                  </div>
                  <Field label="Email" value={request.citizen?.email || request.citizenInfo?.email} />
                </div>
              </GlassSection>

              <GlassSection icon={ClipboardIcon} title="Special Needs">
                <div className="flex flex-wrap gap-2 mb-4">
                  <SpecialNeedChip label="Injuries" isActive={request.specialRequirements?.medical?.hasInjuries} colorClass="bg-red-500/20 text-red-700 dark:text-red-400" />
                  <SpecialNeedChip label="Ambulance" isActive={request.specialRequirements?.medical?.needsAmbulance} colorClass="bg-red-500/20 text-red-700 dark:text-red-400" />
                  <SpecialNeedChip label="Mobility" isActive={request.specialRequirements?.accessibility?.hasMobilityIssues} colorClass="bg-amber-500/20 text-amber-700 dark:text-amber-400" />
                  <SpecialNeedChip label="Translator" isActive={request.specialRequirements?.language?.needsTranslator} colorClass="bg-amber-500/20 text-amber-700 dark:text-amber-400" />
                </div>
                {request.specialRequirements?.medical?.hasInjuries && (
                  <Field label="Injury Details" value={request.specialRequirements?.medical?.injuryDetails} className="mb-3" />
                )}
                <Field label="Language" value={formatLanguage(request.specialRequirements?.language?.preferred)} />
              </GlassSection>

              <GlassSection icon={ClockIcon} title="Timeline">
                {/* Progress stepper */}
                <div className="flex items-center justify-between mb-5 px-1">
                  {steps.map((step, i) => (
                    <React.Fragment key={step}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className={`w-3 h-3 rounded-full border-2 transition-all ${
                          i <= currentStepIndex 
                            ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                        title={step.replace('_', ' ')}
                      />
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-[2px] rounded-full mx-0.5 transition-all ${
                          i < currentStepIndex 
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-500' 
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  <Field label="Reported" value={formatDateTime(request.timeline?.reportedAt)} />
                  <Field label="Resolved" value={formatDateTime(request.timeline?.resolvedAt)} />
                </div>
              </GlassSection>
            </div>

            {/* Assignment */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-1 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </div>
                Assignment & Resolution
              </h3>
              <div className="grid grid-cols-4 gap-3 bg-white/50 dark:bg-slate-800/40 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/40 rounded-[20px] p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]">
                <Field label="Assigned To" value={request.assignment?.assignedTo?.name || request.assignment?.assignedTeam} />
                <Field label="Assigned By" value={request.assignment?.assignedBy?.name} />
                <Field label="Resolved By" value={request.resolution?.resolvedBy?.name} />
                <Field label="Outcome" value={request.resolution?.outcome?.replace('_', ' ')} />
              </div>
            </motion.div>

            {/* Responder Console */}
            {isResponder && request.status !== 'resolved' && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.06] dark:from-indigo-500/10 dark:to-violet-500/10 backdrop-blur-2xl border border-indigo-200/50 dark:border-indigo-500/20 rounded-[20px] p-5 space-y-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
                        <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                      </div>
                      Action Console
                    </h3>
                    <div className="flex gap-1.5">
                      {['in_progress', 'en_route', 'on_scene'].map(status => (
                        <motion.button
                          key={status}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStatusChange(status)}
                          disabled={actionLoading[request._id]}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border backdrop-blur-sm ${
                            request.status === status 
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)]' 
                              : 'bg-white/60 dark:bg-slate-800/60 border-indigo-200/60 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10'
                          }`}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction(request._id, 'resolve')}
                        disabled={actionLoading[request._id]}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.4)] transition-all"
                      >
                        RESOLVE
                      </motion.button>
                    </div>
                  </div>
                  <div className="relative group">
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Progress notes... (e.g. 'Arriving with 5 kits')"
                      className="w-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-indigo-100/60 dark:border-indigo-500/20 rounded-2xl px-4 py-3 text-[13px] focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 dark:focus:border-indigo-500/40 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200"
                      rows="2"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePostUpdate}
                      disabled={!note.trim() || actionLoading[request._id]}
                      className="absolute right-2.5 bottom-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-1.5 rounded-xl text-[11px] font-black disabled:opacity-20 transition-all shadow-[0_2px_8px_rgba(99,102,241,0.3)] opacity-0 group-focus-within:opacity-100"
                    >
                      {actionLoading[request._id] ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : 'POST UPDATE'}
                    </motion.button>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Activity Log */}
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-[150px]">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-1 flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                  <ClockIcon className="w-3 h-3 text-white" />
                </div>
                Activity Log
              </h3>
              <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {(request.updates || []).slice().reverse().map((update, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{
                      y: -4,
                      boxShadow: update.status === 'resolved' ? '0 15px 30px rgba(16,185,129,0.15)' : 
                                 update.status === 'in_progress' ? '0 15px 30px rgba(245,158,11,0.15)' : 
                                 update.status === 'assigned' ? '0 15px 30px rgba(59,130,246,0.15)' : 
                                 '0 15px 30px rgba(99,102,241,0.15)',
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    className={`flex flex-col p-4 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/40 rounded-2xl border-l-4 shadow-sm transition-all cursor-pointer ${
                      update.status === 'resolved' ? 'border-l-emerald-500 hover:border-emerald-300' : 
                      update.status === 'in_progress' ? 'border-l-amber-500 hover:border-amber-300' : 
                      update.status === 'assigned' ? 'border-l-blue-500 hover:border-blue-300' : 
                      'border-l-indigo-400 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{update.status?.replace('_', ' ') || 'UPDATE'}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{formatDateTime(update.updatedAt)}</span>
                    </div>
                    <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{update.note}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <UserIcon className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{update.updatedBy?.name}</span>
                    </div>
                  </motion.div>
                ))}
                {(request.updates || []).length === 0 && (
                  <div className="text-center py-10 bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-700/40">
                    <ClockIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No activity logged yet</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EmergencyRequestSidePanel
