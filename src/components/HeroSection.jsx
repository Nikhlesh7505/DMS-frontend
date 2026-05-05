import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

 import {
   CloudIcon,
  BellAlertIcon,
   ShieldCheckIcon,
   UsersIcon,
   TruckIcon,
   ChartBarIcon
 } from "@heroicons/react/24/outline";
 import AboutSection from "../components/AboutSection";

const images = [
  "https://images.unsplash.com/photo-1600336153113-d66c79de3e91?w=1600&q=80",
  "https://images.unsplash.com/photo-1507680465142-ef2223e23308?w=1600&q=80",
  "https://images.unsplash.com/photo-1601931163309-fe9459564c03?w=1600&q=80",
  "https://images.unsplash.com/photo-1640296150617-1ede154483d9?w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
];

const WORDS = ["Disasters", "Crises", "Emergencies", "Risks"];


const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

/* SAME PARTICLES */
const ParticleField = () => {
  const dots = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-indigo-400"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -30, -60] }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

const GridLines = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-10"
    style={{
      backgroundImage: `
        linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
    }}
  />
);

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  /* ✅ TSX → JSX FIX */
  const heroRef = useRef(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, 6000);
    return () => clearInterval(imgInterval);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIdx((p) => (p + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };
 

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950"
    >
      {/* BACKGROUND IMAGES */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-gray-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-transparent to-purple-950/50" />

      <GridLines />
      <ParticleField />

      {/* ORBS */}
      <FloatingOrb className="w-96 h-96 bg-indigo-600 top-[-8rem] left-[-6rem] floating" />
      <FloatingOrb className="w-80 h-80 bg-purple-600 bottom-[-4rem] right-[-4rem] floating" />
      <FloatingOrb className="w-64 h-64 bg-pink-600 top-1/2 left-1/3" />

      {/* CONTENT */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20"
      >
        {/* BADGE */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
         
        >
      
          
        </motion.div> */}

        {/* HEADLINE */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none"
          >
            <span className="block text-white">Real-Time</span>
            <span className="block">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent neon-text">
                Management
              </span>
            </span>
            <span className="text-white flex flex-wrap justify-center gap-x-4">
              <span>of</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="inline-block bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
                >
                  {WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Monitor disasters, predict risks, and coordinate rescue operations
            with an AI-powered, real-time disaster management platform built for
            Admins, NGOs, Citizens, and Volunteers.
          </motion.p>

          {/* BUTTONS */}
          {/* <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <motion.button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl">
              Get Started Free
              <ArrowRightIcon className="w-4 h-4" />
            </motion.button>

            <motion.button className="flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-2xl">
              <PlayCircleIcon className="w-5 h-5 text-indigo-400" />
              Watch Demo
            </motion.button>
          </motion.div> */}
        </motion.div>
      </motion.div>
    </section>
    
  );
}