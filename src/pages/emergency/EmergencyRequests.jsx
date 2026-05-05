import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { emergencyAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  buildEmergencyRequestPayload,
  createInitialEmergencyRequestForm,
  mapEmergencyValidationErrors,
  validateEmergencyRequestForm
} from '../../utils/emergencyRequestValidation'
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
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import EmergencyRequestSidePanel from './EmergencyRequestSidePanel'

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

const REQUEST_TYPE_OPTIONS = [
  { value: 'medical_emergency', label: 'Medical emergency' },
  { value: 'rescue_request', label: 'Rescue request' },
  { value: 'food_water', label: 'Food and water' },
  { value: 'shelter', label: 'Shelter needed' },
  { value: 'evacuation', label: 'Evacuation help' },
  { value: 'fire', label: 'Fire emergency' },
  { value: 'trapped', label: 'Trapped person' },
  { value: 'injured', label: 'Injured person' },
  { value: 'missing_person', label: 'Missing person' },
  { value: 'animal_rescue', label: 'Animal rescue' },
  { value: 'supply_request', label: 'Supply request' },
  { value: 'information', label: 'Information request' },
  { value: 'other', label: 'Other' }
]

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'other', label: 'Other' }
]

const canDeleteRequest = (request, role) => (
  (['admin', 'ngo', 'rescue_team'].includes(role)) ||
  (role === 'citizen' && CITIZEN_DELETABLE_STATUSES.has(request?.status))
)



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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [requestForm, setRequestForm] = useState(() => ({
    ...createInitialEmergencyRequestForm(),
    city: user?.location?.city || '',
    state: user?.location?.state || ''
  }))

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || (user?.role === 'citizen' ? 'history' : 'all')

  const setActiveTab = (tab) => {
    setSearchParams({ tab })
  }

  useEffect(() => {
    if (user?.role !== 'citizen') return

    setRequestForm((current) => ({
      ...current,
      city: current.city || user?.location?.city || '',
      state: current.state || user?.location?.state || ''
    }))
  }, [user?.location?.city, user?.location?.state, user?.role])

  // Track whether initial data has been loaded (ref avoids re-creating the callback)
  const hasFetchedOnce = React.useRef(false)

  const loadRequests = useCallback(async (isBackground = false) => {
    // Only show the full-page spinner on the very first load
    if (!isBackground && !hasFetchedOnce.current) {
      setLoading(true)
    }
    try {
      let response
      if (user?.role === 'citizen') {
        response = await emergencyAPI.getMyRequests()
      } else if (user?.role === 'ngo' || user?.role === 'rescue_team') {
        // Fetch only requests this responder can act on:
        // 1. Requests accepted/assigned by this user
        // 2. Pending requests that are still unclaimed
        const [assigned, pending] = await Promise.all([
          emergencyAPI.getAssigned(),
          emergencyAPI.getAll({ status: 'pending' })
        ])
        const merged = [
          ...assigned.data.data.requests, 
          ...pending.data.data.requests
        ]
        // Remove duplicates by _id
        const unique = merged.filter((item, index, self) => 
          index === self.findIndex((t) => t._id === item._id)
        )
        setRequests(unique)
        hasFetchedOnce.current = true
        setLoading(false)
        return
      } else {
        const params = filter !== 'all' ? { status: filter } : {}
        response = await emergencyAPI.getAll(params)
      }
      setRequests(response.data.data.requests)
      setFeedback(null)
      hasFetchedOnce.current = true
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      // Only show error feedback if this is NOT a silent background refresh
      if (!isBackground) {
        setFeedback({
          type: 'error',
          text: error.response?.data?.message || 'Failed to fetch emergency requests.'
        })
      }
    } finally {
      setLoading(false)
    }
  }, [filter, user?.role])

  useEffect(() => {
    loadRequests(false) // initial load – shows spinner
    // Background refresh every 60 seconds (silent, no spinner)
    const intervalId = setInterval(() => loadRequests(true), 60000)
    return () => clearInterval(intervalId)
  }, [loadRequests])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-slate-500/20 text-slate-400',
      acknowledged: 'bg-indigo-500/20 text-indigo-400',
      assigned: 'bg-amber-500/20 text-amber-400',
      in_progress: 'bg-orange-500/20 text-orange-400',
      resolved: 'bg-emerald-500/20 text-emerald-400',
      cancelled: 'bg-red-500/20 text-red-400'
    }
    return colors[status] || 'bg-slate-500/20 text-slate-400'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-emerald-500/20 text-emerald-400',
      medium: 'bg-indigo-500/20 text-indigo-400',
      high: 'bg-amber-500/20 text-amber-400',
      critical: 'bg-red-500/20 text-red-400',
      life_threatening: 'bg-red-600/30 text-red-500'
    }
    return colors[priority] || 'bg-slate-500/20 text-slate-400'
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

  const updateFormField = (field, value) => {
    setRequestForm((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => {
      if (!current[field]) return current
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleCitizenSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validateEmergencyRequestForm(requestForm)
    setFormErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setFeedback({
        type: 'error',
        text: 'Please fix the highlighted form fields and submit again.'
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await emergencyAPI.create(buildEmergencyRequestPayload(requestForm))
      const createdRequest = response.data?.data?.request

      if (createdRequest) {
        setRequests((current) => [createdRequest, ...current])
      }

      setRequestForm({
        ...createInitialEmergencyRequestForm(),
        city: user?.location?.city || '',
        state: user?.location?.state || ''
      })
      setFormErrors({})
      setFeedback({
        type: 'success',
        text: response.data?.message || 'Emergency request submitted successfully.'
      })
    } catch (error) {
      const backendErrors = mapEmergencyValidationErrors(error.response?.data?.errors)
      if (Object.keys(backendErrors).length > 0) {
        setFormErrors(backendErrors)
      }
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit emergency request.'
      })
    } finally {
      setIsSubmitting(false)
    }
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
        case 'status_change':
          response = await emergencyAPI.updateStatus(requestId, payload.status, payload.note)
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
      if (error.response?.status === 409) {
        setRequests(prev => prev.filter(req => req._id !== requestId))
      }
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
              loadRequests(false)
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

      {user?.role === 'citizen' && (
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800/60 backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'form'
                ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Emergency Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-indigo-500 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            My Requests
          </button>
        </div>
      )}

      {feedback && (
        <div className={`rounded-xl border p-3 ${
          feedback.type === 'error'
            ? 'border-red-500/30 bg-red-500/20 text-red-700 dark:text-red-400'
            : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
        }`}>
          <p className="text-sm font-medium">{feedback.text}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {user?.role === 'citizen' && activeTab === 'form' && (
          <motion.div
            key="emergency-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <form onSubmit={handleCitizenSubmit} className="rounded-[32px] border border-red-500/20 bg-gradient-to-br from-red-500/10 via-white to-white p-8 shadow-2xl dark:from-red-500/10 dark:via-slate-900/60 dark:to-slate-900/60 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-500/15 p-3 text-red-600 dark:text-red-300">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Request Form</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Submit your emergency details here. Your request will be sent to responders immediately.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <ClipboardDocumentListIcon className="h-4 w-4 text-red-500" />
                Request Type
              </label>
              <select
                value={requestForm.type}
                onChange={(event) => updateFormField('type', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              >
                {REQUEST_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <UserIcon className="h-4 w-4 text-red-500" />
                People Affected
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={requestForm.peopleAffected}
                onChange={(event) => updateFormField('peopleAffected', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              {formErrors.peopleAffected && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.peopleAffected}</p>}
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                Emergency Description
              </label>
              <textarea
                rows="4"
                value={requestForm.description}
                onChange={(event) => updateFormField('description', event.target.value)}
                placeholder="Describe what happened, who needs help, and what kind of response is required..."
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white resize-none"
              />
              {formErrors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.description}</p>}
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <MapPinIcon className="h-4 w-4 text-red-500" />
                Exact Address
              </label>
              <input
                type="text"
                value={requestForm.address}
                onChange={(event) => updateFormField('address', event.target.value)}
                placeholder="House number, street, area"
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              {formErrors.address && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.address}</p>}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <MapPinIcon className="h-4 w-4 text-slate-400" />
                Landmark
              </label>
              <input
                type="text"
                value={requestForm.landmark}
                onChange={(event) => updateFormField('landmark', event.target.value)}
                placeholder="Nearby landmark"
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                Alternative Contact
              </label>
              <input
                type="text"
                value={requestForm.alternativeContact}
                onChange={(event) => updateFormField('alternativeContact', event.target.value)}
                placeholder="Optional phone number"
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              {formErrors.alternativeContact && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.alternativeContact}</p>}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                City
              </label>
              <input
                type="text"
                value={requestForm.city}
                onChange={(event) => updateFormField('city', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              {formErrors.city && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.city}</p>}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                State
              </label>
              <input
                type="text"
                value={requestForm.state}
                onChange={(event) => updateFormField('state', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
              {formErrors.state && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.state}</p>}
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                Preferred Language
              </label>
              <select
                value={requestForm.preferredLanguage}
                onChange={(event) => updateFormField('preferredLanguage', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 ml-1">
                Other Requirements
              </label>
              <textarea
                rows="3"
                value={requestForm.otherRequirements}
                onChange={(event) => updateFormField('otherRequirements', event.target.value)}
                placeholder="Food, water, medicines, mobility support, or other critical needs..."
                className="w-full rounded-2xl border border-slate-200 bg-white/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white resize-none"
              />
              {formErrors.otherRequirements && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.otherRequirements}</p>}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className={`group rounded-[24px] border transition-all duration-300 p-5 ${requestForm.hasInjuries || requestForm.needsAmbulance ? 'border-red-500/40 bg-red-500/5 shadow-lg shadow-red-500/5' : 'border-slate-200/80 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50'}`}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${requestForm.hasInjuries || requestForm.needsAmbulance ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                </div>
                Medical Support
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group/item">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={requestForm.hasInjuries}
                      onChange={(event) => updateFormField('hasInjuries', event.target.checked)}
                      className="peer h-5 w-5 rounded-md border-slate-300 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-red-500 transition-colors">Injuries involved</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group/item">
                  <input
                    type="checkbox"
                    checked={requestForm.needsAmbulance}
                    onChange={(event) => updateFormField('needsAmbulance', event.target.checked)}
                    className="h-5 w-5 rounded-md border-slate-300 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-red-500 transition-colors">Ambulance needed</span>
                </label>
              </div>
              {requestForm.hasInjuries && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    rows="3"
                    value={requestForm.injuryDetails}
                    onChange={(event) => updateFormField('injuryDetails', event.target.value)}
                    placeholder="Provide specific details about the injuries..."
                    className="w-full rounded-2xl border border-red-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white resize-none"
                  />
                  {formErrors.injuryDetails && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.injuryDetails}</p>}
                </div>
              )}
            </div>

            <div className={`group rounded-[24px] border transition-all duration-300 p-5 ${requestForm.hasMobilityIssues || requestForm.needsTranslator ? 'border-amber-500/40 bg-amber-500/5 shadow-lg shadow-amber-500/5' : 'border-slate-200/80 bg-white/50 dark:border-slate-700 dark:bg-slate-900/50'}`}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${requestForm.hasMobilityIssues || requestForm.needsTranslator ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                Accessibility & Support
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group/item">
                  <input
                    type="checkbox"
                    checked={requestForm.hasMobilityIssues}
                    onChange={(event) => updateFormField('hasMobilityIssues', event.target.checked)}
                    className="h-5 w-5 rounded-md border-slate-300 text-amber-500 focus:ring-amber-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-amber-500 transition-colors">Mobility/Accessibility help</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group/item">
                  <input
                    type="checkbox"
                    checked={requestForm.needsTranslator}
                    onChange={(event) => updateFormField('needsTranslator', event.target.checked)}
                    className="h-5 w-5 rounded-md border-slate-300 text-amber-500 focus:ring-amber-500 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-amber-500 transition-colors">Translator needed</span>
                </label>
              </div>
              {requestForm.hasMobilityIssues && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    rows="3"
                    value={requestForm.accessibilityDetails}
                    onChange={(event) => updateFormField('accessibilityDetails', event.target.value)}
                    placeholder="Describe specific accessibility needs..."
                    className="w-full rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 dark:border-slate-800 dark:bg-slate-950/80 dark:text-white resize-none"
                  />
                  {formErrors.accessibilityDetails && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{formErrors.accessibilityDetails}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use this form only for real incidents requiring response support.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-sm font-black text-white shadow-[0_12px_40px_-8px_rgba(220,38,38,0.5)] transition-all hover:bg-red-500 hover:shadow-[0_20px_50px_-8px_rgba(220,38,38,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              <ExclamationTriangleIcon className="h-5 w-5 animate-pulse" />
              {isSubmitting ? 'SUBMITTING REQUEST...' : 'SUBMIT EMERGENCY REQUEST'}
            </button>
          </div>
        </form>
      </motion.div>
    )}

    {((user?.role === 'citizen' && activeTab === 'history') || user?.role !== 'citizen') && (
      <motion.div
        key="requests-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Filters for admin */}
        {(user?.role === 'admin') && (
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'pending', 'acknowledged', 'assigned', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === status
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}

        {user?.role === 'citizen' && requests.some((request) => !canDeleteRequest(request, user?.role)) && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Only pending or cancelled requests can be deleted. Requests that are already being handled stay locked to protect the response history.
            </p>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request._id} className={`group relative backdrop-blur-xl border rounded-[32px] p-6 transition-all hover:shadow-2xl overflow-hidden ${request.status === 'resolved' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-700' : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 p-4 bg-indigo-500/10 dark:bg-slate-800 rounded-2xl border border-indigo-500/20 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                    <ClipboardDocumentListIcon className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                        {request.type.replace(/_/g, ' ')}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 max-w-2xl">
                      {request.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 pt-2 text-slate-500 dark:text-slate-500 text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        {request.location?.city || 'Location N/A'}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(request.timeline?.reportedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize tracking-wide ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* ── Resolved Completion Banner (for NGO/rescue_team) ── */}
              {request.status === 'resolved' && (user?.role === 'ngo' || user?.role === 'rescue_team' || user?.role === 'admin') && (
                <div className="mt-4 flex items-center gap-4 px-5 py-4 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-200/60 dark:border-emerald-700/30 rounded-2xl">
                  <div className="flex-shrink-0 p-2.5 bg-emerald-500 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.35)]">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Request Completed</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-emerald-600/80 dark:text-emerald-500/80 font-medium">
                      {request.resolution?.outcome && (
                        <span className="capitalize">Outcome: <strong>{request.resolution.outcome.replace('_', ' ')}</strong></span>
                      )}
                      {request.timeline?.resolvedAt && (
                        <span>Resolved: <strong>{new Date(request.timeline.resolvedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
                      )}
                      {request.resolution?.resolvedBy?.name && (
                        <span>By: <strong>{request.resolution.resolvedBy.name}</strong></span>
                      )}
                    </div>
                    {request.resolution?.notes && (
                      <p className="mt-1.5 text-xs text-emerald-600/70 dark:text-emerald-500/60 line-clamp-1">{request.resolution.notes}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className={`${request.status === 'resolved' ? 'mt-4 pt-4' : 'mt-8 pt-6'} border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-end gap-4`}>
                {canDeleteRequest(request, user?.role) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(request)}
                    disabled={deletingRequestIds.includes(request._id) || actionLoading[request._id]}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-50"
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
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-5 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-500/20"
                      >
                        Accept
                      </button>
                    )}
                    {(request.status === 'acknowledged' || (request.status === 'pending' && !request.assignment?.assignedTo)) && (
                      <button
                        type="button"
                        onClick={() => handleAction(request._id, 'assign_to_me')}
                        disabled={actionLoading[request._id]}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-5 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-500/20"
                      >
                        Pick Up
                      </button>
                    )}
                    {(request.status === 'assigned' || request.status === 'in_progress') && (
                      <button
                        type="button"
                        onClick={() => handleAction(request._id, 'resolve')}
                        disabled={actionLoading[request._id]}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/20"
                      >
                        Resolve
                      </button>
                    )}
                  </>
                )}

                {/* Assignment info for responders */}
                {(user?.role === 'ngo' || user?.role === 'rescue_team') && request.assignment?.assignedTo && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned:</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{request.assignment.assignedTo.name}</span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => handleViewRequest(request)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-200 dark:border-slate-700"
                >
                  <EyeIcon className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[32px] border border-dashed border-slate-300 dark:border-slate-800">
            <ClipboardDocumentListIcon className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-500">No emergency requests found</p>
            {user?.role === 'citizen' && (
              <button onClick={() => setActiveTab('form')} className="mt-4 text-indigo-500 font-bold hover:underline">
                Submit your first request
              </button>
            )}
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>

      <EmergencyRequestSidePanel
        isOpen={isViewOpen}
        request={selectedRequest}
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
