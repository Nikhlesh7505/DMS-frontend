import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellAlertIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  PlusCircleIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { dashboardAPI, emergencyAPI } from "../../services/api";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getCitizen();
      setData(response.data.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-danger-50 p-4">
        <p className="text-danger-700">{error}</p>
      </div>
    );
  }

  const { requests, alerts, disasters, weather, riskStatus } = data || {};

  // Get overall risk level
  const overallRisk = riskStatus?.overallRisk || "SAFE";
  const riskColor =
    {
      SAFE: "bg-success-500",
      WATCH: "bg-warning-500",
      WARNING: "bg-orange-500",
      DANGER: "bg-danger-500",
    }[overallRisk] || "bg-success-500";

  return (
    <div className="min-h-screen space-y-8 pb-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            My Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
            Stay informed and protected with real-time updates.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard/emergency?tab=form")}
          className="group relative inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-600/30"
        >
          <PlusCircleIcon className="h-5 w-5 transition-transform group-hover:rotate-90" />
          Emergency Request
        </motion.button>
      </motion.div>

      {/* Stats Quick View (Replacing Banner with more useful info if needed, or just skipping) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2  gap-4">
        {[
          // {
          //   label: "Risk Level",
          //   value: overallRisk,
          //   color:
          //     overallRisk === "SAFE" ? "text-emerald-600" : "text-orange-600",
          //   icon: BellAlertIcon,
          // },
          {
            label: "Active Alerts",
            value: alerts?.length || 0,
            color: "text-blue-600",
            icon: BellAlertIcon,
          },
          {
            label: "My Requests",
            value: requests?.length || 0,
            color: "text-purple-600",
            icon: ClipboardDocumentListIcon,
          },
          // {
          //   label: "Disasters Near",
          //   value: disasters?.length || 0,
          //   color: "text-red-600",
          //   icon: ExclamationTriangleIcon,
          // },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-lg font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Requests */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 space-y-6"
        >
          <div className="rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Recent Emergency Requests
              </h3>
              <Link
                to="/dashboard/emergency"
                className="group flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-500 transition-colors"
              >
                View All
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {requests?.slice(0, 4).map((request, i) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group relative flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:border-red-200 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-red-900/50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          request.status === "pending"
                            ? "bg-amber-500"
                            : request.status === "assigned"
                              ? "bg-blue-500"
                              : request.status === "in_progress"
                                ? "bg-indigo-500"
                                : request.status === "resolved"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-900 dark:text-white capitalize">
                            {request.type}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              request.status === "pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : request.status === "assigned"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : request.status === "in_progress"
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                    : request.status === "resolved"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {request.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                          {request.description}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            {request.location?.city || "Location Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClipboardDocumentListIcon className="h-3.5 w-3.5" />
                            {new Date(
                              request.timeline?.reportedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-slate-300 transition-colors group-hover:text-red-500" />
                  </motion.div>
                ))}

                {(!requests || requests.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-slate-50 p-6 dark:bg-slate-800">
                      <ClipboardDocumentListIcon className="h-10 w-10 text-slate-300" />
                    </div>
                    <h4 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                      No requests yet
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Need help? Create an emergency request now.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard/emergency?tab=form")}
                      className="mt-6 flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-500 transition-colors"
                    >
                      <PlusCircleIcon className="h-5 w-5" />
                      CREATE FIRST REQUEST
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Weather Widget */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-hidden rounded-[32px] border border-sky-200 bg-gradient-to-br from-sky-500 to-indigo-600 p-8 text-white shadow-xl shadow-sky-200 dark:border-sky-900/50 dark:shadow-none"
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-black uppercase tracking-[0.2em] opacity-80">
                    Current Weather
                  </span>
                  <CloudIcon className="h-8 w-8 opacity-80" />
                </div>
                <div className="flex items-end gap-2">
                  <h2 className="text-6xl font-black leading-none">
                    {Math.round(weather.data?.temperature?.current)}°
                  </h2>
                  <span className="text-2xl font-bold mb-1">C</span>
                </div>
                <p className="mt-2 text-lg font-bold capitalize opacity-90">
                  {weather.data?.condition?.description}
                </p>
                <div className="mt-8 flex items-center gap-8 border-t border-white/20 pt-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      Humidity
                    </p>
                    <p className="text-lg font-bold">
                      {weather.data?.humidity}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      Wind Speed
                    </p>
                    <p className="text-lg font-bold">
                      {weather.data?.wind?.speed} m/s
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600 dark:bg-red-900/20">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Emergency Contacts
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { name: "National Emergency", number: "112" },
                { name: "Ambulance", number: "108" },
                { name: "Police", number: "100" },
                { name: "Disaster Helpline", number: "1078" },
              ].map((contact) => (
                <div
                  key={contact.number}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors group-hover:text-red-600">
                    {contact.name}
                  </span>
                  <span className="rounded-lg bg-slate-50 px-3 py-1 text-sm font-black text-red-600 dark:bg-slate-800">
                    {contact.number}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-900/20">
                <BellAlertIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent Alerts
              </h3>
            </div>
            <div className="space-y-4">
              {alerts?.slice(0, 3).map((alert) => (
                <div key={alert._id} className="group cursor-pointer">
                  <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 transition-colors group-hover:text-red-600">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(alert.timeline?.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <p className="text-sm font-medium text-slate-500 text-center py-4 italic">
                  No active alerts at this time.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Active Disasters Section */}
      <AnimatePresence>
        {disasters && disasters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-[32px] border border-red-100 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-900/10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-xl bg-red-600 p-2.5 text-white shadow-lg shadow-red-600/30">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Active Disasters
                </h3>
                <p className="text-sm font-bold text-red-600">
                  IMMEDIATE ATTENTION REQUIRED
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {disasters.slice(0, 3).map((disaster) => (
                <div
                  key={disaster._id}
                  className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {disaster.name}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {disaster.type}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        disaster.severity === "catastrophic" ||
                        disaster.severity === "severe"
                          ? "bg-red-600 text-white"
                          : disaster.severity === "high"
                            ? "bg-orange-500 text-white"
                            : "bg-blue-600 text-white"
                      }`}
                    >
                      {disaster.severity}
                    </span>
                    <button className="text-xs font-black text-red-600 hover:underline">
                      DETAILS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitizenDashboard;
