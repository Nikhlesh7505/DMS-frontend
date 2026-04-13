import React from 'react'

const Donation = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Donation Page</h1>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Support disaster relief by donating.
        </p>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Amount (₹)"
            className="w-full p-2 border rounded"
          />

          <select className="w-full p-2 border rounded">
            <option>Flood Relief</option>
            <option>Earthquake Relief</option>
            <option>General Fund</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Donate Now
          </button>
        </form>
      </div>
    </div>
  )
}

export default Donation