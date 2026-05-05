import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheckIcon,
  BellAlertIcon,
  CloudIcon,
  UsersIcon,
  TruckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    icon: CloudIcon,
    title: "Real-time Weather Monitoring",
    description:
      "Continuously tracks weather conditions across multiple regions to detect early signs of natural disasters.",
    tag: "LIVE",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    glow: "rgba(99,102,241,0.5)",
    tagBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    icon: BellAlertIcon,
    title: "Early Warning System",
    description:
      "AI-based prediction system alerts users before disasters like floods, storms, and earthquakes occur.",
    tag: "AI",
    gradient: "from-red-600 via-orange-500 to-yellow-500",
    glow: "rgba(239,68,68,0.5)",
    tagBg: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  {
    icon: TruckIcon,
    title: "Emergency Response",
    description:
      "Coordinate rescue teams, assign tasks, and respond quickly to emergency situations in the field.",
    tag: "FAST",
    gradient: "from-green-600 via-teal-500 to-cyan-500",
    glow: "rgba(16,185,129,0.5)",
    tagBg: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  {
    icon: UsersIcon,
    title: "Multi-role Access",
    description:
      "Dedicated dashboards for Admins, NGOs, Citizens, and Volunteers with granular role-based permissions.",
    tag: "ROLES",
    gradient: "from-purple-600 via-pink-500 to-rose-500",
    glow: "rgba(168,85,247,0.5)",
    tagBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    icon: ShieldCheckIcon,
    title: "Resource Management",
    description:
      "Manage shelters, food supplies, medical kits, and logistics in real-time during active disaster zones.",
    tag: "SAFE",
    gradient: "from-indigo-600 via-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.5)",
    tagBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    icon: ChartBarIcon,
    title: "Analytics & Reporting",
    description:
      "Detailed insights, reports, and data visualization for better decision-making and future disaster planning.",
    tag: "DATA",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    glow: "rgba(245,158,11,0.5)",
    tagBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
];

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      whileHover={{
        y: -10,
        boxShadow: `0 30px 60px ${feature.glow}`,
        transition: { duration: 0.3 },
      }}
      className="group relative p-7 rounded-2xl glass border border-white/8 overflow-hidden cursor-default"
    >
      {/* GRADIENT BG */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />

      {/* GLOW */}
      <div
        className={`absolute -top-px -right-px w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl rounded-full transition-all duration-500 group-hover:opacity-30 group-hover:scale-150`}
      />

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </motion.div>

        <span
          className={`px-2.5 py-1 text-xs font-bold tracking-widest rounded-full border ${feature.tagBg}`}
        >
          {feature.tag}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white transition-colors">
        {feature.title}
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
        {feature.description}
      </p>

      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500`}
      />
    </motion.div>
  );
}

export default function FeaturesSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <section
      id="features"
      className="relative py-28 bg-gray-950 overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            System Features
          </h2>

          <p className="mt-5 text-gray-400 max-w-2xl mx-auto text-lg">
            Powerful tools and intelligent systems designed to handle disasters efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}