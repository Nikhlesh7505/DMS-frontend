import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  BellAlertIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  HomeModernIcon,
  PlusCircleIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import { dashboardAPI, emergencyAPI } from '../../services/api'
import { useGeolocation } from '../../hooks/useGeolocation'
import { emergencyRequestSchema } from '../../utils/validationSchemas'
import FormField from '../../components/common/FormField'

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

const CitizenDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [isLocationCaptured, setIsLocationCaptured] = useState(false)

  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation()

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: {
      type: 'medical_emergency',
      peopleAffected: 1,
      citizenInfo: { alternativeContact: '' },
      location: {
        address: '',
        city: '',
        state: '',
        landmark: '',
        coordinates: { latitude: null, longitude: null }
      },
      specialRequirements: {
        medical: { hasInjuries: false, injuryDetails: '', needsAmbulance: false },
        accessibility: { hasMobilityIssues: false, details: '' },
        language: { preferred: 'en', needsTranslator: false }
      }
    }
  })

  const formValues = watch()
  const hasInjuries = watch('specialRequirements.medical.hasInjuries')
  const hasMobilityIssues = watch('specialRequirements.accessibility.hasMobilityIssues')

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
    return () => window.clearInterval(intervalId)
  }, [fetchDashboardData])

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setValue('location.coordinates.latitude', location.latitude)
      setValue('location.coordinates.longitude', location.longitude)
      setIsLocationCaptured(true)
    }
  }, [location, setValue])

  const onSubmitRequest = async (data) => {
    setIsSubmittingRequest(true)
    setRequestError('')

    try {
      // Structure payload for backend
      const payload = {
        ...data,
        type: data.type,
        location: {
          ...data.location,
          coordinates: (data.location?.coordinates?.latitude && data.location?.coordinates?.longitude) 
            ? {
                latitude: parseFloat(data.location.coordinates.latitude),
                longitude: parseFloat(data.location.coordinates.longitude)
              }
            : undefined
        }
      }

      await emergencyAPI.create(payload)
      setShowRequestForm(false)
      reset()
      setIsLocationCaptured(false)
      await fetchDashboardData()
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit emergency request')
      console.error('Failed to create request:', err)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 backdrop-blur-md">
        <p className="text-red-700 dark:text-red-400 font-semibold">{error}</p>
      </motion.div>
    )
  }

  const { requests, alerts, disasters, weather, riskStatus, notifications, nearbyShelters } = data || {}
  const overallRisk = riskStatus?.overallRisk || 'SAFE'
  
  const riskColor = {
    'SAFE': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    'WATCH': 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
    'WARNING': 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400',
    'DANGER': 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
  }[overallRisk] || 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Citizen Portal</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Real-time status and emergency coordination
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowRequestForm(!showRequestForm)
            setRequestError('')
            if (!showRequestForm) getLocation()
          }}
          className={`btn ${showRequestForm ? 'btn-secondary' : 'btn-danger shadow-lg shadow-red-500/20'} flex items-center gap-2`}
        >
          {showRequestForm ? 'Cancel Request' : (
            <>
              <PlusCircleIcon className="h-5 w-5" />
              Emergency Request
            </>
          )}
        </motion.button>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className={`rounded-2xl p-4 shadow-xl backdrop-blur-xl border ${riskColor}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl backdrop-blur-sm border ${riskColor.replace('bg-', 'border-').replace('/10', '/30')}`}>
            <BellAlertIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="font-extrabold text-lg tracking-wide uppercase">Risk Level: {overallRisk}</p>
            <p className="text-sm font-medium opacity-90">
              {overallRisk === 'SAFE' 
                ? 'No immediate threats detected. Stay vigilant.' :
                overallRisk === 'WATCH'
                ? 'Monitor local news and weather reports.' :
                overallRisk === 'WARNING'
                ? 'Prepare for possible evacuation or shelter.' :
                'Take immediate action. Follow emergency services instructions.'}
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showRequestForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card relative z-20 shadow-2xl overflow-hidden border-red-500/20"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ExclamationTriangleIcon className="h-6 w-6" />
                New Emergency Request
              </h3>
              <p className="text-red-100 text-sm mt-1 opacity-90 font-medium">Please provide accurate information for faster rescue operations.</p>
            </div>
            
            <div className="p-6 sm:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-6">
                {requestError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {requestError}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="form-label">Request Type</label>
                    <select
                      {...register('type')}
                      className="form-input w-full cursor-pointer appearance-none pr-10"
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

                  <FormField
                    label="People Affected"
                    name="peopleAffected"
                    type="number"
                    register={register}
                    error={errors.peopleAffected}
                    min="1"
                    max="1000"
                    required
                  />

                  <div className="md:col-span-2">
                    <FormField
                      label="Emergency Description"
                      name="description"
                      register={register}
                      error={errors.description}
                      placeholder="e.g., We are trapped on the second floor due to flood waters. Two elderly people need assistance."
                      required
                      multiline={true}
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-red-500" />
                        Location Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => getLocation()}
                        disabled={geoLoading}
                        className={`text-xs font-bold flex items-center gap-1 hover:underline disabled:opacity-50 transition-colors ${isLocationCaptured ? 'text-emerald-600' : 'text-indigo-600'}`}
                      >
                        <MapIcon className={`h-3 w-3 ${geoLoading ? 'animate-spin' : ''}`} />
                        {isLocationCaptured ? 'Location Captured ✓' : 'Capture GPS Coordinates (Required)'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <FormField
                        label="Address"
                        name="location.address"
                        register={register}
                        error={errors.location?.address}
                        placeholder="House no, Street name"
                        required
                      />
                      <FormField
                        label="Landmark"
                        name="location.landmark"
                        register={register}
                        placeholder="Near Main Hospital"
                      />
                      <FormField
                        label="City"
                        name="location.city"
                        register={register}
                        error={errors.location?.city}
                        required
                      />
                      <FormField
                        label="State"
                        name="location.state"
                        register={register}
                        error={errors.location?.state}
                        required
                      />

                      <div className="md:col-span-2 grid grid-cols-2 gap-2 mt-2">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Latitude</p>
                          <p className="text-xs font-mono font-bold">{watch('location.coordinates.latitude') || 'Capture required'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Longitude</p>
                          <p className="text-xs font-mono font-bold">{watch('location.coordinates.longitude') || 'Capture required'}</p>
                        </div>
                        {/* Hidden inputs to ensure react-hook-form registers these values correctly */}
                        <input type="hidden" {...register('location.coordinates.latitude')} />
                        <input type="hidden" {...register('location.coordinates.longitude')} />
                      </div>
                      {errors.location?.coordinates && (
                        <p className="md:col-span-2 text-xs text-red-500 font-bold mt-1 text-center">
                          Please capture your location
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Specific Support</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="checkbox-card group">
                        <input type="checkbox" {...register('specialRequirements.medical.hasInjuries')} className="hidden" />
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${hasInjuries ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-500/10' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                          <div className={`p-2 rounded-lg ${hasInjuries ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <PlusCircleIcon className="h-5 w-5" />
                          </div>
                          <span className={`text-sm font-bold ${hasInjuries ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Injuries</span>
                        </div>
                      </label>
                      <label className="checkbox-card group">
                        <input type="checkbox" {...register('specialRequirements.accessibility.hasMobilityIssues')} className="hidden" />
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${hasMobilityIssues ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-500/10' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                          <div className={`p-2 rounded-lg ${hasMobilityIssues ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            <ShieldCheckIcon className="h-5 w-5" />
                          </div>
                          <span className={`text-sm font-bold ${hasMobilityIssues ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>Mobility Support</span>
                        </div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {hasInjuries && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <FormField
                            label="Injury Details"
                            name="specialRequirements.medical.injuryDetails"
                            register={register}
                            error={errors.specialRequirements?.medical?.injuryDetails}
                            placeholder="Describe wounds, fractures, or conditions"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmittingRequest}
                    className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
                  >
                    {isSubmittingRequest ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Broadcast Emergency'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="card h-full">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Requests</h3>
              <Link to="/dashboard/emergency" className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                View History
              </Link>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {requests?.slice(0, 5).map((request) => (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    key={request._id} 
                    className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{request.type.replace('_', ' ')}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{request.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      request.status === 'pending' ? 'bg-slate-100 text-slate-600' :
                      request.status === 'assigned' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {request.status}
                    </span>
                  </motion.div>
                ))}
                {(!requests || requests.length === 0) && (
                  <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No active emergency requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-none shadow-indigo-500/20 shadow-xl overflow-hidden focus-within:ring-0">
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
             <div className="relative p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Local Weather</h3>
                  <CloudIcon className="h-8 w-8 text-white/80" />
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-5xl font-black">{Math.round(weather?.data?.temperature?.current || 0)}°C</p>
                  <div>
                    <p className="text-sm font-bold uppercase opacity-80">{weather?.data?.condition?.description || 'Clear Sky'}</p>
                    <p className="text-xs font-medium opacity-60">Humidity: {weather?.data?.humidity}%</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-amber-500" />
                Recent Alerts
              </h3>
            </div>
            <div className="card-body p-0">
              {alerts?.slice(0, 3).map((alert, i) => (
                <div key={alert._id} className={`p-4 ${i !== alerts.slice(0,3).length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.message}</p>
                  <Link to={`/dashboard/alerts/${alert._id}`} className="inline-block mt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Read All Warnings</Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CitizenDashboard
