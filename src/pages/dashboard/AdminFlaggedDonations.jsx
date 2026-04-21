import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  TrashIcon, 
  XCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { donationAPI } from '../../services/api'

const AdminFlaggedDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetchFlagged()
  }, [])

  const fetchFlagged = async () => {
    try {
      setLoading(true)
      const res = await donationAPI.getFlagged()
      setDonations(res.data.data.donations)
    } catch (err) {
      console.error('Error fetching flagged donations', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setSelectedId(id)
    setFeedback('Your donation request has been pending for over 7 days with no available NGOs to pick it up. We have cancelled this request to keep our system clean. Please feel free to post again later.')
    setIsModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await donationAPI.adminDelete(selectedId, feedback)
      setIsModalOpen(false)
      setSelectedId(null)
      fetchFlagged()
    } catch (err) {
      console.error('Error deleting flagged donation', err)
      alert("Failed to delete request")
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <ExclamationTriangleIcon className="w-10 h-10 text-rose-500" />
          Flagged Donations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Review and manage citizen donation requests that have been pending for over 7 days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : donations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">Flagged</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">{donation.category}</h3>
                  </div>
                </div>
                <div className="space-y-2 mb-4 flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-300">Quantity:</span> {donation.quantity} {donation.unit}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-300">Citizen:</span> {donation.userId?.name} ({donation.userId?.email})
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-300">Location:</span> {donation.city}, {donation.country}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-300">Created At:</span> {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteClick(donation._id)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" /> Cancel Request
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <HeartIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">All clear</h3>
            <p className="text-slate-500 mt-2">No expired donations require your attention.</p>
          </div>
        )}
      </div>

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
                <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">Cancel & Notify Citizen</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Feedback Message to Citizen</label>
                  <textarea 
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
                  <button onClick={handleConfirmDelete} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-lg shadow-rose-500/30">Confirm & Send</button>
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
