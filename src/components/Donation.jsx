import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { dashboardAPI } from "../services/api";

const AVATAR_COLORS = [
  "from-indigo-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-sky-600",
  "from-violet-500 to-fuchsia-600",
];

const formatDateTime = (value) => {
  if (!value) return "Recently";
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatLabel = (value) => {
  if (!value) return "Donation";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

function DonationCard({ donation, colorIdx }) {
  const location = [donation.city, donation.state || donation.country].filter(Boolean).join(", ");
  const displayName = donation.fullName || donation.name || "Anonymous Citizen";

  return (
    <motion.article
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(20,184,166,0.18)",
        borderColor: "rgba(45,212,191,0.35)",
      }}
      className="flex-shrink-0 w-80 rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur transition-colors duration-300"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${
            AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
          } text-lg font-black text-white shadow-lg`}
        >
          {displayName.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{displayName}</p>
          <p className="truncate text-xs font-medium text-slate-500">{location || "India"}</p>
        </div>

        <span className="rounded-full bg-teal-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-teal-300">
          Public
        </span>
      </div>

      <div className="my-4 h-px bg-white/10" />

      <div className="space-y-3">
        <div className="flex justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Donation</span>
          <span className="max-w-[11rem] text-right text-sm font-semibold leading-snug text-slate-200">
            {donation.summary || formatLabel(donation.category)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</span>
          <span className="text-right text-xs font-semibold text-slate-400">{formatDateTime(donation.time)}</span>
        </div>
      </div>

    </motion.article>
  );
}

export default function DonationSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const [search, setSearch] = useState("");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchPublicDonations = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getRecentDonors();
        if (!ignore) {
          setDonations(response.data?.data?.donors || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError("Unable to load the public donation feed right now.");
          setDonations([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPublicDonations();
    const intervalId = window.setInterval(fetchPublicDonations, 60000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return donations;

    return donations.filter((d) =>
      [d.fullName, d.name, d.city, d.state, d.country, d.category, d.summary]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [donations, search]);

  return (
    <section id="donations" className="relative overflow-hidden bg-gray-950 py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-14 text-center"
        >
          <h2 className="bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent md:text-6xl">
            Live Donation Feed
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-300">
            Real public contributions shared by citizens across India.
          </p>

          <input
            type="text"
            placeholder="Search by name, location, or cause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-7 w-full max-w-md rounded-xl border border-white/15 bg-slate-950/70 px-5 py-3 text-sm text-white outline-none transition focus:border-teal-300 placeholder:text-slate-500"
          />
        </motion.div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm font-bold text-slate-400">
            Loading public donations...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-12 text-center text-sm font-bold text-red-200">
            {error}
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-5">
            {filtered.map((donation, i) => (
              <DonationCard key={donation.id} donation={donation} colorIdx={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
            <h3 className="text-xl font-black text-white">No public donations yet</h3>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Public posts will appear here only after citizens choose to share them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
