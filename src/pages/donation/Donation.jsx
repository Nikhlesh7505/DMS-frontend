import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { 
  HeartIcon, 
  TruckIcon, 
  ClipboardDocumentCheckIcon, 
  ClockIcon, 
  CheckCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { donationAPI, utilsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { donationSchema } from '../../utils/validationSchemas'
import FormField from '../../components/common/FormField'
// import { COUNTRIES, COUNTRY_CITY_MAP } from '../../utils/countryCity'

const statusConfig = {
  Pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ClockIcon },
  Accepted: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircleIcon },
  'In Process': { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: TruckIcon },
  Completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircleIcon },
  Rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircleIcon },
  Expired: { color: 'text-slate-500', bg: 'bg-slate-500/10', icon: ClockIcon },
}

const CATEGORY_UNIT_MAP = {
  clothes:   { label: 'Number of Pieces', unit: 'pieces', placeholder: 'e.g. 25' },
  food:      { label: 'Weight (kg)',      unit: 'kg',     placeholder: 'e.g. 10' },
  medicines: { label: 'Units / Boxes',    unit: 'units',  placeholder: 'e.g. 5' },
  others:    { label: 'Quantity',         unit: 'units',  placeholder: 'e.g. 3' },
}

const Donation = () => {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [loadingGeo, setLoadingGeo] = useState({ countries: false, states: false, cities: false })

  const getFormValues = (donation = null) => ({
    country: donation?.country || '',
    state: donation?.state || '',
    city: donation?.city || '',
    category: donation?.category || 'clothes',
    quantity: donation?.quantity || '',
    description: donation?.description || '',
    contactDetails: donation?.contactDetails || user?.phone?.replace(/\D/g, '').slice(-10) || '',
    pickupLocation: {
      address: donation?.location?.address || user?.location?.address || '',
    }
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(donationSchema),
    defaultValues: getFormValues(),
    mode: 'onChange'
  })

  const category = watch('category') || 'clothes'
  const selectedCountry = watch('country')
  const selectedState = watch('state')
  
  const currentUnitConfig = CATEGORY_UNIT_MAP[category] || CATEGORY_UNIT_MAP.others

  useEffect(() => {
    fetchDonations()
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      setLoadingGeo(prev => ({ ...prev, countries: true }))
      const res = await utilsAPI.getCountries()
      if (res.data.success) {
        setCountries(res.data.data.sort((a, b) => a.name.localeCompare(b.name)))
      }
    } catch (err) {
      console.error('Error fetching countries:', err)
    } finally {
      setLoadingGeo(prev => ({ ...prev, countries: false }))
    }
  }

  // Handle Country Change
  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry)
      setCities([])
      setValue('state', '')
      setValue('city', '')
    }
  }, [selectedCountry])

  const fetchStates = async (countryName) => {
    try {
      setLoadingGeo(prev => ({ ...prev, states: true }))
      const res = await utilsAPI.getStates(countryName)
      if (res.data.success) {
        setStates(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching states:', err)
    } finally {
      setLoadingGeo(prev => ({ ...prev, states: false }))
    }
  }

  // Handle State Change
  useEffect(() => {
    if (selectedCountry && selectedState) {
      fetchCities(selectedCountry, selectedState)
      setValue('city', '')
    }
  }, [selectedState])

  const fetchCities = async (countryName, stateName) => {
    try {
      setLoadingGeo(prev => ({ ...prev, cities: true }))
      const res = await utilsAPI.getCities(countryName, stateName)
      if (res.data.success) {
        setCities(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    } finally {
      setLoadingGeo(prev => ({ ...prev, cities: false }))
    }
  }

  useEffect(() => {
    if (!isFormOpen) {
      reset(getFormValues(editingDonation))
    }
  }, [user, isFormOpen, editingDonation, reset])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const res = await donationAPI.getMy()
      setDonations(res.data.data.donations)
    } catch (err) {
      console.error('Error fetching donations:', err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setSubmitError('')

      const contactDetails = editingDonation?.contactDetails || user?.phone || ''
      if (!contactDetails) {
        setSubmitError('Please add a phone number in your profile before broadcasting a donation.')
        return
      }

      setSubmitting(true)

      const payload = {
        country: data.country,
        state: data.state,
        city: data.city,
        category: data.category,
        quantity: Number(data.quantity),
        unit: CATEGORY_UNIT_MAP[data.category]?.unit || 'units',
        description: data.description.trim(),
        contactDetails: data.contactDetails,
        location: {
          address: data.pickupLocation.address.trim(),
        },
      }

      if (editingDonation) {
        await donationAPI.update(editingDonation._id, payload)
      } else {
        await donationAPI.create(payload)
      }

      setIsFormOpen(false)
      setEditingDonation(null)
      await fetchDonations()
      reset(getFormValues())
    } catch (err) {
      console.error('Error submitting donation:', err)
      setSubmitError(
        err.response?.data?.errors?.[0] ||
        err.response?.data?.message ||
        'Unable to broadcast the donation right now. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (donation) => {
    setSubmitError('')
    setEditingDonation(donation)
    reset(getFormValues(donation))
    setIsFormOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this donation?')) {
      try {
        await donationAPI.delete(id)
        fetchDonations()
      } catch (err) {
        console.error('Error deleting donation:', err)
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <HeartIcon className="w-10 h-10 text-rose-500" />
            Impact Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage your contributions and help communities recover.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSubmitError('')
            setEditingDonation(null)
            reset(getFormValues())
            setIsFormOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircleIcon className="w-5 h-5" />
          New Donation
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="History" value={donations.length} icon={ClipboardDocumentCheckIcon} color="bg-blue-500" />
          <StatCard label="Active" value={donations.filter(d => ['Pending', 'Accepted', 'In Process'].includes(d.status)).length} icon={ClockIcon} color="bg-amber-500" />
          <StatCard label="Success" value={donations.filter(d => d.status === 'Completed').length} icon={CheckCircleIcon} color="bg-emerald-500" />
          <StatCard label="Transit" value={donations.filter(d => d.status === 'In Process').length} icon={TruckIcon} color="bg-indigo-500" />
        </div>

        <div className="lg:col-span-3">
          <div className="card shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-xl font-bold">Contribution History</h2>
              <button onClick={fetchDonations} className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center h-64 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-500 font-medium tracking-wide">Loading history...</p>
                </div>
              ) : donations.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resource Type</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volume</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {donations.map((donation) => {
                      const status = statusConfig[donation.status] || statusConfig.Pending;
                      const isExpanded = expandedId === donation._id;
                      return (
                        <React.Fragment key={donation._id}>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : donation._id)}>
                            <td className="px-6 py-4">
                              <span className="capitalize font-bold text-slate-900 dark:text-white">{donation.category}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                              {donation.quantity} {donation.unit}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                              {donation.city}, {donation.country}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.bg} ${status.color}`}>
                                <status.icon className="w-3 h-3" />
                                {donation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {donation.status === 'Pending' && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(donation); }} className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all">
                                      <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(donation._id); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Volunteer details dropdown row */}
                          <AnimatePresence>
                            {isExpanded && donation.status !== 'Pending' && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50/50 dark:bg-slate-800/20"
                              >
                                <td colSpan={5} className="px-6 py-4">
                                  <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 p-5">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                      <TruckIcon className="w-5 h-5 text-indigo-500" /> Handling Organization
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Organization</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{donation.assignedNGO?.name || 'Assigned to NGO'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Volunteer Info</p>
                                        {donation.volunteerDetails?.name ? (
                                          <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{donation.volunteerDetails.name}</span>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-slate-500 italic">Not yet assigned</p>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Expected Pickup</p>
                                        {donation.volunteerDetails?.expectedTime ? (
                                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                                            <ClockIcon className="w-4 h-4" />
                                            {new Date(donation.volunteerDetails.expectedTime).toLocaleString()}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-slate-500 italic">Pending schedule</p>
                                        )}
                                      </div>
                                    </div>
                                    {donation.adminFeedback && (
                                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg text-sm text-red-600 dark:text-red-400">
                                        <strong>Admin Feedback:</strong> {donation.adminFeedback}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center">
                   <div className="bg-rose-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HeartIcon className="w-12 h-12 text-rose-500" />
                   </div>
                   <h3 className="text-xl font-bold">No contributions found</h3>
                   <p className="text-slate-500 mt-2">Be the first to help your community today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{editingDonation ? 'Update Contribution' : 'New Contribution'}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Disaster Recovery Network</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-rose-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* Location Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Country <span className="text-red-500">*</span></label>
                    <select
                      {...register('country')}
                      disabled={loadingGeo.countries}
                      className={`form-input w-full ${errors.country ? 'border-red-500' : ''} disabled:opacity-50`}
                    >
                      <option value="">{loadingGeo.countries ? 'Loading...' : 'Select Country'}</option>
                      {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">State <span className="text-red-500">*</span></label>
                    <select
                      {...register('state')}
                      disabled={!selectedCountry || loadingGeo.states}
                      className={`form-input w-full ${errors.state ? 'border-red-500' : ''} disabled:opacity-50`}
                    >
                      <option value="">{loadingGeo.states ? 'Loading...' : selectedCountry ? 'Select State' : 'Select Country'}</option>
                      {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">City <span className="text-red-500">*</span></label>
                    <select
                      {...register('city')}
                      disabled={!selectedState || loadingGeo.cities}
                      className={`form-input w-full ${errors.city ? 'border-red-500' : ''} disabled:opacity-50`}
                    >
                      <option value="">{loadingGeo.cities ? 'Loading...' : selectedState ? 'Select City' : 'Select State'}</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Square3Stack3DIcon className="w-4 h-4 text-indigo-500" /> Resource Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['clothes', 'food', 'medicines', 'others'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('category', type, { shouldValidate: true })}
                        className={`px-4 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                          category === type 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    {currentUnitConfig.label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('quantity')}
                      placeholder={currentUnitConfig.placeholder}
                      className={`form-input w-full pr-16 ${errors.quantity ? 'border-red-500' : ''}`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-sm font-medium">
                      {currentUnitConfig.unit}
                    </div>
                  </div>
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                </div>

                <FormField
                   label="Additional Notes"
                   name="description"
                   register={register}
                   error={errors.description}
                    placeholder="e.g., Expiry dates, size details, or specific instructions..."
                    multiline={true}
                    rows={3}
                    icon={DocumentTextIcon}
                    required
                />

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact & Logistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Contact Number (10 digits)"
                      name="contactDetails"
                      register={register}
                      error={errors.contactDetails}
                      placeholder="e.g. 9876543210"
                      icon={PhoneIcon}
                      required
                    />
                    <FormField
                      label="Pickup Address"
                      name="pickupLocation.address"
                      register={register}
                      error={errors.pickupLocation?.address}
                      placeholder="Flat no, Building"
                      icon={MapPinIcon}
                      required
                    />
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-3">
                  {submitError && (
                    <p className="mr-auto max-w-sm text-sm font-semibold text-rose-500">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError('')
                      setIsFormOpen(false)
                    }}
                    className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all"
                  >
                    {submitting ? 'Sending...' : editingDonation ? 'Verify & Update' : 'Broadcast Contribution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="card shadow-md flex items-center justify-between p-5 border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 leading-none">{value}</h3>
    </div>
    <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
)

export default Donation
