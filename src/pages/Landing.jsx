import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WeatherBackground from "../components/weatherBackground";

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
    name: "Real-time Weather Monitoring",
    description: "Continuous monitoring of weather conditions across multiple cities.",
    icon: CloudIcon,
  },
  {
    name: "Early Warning System",
    description: "AI-powered disaster prediction for floods, storms, and cyclones.",
    icon: BellAlertIcon,
  },
  {
    name: "Emergency Response",
    description: "Coordinate rescue operations and manage emergency requests.",
    icon: TruckIcon,
  },
  {
    name: "Multi-role Access",
    description: "Dashboards for admins, NGOs, rescue teams, and citizens.",
    icon: UsersIcon,
  },
  {
    name: "Resource Management",
    description: "Track medical supplies, equipment, and personnel.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Analytics & Reporting",
    description: "Reports and analytics for decision-making.",
    icon: ChartBarIcon,
  },
];

const Landing = () => {
  const [weatherType, setWeatherType] = useState("sunny");

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current_weather=true"
      );
      const data = await res.json();
      const code = data.current_weather.weathercode;

      if (code >= 95) setWeatherType("storm");
      else if (code >= 60) setWeatherType("rain");
      else if (code <= 2) setWeatherType("sunny");
      else setWeatherType("clouds");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/60">

      {/* HERO */}
      <div className="relative isolate pt-14 min-h-screen flex items-center justify-center">

        <WeatherBackground type={weatherType} />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6">

          <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            Disaster Management System
          </h1>

          <p className="mt-6 text-lg text-white max-w-2xl mx-auto">
            A comprehensive platform for disaster early warning and emergency response.
            Monitor weather, predict risks, and coordinate rescue operations in real time.
          </p>

          <div className="mt-10 flex justify-center gap-6">

            <Link
              to="/register"
              className="px-8 py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition shadow-xl"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-8 py-3 rounded-lg text-white border border-white/40 hover:bg-white/20 transition"
            >
              Login
            </Link>

          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="py-24 sm:py-32 bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold text-blue-600">Features</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need for disaster management
            </p>
          </div>

          <div className="mx-auto mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => (
              <div
                key={feature.name}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/60 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300"
              >
                <feature.icon className="h-8 w-8 text-blue-600" />

                <h3 className="mt-4 font-semibold text-lg text-slate-900 dark:text-white">
                  {feature.name}
                </h3>

                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
};

export default Landing;
