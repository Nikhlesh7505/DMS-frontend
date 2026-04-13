import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white/30 dark:bg-black/10">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-primary-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
