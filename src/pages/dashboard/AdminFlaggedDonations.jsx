import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  TrashIcon,
  XCircleIcon,
  HeartIcon,
  UserIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  FunnelIcon,
  MapPinIcon,
  InboxStackIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  EyeIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { donationAPI } from '../../services/api'

const statusConfig = {
  Pending: { color: 'text-amber-600', bg: 'bg-amber-500/10', icon: ClockIcon },
  Accepted: { color: 'text-sky-600', bg: 'bg-sky-500/10', icon: ShieldCheckIcon },
  Assigned: { color: 'text-violet-600', bg: 'bg-violet-500/10', icon: TruckIcon },
  'In Process': { color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: TruckIcon },
  'In-Progress': { color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: TruckIcon },
  Completed: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: CheckCircleIcon },
  Rejected: { color: 'text-rose-600', bg: 'bg-rose-500/10', icon: XCircleIcon },
  'Rejected by Volunteer': { color: 'text-rose-600', bg: 'bg-rose-500/10', icon: ExclamationTriangleIcon },
  Expired: { color: 'text-slate-600', bg: 'bg-slate-500/10', icon: ExclamationTriangleIcon }
}

const formatDateTime = (value) => {
  if (!value) return 'Not available'
  return new Date(value).toLocaleString()
}

const formatCompletedTime = (donation) => {
  if (donation.completedAt) {
    return formatDateTime(donation.completedAt)
  }

  if (donation.status === 'Completed') {
    return 'Completed (legacy record, timestamp unavailable)'
  }

  return 'Not yet'
}

const formatOrganization = (organization) => {
  if (!organization?.name) return 'Not assigned'
  if (!organization?.type) return organization.name
  return `${organization.name} (${organization.type})`
}

const AdminFlaggedDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setActionError('')
      const response = await donationAPI.getAll({ limit: 100 })
      setDonations(response.data.data.donations || [])
    } catch (error) {
      console.error('Error fetching donation activity', error)
      setActionError('Failed to load donation activity for admin review.')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(donations.map((donation) => donation.status).filter(Boolean))]
    return ['all', ...uniqueStatuses]
  }, [donations])

  const visibleDonations = useMemo(() => {
    return donations.filter((donation) => {
      const matchesTab = activeTab === 'all' ? true : donation.flagged
      const matchesStatus = statusFilter === 'all' ? true : donation.status === statusFilter
      return matchesTab && matchesStatus
    })
  }, [activeTab, donations, statusFilter])

  const stats = useMemo(() => ({
    total: donations.length,
    flagged: donations.filter((donation) => donation.flagged).length,
    active: donations.filter((donation) => ['Pending', 'Accepted', 'Assigned', 'In Process', 'In-Progress'].includes(donation.status)).length,
    completed: donations.filter((donation) => donation.status === 'Completed').length
  }), [donations])

  const openRejectModal = (donation) => {
    setSelectedDonation(donation)
    setFeedback(
      donation.flagged
        ? 'Your donation request has been pending for over 7 days with no available NGOs to pick it up. We have cancelled this request to keep our system clean. Please feel free to post again later.'
        : 'This donation request has been closed by the admin team. Please review the details and create a new donation if needed.'
    )
    setIsModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedDonation?._id) return

    try {
      await donationAPI.adminDelete(selectedDonation._id, feedback)
      setIsModalOpen(false)
      setSelectedDonation(null)
      setFeedback('')
      fetchDonations()
    } catch (error) {
      console.error('Error rejecting donation request', error)
      setActionError(error.response?.data?.message || 'Failed to update the donation request.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <HeartIcon className="w-10 h-10 text-indigo-600" />
            Donation Activity
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
            Monitor every donation request, assignment handoff, volunteer status, donor details, and NGO activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'flagged'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Flagged Review
          </button>
          <div className="relative">
            <FunnelIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="form-input pl-9 pr-10 min-w-44 bg-white dark:bg-slate-900"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 p-4 rounded-2xl font-medium">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-black tracking-widest uppercase text-slate-400">Total Donations</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-black tracking-widest uppercase text-slate-400">Active Flow</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-black tracking-widest uppercase text-slate-400">Flagged</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.flagged}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-xs font-black tracking-widest uppercase text-slate-400">Completed</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stats.completed}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading donation activity...</p>
        </div>
      ) : visibleDonations.length > 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/85 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)]">
          <div className="hidden xl:grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_auto] gap-6 px-6 py-4 bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span>Donation</span>
            <span>Donor</span>
            <span>Assignment</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {visibleDonations.map((donation) => {
            const status = statusConfig[donation.status] || statusConfig.Pending
            const StatusIcon = status.icon
            const isExpanded = expandedId === donation._id
            const donorName = donation.userId?.name || 'Unknown donor'
            const ngoName = donation.assignedNGO?.name || 'Not assigned'
            const volunteerName = donation.assignedVolunteer?.name || donation.volunteerDetails?.name || 'Not assigned'

            return (
              <motion.div
                key={donation._id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-slate-200 dark:border-slate-800 last:border-b-0"
              >
                <div
                  className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_auto] gap-5 px-6 py-5 items-start transition-colors ${
                    isExpanded ? 'bg-slate-100/70 dark:bg-slate-800/70' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                        {donation.category}
                      </span>
                      {donation.flagged && (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-full">
                          Flagged
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {donation.quantity} {donation.unit || 'units'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {donation.description || 'No description provided.'}
                    </p>
                    <div className="flex items-start gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                      <MapPinIcon className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                      <span className="leading-snug">
                        {donation.location?.address || 'Address not shared'}, {donation.city}, {donation.state}, {donation.country}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-white truncate">{donorName}</p>
                        <p className="text-sm text-slate-500 truncate">{donation.userId?.email || 'No email available'}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-slate-400" />
                        <span>{donation.userId?.phone || donation.contactDetails || 'No contact available'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                        <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">NGO</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">{ngoName}</p>
                      <p className="text-sm text-slate-500 truncate">{formatOrganization(donation.assignedNGO?.organization)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Volunteer</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">{volunteerName}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {donation.assignedVolunteer?.phone || donation.volunteerDetails?.contact || 'No volunteer contact'}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {donation.status}
                    </div>
                    <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <p>Accepted: {donation.acceptedAt ? new Date(donation.acceptedAt).toLocaleDateString() : 'Not yet'}</p>
                      <p>Assigned: {donation.assignmentDate ? new Date(donation.assignmentDate).toLocaleDateString() : 'Not yet'}</p>
                      <p>Completed: {formatCompletedTime(donation)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 xl:justify-end">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : donation._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Details
                    </button>
                    {donation.status !== 'Rejected' && donation.status !== 'Completed' && (
                      <button
                        onClick={() => openRejectModal(donation)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : donation._id)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                          <section className="space-y-4">
                            <div className="flex items-start gap-3">
                              <UserIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Who Donated</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{donorName}</p>
                                <div className="space-y-1 mt-1 text-sm text-slate-500">
                                  <p className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 text-slate-400" />{donation.userId?.email || 'No email'}</p>
                                  <p className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-slate-400" />{donation.userId?.phone || donation.contactDetails || 'No contact available'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPinIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pickup Location</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {donation.location?.address || 'Address not shared'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {donation.city}, {donation.state}, {donation.country}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <BuildingOffice2Icon className="w-5 h-5 text-indigo-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">NGO Details</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{ngoName}</p>
                                <p className="text-sm text-slate-500">{formatOrganization(donation.assignedNGO?.organization)}</p>
                                <p className="text-sm text-slate-500">
                                  {donation.assignedNGO?.email || donation.assignedNGO?.phone || 'No NGO contact available'}
                                </p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-4">
                            <div className="flex items-start gap-3">
                              <TruckIcon className="w-5 h-5 text-violet-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Who Is Assigned</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{volunteerName}</p>
                                <p className="text-sm text-slate-500">
                                  {donation.assignedVolunteer?.phone || donation.volunteerDetails?.contact || 'No volunteer contact available'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {donation.volunteerDetails?.expectedTime
                                    ? `Expected arrival: ${formatDateTime(donation.volunteerDetails.expectedTime)}`
                                    : 'Expected arrival not set'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <InboxStackIcon className="w-5 h-5 text-violet-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Whom Assigned</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {donation.assignedNGO?.name
                                    ? `${donation.assignedNGO.name} assigned ${volunteerName === 'Not assigned' ? 'a volunteer' : volunteerName}`
                                    : 'This request has not been handed off to an NGO yet'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {donation.assignmentDate ? `Volunteer assignment time: ${formatDateTime(donation.assignmentDate)}` : 'Volunteer assignment time not available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CalendarDaysIcon className="w-5 h-5 text-violet-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Timeline</p>
                                <div className="space-y-1 text-sm text-slate-500">
                                  <p>Created: {formatDateTime(donation.createdAt)}</p>
                                  <p>Accepted: {formatDateTime(donation.acceptedAt)}</p>
                                  <p>Assigned: {formatDateTime(donation.assignmentDate)}</p>
                                  <p>Completed: {formatCompletedTime(donation)}</p>
                                  {donation.flaggedAt && <p>Flagged: {formatDateTime(donation.flaggedAt)}</p>}
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>

                        {(donation.adminFeedback || donation.volunteerFeedback) && (
                          <div className="space-y-3 mt-5">
                            {donation.volunteerFeedback && (
                              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-2xl p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Volunteer Feedback</p>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{donation.volunteerFeedback}</p>
                              </div>
                            )}
                            {donation.adminFeedback && (
                              <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200/60 dark:border-rose-800/30 rounded-2xl p-4">
                                <p className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">Admin Feedback</p>
                                <p className="text-sm text-rose-800 dark:text-rose-200 mt-1">{donation.adminFeedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <HeartIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">No donation activity found</h3>
          <p className="text-slate-500 mt-2">
            Try another status filter or switch between all activity and flagged review.
          </p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-50 dark:bg-rose-900/20">
                <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">Close Donation Request</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Donation: <span className="text-slate-500">{selectedDonation?.category} · {selectedDonation?.quantity} {selectedDonation?.unit || 'units'}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Feedback Message</label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    Cancel
                  </button>
                  <button onClick={handleConfirmReject} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-lg shadow-rose-500/30">
                    Confirm & Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminFlaggedDonations
