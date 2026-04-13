import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, UserPlusIcon } from '@heroicons/react/24/outline'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'citizen',
    organizationName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const userData = {
      name: formData.name,
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

    const result = await register(userData)
    
    if (result.success) {
      navigate('/login', {
        replace: true,
        state: {
          message: result.message || 'Registration successful. Please log in to continue.'
        }
      })
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 md:py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="card max-w-lg w-full relative z-10 p-6 sm:p-10 my-8 group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 rounded-[28px] to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition duration-500"></div>
        <div className="relative space-y-6">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="bg-white/40 dark:bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/60 dark:border-white/20 shadow-xl">
              <ShieldCheckIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Create Account
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-slate-600 dark:text-slate-400"
          >
            Or{' '}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
              sign in to existing account
            </Link>
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
        >
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl backdrop-blur-md overflow-hidden"
              >
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  className="form-input"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    // Allow control keys
                    if (
                      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                    ) return

                    // Block non-numeric keys
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault()
                    }
                  }}
                />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="role" className="form-label">Account Type</label>
              <select
                id="role"
                name="role"
                className="form-input cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="citizen">Citizen</option>
                <option value="ngo">NGO / Organization</option>
                {/* <option value="rescue_team">Rescue Team</option> */}
              </select>
            </div>

            <AnimatePresence>
              {(formData.role === 'ngo' || formData.role === 'rescue_team') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:col-span-2 overflow-hidden"
                >
                  <label htmlFor="organizationName" className="form-label">Organization Name</label>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    className="form-input"
                    placeholder="Organization name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    NGO and Rescue Team accounts require admin approval.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 w-full">
                  Create Account
                  <UserPlusIcon className="w-5 h-5" />
                </span>
              )}
            </button>
          </motion.div>
        </motion.form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register

