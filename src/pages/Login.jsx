import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const successMessage = location.state?.message || ''

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background is styled in index.css body, but we can add an extra glow here if wanted */}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="card max-w-md w-full relative z-10 p-8 sm:p-10 group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 rounded-[28px] to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition duration-500"></div>
        <div className="relative space-y-8">
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
            Welcome Back
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-slate-600 dark:text-slate-400"
          >
            Or{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
              create a new account
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
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/20 border border-green-500/30 p-3 rounded-xl backdrop-blur-md overflow-hidden"
              >
                <p className="text-green-700 dark:text-green-400 text-sm font-medium">{successMessage}</p>
              </motion.div>
            )}
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

          <div className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="form-input pr-12"
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 w-full">
                  Sign in
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </span>
              )}
            </button>
          </motion.div>
        </motion.form>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
