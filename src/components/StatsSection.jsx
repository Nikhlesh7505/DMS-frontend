import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { name: "Cities Monitored", value: 150, suffix: "+", icon: "🏙️", color: "from-indigo-500 to-purple-500" },
  { name: "Active Alerts", value: 24, suffix: "", icon: "⚡", color: "from-red-500 to-orange-500" },
  { name: "Rescue Teams", value: 320, suffix: "+", icon: "🚑", color: "from-green-500 to-teal-500" },
  { name: "Lives Protected", value: 1, suffix: "M+", icon: "❤️", color: "from-pink-500 to-rose-500" },
];

function CountUp({ end, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative py-28 overflow-hidden scroll-mt-20"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 animated-gradient opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950/60" />

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest rounded-full bg-white/10 text-white border border-white/20">
            Our Impact
          </span>

          <h2 className="text-5xl md:text-6xl font-black text-white">
            Numbers That Matter
          </h2>

          <p className="mt-4 text-indigo-200 max-w-xl mx-auto">
            Real impact across India — protecting communities and saving lives every day
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.04 }}
              className="glass-strong border border-white/10 rounded-2xl p-8 text-center cursor-default"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                className="text-4xl mb-4"
              >
                {stat.icon}
              </motion.div>

              <div className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>

              <div className="mt-2 text-sm text-indigo-200 font-medium">
                {stat.name}
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: i * 0.15 + 0.5 }}
                className={`mt-4 h-0.5 bg-gradient-to-r ${stat.color} rounded-full origin-left`}
              />
            </motion.div>
          ))}
        </div>

        {/* FOOTER TEXT */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-indigo-300/60 text-sm"
        >
          Updated in real-time • Last sync: just now
        </motion.div>

      </div>
    </section>
  );
}