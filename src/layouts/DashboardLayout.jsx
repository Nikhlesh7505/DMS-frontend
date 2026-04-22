import React, { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  UsersIcon,
  WrenchIcon,
  CloudIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

const MotionLink = motion.create(Link)

// ── Sidebar Chatbot Bar ──────────────────────────────────────────────────────
const SidebarChatbot = () => {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! How can I assist you today?' }
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, expanded])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const allMessages = [
        ...messages.map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: text },
      ]
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, no response.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-3 mb-4 rounded-[18px] border border-indigo-200/40 dark:border-indigo-500/20 bg-white/50 dark:bg-indigo-950/30 backdrop-blur-md shadow-[0_2px_16px_rgba(99,102,241,0.08)] overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10 transition-colors"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
          <SparklesIcon className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="flex-1 text-left text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          AI Assistant
        </span>
        {expanded
          ? <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          : <ChevronUpIcon className="h-4 w-4 text-slate-400" />}
      </button>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="chat-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 220, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex flex-col overflow-hidden border-t border-indigo-100/40 dark:border-indigo-500/15"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1 space-y-2 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-700" style={{ maxHeight: 160 }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-[12px] px-3 py-2 text-[11.5px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-sm'
                        : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border border-slate-100/60 dark:border-slate-700/50 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/70 dark:bg-slate-800/70 border border-slate-100/60 dark:border-slate-700/50 rounded-[12px] rounded-bl-sm px-3 py-2">
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="block w-1.5 h-1.5 rounded-full bg-indigo-400"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask something…"
                className="flex-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 dark:focus:ring-indigo-500/40 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-link to full chatbot page */}
      {!expanded && (
        <button
          onClick={() => { navigate('/dashboard/chatbot') }}
          className="w-full text-center text-[10.5px] text-indigo-400 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 pb-2.5 transition-colors"
        >
          Open full chat →
        </button>
      )}
    </div>
  )
}

// ── Main Layout ──────────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: user?.role === 'admin' ? 'Alerts' : 'My Alerts', href: '/dashboard/alerts', icon: BellAlertIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
    ]

    if (user?.role === 'admin') {
      return [
        ...baseNavigation,
        { name: 'Disasters', href: '/dashboard/disasters', icon: ExclamationTriangleIcon },
        { name: 'Donations', href: '/dashboard/donation', icon: HeartIcon },
        { name: 'Live Map', href: '/dashboard/tasks', icon: WrenchIcon },
        { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
        { name: 'Weather', href: '/dashboard/weather', icon: CloudIcon },
        { name: 'ChatBot', href: '/dashboard/chatbot', icon: ChatBubbleLeftRightIcon },
      ]
    }

    if (user?.role === 'ngo' || user?.role === 'rescue_team') {
      return [
        ...baseNavigation,
        { name: 'Disasters', href: '/dashboard/disasters', icon: ExclamationTriangleIcon },
        { name: 'Emergency Requests', href: '/dashboard/emergency', icon: ClipboardDocumentListIcon },
        { name: 'Donations', href: '/dashboard/donation', icon: HeartIcon },
        { name: 'Live Map', href: '/dashboard/tasks', icon: WrenchIcon },
        { name: 'Weather', href: '/dashboard/weather', icon: CloudIcon },
      ]
    }

    if (user?.role === 'volunteer') {
      return [
        ...baseNavigation,
        { name: 'Donations', href: '/dashboard/donation', icon: HeartIcon },
        { name: 'Weather', href: '/dashboard/weather', icon: CloudIcon },
      ]
    }

    return [
      ...baseNavigation,
      { name: 'Disasters', href: '/dashboard/disasters', icon: ExclamationTriangleIcon },
      { name: 'My Requests', href: '/dashboard/emergency', icon: ClipboardDocumentListIcon },
      { name: 'Donations', href: '/dashboard/donation', icon: HeartIcon },
      { name: 'Weather', href: '/dashboard/weather', icon: CloudIcon },
    ]
  }

  const navigation = getNavigation()

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

  const NavLinks = ({ onClick }) => (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex-1 space-y-1 overflow-y-auto px-4 py-6"
    >
      {navigation.map((item) => (
        <MotionLink
          variants={itemVariants}
          whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.4)' }}
          whileTap={{ scale: 0.97 }}
          key={item.name}
          to={item.href}
          className={`flex items-center rounded-[16px] px-4 py-3 text-[14px] font-semibold transition-all duration-300 mb-[4px] relative overflow-hidden group ${
            isActive(item.href)
              ? 'text-indigo-600 dark:text-indigo-300'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          onClick={onClick}
        >
          {isActive(item.href) && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-400/20 rounded-[16px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            />
          )}
          <item.icon
            className={`mr-3 h-[22px] w-[22px] relative z-10 transition-transform group-hover:scale-110 ${
              isActive(item.href)
                ? 'text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                : 'opacity-80'
            }`}
          />
          <span className="relative z-10">{item.name}</span>
        </MotionLink>
      ))}
    </motion.nav>
  )

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500 overflow-hidden relative">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white/30 dark:bg-black/30 backdrop-blur-xl border-r border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] lg:hidden flex flex-col"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/20 dark:border-white/10 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">DMS</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-slate-600 dark:text-slate-300 hover:bg-white/20"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Mobile nav links */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 mt-4 px-3 flex flex-col gap-1 overflow-y-auto"
        >
          {navigation.map((item) => (
            <MotionLink
              variants={itemVariants}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.4)' }}
              whileTap={{ scale: 0.98 }}
              key={item.name}
              to={item.href}
              className={`flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-white/40 dark:bg-white/10 text-blue-700 dark:text-blue-400 shadow-sm border border-white/50 dark:border-white/20'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </MotionLink>
          ))}
        </motion.nav>

        {/* Mobile chatbot bar */}
        <div className="mt-auto">
          <SidebarChatbot />
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[280px] lg:flex-col z-40">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-1 flex-col border-r border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] isolate"
        >
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 pt-2">
            <Link to="/dashboard" className="flex items-center gap-3 w-full group">
              <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-2.5 rounded-[14px] shadow-[0_4px_16px_rgba(99,102,241,0.4)] group-hover:shadow-[0_4px_24px_rgba(99,102,241,0.6)] transition-all">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-[22px] font-bold tracking-tight text-slate-800 dark:text-white">DMS</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 font-semibold opacity-80">
                  Management System
                </div>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <NavLinks />

          {/* ── Chatbot bar pinned to bottom ── */}
          <div className="mt-auto">
            <SidebarChatbot />
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[280px] flex flex-col min-h-screen">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="sticky top-6 z-30 mx-4 sm:mx-6 lg:mx-8 rounded-[24px] border border-slate-200/60 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
        >
          <div className="flex h-[68px] items-center justify-between px-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl p-2 bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/20 text-slate-600 dark:text-slate-300 lg:hidden shadow-sm backdrop-blur-md"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </motion.button>

            <div className="ml-auto flex items-center gap-4">
              <div className="hidden text-right sm:block pr-2">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 dark:text-indigo-400">{user?.role || 'member'}</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                <Link
                  to="/dashboard/profile"
                  className="block rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-white/60 dark:border-white/20 p-1 shadow-inner backdrop-blur-md group-hover:border-indigo-400/50 transition-colors"
                >
                  <UserCircleIcon className="h-9 w-9 text-slate-600 dark:text-slate-300" />
                </Link>
              </motion.div>
              <div className="w-px h-8 bg-black/10 dark:bg-white/10 mx-1" />
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="rounded-full bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/10 p-2.5 text-slate-500 dark:text-slate-400 shadow-sm transition-all hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
