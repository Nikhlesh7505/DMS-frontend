import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellAlertIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  HomeModernIcon,
  PlusCircleIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { dashboardAPI, emergencyAPI } from '../../services/api'
import {
  buildEmergencyRequestPayload,
  createInitialEmergencyRequestForm,
  mapEmergencyValidationErrors,
  validateEmergencyRequestForm
} from '../../utils/emergencyRequestValidation'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const getFieldInputClassName = (hasError) => (
  hasError
    ? 'form-input border-red-400 focus:border-red-500 focus:ring-red-500/20'
    : 'form-input'
)

const CitizenDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestFieldErrors, setRequestFieldErrors] = useState({})
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestForm, setRequestForm] = useState(createInitialEmergencyRequestForm)

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getCitizen()
      setData(response.data.data)
      setError('')
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()

    const intervalId = window.setInterval(fetchDashboardData, 60000)
    const handleFocus = () => fetchDashboardData()

    window.addEventListener('focus', handleFocus)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchDashboardData])

  const clearRequestFieldErrors = useCallback((fields) => {
    if (!fields?.length) {
      setRequestFieldErrors({})
      return
    }

    setRequestFieldErrors((currentErrors) => {
      let changed = false
      const nextErrors = { ...currentErrors }

      fields.forEach((field) => {
        if (nextErrors[field]) {
          delete nextErrors[field]
          changed = true
        }
      })

      return changed ? nextErrors : currentErrors
    })
  }, [])

  const updateRequestForm = useCallback((updates, fieldsToClear = []) => {
    setRequestForm((currentForm) => ({ ...currentForm, ...updates }))
    if (requestError) {
      setRequestError('')
    }
    clearRequestFieldErrors(fieldsToClear)
  }, [clearRequestFieldErrors, requestError])

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setRequestError('')
    const validationErrors = validateEmergencyRequestForm(requestForm)

    if (Object.keys(validationErrors).length > 0) {
      setRequestFieldErrors(validationErrors)
      setRequestError('Please review the highlighted fields before submitting your request.')
      return
    }

    setRequestFieldErrors({})
    setIsSubmittingRequest(true)
    const payload = buildEmergencyRequestPayload(requestForm)

    try {
      await emergencyAPI.create(payload)
      setShowRequestForm(false)
      setRequestForm(createInitialEmergencyRequestForm())
      setRequestFieldErrors({})
      await fetchDashboardData()
    } catch (err) {
      const backendErrors = err.response?.data?.errors || []
      const mappedErrors = mapEmergencyValidationErrors(backendErrors)

      if (Object.keys(mappedErrors).length > 0) {
        setRequestFieldErrors(mappedErrors)
      }

      const validationMessage = backendErrors?.[0]?.message
      setRequestError(
        validationMessage ||
        err.response?.data?.message ||
        'Failed to submit emergency request'
      )
      console.error('Failed to create request:', err)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4 backdrop-blur-md">
        <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
      </motion.div>
    )
  }

  const { requests, alerts, disasters, weather, riskStatus, notifications, nearbyShelters } = data || {}

  const overallRisk = riskStatus?.overallRisk || 'SAFE'
  const riskColor = {
    'SAFE': 'bg-green-500/80 shadow-green-500/30 text-white',
    'WATCH': 'bg-amber-500/80 shadow-amber-500/30 text-white',
    'WARNING': 'bg-orange-500/80 shadow-orange-500/30 text-white',
    'DANGER': 'bg-red-500/80 shadow-red-500/30 text-white'
  }[overallRisk] || 'bg-green-500/80 shadow-green-500/30 text-white'

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Dashboard</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Stay informed and request help when needed
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowRequestForm((currentValue) => !currentValue)
            setRequestError('')
            setRequestFieldErrors({})
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Emergency Request
        </motion.button>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className={`rounded-2xl p-4 shadow-lg backdrop-blur-xl border border-white/20 ${riskColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
              <BellAlertIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="font-extrabold text-lg tracking-wide">Current Risk Level: {overallRisk}</p>
              <p className="text-sm font-medium opacity-90 mt-0.5">
                {overallRisk === 'SAFE' 
                  ? 'No immediate threats detected in your area.' :
                  overallRisk === 'WATCH'
                  ? 'Monitor local conditions and stay alert.' :
                  overallRisk === 'WARNING'
                  ? 'Be prepared to take action if necessary.' :
                  'Take immediate precautions and follow official instructions.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showRequestForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Emergency Request</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmitRequest} className="space-y-4" noValidate>
                {requestError && (
                  <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-3 backdrop-blur-sm">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{requestError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Request Type</label>
                    <select
                      className="form-input cursor-pointer"
                      value={requestForm.type}
                      onChange={(e) => updateRequestForm({ type: e.target.value })}
                    >
                      <option value="medical_emergency">Medical Emergency</option>
                      <option value="rescue_request">Rescue Request</option>
                      <option value="food_water">Food & Water</option>
                      <option value="shelter">Shelter</option>
                      <option value="evacuation">Evacuation</option>
                      <option value="fire">Fire</option>
                      <option value="trapped">Trapped</option>
                      <option value="injured">Injured</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">People Affected</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className={getFieldInputClassName(Boolean(requestFieldErrors.peopleAffected))}
                      value={requestForm.peopleAffected}
                      onChange={(e) => updateRequestForm({ peopleAffected: e.target.value }, ['peopleAffected'])}
                    />
                    {requestFieldErrors.peopleAffected && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.peopleAffected}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className={getFieldInputClassName(Boolean(requestFieldErrors.description))}
                    rows="3"
                    placeholder="Describe your emergency situation..."
                    maxLength={1000}
                    value={requestForm.description}
                    onChange={(e) => updateRequestForm({ description: e.target.value }, ['description'])}
                    required
                  />
                  <div className="mt-1 flex items-center justify-between gap-3">
                    {requestFieldErrors.description ? (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.description}</p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Include what happened, immediate risks, and what help is needed.</p>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {requestForm.description.trim().length}/1000
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className={getFieldInputClassName(Boolean(requestFieldErrors.address))}
                      placeholder="Your current address"
                      maxLength={200}
                      value={requestForm.address}
                      onChange={(e) => updateRequestForm({ address: e.target.value }, ['address'])}
                      required
                    />
                    {requestFieldErrors.address && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Landmark</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nearby landmark"
                      maxLength={120}
                      value={requestForm.landmark}
                      onChange={(e) => updateRequestForm({ landmark: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className={getFieldInputClassName(Boolean(requestFieldErrors.city))}
                      placeholder="City name"
                      maxLength={100}
                      value={requestForm.city}
                      onChange={(e) => updateRequestForm({ city: e.target.value }, ['city'])}
                      required
                    />
                    {requestFieldErrors.city && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className={getFieldInputClassName(Boolean(requestFieldErrors.state))}
                      placeholder="State name"
                      maxLength={100}
                      value={requestForm.state}
                      onChange={(e) => updateRequestForm({ state: e.target.value }, ['state'])}
                      required
                    />
                    {requestFieldErrors.state && (
                      <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/20 dark:border-white/10 pt-4 mt-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Contact & Support Details</h4>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Alternative Contact</label>
                      <input
                        type="tel"
                        className={getFieldInputClassName(Boolean(requestFieldErrors.alternativeContact))}
                        placeholder="Backup phone or contact person"
                        value={requestForm.alternativeContact}
                        onChange={(e) => updateRequestForm({ alternativeContact: e.target.value }, ['alternativeContact'])}
                      />
                      {requestFieldErrors.alternativeContact && (
                        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.alternativeContact}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Preferred Language</label>
                      <select
                        className={`${getFieldInputClassName(Boolean(requestFieldErrors.preferredLanguage))} cursor-pointer`}
                        value={requestForm.preferredLanguage}
                        onChange={(e) => updateRequestForm({ preferredLanguage: e.target.value }, ['preferredLanguage'])}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="ta">Tamil</option>
                        <option value="te">Telugu</option>
                        <option value="mr">Marathi</option>
                        <option value="other">Other</option>
                      </select>
                      {requestFieldErrors.preferredLanguage && (
                        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.preferredLanguage}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-black/20 p-3 cursor-pointer hover:bg-white/40 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded bg-white/50 border-white/40 focus:ring-blue-500"
                        checked={requestForm.hasInjuries}
                        onChange={(e) => updateRequestForm({
                          hasInjuries: e.target.checked,
                          injuryDetails: e.target.checked ? requestForm.injuryDetails : ''
                        }, ['injuryDetails'])}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Injuries reported</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-black/20 p-3 cursor-pointer hover:bg-white/40 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded bg-white/50 border-white/40 focus:ring-blue-500"
                        checked={requestForm.needsAmbulance}
                        onChange={(e) => updateRequestForm({ needsAmbulance: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ambulance needed</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-black/20 p-3 cursor-pointer hover:bg-white/40 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded bg-white/50 border-white/40 focus:ring-blue-500"
                        checked={requestForm.hasMobilityIssues}
                        onChange={(e) => updateRequestForm({
                          hasMobilityIssues: e.target.checked,
                          accessibilityDetails: e.target.checked ? requestForm.accessibilityDetails : ''
                        }, ['accessibilityDetails'])}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobility support needed</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-black/20 p-3 cursor-pointer hover:bg-white/40 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded bg-white/50 border-white/40 focus:ring-blue-500"
                        checked={requestForm.needsTranslator}
                        onChange={(e) => updateRequestForm({ needsTranslator: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Translator needed</span>
                    </label>
                  </div>

                  <AnimatePresence>
                    {(requestForm.hasInjuries || requestForm.hasMobilityIssues) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                      >
                        {requestForm.hasInjuries && (
                          <div>
                            <label className="form-label">Injury Details</label>
                            <textarea
                              className={getFieldInputClassName(Boolean(requestFieldErrors.injuryDetails))}
                              rows="3"
                              placeholder="Describe injuries or medical condition"
                              maxLength={500}
                              value={requestForm.injuryDetails}
                              onChange={(e) => updateRequestForm({ injuryDetails: e.target.value }, ['injuryDetails'])}
                              required={requestForm.hasInjuries}
                            />
                            {requestFieldErrors.injuryDetails && (
                              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.injuryDetails}</p>
                            )}
                          </div>
                        )}
                        {requestForm.hasMobilityIssues && (
                          <div>
                            <label className="form-label">Accessibility Details</label>
                            <textarea
                              className={getFieldInputClassName(Boolean(requestFieldErrors.accessibilityDetails))}
                              rows="3"
                              placeholder="Describe mobility or accessibility needs"
                              maxLength={500}
                              value={requestForm.accessibilityDetails}
                              onChange={(e) => updateRequestForm({ accessibilityDetails: e.target.value }, ['accessibilityDetails'])}
                              required={requestForm.hasMobilityIssues}
                            />
                            {requestFieldErrors.accessibilityDetails && (
                              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.accessibilityDetails}</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-4">
                    <label className="form-label">Other Requirements</label>
                    <textarea
                      className={getFieldInputClassName(Boolean(requestFieldErrors.otherRequirements))}
                      rows="3"
                      placeholder="Any other important information for responders"
                      maxLength={500}
                      value={requestForm.otherRequirements}
                      onChange={(e) => updateRequestForm({ otherRequirements: e.target.value }, ['otherRequirements'])}
                    />
                    <div className="mt-1 flex items-center justify-between gap-3">
                      {requestFieldErrors.otherRequirements ? (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">{requestFieldErrors.otherRequirements}</p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {requestForm.otherRequirements.trim().length}/500
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/20 dark:border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      setShowRequestForm(false)
                      setRequestError('')
                      setRequestFieldErrors({})
                      setRequestForm(createInitialEmergencyRequestForm())
                    }}
                    className="btn btn-secondary"
                    disabled={isSubmittingRequest}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className="btn btn-danger" 
                    disabled={isSubmittingRequest}
                  >
                    {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Emergency Requests</h3>
            <Link to="/dashboard/emergency" className="text-sm font-bold text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {requests?.slice(0, 5).map((request) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  key={request._id} 
                  className="flex items-start justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl backdrop-blur-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{request.type}</p>
                      <span className={`badge ${
                        request.status === 'pending' ? 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30' :
                        request.status === 'assigned' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30' :
                        request.status === 'in_progress' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30' :
                        request.status === 'resolved' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30' :
                        'bg-slate-500/20 text-slate-700 border-slate-500/30'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{request.description?.substring(0, 100)}...</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center">
                        <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                        {request.location?.city}
                      </span>
                      <span className="flex items-center">
                        <ClipboardDocumentListIcon className="h-3.5 w-3.5 mr-1" />
                        {new Date(request.timeline?.reportedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(!requests || requests.length === 0) && (
                <div className="text-center py-8">
                  <div className="bg-white/30 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No emergency requests yet</p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-bold tracking-wide"
                  >
                    CREATE YOUR FIRST REQUEST
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {weather && (
            <motion.div variants={itemVariants} className="card bg-gradient-to-br from-blue-400/20 to-blue-600/20 border-white/40">
              <div className="card-header border-white/20 bg-transparent">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CloudIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Current Weather
                </h3>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <p className="text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">
                    {Math.round(weather.data?.temperature?.current)}°C
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize mt-2">
                    {weather.data?.condition?.description}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm font-semibold bg-white/30 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-md">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Humidity</p>
                      <p className="text-slate-900 dark:text-white">{weather.data?.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Wind</p>
                      <p className="text-slate-900 dark:text-white">{weather.data?.wind?.speed} m/s</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-amber-500" />
                Alerts
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {alerts?.slice(0, 3).map((alert) => (
                  <div key={alert._id} className={`p-3 rounded-xl border-l-4 backdrop-blur-sm ${
                    alert.severity === 'danger' ? 'bg-red-500/10 border-red-500' :
                    alert.severity === 'warning' ? 'bg-warning-500/10 border-warning-500' :
                    'bg-blue-500/10 border-blue-500'
                  }`}>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(alert.timeline?.issuedAt).toLocaleDateString()}
                    </p>
                    <Link
                      to={alert.disaster?._id ? `/dashboard/disasters/${alert.disaster._id}` : `/dashboard/alerts/${alert._id}`}
                      className="inline-block mt-2 text-xs font-bold text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  </div>
                ))}
                {(!alerts || alerts.length === 0) && (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-2">No active alerts</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-500" />
                Notification History
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {notifications?.slice(0, 4).map((notification) => (
                  <div
                    key={notification._id}
                    className={`rounded-xl border px-3 py-3 backdrop-blur-md ${
                      notification.read ? 'border-white/40 bg-white/30 dark:bg-white/5' : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">{notification.message}</p>
                  </div>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-2">No notifications</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HomeModernIcon className="h-5 w-5 text-emerald-500" />
                Nearby Shelters
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {nearbyShelters?.slice(0, 4).map((shelter) => (
                  <div key={shelter._id} className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-white/5 p-3 backdrop-blur-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{shelter.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {[shelter.address?.line1, shelter.address?.city, shelter.address?.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Available beds</span>
                      <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {shelter.capacity?.available ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
                {(!nearbyShelters || nearbyShelters.length === 0) && (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-2">No nearby shelters</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-rose-500" />
                Emergency Contacts
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-3 text-sm font-bold">
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                  <span className="text-slate-600 dark:text-slate-300">National Emergency</span>
                  <a href="tel:112" className="text-rose-600 dark:text-rose-400">112</a>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                  <span className="text-slate-600 dark:text-slate-300">Ambulance</span>
                  <a href="tel:108" className="text-rose-600 dark:text-rose-400">108</a>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                  <span className="text-slate-600 dark:text-slate-300">Fire Service</span>
                  <a href="tel:101" className="text-rose-600 dark:text-rose-400">101</a>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                  <span className="text-slate-600 dark:text-slate-300">Police</span>
                  <a href="tel:100" className="text-rose-600 dark:text-rose-400">100</a>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                  <span className="text-slate-600 dark:text-slate-300">Disaster Helpline</span>
                  <a href="tel:1078" className="text-rose-600 dark:text-rose-400">1078</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {disasters && disasters.length > 0 && (
          <motion.div variants={itemVariants} className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Disasters in Your Area</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disasters.slice(0, 3).map((disaster) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={disaster._id} 
                    className="p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm"
                  >
                    <Link to={`/dashboard/disasters/${disaster._id}`} className="block">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500/20 p-2 rounded-xl">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">{disaster.name}</p>
                          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize mb-2">{disaster.type}</p>
                          <span className={`badge ${
                            disaster.severity === 'catastrophic' || disaster.severity === 'severe'
                              ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
                            disaster.severity === 'high' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' :
                            'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          }`}>
                            {disaster.severity}
                          </span>
                          <div className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-500">
                            View disaster details
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CitizenDashboard
