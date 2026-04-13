import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { emergencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const formatLabel = (value) => {
  if (!value) return 'Not available'

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}



const formatDateTime = (value) => {
  if (!value) return 'Not available'
  return new Date(value).toLocaleString()
}

const formatLanguage = (value) => {
  const labels = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
    other: 'Other'
  }

  return labels[value] || value || 'Not available'
}

const CITIZEN_DELETABLE_STATUSES = new Set(['pending', 'cancelled'])

const canDeleteRequest = (request, role) => (
  (['admin', 'ngo', 'rescue_team'].includes(role)) ||
  (role === 'citizen' && CITIZEN_DELETABLE_STATUSES.has(request?.status))
)

const RequestDetailItem = ({ label, value }) => (
  <div className="rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 p-3 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value || 'Not available'}</p>
  </div>
)

const RequestDetailsModal = ({ isOpen, request, loading, error, onClose, userRole, getPriorityColor, getStatusColor, onAction, actionLoading }) => {
  const navigate = useNavigate()

  // ✅ All hooks must be declared before any early returns
  const [note, setNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  if (!isOpen) return null

  const timelineItems = [
    { label: 'Reported', value: request?.timeline?.reportedAt },
    { label: 'Acknowledged', value: request?.timeline?.acknowledgedAt },
    { label: 'Assigned', value: request?.timeline?.assignedAt },
    { label: 'In Progress', value: request?.timeline?.startedAt },
    { label: 'Resolved', value: request?.timeline?.resolvedAt },
    { label: 'Last Updated', value: request?.timeline?.lastUpdatedAt }
  ]

  const requestorName = request?.citizen?.name || request?.citizenInfo?.name
  const requestorPhone = request?.citizen?.phone || request?.citizenInfo?.phone
  const requestorEmail = request?.citizen?.email || request?.citizenInfo?.email
  const alternativeContact = request?.citizenInfo?.alternativeContact
  const specialRequirements = request?.specialRequirements

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSubmittingNote(true)
    try {
      await emergencyAPI.updateStatus(request._id, request.status, note)
      setNote('')
      if (onAction) onAction(request._id, 'refresh')
    } catch (err) {
      console.error('Failed to add note:', err)
    } finally {
      setSubmittingNote(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    const statusNote = window.prompt(`Enter a note for the status change to "${formatLabel(newStatus)}":`)
    if (statusNote === null) return
    try {
      await emergencyAPI.updateStatus(request._id, newStatus, statusNote)
      if (onAction) onAction(request._id, 'refresh')
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[24px] bg-white/70 dark:bg-white/5 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-start justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-white/5 backdrop-blur-md px-6 py-5">
            <div>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {request?.requestId || 'Emergency Request Details'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatLabel(request?.type)}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                Full request information and response tracking
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </motion.button>
          </div>

          <div className="relative z-10 max-h-[calc(90vh-100px)] overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 backdrop-blur-md">
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{error}</p>
              </div>
            ) : request ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`badge ${getStatusColor(request.status)}`}>
                      {formatLabel(request.status)}
                    </span>
                    <span className={`badge ${getPriorityColor(request.priority)}`}>
                      {formatLabel(request.priority)}
                    </span>
                    <span className="badge bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30">
                      {request.peopleAffected || 1} {request.peopleAffected === 1 ? 'person affected' : 'people affected'}
                    </span>
                  </div>
                </div>

                {/* Actions Bar moved to top level of card list */}
                {(userRole === 'ngo' || userRole === 'rescue_team') && (request.status === 'pending' || request.status === 'acknowledged') && (
                  <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-4 flex flex-wrap items-center justify-center gap-4">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Pending Action Required:</p>
                    {request.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onAction(request._id, 'acknowledge')}
                        disabled={actionLoading[request._id]}
                        className="btn btn-primary btn-sm"
                      >
                        Acknowledge Request
                      </button>
                    )}
                    {(request.status === 'acknowledged' || (request.status === 'pending' && !request.assignment?.assignedTo)) && (
                      <button
                        type="button"
                        onClick={() => onAction(request._id, 'assign_to_me')}
                        disabled={actionLoading[request._id]}
                        className="btn btn-warning btn-sm"
                      >
                        Assign To Me (Pick Up)
                      </button>
                    )}
                  </div>
                )}

                <div className="rounded-[20px] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm p-6 shadow-inner">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Description</h3>
                  <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                    {request.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-[20px] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location</h3>
                      <button
                        onClick={() => {
                          const coords = request.location?.coordinates || { latitude: 20.5937, longitude: 78.9629 }
                          navigate('/dashboard/tasks', { 
                            state: { 
                              focusLocation: coords,
                              focusTitle: `Emergency: ${formatLabel(request.type)}`,
                              focusType: 'alert'
                            } 
                          })
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MapPinIcon className="h-3.5 w-3.5" />
                        View Map
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <RequestDetailItem label="Address" value={request.location?.address} />
                      <RequestDetailItem label="City" value={request.location?.city} />
                      <RequestDetailItem label="State" value={request.location?.state} />
                      <RequestDetailItem label="Landmark" value={request.location?.landmark} />
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-sm p-6 shadow-inner">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Timeline</h3>
                    <div className="mt-4 space-y-3">
                      {timelineItems.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                            <ClockIcon className="h-4 w-4" />
                            {item.label}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white text-right">{formatDateTime(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {userRole === 'citizen' ? 'Your Contact Details' : 'Requester Details'}
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3 rounded-lg bg-white/30 dark:bg-black/10 px-4 py-3">
                      <UserIcon className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</p>
                        <p className="text-sm text-slate-900 dark:text-white">{requestorName || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-white/30 dark:bg-black/10 px-4 py-3">
                      <PhoneIcon className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</p>
                        <p className="text-sm text-slate-900 dark:text-white">{requestorPhone || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-white/30 dark:bg-black/10 px-4 py-3">
                      <EnvelopeIcon className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm text-slate-900 dark:text-white">{requestorEmail || 'Not available'}</p>
                      </div>
                    </div>
                    {alternativeContact && (
                      <div className="flex items-start gap-3 rounded-lg bg-white/30 dark:bg-black/10 px-4 py-3">
                        <PhoneIcon className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Alternative Contact</p>
                          <p className="text-sm text-slate-900 dark:text-white">{alternativeContact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Special Requirements</h3>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <RequestDetailItem
                      label="Injuries Reported"
                      value={specialRequirements?.medical?.hasInjuries ? 'Yes' : 'No'}
                    />
                    <RequestDetailItem
                      label="Ambulance Needed"
                      value={specialRequirements?.medical?.needsAmbulance ? 'Yes' : 'No'}
                    />
                    <RequestDetailItem
                      label="Mobility Support"
                      value={specialRequirements?.accessibility?.hasMobilityIssues ? 'Yes' : 'No'}
                    />
                    <RequestDetailItem
                      label="Translator Needed"
                      value={specialRequirements?.language?.needsTranslator ? 'Yes' : 'No'}
                    />
                    <RequestDetailItem
                      label="Preferred Language"
                      value={formatLanguage(specialRequirements?.language?.preferred)}
                    />
                    {specialRequirements?.medical?.injuryDetails && (
                      <RequestDetailItem
                        label="Injury Details"
                        value={specialRequirements?.medical?.injuryDetails}
                      />
                    )}
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Assignment & Resolution</h3>
                      {(userRole === 'ngo' || userRole === 'rescue_team') && request.status !== 'resolved' && (
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter bg-indigo-500/10 px-2 py-0.5 rounded">Responder View</span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Assigned To</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.assignment?.assignedTo?.name || request.assignment?.assignedTeam || 'Not available'}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Assigned By</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.assignment?.assignedBy?.name || 'Not available'}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Resolved By</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.resolution?.resolvedBy?.name || 'Not available'}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Outcome</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatLabel(request.resolution?.outcome)}</span>
                      </div>
                    </div>

                    {/* Enhanced Responder Controls inside the Assignment Card */}
                    {(userRole === 'ngo' || userRole === 'rescue_team') && request.status !== 'resolved' && request.status !== 'cancelled' && (
                      <div className="mt-6 space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Detailed Response Status</label>
                          <div className="flex flex-wrap gap-1.5">
                            {['in_progress', 'en_route', 'on_scene'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  request.status === status 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {formatLabel(status)}
                              </button>
                            ))}
                            <button
                              onClick={() => onAction(request._id, 'resolve')}
                              disabled={actionLoading[request._id]}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">Progress Update / Activity Note</label>
                          <form onSubmit={handleAddNote} className="flex flex-col gap-2">
                            <textarea 
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Type activity log or situational update..."
                              rows="2"
                              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                            <button 
                              type="submit"
                              disabled={submittingNote || !note.trim()}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                              {submittingNote ? 'Saving...' : 'Post Progress Update'}
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 p-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Updates</h3>
                    {request.updates?.length > 0 ? (
                      <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {request.updates.slice().reverse().map((update, index) => (
                          <div key={`${update.updatedAt || index}-${index}`} className="rounded-lg bg-white/30 dark:bg-black/10 p-4 border border-white/40 dark:border-white/5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                {formatLabel(update.status || 'update')}
                              </p>
                              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{formatDateTime(update.updatedAt)}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{update.note || 'No note added.'}</p>
                            {update.updatedBy?.name && (
                              <p className="mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                Added by {update.updatedBy.name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No updates have been added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  )
}

const EmergencyRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [deletingRequestIds, setDeletingRequestIds] = useState([])
  const [actionLoading, setActionLoading] = useState({})

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      let response
      if (user?.role === 'citizen') {
        response = await emergencyAPI.getMyRequests()
      } else if (user?.role === 'ngo' || user?.role === 'rescue_team') {
        const [assigned, pending] = await Promise.all([
          emergencyAPI.getAssigned(),
          emergencyAPI.getAll({ status: 'pending' })
        ])
        const merged = [...assigned.data.data.requests, ...pending.data.data.requests]
        // Remove duplicates if any
        const unique = merged.filter((item, index, self) => 
          index === self.findIndex((t) => t._id === item._id)
        )
        setRequests(unique)
        setLoading(false)
        return
      } else {
        const params = filter !== 'all' ? { status: filter } : {}
        response = await emergencyAPI.getAll(params)
      }
      setRequests(response.data.data.requests)
      setFeedback(null)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch emergency requests.'
      })
    } finally {
      setLoading(false)
    }
  }, [filter, user?.role])

  useEffect(() => {
    loadRequests()
    // Periodic refresh every 30 seconds
    const intervalId = setInterval(loadRequests, 30000)
    return () => clearInterval(intervalId)
  }, [loadRequests])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100',
      acknowledged: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      assigned: 'bg-warning-100 text-warning-800',
      in_progress: 'bg-orange-100 text-orange-800',
      resolved: 'bg-success-100 text-success-800',
      cancelled: 'bg-white/40 dark:bg-black/20 text-slate-500 dark:text-slate-400'
    }
    return colors[status] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-success-100 text-success-800',
      medium: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      high: 'bg-warning-100 text-warning-800',
      critical: 'bg-danger-100 text-danger-800',
      life_threatening: 'bg-danger-200 text-danger-900'
    }
    return colors[priority] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  const handleViewRequest = async (request) => {
    setIsViewOpen(true)
    setSelectedRequest(request)
    setDetailsError('')
    setDetailsLoading(true)

    try {
      const response = await emergencyAPI.getById(request._id)
      setSelectedRequest(response.data.data.request)
    } catch (error) {
      setDetailsError(error.response?.data?.message || 'Failed to load request details')
      console.error('Failed to fetch request details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeDetailsModal = () => {
    setIsViewOpen(false)
    setSelectedRequest(null)
    setDetailsError('')
  }

  const handleDeleteRequest = async (request) => {
    if (!canDeleteRequest(request, user?.role)) {
      return
    }

    const confirmed = window.confirm(
      `Delete request "${formatLabel(request.type)}"? This action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    setDeletingRequestIds((currentIds) => [...currentIds, request._id])
    setFeedback(null)

    try {
      const response = await emergencyAPI.deleteMine(request._id)

      if (selectedRequest?._id === request._id) {
        closeDetailsModal()
      }

      setRequests((currentRequests) => currentRequests.filter((item) => item._id !== request._id))
      setFeedback({
        type: 'success',
        text: response.data?.message || 'Emergency request deleted successfully.'
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete emergency request.'
      })
      console.error('Failed to delete request:', error)
    } finally {
      setDeletingRequestIds((currentIds) => currentIds.filter((id) => id !== request._id))
    }
  }

  const handleAction = async (requestId, action, payload = {}) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }))
    setFeedback(null)
    try {
      let response
      switch (action) {
        case 'acknowledge':
          response = await emergencyAPI.acknowledge(requestId)
          break
        case 'assign_to_me':
          response = await emergencyAPI.assign(requestId, { userId: user.id })
          break
        case 'resolve':
          const outcome = window.prompt('Enter resolution outcome (successful, partial, false_alarm, unattainable):', 'successful')
          if (!outcome) return
          const notes = window.prompt('Enter resolution notes:')
          response = await emergencyAPI.resolve(requestId, { outcome, notes })
          break
        case 'refresh':
          response = await emergencyAPI.getById(requestId)
          break
        default:
          throw new Error('Invalid action')
      }

      setFeedback({
        type: 'success',
        text: response.data?.message || 'Action completed successfully.'
      })
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId ? response.data.data.request : req
      ))
      
      if (selectedRequest?._id === requestId) {
        setSelectedRequest(response.data.data.request)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to perform ${action}.`
      setFeedback({
        type: 'error',
        text: errorMsg
      })
      // Auto-refresh on status mismatch error
      if (errorMsg.toLowerCase().includes('status')) {
        handleAction(requestId, 'refresh')
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user?.role === 'citizen' ? 'My Emergency Requests' : 'Emergency Requests'}
          </h1>
          <button 
            onClick={() => {
              setLoading(true)
              loadRequests()
            }}
            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-all active:rotate-180 duration-500"
            title="Refresh List"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {user?.role === 'citizen' 
            ? 'Track your emergency requests' 
            : 'Manage and respond to emergency requests'}
        </p>
      </div>

      {feedback && (
        <div className={`rounded-xl border p-3 ${
          feedback.type === 'error'
            ? 'border-red-500/30 bg-red-500/20 text-red-700 dark:text-red-400'
            : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
        }`}>
          <p className="text-sm font-medium">{feedback.text}</p>
        </div>
      )}

      {/* Filters for admin */}
      {(user?.role === 'admin') && (
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'acknowledged', 'assigned', 'in_progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {user?.role === 'citizen' && requests.some((request) => !canDeleteRequest(request, user?.role)) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Only pending or cancelled requests can be deleted. Requests that are already being handled stay locked to protect the response history.
          </p>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="card hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/40 dark:bg-black/20 rounded-lg">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white capitalize">{request.type}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{request.description?.substring(0, 150)}...</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {request.location?.city}
                      </span>
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(request.timeline?.reportedAt).toLocaleString()}
                      </span>
                      {request.peopleAffected > 1 && (
                        <span className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {request.peopleAffected} people
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
                {canDeleteRequest(request, user?.role) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(request)}
                    disabled={deletingRequestIds.includes(request._id) || actionLoading[request._id]}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TrashIcon className={`h-4 w-4 ${deletingRequestIds.includes(request._id) ? 'animate-pulse' : ''}`} />
                    {deletingRequestIds.includes(request._id) ? 'Deleting...' : 'Delete'}
                  </button>
                )}

                {(user?.role === 'ngo' || user?.role === 'rescue_team') && (
                  <>
                    {request.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleAction(request._id, 'acknowledge')}
                        disabled={actionLoading[request._id]}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-500/20"
                      >
                        Acknowledge
                      </button>
                    )}
                    {(request.status === 'acknowledged' || (request.status === 'pending' && !request.assignment?.assignedTo)) && (
                      <button
                        type="button"
                        onClick={() => handleAction(request._id, 'assign_to_me')}
                        disabled={actionLoading[request._id]}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 transition hover:bg-amber-500/20"
                      >
                        Pick Up
                      </button>
                    )}
                    {(request.status === 'assigned' || request.status === 'in_progress') && (
                      <button
                        type="button"
                        onClick={() => handleAction(request._id, 'resolve')}
                        disabled={actionLoading[request._id]}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 transition hover:bg-green-500/20"
                      >
                        Resolve
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleViewRequest(request)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-500/20"
                >
                  <EyeIcon className="h-4 w-4" />
                  View Details
                </button>
              </div>

              {/* Assignment info for responders */}
              {(user?.role === 'ngo' || user?.role === 'rescue_team') && request.assignment?.assignedTo && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Assigned to:</span> {request.assignment.assignedTo.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No emergency requests found</p>
        </div>
      )}

      <RequestDetailsModal
        isOpen={isViewOpen}
        request={selectedRequest}
        loading={detailsLoading}
        error={detailsError}
        onClose={closeDetailsModal}
        userRole={user?.role}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        onAction={handleAction}
        actionLoading={actionLoading}
      />
    </div>
  )
}

export default EmergencyRequests