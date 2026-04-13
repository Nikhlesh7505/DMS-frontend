import { motion } from "framer-motion";

const MotionDiv = motion.div;

const SpringBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">

      {/* Soft Spring Gradient Sky */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-green-100 to-blue-100" />

      {/* Floating Flowers */}
      {[...Array(30)].map((_, i) => (
        <MotionDiv
          key={i}
          className="absolute text-pink-400 text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10%",
          }}
          animate={{
            y: "110vh",
            x: [0, 20, -20, 0],
            rotate: 360,
          }}
          transition={{
            duration: 12 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        >
          🌸
        </MotionDiv>
      ))}

      {/* Floating Leaves */}
      {[...Array(20)].map((_, i) => (
        <MotionDiv
          key={`leaf-${i}`}
          className="absolute text-green-400 text-xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10%",
          }}
          animate={{
            y: "110vh",
            x: [0, -30, 30, 0],
            rotate: 180,
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        >
          🍃
        </MotionDiv>
      ))}

      {/* Soft Moving Clouds */}
      <MotionDiv
        className="absolute top-20 w-[200%] h-64 bg-white/30 blur-3xl rounded-full"
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      />

    </div>
  );
};

export default SpringBackground;
