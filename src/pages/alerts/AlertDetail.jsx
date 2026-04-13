import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { alertAPI } from '../../services/api'
import {
  BellAlertIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const AlertDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAlert = async () => {
      try {
        const response = await alertAPI.getById(id)
        setAlert(response.data.data.alert)
      } catch (error) {
        console.error('Failed to fetch alert:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlert()
  }, [id])

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      watch: 'bg-warning-100 text-warning-800',
      warning: 'bg-orange-100 text-orange-800',
      danger: 'bg-danger-100 text-danger-800',
      emergency: 'bg-danger-200 text-danger-900'
    }
    return colors[severity] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Alert not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/alerts')}
        className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Alerts
      </button>

      {/* Alert Header */}
      <div className={`card border-l-4 ${
        alert.severity === 'danger' || alert.severity === 'emergency'
          ? 'border-l-danger-500'
          : alert.severity === 'warning'
          ? 'border-l-warning-500'
          : 'border-l-primary-500'
      }`}>
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/40 dark:bg-black/20 rounded-lg">
                {alert.severity === 'danger' || alert.severity === 'emergency' ? (
                  <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
                ) : (
                  <BellAlertIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{alert.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Alert Code: {alert.alertCode}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                {alert.severity}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                alert.status === 'active' ? 'bg-success-100 text-success-800' :
                alert.status === 'acknowledged' ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200' :
                'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
              }`}>
                {alert.status}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                <p className="font-medium">{alert.targetLocation?.city}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Issued</p>
                <p className="font-medium">
                  {new Date(alert.timeline?.issuedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Issued By</p>
                <p className="font-medium">{alert.issuedBy?.name || 'System'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Alert Details</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-700 dark:text-slate-200 text-lg">{alert.message}</p>
        </div>
      </div>

      {alert.disaster?._id && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">Related Disaster</h2>
          </div>
          <div className="card-body flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{alert.disaster.name || alert.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                {alert.disaster.type} • {alert.disaster.status}
              </p>
            </div>
            <Link
              to={`/dashboard/disasters/${alert.disaster._id}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Open disaster details
            </Link>
          </div>
        </div>
      )}

      {/* Instructions */}
      {alert.instructions && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">Safety Instructions</h2>
          </div>
          <div className="card-body space-y-6">
            {alert.instructions.before?.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Before:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-200">
                  {alert.instructions.before.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {alert.instructions.during?.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">During:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-200">
                  {alert.instructions.during.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {alert.instructions.after?.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">After:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-200">
                  {alert.instructions.after.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      {alert.instructions?.emergencyContacts?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">Emergency Contacts</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alert.instructions.emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/30 dark:bg-black/10 rounded-lg">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-danger-600 font-bold">{contact.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertDetail
