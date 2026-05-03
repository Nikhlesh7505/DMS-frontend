import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { alertAPI, disasterAPI } from '../../services/api'
import {
  ExclamationTriangleIcon,
  FireIcon,
  BoltIcon,
  GlobeAltIcon,
  SunIcon,
  CloudIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const DISASTER_TYPE_META = {
  earthquake: { Icon: GlobeAltIcon, accent: 'text-orange-500', iconBg: 'bg-orange-100 dark:bg-orange-900/30' },
  flood: { Icon: CloudIcon, accent: 'text-sky-500', iconBg: 'bg-sky-100 dark:bg-sky-900/30' },
  cyclone: { Icon: BoltIcon, accent: 'text-violet-500', iconBg: 'bg-violet-100 dark:bg-violet-900/30' },
  tsunami: { Icon: CloudIcon, accent: 'text-cyan-500', iconBg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  drought: { Icon: SunIcon, accent: 'text-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30' },
  heatwave: { Icon: SunIcon, accent: 'text-rose-500', iconBg: 'bg-rose-100 dark:bg-rose-900/30' },
  wildfire: { Icon: FireIcon, accent: 'text-red-500', iconBg: 'bg-red-100 dark:bg-red-900/30' },
  landslide: { Icon: ExclamationTriangleIcon, accent: 'text-yellow-500', iconBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  storm: { Icon: BoltIcon, accent: 'text-indigo-500', iconBg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  pandemic: { Icon: ExclamationTriangleIcon, accent: 'text-fuchsia-500', iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30' },
  chemical: { Icon: ExclamationTriangleIcon, accent: 'text-lime-500', iconBg: 'bg-lime-100 dark:bg-lime-900/30' },
  industrial: { Icon: ExclamationTriangleIcon, accent: 'text-slate-500', iconBg: 'bg-slate-100 dark:bg-slate-800/70' },
  other: { Icon: ExclamationTriangleIcon, accent: 'text-slate-500', iconBg: 'bg-slate-100 dark:bg-slate-800/70' }
}

const ALERT_TO_DISASTER_TYPE = {
  earthquake_warning: 'earthquake',
  flood_warning: 'flood',
  cyclone_alert: 'cyclone',
  tsunami_warning: 'tsunami',
  heatwave_warning: 'heatwave',
  storm_warning: 'storm',
  wildfire_warning: 'wildfire',
  landslide_warning: 'landslide',
  safety_advisory: 'other',
  evacuation_notice: 'other',
  all_clear: 'other',
  test: 'other'
}

const ALERT_SEVERITY_TO_DISASTER = {
  info: 'low',
  watch: 'moderate',
  warning: 'high',
  danger: 'severe',
  emergency: 'catastrophic'
}

const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    moderate: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
    high: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    severe: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    catastrophic: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
  return colors[severity] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
}

const getStatusColor = (status) => {
  const colors = {
    monitoring: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
    active: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    contained: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
  }
  return colors[status] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
}

const normalizeType = (value = '') => value.toString().trim().toLowerCase().replace(/\s+/g, '')

const prettyType = (value = '') =>
  value
    .toString()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())

const Disasters = () => {
  const [disasters, setDisasters] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true)
        const disasterParams = filter !== 'all' ? { status: filter, limit: 100 } : { limit: 100 }
        const [disasterResponse, alertResponse] = await Promise.all([
          disasterAPI.getAll(disasterParams),
          alertAPI.getActive()
        ])

        setDisasters(disasterResponse.data?.data?.disasters || [])
        setAlerts(alertResponse.data?.data?.alerts || [])
      } catch (error) {
        console.error('Failed to fetch incidents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadIncidents()
  }, [filter])

  const incidents = useMemo(() => {
    const disasterIds = new Set(disasters.map((item) => item._id))

    const disasterItems = disasters.map((disaster) => ({
      id: `disaster-${disaster._id}`,
      route: `/dashboard/disasters/${disaster._id}`,
      source: 'recorded_disaster',
      title: disaster.name,
      type: normalizeType(disaster.type),
      typeLabel: prettyType(disaster.type),
      severity: disaster.severity,
      status: disaster.status,
      location: `${disaster.location?.city || 'Unknown'}, ${disaster.location?.state || ''}`.replace(/,\s*$/, ''),
      fullLocation: disaster.location?.address || `${disaster.location?.city || ''}, ${disaster.location?.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
      date: disaster.timeline?.detectedAt || disaster.createdAt,
      affectedPopulation: disaster.impact?.affectedPopulation || 0,
      sourceLabel: 'Recorded Disaster'
    }))

    const highRiskAlertItems = alerts
      .filter((alert) => ['warning', 'danger', 'emergency'].includes(alert.severity))
      .filter((alert) => !(alert.disaster?._id && disasterIds.has(alert.disaster._id)))
      .map((alert) => {
        const normalizedType = normalizeType(alert.disasterType || ALERT_TO_DISASTER_TYPE[alert.type] || 'other')
        return {
          id: `alert-${alert._id}`,
          route: alert.disaster?._id ? `/dashboard/disasters/${alert.disaster._id}` : `/dashboard/alerts/${alert._id}`,
          source: 'live_alert',
          title: alert.title,
          type: normalizedType,
          typeLabel: prettyType(alert.disasterType || ALERT_TO_DISASTER_TYPE[alert.type] || 'other'),
          severity: ALERT_SEVERITY_TO_DISASTER[alert.severity] || 'moderate',
          status: 'active',
          location: `${alert.targetLocation?.city || 'Unknown'}, ${alert.targetLocation?.state || ''}`.replace(/,\s*$/, ''),
          fullLocation: alert.targetLocation?.affectedAreas?.length
            ? `${alert.targetLocation.city}, ${alert.targetLocation.affectedAreas.join(', ')}`
            : `${alert.targetLocation?.city || ''}, ${alert.targetLocation?.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
          date: alert.timeline?.issuedAt || alert.createdAt,
          affectedPopulation: 0,
          sourceLabel: alert.source || 'Live Alert'
        }
      })

    return [...highRiskAlertItems, ...disasterItems]
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [alerts, disasters, typeFilter])

  const availableTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(incidents.map((item) => item.type).filter(Boolean))).sort()
    return ['all', ...uniqueTypes]
  }, [incidents])

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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track live high-risk hazard alerts and recorded disaster incidents in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <div className="flex flex-wrap gap-2">
        {availableTypes.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              typeFilter === type
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {type === 'all' ? 'All Types' : prettyType(type)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.map((incident) => {
          const meta = DISASTER_TYPE_META[incident.type] || DISASTER_TYPE_META.other
          const TypeIcon = meta.Icon

          return (
            <Link
              key={incident.id}
              to={incident.route}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${meta.iconBg}`}>
                      <TypeIcon className={`h-6 w-6 ${meta.accent}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{incident.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{incident.typeLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {incident.sourceLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
                    <span>{incident.fullLocation || incident.location}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
                    <span>{new Date(incident.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {incident.affectedPopulation > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">Affected:</span>{' '}
                      {incident.affectedPopulation.toLocaleString()} people
                    </p>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {incidents.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No disaster incidents found</p>
        </div>
      )}
    </div>
  )
}

export default Disasters
