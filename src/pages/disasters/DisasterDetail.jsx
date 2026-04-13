import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { disasterAPI, alertAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ArrowLeftIcon,
  BellAlertIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const RelatedAlerts = ({ disasterId }) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await alertAPI.getAll({ disaster: disasterId })
        setAlerts(response.data?.data?.alerts || [])
      } catch (error) {
        console.error('Failed to fetch related alerts:', error)
      } finally {
        setLoading(false)
      }
    }
    if (disasterId) fetchAlerts()
  }, [disasterId])

  if (loading) return null
  if (alerts.length === 0) return null

  return (
    <div className="card mt-6">
      <div className="card-header flex items-center gap-2">
        <BellAlertIcon className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Related Alerts</h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`p-4 rounded-xl border-l-4 backdrop-blur-sm ${
                alert.severity === 'danger' ? 'bg-red-500/10 border-red-500' :
                alert.severity === 'warning' ? 'bg-warning-500/10 border-warning-500' :
                'bg-blue-500/10 border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/50 dark:bg-black/20 uppercase tracking-wider">
                  {alert.severity}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {new Date(alert.timeline?.issuedAt).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {alert.targetLocation?.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DisasterDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [disaster, setDisaster] = useState(null)
  const [loading, setLoading] = useState(true)

  const canUpdateStatus = user?.role === 'admin'

  useEffect(() => {
    const loadDisaster = async () => {
      try {
        const response = await disasterAPI.getById(id)
        setDisaster(response.data.data.disaster)
      } catch (error) {
        console.error('Failed to fetch disaster:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDisaster()
  }, [id])

  const handleStatusUpdate = async (newStatus) => {
    if (!canUpdateStatus) {
      return
    }

    try {
      await disasterAPI.updateStatus(id, newStatus)
      const response = await disasterAPI.getById(id)
      setDisaster(response.data.data.disaster)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!disaster) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Disaster not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/disasters')}
        className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Disasters
      </button>

      {/* Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{disaster.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 capitalize font-medium">{disaster.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold capitalize tracking-wide shadow-sm ${
                disaster.severity === 'catastrophic' ? 'bg-red-600 text-white' :
                disaster.severity === 'severe' ? 'bg-red-500 text-white' :
                disaster.severity === 'high' ? 'bg-orange-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {disaster.severity}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center bg-white/30 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/10">
              <MapPinIcon className="h-6 w-6 text-blue-500 mr-4" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                <p className="font-bold text-slate-900 dark:text-white">{disaster.location?.city}, {disaster.location?.state}</p>
              </div>
            </div>
            <div className="flex items-center bg-white/30 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/10">
              <CalendarIcon className="h-6 w-6 text-purple-500 mr-4" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detected</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {new Date(disaster.timeline?.detectedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white/30 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/10">
              <UsersIcon className="h-6 w-6 text-emerald-500 mr-4" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Affected</p>
                <p className="font-bold text-slate-900 dark:text-white">{disaster.impact?.affectedPopulation?.toLocaleString() || 0} people</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Situation Overview</h2>
            </div>
            <div className="card-body">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{disaster.description}</p>
            </div>
          </div>

          {/* Impact */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Impact Assessment</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {disaster.impact?.affectedPopulation?.toLocaleString() || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Affected</p>
                </div>
                <div className="text-center p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {disaster.impact?.evacuatedPopulation?.toLocaleString() || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Evacuated</p>
                </div>
                <div className="text-center p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">
                    {disaster.impact?.casualties?.confirmed || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Casualties</p>
                </div>
                <div className="text-center p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {disaster.impact?.injuries || 0}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Injuries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {canUpdateStatus ? (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Update Status</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-2">
                  {['monitoring', 'active', 'contained', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={disaster.status === status}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        disaster.status === status
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status</h2>
              </div>
              <div className="card-body">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  This disaster is currently marked as <span className="font-semibold capitalize">{disaster.status}</span>.
                  Status changes are limited to administrators.
                </p>
              </div>
            </div>
          )}

          <RelatedAlerts disasterId={id} />
        </div>
      </div>
    </div>
  )
}

export default DisasterDetail
