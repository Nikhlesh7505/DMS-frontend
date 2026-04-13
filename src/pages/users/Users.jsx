// import React, { useEffect, useState } from 'react'
// import { userAPI } from '../../services/api'
// import {
//   UsersIcon,
//   UserIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon
// } from '@heroicons/react/24/outline'

// const Users = () => {
//   const [users, setUsers] = useState([])
//   const [pendingUsers, setPendingUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState('all')

//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const params = activeTab !== 'all' ? { role: activeTab } : {}
//         const [usersResponse, pendingResponse] = await Promise.all([
//           userAPI.getUsers(params),
//           userAPI.getPendingApprovals(),
//         ])
//         setUsers(usersResponse.data.data.users)
//         setPendingUsers(pendingResponse.data.data.users)
//       } catch (error) {
//         console.error('Failed to fetch users:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadUsers()
//   }, [activeTab])

//   const handleApprove = async (userId, status) => {
//     try {
//       await userAPI.approveUser(userId, { status })
//       const params = activeTab !== 'all' ? { role: activeTab } : {}
//       const [usersResponse, pendingResponse] = await Promise.all([
//         userAPI.getUsers(params),
//         userAPI.getPendingApprovals(),
//       ])
//       setUsers(usersResponse.data.data.users)
//       setPendingUsers(pendingResponse.data.data.users)
//     } catch (error) {
//       console.error('Failed to update user:', error)
//     }
//   }

//   const getRoleColor = (role) => {
//     const colors = {
//       admin: 'bg-danger-100 text-danger-800',
//       ngo: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
//       rescue_team: 'bg-warning-100 text-warning-800',
//       citizen: 'bg-success-100 text-success-800'
//     }
//     return colors[role] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'approved':
//         return <CheckCircleIcon className="h-5 w-5 text-success-500" />
//       case 'pending':
//         return <ClockIcon className="h-5 w-5 text-warning-500" />
//       case 'rejected':
//         return <XCircleIcon className="h-5 w-5 text-danger-500" />
//       default:
//         return null
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage users and approvals</p>
//       </div>

//       {/* Pending Approvals */}
//       {pendingUsers.length > 0 && (
//         <div className="card border-l-4 border-l-warning-500">
//           <div className="card-header">
//             <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
//               <ClockIcon className="h-5 w-5 text-warning-500" />
//               Pending Approvals ({pendingUsers.length})
//             </h2>
//           </div>
//           <div className="card-body">
//             <div className="space-y-4">
//               {pendingUsers.map((user) => (
//                 <div key={user._id} className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/10 rounded-lg">
//                   <div className="flex items-center gap-4">
//                     <div className="p-2 bg-white/50 dark:bg-black/30 rounded-full">
//                       <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
//                       <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
//                       <p className="text-sm text-slate-400 dark:text-slate-500 capitalize">{user.role}</p>
//                       {user.organization?.name && (
//                         <p className="text-sm text-slate-400 dark:text-slate-500">{user.organization.name}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleApprove(user._id, 'approved')}
//                       className="btn-success text-sm"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleApprove(user._id, 'rejected')}
//                       className="btn-danger text-sm"
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="flex flex-wrap gap-2">
//         {['all', 'admin', 'ngo', 'rescue_team', 'citizen'].map((role) => (
//           <button
//             key={role}
//             onClick={() => setActiveTab(role)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
//               activeTab === role
//                 ? 'bg-indigo-600 text-white'
//                 : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10'
//             }`}
//           >
//             {role.replace('_', ' ')}
//           </button>
//         ))}
//       </div>

//       {/* Users Table */}
//       <div className="card overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-white/30 dark:bg-black/10">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                   Location
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                   Joined
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-slate-800/60 divide-y divide-gray-200">
//               {users.map((user) => (
//                 <tr key={user._id} className="hover:bg-white/30 dark:bg-black/10">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10 bg-white/50 dark:bg-black/30 rounded-full flex items-center justify-center">
//                         <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
//                         <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
//                       {user.role.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       {getStatusIcon(user.approvalStatus)}
//                       <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 capitalize">
//                         {user.approvalStatus}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
//                     {user.location?.city || 'Not set'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {users.length === 0 && (
//         <div className="text-center py-12">
//           <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
//           <p className="mt-4 text-slate-500 dark:text-slate-400">No users found</p>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Users


import React, { useCallback, useEffect, useState } from 'react'
import { userAPI } from '../../services/api'
import {
  UsersIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Users = () => {
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null })
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params = activeTab !== 'all' ? { role: activeTab } : {}
      const response = await userAPI.getUsers(params)
      setUsers(response.data.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const fetchPendingUsers = useCallback(async () => {
    try {
      const response = await userAPI.getPendingApprovals()
      setPendingUsers(response.data.data.users)
    } catch (error) {
      console.error('Failed to fetch pending users:', error)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchPendingUsers()
  }, [fetchUsers, fetchPendingUsers])

  const handleApprove = async (userId, status) => {
    try {
      await userAPI.approveUser(userId, { status })
      fetchUsers()
      fetchPendingUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  // ✅ NEW: Remove user handler
  const handleRemoveUser = async () => {
    if (!deleteModal.user) return
    setDeleting(true)
    try {
      await userAPI.deleteUser(deleteModal.user._id)
      setDeleteModal({ open: false, user: null })
      fetchUsers()
      fetchPendingUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-danger-100 text-danger-800',
      ngo: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200',
      rescue_team: 'bg-warning-100 text-warning-800',
      citizen: 'bg-success-100 text-success-800'
    }
    return colors[role] || 'bg-white/40 dark:bg-black/20 text-slate-800 dark:text-slate-100'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />
      default:
        return null
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage users and approvals</p>
      </div>

      {/* ✅ NEW: Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-danger-100 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-danger-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Remove User</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
              Are you sure you want to permanently remove:
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{deleteModal.user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{deleteModal.user?.email}</p>
            <p className="text-xs text-danger-600 bg-danger-50 rounded-lg px-3 py-2 mb-6">
              This action cannot be undone. All data associated with this user will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-lg hover:bg-white/30 dark:bg-black/10"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                className="px-4 py-2 text-sm font-medium text-white bg-danger-600 rounded-lg hover:bg-danger-700 disabled:opacity-50 flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
                {deleting ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="card border-l-4 border-l-warning-500">
          <div className="card-header">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-warning-500" />
              Pending Approvals ({pendingUsers.length})
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/10 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/50 dark:bg-black/30 rounded-full">
                      <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 capitalize">{user.role}</p>
                      {user.organization?.name && (
                        <p className="text-sm text-slate-400 dark:text-slate-500">{user.organization.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user._id, 'approved')}
                      className="btn-success text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(user._id, 'rejected')}
                      className="btn-danger text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'admin', 'ngo', 'rescue_team', 'citizen'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              activeTab === role
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10'
            }`}
          >
            {role.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/30 dark:bg-black/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                {/* ✅ NEW column header */}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800/60 divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/30 dark:bg-black/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-white/50 dark:bg-black/30 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.approvalStatus)}
                      <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {user.approvalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {user.location?.city || 'Not set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {/* ✅ NEW: Remove button cell */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setDeleteModal({ open: true, user })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-700 bg-danger-50 border border-danger-200 rounded-lg hover:bg-danger-100 transition-colors"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">No users found</p>
        </div>
      )}
    </div>
  )
}

export default Users
