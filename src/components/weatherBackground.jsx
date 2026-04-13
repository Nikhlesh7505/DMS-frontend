import { motion } from "framer-motion";

const MotionDiv = motion.div;

const WeatherBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

      {/* Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-gray-800" />

      {/* Clouds Layer 1 */}
      <MotionDiv
        className="absolute top-10 w-[200%] h-64 bg-white/10 blur-3xl rounded-full"
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Clouds Layer 2 */}
      <MotionDiv
        className="absolute top-40 w-[200%] h-72 bg-white/10 blur-3xl rounded-full"
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Rain */}
      {[...Array(120)].map((_, i) => (
        <MotionDiv
          key={i}
          className="absolute w-[2px] h-10 bg-blue-300 opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10%",
          }}
          animate={{ y: "110vh" }}
          transition={{
            duration: 0.5 + Math.random(),
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Lightning Flash */}
      <MotionDiv
        className="absolute inset-0 bg-white dark:bg-slate-800/60 opacity-0"
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 8,
        }}
      />
    </div>
  );
};

export default WeatherBackground;
