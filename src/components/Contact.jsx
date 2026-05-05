import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const contacts = [
  { icon: PhoneIcon, label: "Emergency Hotline", value: "112", color: "text-red-400" },
  { icon: EnvelopeIcon, label: "Email Support", value: "nikhileshkm956@gmail.com", color: "text-indigo-400" },
  { icon: MapPinIcon, label: "Headquarters", value: "Bareilly, Uttar Pradesh, India", color: "text-green-400" },
];

export default function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sent, setSent] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", type: "Report Disaster", message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Block unauthenticated users
    if (!isAuthenticated) {
      setBlocked(true);
      return;
    }

    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", type: "Report Disaster", message: "" });
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-28 bg-gray-950 overflow-hidden scroll-mt-20"
    >
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Get In Touch
          </span>
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="mt-5 text-gray-400 max-w-xl mx-auto text-lg">
            Report disasters, request emergency help, or reach out for support
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {contacts.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 glass border border-white/8 p-5 rounded-2xl cursor-default"
                >
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</div>
                    <div className="text-white font-semibold mt-0.5">{c.value}</div>
                  </div>
                </motion.div>
              );
            })}

            {/* EMERGENCY pulse */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 rgba(239,68,68,0)",
                  "0 0 24px rgba(239,68,68,0.4)",
                  "0 0 0 rgba(239,68,68,0)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="glass border border-red-500/30 p-5 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Emergency Active</span>
              </div>
              <p className="text-gray-400 text-sm">
                Heavy rainfall alert issued for Northern regions. Response teams deployed.
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="glass-strong border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Send a Report or Request</h3>

              {/* ── SUCCESS state ── */}
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <div className="text-green-400 text-xl font-bold">Message Sent!</div>
                  <div className="text-gray-400 mt-2">We'll respond within minutes.</div>
                </motion.div>

              /* ── BLOCKED state (not logged in) ── */
              ) : blocked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 flex flex-col items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <LockClosedIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white text-xl font-bold mb-2">Registration Required</div>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      You need a free account to send reports or emergency requests on DisasterShield.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => navigate('/register')}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Create Free Account
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2.5 border border-white/15 text-gray-300 text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                  <button
                    onClick={() => setBlocked(false)}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors mt-1"
                  >
                    ← Back to form
                  </button>
                </motion.div>

              /* ── FORM state ── */
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    <option value="Report Disaster">🚨 Report Disaster</option>
                    <option value="Request Help">🆘 Request Emergency Help</option>
                    <option value="Volunteer">🤝 Volunteer Registration</option>
                    <option value="NGO">🏢 NGO Partnership</option>
                    <option value="General">💬 General Inquiry</option>
                  </select>

                  <textarea
                    rows={4} required value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe the situation..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Send Message
                  </button>

                  {/* Subtle hint for guests */}
                  {!isAuthenticated && (
                    <p className="text-center text-xs text-gray-600">
                      Submitting requires a free account.{" "}
                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Register here
                      </button>
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}