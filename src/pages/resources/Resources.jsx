import React, { useEffect, useState } from 'react'
import { resourceAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  TruckIcon,
  MapPinIcon,
  CubeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const Resources = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadResources = async () => {
      try {
        let response
        if (user?.role === 'ngo' || user?.role === 'rescue_team') {
          response = await resourceAPI.getMyResources()
        } else {
          const params = filter !== 'all' ? { category: filter } : {}
          response = await resourceAPI.getAll(params)
        }
        setResources(response.data.data.resources)
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [filter, user?.role])

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-success-100 text-success-800',
      in_use: 'bg-warning-100 text-warning-800',
      depleted: 'bg-danger-100 text-danger-800',
      maintenance: 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100',
      reserved: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200'
    }
    return colors[status] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  const categories = [
    'all', 'medical', 'rescue_equipment', 'vehicle', 'communication',
    'food_water', 'shelter', 'clothing', 'fuel', 'power', 'personnel'
  ]

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resources</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage and track resources</p>
        </div>
        {(user?.role === 'ngo' || user?.role === 'rescue_team' || user?.role === 'admin') && (
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="card hover:shadow-lg transition-shadow">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <TruckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{resource.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{resource.category}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Available</span>
                  <span className="font-medium">
                    {resource.quantity?.available} / {resource.quantity?.total} {resource.quantity?.unit}
                  </span>
                </div>
                <div className="mt-2 w-full bg-white/50 dark:bg-black/30 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ 
                      width: `${(resource.quantity?.available / resource.quantity?.total) * 100}%` 
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {resource.location?.city}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No resources found</p>
        </div>
      )}
    </div>
  )
}

export default Resources
