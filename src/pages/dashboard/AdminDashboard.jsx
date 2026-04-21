import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
  WrenchIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { dashboardAPI } from '../../services/api'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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

const StatCard = ({ title, value, icon: Icon, trend, trendValue, link, color }) => (
  <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
    <Link to={link} className="card hover:shadow-lg transition-shadow block">
      <div className="card-body">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-2xl p-3 ${color} shadow-lg`}>
            {React.createElement(Icon, { className: 'h-6 w-6 text-white' })}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                    {trendValue}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
)

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getAdmin()
      setData(response.data.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
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

  const { counts, recent, statistics } = data || {}

  const disasterChartData = statistics?.disasters?.map(d => ({
    name: d._id,
    count: d.count,
    active: d.active
  })) || []

  const requestChartData = statistics?.requests?.statusStats?.map(s => ({
    name: s._id,
    value: s.count
  })) || []

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Overview of the disaster management system
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Users" value={counts?.totalUsers || 0} icon={UsersIcon} link="/dashboard/users" color="bg-blue-500" />
        <StatCard title="Active Disasters" value={counts?.activeDisasters || 0} icon={ExclamationTriangleIcon} link="/dashboard/disasters" color="bg-red-500" />
        <StatCard title="Active Alerts" value={counts?.activeAlerts || 0} icon={BellAlertIcon} link="/dashboard/alerts" color="bg-amber-500" />
        <StatCard title="Pending Requests" value={counts?.pendingRequests || 0} icon={ClipboardDocumentListIcon} link="/dashboard/emergency" color="bg-green-500" />
        <StatCard title="Flagged Donations" value={"!"} icon={ExclamationTriangleIcon} link="/dashboard/flagged-donations" color="bg-rose-500" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Tasks" value={counts?.activeTasks || 0} icon={WrenchIcon} link="/dashboard/tasks" color="bg-purple-500" />
        <StatCard title="Total Resources" value={counts?.totalResources || 0} icon={TruckIcon} link="/dashboard/resources" color="bg-indigo-500" />
        <StatCard title="Pending Approvals" value={counts?.pendingApprovals || 0} icon={UsersIcon} link="/dashboard/users" color="bg-pink-500" />
        <StatCard title="Low Stock Items" value={counts?.lowStockResources || 0} icon={TruckIcon} link="/dashboard/resources" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Disasters by Type</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disasterChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="active" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Requests by Status</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                >
                  {requestChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Alerts</h3>
            <Link to="/dashboard/alerts" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recent?.alerts?.slice(0, 5).map((alert) => (
                <div key={alert._id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full shadow-lg ${
                    alert.severity === 'danger' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{alert.title}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(alert.timeline?.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!recent?.alerts || recent.alerts.length === 0) && (
                <p className="text-sm font-medium text-slate-500">No recent alerts</p>
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
            <div className="space-y-4">
              {recent?.disasters?.slice(0, 5).map((disaster) => (
                <div key={disaster._id} className="flex items-start space-x-3">
                  <div className="bg-red-500/20 p-2 rounded-xl">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0 font-medium">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{disaster.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                      {disaster.type} - {disaster.location?.city}
                    </p>
                  </div>
                </div>
              ))}
              {(!recent?.disasters || recent.disasters.length === 0) && (
                <p className="text-sm font-medium text-slate-500">No active disasters</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Requests</h3>
            <Link to="/dashboard/emergency" className="text-sm font-bold text-blue-600 hover:text-blue-500">View all</Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recent?.requests?.slice(0, 5).map((request) => (
                <div key={request._id} className="flex items-start space-x-3">
                  <div className="bg-slate-500/10 p-2 rounded-xl">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0 font-medium">
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{request.type}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {request.citizenInfo?.name} - {new Date(request.timeline?.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!recent?.requests || recent.requests.length === 0) && (
                <p className="text-sm font-medium text-slate-500">No recent requests</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AdminDashboard
