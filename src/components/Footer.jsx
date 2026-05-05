import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const footerLinks = {
  Platform: ["Dashboard", "Analytics", "Alerts", "Reports"],
  "For Users": ["Citizens", "Volunteers", "NGOs", "Admins"],
  Resources: ["Documentation", "API", "Community", "Blog"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const socials = ["𝕏", "in", "fb", "yt"];

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 border-t border-white/5 overflow-hidden">

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">

          {/* BRAND */}
          <div className="col-span-2">
            <motion.div
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.03 }}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 glow-pulse">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>

              <span className="text-white font-extrabold text-lg">
                Disaster
                <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  Shield
                </span>
              </span>
            </motion.div>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              A real-time disaster management platform empowering communities with AI-powered tools to respond faster and save more lives.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center glass border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-indigo-500/50 transition-colors"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          {/* LINKS */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {category}
              </h4>

              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 4 }}
                      className="text-gray-500 text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* DIVIDER */}
        <div className="h-px bg-white/5 mb-8" />

        {/* BOTTOM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-gray-600 text-xs">
            © 2025 DisasterShield. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-green-500 font-medium">
              All Systems Operational
            </span>
          </div>

          <p className="text-gray-600 text-xs">
            Built with ❤️ to protect communities
          </p>

        </div>

      </div>
    </footer>
  );
}