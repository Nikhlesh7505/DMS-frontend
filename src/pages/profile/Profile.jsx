


import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI, userAPI } from '../../services/api'
import {
  UserCircleIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  PencilIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, setUser } = useAuth()

  const [editing,       setEditing]       = useState(false)
  const [changingPass,  setChangingPass]  = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [passLoading,   setPassLoading]   = useState(false)
  const [message,       setMessage]       = useState(null) // { type: 'success'|'error', text }

  const [formData, setFormData] = useState({
    name:    user?.name             || '',
    username:user?.username         || '',
    phone:   user?.phone            || '',
    address: user?.location?.address|| '',
    city:    user?.location?.city   || '',
    state:   user?.location?.state  || '',
  })

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  const [passError, setPassError] = useState('')

  const editInputClassName =
    'w-full rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600/70 dark:focus:border-blue-400'

  // ── Reset form to current user values ──────────────────────────
  const resetForm = () => {
    setFormData({
      name:    user?.name             || '',
      username:user?.username         || '',
      phone:   user?.phone            || '',
      address: user?.location?.address|| '',
      city:    user?.location?.city   || '',
      state:   user?.location?.state  || '',
    })
    setEditing(false)
    setMessage(null)
  }

  // ── Save profile ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await userAPI.updateProfile({
        name:  formData.name,
        username: formData.username,
        phone: formData.phone,
        location: {
          address: formData.address,
          city:    formData.city,
          state:   formData.state,
        },
      })

      // Update user in AuthContext if setUser is available
      const updated = res.data?.data?.user || res.data?.user
      if (updated && setUser) setUser(updated)

      setMessage({ type: 'success', text: 'Profile updated successfully.' })
      setEditing(false)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update profile.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Change password ─────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassError('')

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.')
      return
    }
    if (passData.newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.')
      return
    }

    setPassLoading(true)
    try {
      await authAPI.updatePassword({
        currentPassword: passData.currentPassword,
        newPassword:     passData.newPassword,
      })
      setMessage({ type: 'success', text: 'Password changed successfully.' })
      setChangingPass(false)
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswords({ current: false, next: false, confirm: false })
    } catch (err) {
      setPassError(err?.response?.data?.message || 'Failed to change password.')
    } finally {
      setPassLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // ── Role badge ──────────────────────────────────────────────────
  const roleBadge = {
    admin:        'bg-purple-100 text-purple-700',
    ngo:          'bg-blue-100 text-blue-700',
    rescue_team:  'bg-orange-100 text-orange-700',
    citizen:      'bg-green-100 text-green-700',
  }

  // ── Approval badge — only for NGO / rescue_team ─────────────────
  const showApproval = user?.role === 'ngo' || user?.role === 'rescue_team'
  const approvalBadge = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const isAccountActive = user?.isActive !== false
  const isAccountVerified = Boolean(user?.isVerified || user?.approvalStatus === 'approved')

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>

      {/* Global message */}
      {message && (
        <div className={`flex items-center gap-3 rounded-xl p-4 border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success'
            ? <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            : <XMarkIcon className="h-5 w-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">

        {/* Avatar + name header */}
        <div className="px-6 py-5 border-b border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              {user?.username && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Role badge */}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                  roleBadge[user?.role] || 'bg-white/40 dark:bg-black/20 text-slate-600 dark:text-slate-300'
                }`}>
                  {user?.role?.replace('_', ' ')}
                </span>
                {/* Approval badge — NGO / rescue only */}
                {showApproval && user?.approvalStatus && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                    approvalBadge[user.approvalStatus] || 'bg-white/40 dark:bg-black/20 text-slate-600 dark:text-slate-300'
                  }`}>
                    {user.approvalStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit button */}
          {!editing && (
            <button
              onClick={() => { setEditing(true); setMessage(null) }}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {editing ? (
            /* ── Edit form ─────────────────────────────────────── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={editInputClassName}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    className={editInputClassName}
                    placeholder="john_doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={editInputClassName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={editInputClassName}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className={editInputClassName}
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className={editInputClassName}
                    placeholder="e.g. Maharashtra"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-200/60 dark:border-slate-700/50 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* ── View mode ─────────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <UserCircleIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserCircleIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Username</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {user?.username ? `@${user.username}` : <span className="text-slate-400 dark:text-slate-500 italic">Not set</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {user?.phone || <span className="text-slate-400 dark:text-slate-500 italic">Not provided</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <MapPinIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Location</p>
                  {user?.location?.city ? (
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {[user.location.address, user.location.city, user.location.state]
                        .filter(Boolean).join(', ')}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">Not provided</p>
                  )}
                </div>
              </div>

              {user?.organization?.name && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">Organization</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.organization.name}</p>
                    {user.organization.type && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{user.organization.type}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account info card */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/40 dark:border-slate-700/40">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Account Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAccountActive ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {isAccountActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Email Verified</p>
              <div className="flex items-center gap-2">
                {isAccountVerified ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Verified</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Verification</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Member Since</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Last Login</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    }) + ' IST'
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            Password
          </h3>
          {!changingPass && (
            <button
              onClick={() => {
                setChangingPass(true)
                setPassError('')
                setShowPasswords({ current: false, next: false, confirm: false })
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {changingPass ? (
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passData.currentPassword}
                  onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                  className={`${editInputClassName} pr-10`}
                  required 
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'}
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.next ? 'text' : 'password'}
                    value={passData.newPassword}
                    onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                    className={`${editInputClassName} pr-10`}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('next')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPasswords.next ? 'Hide new password' : 'Show new password'}
                  >
                    {showPasswords.next ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passData.confirmPassword}
                    onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                    className={`${editInputClassName} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {passError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {passError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
              <button
                type="button"
                onClick={() => {
                  setChangingPass(false)
                  setPassError('')
                  setShowPasswords({ current: false, next: false, confirm: false })
                }}
                className="px-4 py-2 border border-slate-200/60 dark:border-slate-700/50 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:bg-black/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-4">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Password last changed: {user?.passwordChangedAt
                ? new Date(user.passwordChangedAt).toLocaleDateString('en-IN')
                : 'Never'}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Profile
