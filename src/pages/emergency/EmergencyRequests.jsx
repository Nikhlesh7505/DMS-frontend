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