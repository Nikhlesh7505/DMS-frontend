import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '../contexts/AuthContext'
import { registerSchema } from '../utils/validationSchemas'
import FormField from '../components/common/FormField'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  KeyIcon,
  CheckCircleIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { authAPI } from '../services/api'

const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setLabel('')
      return
    }

    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    setStrength(score)
    const labels = ['', 'Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong']
    setLabel(labels[score])
  }, [password])

  if (!password) return null

  const getColor = () => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-amber-500'
    if (strength <= 4) return 'bg-emerald-500'
    return 'bg-indigo-500'
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-500">Security Strength</span>
        <span className={strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-amber-500' : 'text-emerald-500'}>
          {label}
        </span>
      </div>
      <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          className={`h-full ${getColor()}`}
        />
      </div>
    </div>
  )
}

const Register = () => {
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [serverOtp, setServerOtp] = useState('123456') // Mock server OTP
  
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [locating, setLocating] = useState(false)
  const [locationData, setLocationData] = useState({
    address: '',
    city: '',
    state: '',
    coordinates: { latitude: null, longitude: null }
  })

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: 'citizen',
      location: {
        address: '',
        city: '',
        state: '',
        coordinates: { latitude: null, longitude: null }
      }
    }
  })

  const handleGetLocation = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocationData(prev => ({
          ...prev,
          coordinates: { latitude, longitude }
        }))
        setValue('location.coordinates.latitude', latitude)
        setValue('location.coordinates.longitude', longitude)
        setLocating(false)
      },
      (error) => {
        setError('Location access denied. Please enter details manually.')
        setLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const role = watch('role')
  const password = watch('password')
  const lat = watch('location.coordinates.latitude')
  const lng = watch('location.coordinates.longitude')

  const onFirstStepSubmit = async (data) => {
    setError('')
    
    // Generate a random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setServerOtp(generatedOtp)
    
    try {
      setLoading(true)
      // Call our new backend endpoint to email the candidate OTP
      await authAPI.sendOtp({ email: data.email, otp: generatedOtp, name: data.name })
      setStep(2)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP to your email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    const data = watch()
    try {
      // Re-send the existing serverOtp
      await authAPI.sendOtp({ email: data.email, otp: serverOtp, name: data.name })
      // Notice: If using real email, could alert "Email Sent!"
    } catch (err) {
      setError('Failed to resend OTP.')
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleFinalSubmit = async () => {
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setError('Please enter the full 6-digit verification code')
      return
    }

    // Simulate OTP verification logic
    if (otpValue !== serverOtp) {
      setError(`Invalid verification code. Please check the alert we sent you.`)
      return
    }

    setLoading(true)
    setError('')

    const formData = watch()
    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role
    }

    if ((formData.role === 'ngo' || formData.role === 'rescue_team') && formData.organizationName) {
      userData.organization = {
        name: formData.organizationName,
        type: formData.role === 'ngo' ? 'ngo' : 'government'
      }
    }

    if (formData.location) {
      userData.location = formData.location
    }

    const result = await registerUser(userData)
    
    if (result.success) {
      setStep(3) // Success step
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Registration successful. Your account is pending admin approval. You will be notified once approved.' }
        })
      }, 5000)
    } else {
      setError(result.message)
      setStep(1) // Back to first step on error
    }
    
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-lg w-full relative z-10 p-6 sm:p-10 my-8 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20"
      >
        <div className="relative space-y-6">
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex justify-center"
            >
              <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-600/20 shadow-lg">
                <ShieldCheckIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
            </motion.div>

            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {step === 1 ? 'Join the Network' : step === 2 ? 'Verify Identity' : 'Welcome Aboard!'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {step === 1 ? 'Create your account to help or get help.' : step === 2 ? 'We sent a 6-digit code to your phone.' : 'Your account has been created successfully.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onFirstStepSubmit)}
                className="space-y-5"
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    name="name"
                    register={register}
                    error={errors.name}
                    placeholder="John Doe"
                    icon={UserIcon}
                    required
                  />

                  <FormField
                    label="Username"
                    name="username"
                    register={register}
                    error={errors.username}
                    placeholder="john_doe"
                    icon={UserIcon}
                    required
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email}
                    placeholder="john@example.com"
                    icon={EnvelopeIcon}
                    required
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    register={register}
                    error={errors.phone}
                    placeholder="+91XXXXXXXXXX"
                    icon={PhoneIcon}
                    required
                  />

                  <div className="space-y-2">
                    <label className="form-label">Account Type</label>
                    <div className="relative">
                      <select
                        {...register('role')}
                        className="form-input w-full appearance-none pr-10"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="ngo">NGO / Organization</option>
                        <option value="rescue_team">Rescue Team</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                  </div>

                  {(role === 'ngo' || role === 'rescue_team') && (
                    <motion.div 
                      className="md:col-span-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <FormField
                        label="Organization Name"
                        name="organizationName"
                        register={register}
                        error={errors.organizationName}
                        placeholder="Helping Hands Foundation"
                        icon={BuildingOfficeIcon}
                        required
                      />
                    </motion.div>
                  )}

                  <div className="md:col-span-2 space-y-2">
                    <label className="form-label">Password</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`form-input w-full pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>}
                    <PasswordStrength password={password} />
                  </div>

                  <FormField
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    register={register}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                    icon={KeyIcon}
                    required
                    className="md:col-span-2"
                  />

                  {/* Location Section */}
                  <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-indigo-500" />
                        Location Information
                      </h3>
                      {/* <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locating}
                        className="btn bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 py-1.5 px-3 text-xs flex items-center gap-2 border border-indigo-200/50"
                      >
                        {locating ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <MapPinIcon className="w-3.5 h-3.5" />}
                        {locating ? 'Detecting...' : 'Detect My Location'}
                      </button> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Address"
                        name="location.address"
                        register={register}
                        error={errors.location?.address}
                        placeholder="Street, Housing Society"
                        icon={MapPinIcon}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          label="City"
                          name="location.city"
                          register={register}
                          error={errors.location?.city}
                          placeholder="e.g. Mumbai"
                        />
                        <FormField
                          label="State"
                          name="location.state"
                          register={register}
                          error={errors.location?.state}
                          placeholder="e.g. MH"
                        />
                      </div>

                      {/* Read-only Coordinates if detected */}
                      {/* <div className="grid grid-cols-2 gap-3 opacity-80">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500">Latitude</label>
                          <div className="form-input text-xs bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed h-10 flex items-center px-3 text-slate-600 dark:text-slate-400">
                            {lat ? lat.toFixed(6) : locating ? 'Detecting...' : 'Not detected'}
                          </div>
                          <input type="hidden" {...register('location.coordinates.latitude')} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-500">Longitude</label>
                          <div className="form-input text-xs bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed h-10 flex items-center px-3 text-slate-600 dark:text-slate-400">
                            {lng ? lng.toFixed(6) : locating ? 'Detecting...' : 'Not detected'}
                          </div>
                          <input type="hidden" {...register('location.coordinates.longitude')} />
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  Verify via Phone
                  <UserPlusIcon className="w-5 h-5" />
                </motion.button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold text-center">{error}</p>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-500">
                    Didn't receive code? <button onClick={handleResendOtp} className="text-indigo-600 font-bold hover:underline">Resend OTP</button>
                  </p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      className="flex-[2] btn btn-primary py-3 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'Confirm & Register'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <CheckCircleIcon className="w-20 h-20 text-emerald-500" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Account Created!</h3>
                <p className="text-slate-500">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account? {' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
