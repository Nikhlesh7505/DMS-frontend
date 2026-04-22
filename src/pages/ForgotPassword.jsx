import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import FormField from '../components/common/FormField'
import { authAPI } from '../services/api'
import {
  forgotPasswordEmailSchema,
  forgotPasswordResetSchema,
  recoverEmailByPhoneSchema,
  recoverEmailByUsernameSchema
} from '../utils/validationSchemas'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'email' ? 'email' : 'password')
  const [step, setStep] = useState(1)
  const [recoverMethod, setRecoverMethod] = useState('phone')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [recoveringEmail, setRecoveringEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [recoveredEmail, setRecoveredEmail] = useState('')

  useEffect(() => {
    setMode(searchParams.get('mode') === 'email' ? 'email' : 'password')
  }, [searchParams])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setSearchParams(nextMode === 'email' ? { mode: 'email' } : {}, { replace: true })
  }

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    setValue: setEmailRequestValue,
    formState: { errors: emailErrors }
  } = useForm({
    resolver: yupResolver(forgotPasswordEmailSchema),
    mode: 'onBlur'
  })

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    formState: { errors: resetErrors }
  } = useForm({
    resolver: yupResolver(forgotPasswordResetSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: ''
    }
  })

  const {
    register: registerRecoveryPhone,
    handleSubmit: handleSubmitRecoveryPhone,
    formState: { errors: recoveryPhoneErrors }
  } = useForm({
    resolver: yupResolver(recoverEmailByPhoneSchema),
    mode: 'onBlur'
  })

  const {
    register: registerRecoveryUsername,
    handleSubmit: handleSubmitRecoveryUsername,
    formState: { errors: recoveryUsernameErrors }
  } = useForm({
    resolver: yupResolver(recoverEmailByUsernameSchema),
    mode: 'onBlur'
  })

  const handleRequestOtp = async ({ email }) => {
    try {
      setRequestingOtp(true)
      const response = await authAPI.forgotPassword(email)

      setSubmittedEmail(email)
      setResetValue('email', email, { shouldValidate: true })
      setEmailRequestValue('email', email, { shouldValidate: true })
      setStep(2)

      const otpFromServer = response?.data?.data?.devOtp
      setDevOtp(otpFromServer || '')

      toast.success(response?.data?.message || 'OTP sent to your email.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to send OTP. Please try again.'
      toast.error(message)
    } finally {
      setRequestingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    if (!submittedEmail) return

    try {
      setResendingOtp(true)
      const response = await authAPI.forgotPassword(submittedEmail)
      const otpFromServer = response?.data?.data?.devOtp
      setDevOtp(otpFromServer || '')
      toast.success(response?.data?.message || 'OTP resent successfully.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to resend OTP. Please try again.'
      toast.error(message)
    } finally {
      setResendingOtp(false)
    }
  }

  const handleResetPassword = async (data) => {
    try {
      setResettingPassword(true)
      await authAPI.resetPasswordWithOtp({
        email: data.email,
        otp: data.otp,
        password: data.password,
        confirmPassword: data.confirmPassword
      })

      toast.success('Password reset successful. Please login with your new password.')
      navigate('/login', {
        state: { message: 'Password reset successful. You can now log in.' }
      })
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to reset password. Please try again.'
      toast.error(message)
    } finally {
      setResettingPassword(false)
    }
  }

  const handleRecoverEmail = async (payload) => {
    try {
      setRecoveringEmail(true)
      const response = await authAPI.recoverEmail(payload)
      const email = response?.data?.data?.email || ''

      setRecoveredEmail(email)
      toast.success(response?.data?.message || 'Email recovered successfully.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to recover email. Please try again.'
      toast.error(message)
      setRecoveredEmail('')
    } finally {
      setRecoveringEmail(false)
    }
  }

  const useRecoveredEmailForReset = () => {
    if (!recoveredEmail) return
    switchMode('password')
    setStep(1)
    setSubmittedEmail(recoveredEmail)
    setEmailRequestValue('email', recoveredEmail, { shouldValidate: true })
    setResetValue('email', recoveredEmail, { shouldValidate: true })
  }

  const title = mode === 'email' ? 'Find My Email' : 'Forgot Password'
  const subtitle = mode === 'email'
    ? 'Recover your registered email using your phone number or username.'
    : step === 1
      ? 'Enter your registered email to receive OTP.'
      : 'Enter OTP and set your new password.'

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="card max-w-md w-full relative z-10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-600/20 shadow-lg">
              <ShieldCheckIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 p-1">
          <button
            type="button"
            onClick={() => switchMode('password')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              mode === 'password'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Reset Password
          </button>
          <button
            type="button"
            onClick={() => switchMode('email')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              mode === 'email'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Find Email
          </button>
        </div>

        {mode === 'password' ? (
          step === 1 ? (
            <form onSubmit={handleSubmitEmail(handleRequestOtp)} className="space-y-6">
              <FormField
                label="Email"
                name="email"
                type="email"
                register={registerEmail}
                error={emailErrors.email}
                placeholder="you@example.com"
                icon={EnvelopeIcon}
                required
              />

              <button
                type="submit"
                disabled={requestingOtp}
                className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                {requestingOtp ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitReset(handleResetPassword)} className="space-y-5">
              <FormField
                label="Email"
                name="email"
                type="email"
                register={registerReset}
                error={resetErrors.email}
                icon={EnvelopeIcon}
                readOnly
                className="opacity-90"
              />

              <FormField
                label="OTP"
                name="otp"
                type="text"
                register={registerReset}
                error={resetErrors.otp}
                placeholder="Enter 6-digit OTP"
                icon={KeyIcon}
                required
              />

              <div className="space-y-2">
                <label className="form-label" htmlFor="new-password">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    {...registerReset('password')}
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    className={`form-input w-full pl-10 pr-12 ${resetErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {resetErrors.password && <p className="text-xs text-red-500 font-medium mt-1">{resetErrors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="form-label" htmlFor="confirm-password">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    {...registerReset('confirmPassword')}
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className={`form-input w-full pl-10 pr-12 ${resetErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {resetErrors.confirmPassword && <p className="text-xs text-red-500 font-medium mt-1">{resetErrors.confirmPassword.message}</p>}
              </div>

              {devOtp && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  <p className="text-amber-700 dark:text-amber-300 text-xs font-medium">
                    Development OTP (SMTP not configured): <span className="font-bold">{devOtp}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={resettingPassword}
                className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center"
              >
                {resettingPassword ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline disabled:opacity-50"
                >
                  {resendingOtp ? 'Resending...' : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Change Email
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/70 p-1">
              <button
                type="button"
                onClick={() => setRecoverMethod('phone')}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  recoverMethod === 'phone'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Phone Number
              </button>
              <button
                type="button"
                onClick={() => setRecoverMethod('username')}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  recoverMethod === 'username'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Username
              </button>
            </div>

            {recoverMethod === 'phone' ? (
              <form onSubmit={handleSubmitRecoveryPhone((data) => handleRecoverEmail(data))} className="space-y-5">
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  register={registerRecoveryPhone}
                  error={recoveryPhoneErrors.phone}
                  placeholder="+91XXXXXXXXXX"
                  icon={PhoneIcon}
                  required
                />

                <button
                  type="submit"
                  disabled={recoveringEmail}
                  className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center"
                >
                  {recoveringEmail ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Recover Email'
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSubmitRecoveryUsername((data) =>
                  handleRecoverEmail({ username: data.username.trim().replace(/^@+/, '').toLowerCase() })
                )}
                className="space-y-5"
              >
                <FormField
                  label="Username"
                  name="username"
                  type="text"
                  register={registerRecoveryUsername}
                  error={recoveryUsernameErrors.username}
                  placeholder="john_doe"
                  icon={UserIcon}
                  required
                />

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If your account was created before usernames were added, use phone recovery instead.
                </p>

                <button
                  type="submit"
                  disabled={recoveringEmail}
                  className="btn btn-primary w-full py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center"
                >
                  {recoveringEmail ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Recover Email'
                  )}
                </button>
              </form>
            )}

            {recoveredEmail && (
              <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Recovered Email
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {recoveredEmail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={useRecoveredEmailForReset}
                  className="w-full rounded-xl bg-white/80 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-300 border border-white/60 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  Use This Email To Reset Password
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          Remember your account details?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
