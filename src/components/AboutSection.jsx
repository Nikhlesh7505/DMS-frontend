import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ROLE CARD */
function RoleCard({
  badge,
  badgeColor,
  title,
  description,
  tags,
  imageSrc,
  imageOverlay,
  reverse = false,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const slideLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  };

  const slideRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  };

  const transition = {
    duration: 0.8,
    ease: "easeOut",
    delay: 0.1,
  };

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${
        reverse
          ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1"
          : ""
      }`}
    >
      {/* IMAGE */}
      <motion.div
        variants={reverse ? slideRight : slideLeft}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={transition}
        className="relative group"
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={imageSrc}
            alt={title}
            loading="lazy"
            className="w-full h-72 md:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div
            className={`absolute inset-0 ${imageOverlay} opacity-30 group-hover:opacity-50 transition-opacity duration-500`}
          />

          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
        </div>

        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -right-4 glass-strong px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-white shadow-xl"
        >
          {badge}
        </motion.div>
      </motion.div>

      {/* CONTENT */}
      <motion.div
        variants={reverse ? slideLeft : slideRight}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ ...transition, delay: 0.25 }}
      >
        <span
          className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${badgeColor}`}
        >
          {badge}
        </span>

        <h3 className="mt-5 text-3xl md:text-4xl font-black text-white leading-tight">
          {title}
        </h3>

        <p className="mt-4 text-gray-400 leading-relaxed">
          {description}
        </p>

        <motion.div
          className="mt-8 grid grid-cols-2 gap-3"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.07, delayChildren: 0.4 },
            },
          }}
        >
          {tags.map((tag) => (
            <motion.div
              key={tag.label}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4 },
                },
              }}
              whileHover={{
                scale: 1.04,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
              className="flex items-center gap-2 glass border border-white/8 px-3 py-2.5 rounded-xl text-sm text-gray-200 cursor-default transition-all"
            >
              <span className="text-base">{tag.emoji}</span>
              {tag.label}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* DATA */
const roles = [
  {
    badge: "Admin Panel",
    badgeColor:
      "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    title: "Full System Control & Monitoring",
    description:
      "Admin dashboard gives complete authority to monitor disasters, manage users, control alerts, and analyze real-time data.",
    tags: [
      { emoji: "📊", label: "Analytics" },
      { emoji: "👥", label: "User Control" },
      { emoji: "⚠️", label: "Alerts" },
      { emoji: "📦", label: "Resources" },
    ],
    imageSrc:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    imageOverlay: "bg-gradient-to-br from-indigo-600 to-purple-600",
  },
  {
    badge: "NGO Panel",
    badgeColor:
      "bg-green-500/15 text-green-400 border border-green-500/30",
    title: "Relief & Resource Management",
    description:
      "NGOs manage shelters, distribute resources, and track donations efficiently.",
    tags: [
      { emoji: "🎁", label: "Donations" },
      { emoji: "🏠", label: "Shelters" },
      { emoji: "🤝", label: "Volunteers" },
      { emoji: "🚚", label: "Distribution" },
    ],
    imageSrc:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&q=80",
    imageOverlay: "bg-gradient-to-br from-green-600 to-teal-600",
    reverse: true,
  },
  {
    badge: "Citizen Panel",
    badgeColor:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    title: "Report & Get Emergency Help",
    description:
      "Citizens can report disasters, request help, and receive alerts instantly.",
    tags: [
      { emoji: "📢", label: "Reports" },
      { emoji: "🆘", label: "Help Request" },
      { emoji: "📍", label: "Location" },
      { emoji: "🔔", label: "Alerts" },
    ],
    imageSrc:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
    imageOverlay: "bg-gradient-to-br from-yellow-600 to-orange-600",
  },
  {
    badge: "Volunteer Panel",
    badgeColor:
      "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    title: "Rescue & Field Operations",
    description:
      "Volunteers handle rescue tasks, track locations, and coordinate operations.",
    tags: [
      { emoji: "📋", label: "Tasks" },
      { emoji: "📍", label: "Tracking" },
      { emoji: "🚑", label: "Help" },
      { emoji: "💬", label: "Communication" },
    ],
    imageSrc:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80",
    imageOverlay: "bg-gradient-to-br from-purple-600 to-pink-600",
    reverse: true,
  },
];

/* MAIN COMPONENT */
export default function AboutSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <section className="relative py-28 bg-gray-950 overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* HEADING */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-black text-indigo-400 leading-tight">
            About System
          </h2>
          <p className="mt-5 text-gray-400 max-w-2xl mx-auto">
            Disaster management platform connecting Admins, NGOs, Citizens & Volunteers.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="space-y-28">
          {roles.map((role) => (
            <RoleCard key={role.badge} {...role} />
          ))}
        </div>
      </div>
    </section>
  );
}