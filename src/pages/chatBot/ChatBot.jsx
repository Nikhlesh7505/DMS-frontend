import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const starterMessage = {
  role: 'assistant',
  content: 'Hi! I\'m your DMS AI Assistant. Ask me anything about disaster response, alerts, resources, weather, or emergency management.',
}

export default function ChatBot() {
  const [messages, setMessages] = useState([starterMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      })
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }])
    } catch (error) {
      console.error(error)
      const serverMessage = error.response?.data?.error || 'Error connecting to backend'
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${serverMessage}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_4px_16px_rgba(99,102,241,0.4)]">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Assistant</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Powered by Groq · DMS Intelligence</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md'
                }`}>
                  {message.role === 'user'
                    ? <UserIcon className="h-4 w-4" />
                    : <SparklesIcon className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-600/40 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <SparklesIcon className="h-4 w-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600/40 rounded-2xl rounded-tl-sm px-4 py-3">
                <span className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-indigo-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">Thinking...</span>
                </span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-4">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about disaster management..."
              rows={1}
              className="flex-1 resize-none rounded-2xl bg-white dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600/40 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 dark:focus:ring-indigo-500/30 focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-all"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]"
            >
              {loading
                ? <ArrowPathIcon className="h-5 w-5 animate-spin" />
                : <PaperAirplaneIcon className="h-5 w-5" />}
            </motion.button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 text-center">
            AI responses are generated. Always verify critical information with official sources.
          </p>
        </div>
      </div>
    </div>
  )
}
