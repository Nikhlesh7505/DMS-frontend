import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '../contexts/AuthContext'
import { loginSchema } from '../utils/validationSchemas'
import FormField from '../components/common/FormField'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const successMessage = location.state?.message || ''

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur'
  })

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)

    const result = await login(data.email, data.password)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card max-w-md w-full relative z-10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20"
      >
        <div className="relative space-y-8">
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
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl"
                >
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">{successMessage}</p>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                placeholder="you@example.com"
                icon={EnvelopeIcon}
                required
              />

              <div className="space-y-2">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`form-input w-full pl-10 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account? {' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
