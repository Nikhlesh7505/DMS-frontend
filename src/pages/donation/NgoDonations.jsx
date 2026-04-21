import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
  HeartIcon, 
  TruckIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UserIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { donationAPI, userAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { volunteerAssignSchema } from '../../utils/validationSchemas'
import FormField from '../../components/common/FormField'

const statusConfig = {
  Pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ClockIcon },
  Accepted: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircleIcon },
  Assigned: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ClockIcon },
  'In Process': { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: TruckIcon },
  Completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircleIcon },
  'Rejected by Volunteer': { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: ExclamationTriangleIcon },
}

const NgoDonations = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('pending')
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [apiError, setApiError] = useState('')
  
  // Volunteer Search State
  const [volunteers, setVolunteers] = useState([])
  const [searchingVolunteers, setSearchingVolunteers] = useState(false)
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(volunteerAssignSchema)
  })

  useEffect(() => {
    if (isAssignModalOpen && selectedDonation) {
      searchNearbyVolunteers()
    }
  }, [isAssignModalOpen, selectedDonation])

  const searchNearbyVolunteers = async () => {
    try {
      setSearchingVolunteers(true)
      const res = await userAPI.getNearbyVolunteers({ city: selectedDonation.city })
      setVolunteers(res.data.data.volunteers)
    } catch (err) {
      console.error('Error finding volunteers:', err)
    } finally {
      setSearchingVolunteers(false)
    }
  }

  const selectVolunteer = (v) => {
    setSelectedVolunteerId(v._id)
    setValue('name', v.name)
    setValue('contact', v.phone || '')
  }

  useEffect(() => {
    if (user) {
      fetchDonations()
    }
  }, [activeTab, user])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setApiError('')
      if (activeTab === 'pending') {
        const res = await donationAPI.getPending()
        setDonations(res.data.data.donations)
      } else {
        // Fetch only donations assigned to this NGO
        const res = await donationAPI.getAll({ assignedNGO: user?.id })
        setDonations(res.data.data.donations)
      }
    } catch (err) {
      console.error('Error fetching donations:', err)
      setApiError('Failed to fetch donations.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id) => {
    try {
      await donationAPI.accept(id)
      // Open volunteer assignment modal
      const acceptedItem = donations.find(d => d._id === id)
      setSelectedDonation(acceptedItem)
      setIsAssignModalOpen(true)
      fetchDonations()
    } catch (err) {
      if (err.response?.status === 409) {
        alert('This request was already accepted by another NGO.')
        fetchDonations()
      } else {
        console.error(err)
        alert('Error accepting donation.')
      }
    }
  }

  const handleAssignSubmit = async (data) => {
    try {
      const payload = { ...data, volunteerId: selectedVolunteerId }
      await donationAPI.assignVolunteer(selectedDonation._id, payload)
      setIsAssignModalOpen(false)
      setSelectedDonation(null)
      setSelectedVolunteerId(null)
      reset()
      if (activeTab === 'pending') {
        setActiveTab('accepted') // switch tab smoothly
      } else {
        fetchDonations()
      }
    } catch (err) {
      console.error('Error assigning volunteer:', err)
      setApiError('Failed to assign volunteer.')
    }
  }

  const handleCancelAcceptance = async (id) => {
    if (!window.confirm("Are you sure you want to cancel taking this donation? It will visible to other NGOs again.")) return;
    try {
      await donationAPI.cancelAcceptance(id)
      fetchDonations()
    } catch (err) {
      console.error(err)
      alert("Error cancelling acceptance.")
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await donationAPI.updateStatus(id, newStatus)
      fetchDonations()
    } catch (err) {
      console.error(err)
      alert("Error updating status.")
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <HeartIcon className="w-10 h-10 text-indigo-600" />
            Donation Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Review citizen requests, accept tasks, and assign volunteers.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'pending' 
                ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'accepted' 
                ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My Accepted
          </button>
        </div>
      </div>

      {apiError && <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl font-medium">{apiError}</div>}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-500 font-medium">Fetching donations...</p>
          </div>
        ) : donations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {donations.map((donation) => {
              const status = statusConfig[donation.status] || statusConfig.Pending;
              return (
                <motion.div 
                  key={donation._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden group flex flex-col"
                >
                  <div className={`h-1.5 ${status.bg.replace('/10', '')}`} />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{donation.category}</span>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                           {donation.quantity} <span className="text-lg text-slate-500 font-medium">{donation.unit}</span>
                        </h3>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${status.bg} ${status.color}`}>
                        <status.icon className="w-3.5 h-3.5" />
                        {donation.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                      {donation.description || 'No additional description'}
                    </p>

                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">{donation.userId?.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{donation.contactDetails}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-500">
                        <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">
                           {donation.location?.address}, {donation.city}, {donation.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action FOOTER */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                    {donation.status === 'Rejected by Volunteer' && (
                       <div className="bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-200/50">
                          <p className="text-[10px] font-black text-rose-600 uppercase flex items-center gap-1 mb-1">
                             <ExclamationTriangleIcon className="w-3 h-3" /> Rejection Feedback
                          </p>
                          <p className="text-xs text-rose-700 dark:text-rose-400 italic font-medium">"{donation.volunteerFeedback}"</p>
                       </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                    {activeTab === 'pending' ? (
                       <button onClick={() => handleAccept(donation._id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm">
                           Accept & Assign Volunteer
                       </button>
                    ) : (
                       <>
                          {(donation.status === 'Accepted' || donation.status === 'Rejected by Volunteer') && (
                             <>
                                <button 
                                  onClick={() => { setSelectedDonation(donation); setIsAssignModalOpen(true); }} 
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                                >
                                   {donation.status === 'Rejected by Volunteer' ? 'Reassign Volunteer' : 'Assign Volunteer'}
                                </button>
                                <button onClick={() => handleCancelAcceptance(donation._id)} className="px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 font-bold py-2 rounded-xl transition-all text-xs">
                                   Cancel
                                </button>
                             </>
                          )}
                          {donation.status === 'Assigned' && (
                             <div className="w-full text-center py-2 text-amber-600 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 font-bold text-xs flex items-center justify-center gap-2">
                                <ClockIcon className="w-4 h-4" /> Awaiting Volunteer Acceptance
                             </div>
                          )}
                          {donation.status === 'In Process' && (
                             <button onClick={() => updateStatus(donation._id, 'Completed')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-all text-xs flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" /> Mark Completed
                             </button>
                          )}
                          {donation.status === 'Completed' && (
                             <div className="w-full text-center py-2 text-emerald-600 font-bold text-xs flex items-center justify-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" /> Finished
                             </div>
                          )}
                       </>
                    )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <HeartIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {activeTab === 'pending' ? 'No pending requests' : 'You have no accepted requests'}
            </h3>
            <p className="text-slate-500 mt-2">
              {activeTab === 'pending' ? 'Check back later for new citizen contributions.' : 'Go to Pending Requests to accept new assignments.'}
            </p>
          </div>
        )}
      </div>

      {/* Volunteer Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Assign Volunteer
                </h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Assign a registered volunteer from <span className="font-bold text-indigo-600">{selectedDonation?.city}</span> to pick up {selectedDonation?.quantity} {selectedDonation?.unit} of {selectedDonation?.category}.
                </p>

                {/* Nearby Volunteers */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Nearby Registered Volunteers</label>
                     <button onClick={searchNearbyVolunteers} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" /> Refresh List
                     </button>
                   </div>
                   
                   <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {searchingVolunteers ? (
                         <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                         </div>
                      ) : volunteers.length > 0 ? (
                         volunteers.map(v => (
                            <button 
                              key={v._id} 
                              type="button"
                              onClick={() => selectVolunteer(v)}
                              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                                selectedVolunteerId === v._id 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                            >
                               <div>
                                  <p className={`text-sm font-bold ${selectedVolunteerId === v._id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{v.name}</p>
                                  <p className={`text-[10px] ${selectedVolunteerId === v._id ? 'text-indigo-100' : 'text-slate-500'}`}>{v.phone || 'No phone'}</p>
                               </div>
                               <div className={`p-1.5 rounded-lg ${selectedVolunteerId === v._id ? 'bg-indigo-500' : 'bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600'}`}>
                                  <UserIcon className={`w-4 h-4 ${selectedVolunteerId === v._id ? 'text-white' : 'text-indigo-600'}`} />
                               </div>
                            </button>
                         ))
                      ) : (
                         <div className="text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500">No volunteers found in {selectedDonation?.city}</p>
                         </div>
                      )}
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-800"></span></div>
                   <div className="relative flex justify-center text-xs uppercase font-black text-slate-400"><span className="bg-white dark:bg-slate-900 px-2 tracking-widest">OR ENTER DETAILS</span></div>
                </div>

                <form onSubmit={handleSubmit(handleAssignSubmit)} className="space-y-4">
                  <FormField
                    label="Volunteer Name"
                    name="name"
                    register={register}
                    error={errors.name}
                    placeholder="e.g. John Doe"
                    icon={UserIcon}
                    required
                  />
                  
                  <FormField
                    label="Volunteer Contact Number"
                    name="contact"
                    register={register}
                    error={errors.contact}
                    placeholder="+91 9876543210"
                    icon={UserIcon}
                    required
                  />

                  <FormField
                    label="Expected Arrival/Completion"
                    name="expectedTime"
                    type="datetime-local"
                    register={register}
                    error={errors.expectedTime}
                    icon={ClockIcon}
                    required
                  />

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                      <PaperAirplaneIcon className="w-5 h-5 -rotate-45" /> Dispatch Volunteer Task
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NgoDonations
