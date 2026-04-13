import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { disasterAPI } from '../../services/api'
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const Disasters = () => {
  const [disasters, setDisasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadDisasters = async () => {
      try {
        const params = filter !== 'all' ? { status: filter } : {}
        const response = await disasterAPI.getAll(params)
        setDisasters(response.data.data.disasters)
      } catch (error) {
        console.error('Failed to fetch disasters:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDisasters()
  }, [filter])

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-success-100 text-success-800',
      moderate: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      high: 'bg-warning-100 text-warning-800',
      severe: 'bg-danger-100 text-danger-800',
      catastrophic: 'bg-danger-200 text-danger-900'
    }
    return colors[severity] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  const getStatusColor = (status) => {
    const colors = {
      monitoring: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      active: 'bg-danger-100 text-danger-800',
      contained: 'bg-warning-100 text-warning-800',
      resolved: 'bg-success-100 text-success-800'
    }
    return colors[status] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disasters</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track active incidents and open a disaster for full details</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'monitoring', 'active', 'contained', 'resolved'].map((status) => (
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

      {/* Disasters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disasters.map((disaster) => (
          <Link
            key={disaster._id}
            to={`/dashboard/disasters/${disaster._id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{disaster.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{disaster.type}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(disaster.severity)}`}>
                  {disaster.severity}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(disaster.status)}`}>
                  {disaster.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {disaster.location?.city}, {disaster.location?.state}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(disaster.timeline?.detectedAt).toLocaleDateString()}
                </div>
              </div>

              {disaster.impact?.affectedPopulation > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Affected:</span>{' '}
                    {disaster.impact.affectedPopulation.toLocaleString()} people
                  </p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {disasters.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No disasters found</p>
        </div>
      )}
    </div>
  )
}

export default Disasters
