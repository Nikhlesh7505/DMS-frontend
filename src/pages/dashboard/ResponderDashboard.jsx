import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  WrenchIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { dashboardAPI } from '../../services/api'

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

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }} className="card hover:shadow-xl transition-shadow block relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 ${color} group-hover:scale-150 transition-transform duration-700 ease-out`} />
    <div className="card-body relative z-10">
      <div className="flex items-center">
        <div className={`flex-shrink-0 bg-white/20 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 text-slate-800 dark:text-white ${color}`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="ml-5">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 capitalize">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  </motion.div>
)

const ResponderDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getResponder()
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

  const { tasks, requests, resources, alerts, disasters } = data || {}

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Responder Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Manage your tasks, resources, and emergency responses
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Tasks" value={tasks?.pending?.length || 0} icon={WrenchIcon} color="bg-blue-500" />
        <StatCard title="Assigned Requests" value={requests?.length || 0} icon={ClipboardDocumentListIcon} color="bg-amber-500" />
        <StatCard title="My Resources" value={resources?.length || 0} icon={TruckIcon} color="bg-emerald-500" />
        <StatCard title="Active Alerts" value={alerts?.length || 0} icon={BellAlertIcon} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Tasks</h3>
            <Link to="/dashboard/tasks" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {tasks?.pending?.slice(0, 5).map((task) => (
                <motion.div whileHover={{ scale: 1.02 }} key={task._id} className="flex items-start justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{task.type}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`badge ${
                        task.priority === 'critical' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
                        task.priority === 'high' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' :
                        'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                        <ClockIcon className="h-3.5 w-3.5 mr-1" />
                        {new Date(task.timeline?.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link to={`/dashboard/tasks`} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-blue-600 transition-colors">
                    <CheckCircleIcon className="h-6 w-6" />
                  </Link>
                </motion.div>
              ))}
              {(!tasks?.pending || tasks.pending.length === 0) && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-4">No pending tasks</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Requests</h3>
            <Link to="/dashboard/emergency" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {requests?.slice(0, 5).map((request) => (
                <motion.div whileHover={{ scale: 1.02 }} key={request._id} className="flex items-start justify-between p-4 bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl backdrop-blur-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{request.type}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{request.citizen?.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`badge ${
                        request.priority === 'critical' || request.priority === 'life_threatening' 
                          ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
                        request.priority === 'high' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' :
                        'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        {request.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{request.location?.city}</span>
                    </div>
                  </div>
                  <span className={`badge ${
                    request.status === 'pending' ? 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30' :
                    request.status === 'in_progress' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30' :
                    'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                  }`}>
                    {request.status}
                  </span>
                </motion.div>
              ))}
              {(!requests || requests.length === 0) && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-4">No assigned requests</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Alerts</h3>
            <Link to="/dashboard/alerts" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {alerts?.slice(0, 5).map((alert) => (
                <motion.div whileHover={{ scale: 1.01 }} key={alert._id} className={`p-3 rounded-xl border-l-4 backdrop-blur-sm ${
                  alert.severity === 'danger' ? 'bg-red-500/10 border-red-500' :
                  alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{alert.targetLocation?.city}</p>
                </motion.div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-4">No active alerts</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Disasters</h3>
            <Link to="/dashboard/disasters" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {disasters?.slice(0, 5).map((disaster) => (
                <motion.div whileHover={{ scale: 1.01 }} key={disaster._id} className="flex items-center p-3 bg-white/30 dark:bg-white/5 border border-white/20 rounded-xl backdrop-blur-md">
                  <div className="bg-red-500/20 p-2 rounded-xl mr-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{disaster.name}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                      {disaster.type} - {disaster.location?.city}
                    </p>
                  </div>
                  <span className={`badge ${
                    disaster.severity === 'catastrophic' || disaster.severity === 'severe'
                      ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
                    disaster.severity === 'high' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' :
                    'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                  }`}>
                    {disaster.severity}
                  </span>
                </motion.div>
              ))}
              {(!disasters || disasters.length === 0) && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-4">No active disasters</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {resources && resources.length > 0 && (
          <motion.div variants={itemVariants} className="card">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Resources</h3>
              <Link to="/dashboard/resources" className="text-sm font-bold text-blue-600 hover:text-blue-500">Manage resources</Link>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.slice(0, 4).map((resource) => (
                  <motion.div whileHover={{ scale: 1.05 }} key={resource._id} className="p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{resource.name}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">{resource.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                        {resource.quantity?.available} / {resource.quantity?.total} <span className="text-xs font-medium text-slate-500">{resource.quantity?.unit}</span>
                      </span>
                      <span className={`badge ${
                        resource.status === 'available' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30' :
                        resource.status === 'in_use' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30' :
                        'bg-slate-500/20 text-slate-700 border-slate-500/30'
                      }`}>
                        {resource.status}
                      </span>
                    </div>
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

export default ResponderDashboard
