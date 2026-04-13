// import React, { useEffect, useState } from 'react'
// import { weatherAPI } from '../../services/api'
// // import {
// //   CloudIcon,
// //   CloudBoltIcon,
// //   SunIcon,
// //   WindIcon,
// //   BeakerIcon,       // DropletIcon ki jagah
// //   MapPinIcon
// // } from '@heroicons/react/24/outline'


// import {
//   CloudIcon,
//   SunIcon,
//   MapPinIcon,
//   ArrowPathIcon,   // wind replacement
//   BeakerIcon,      // humidity replacement
//   BoltIcon         // storm replacement
// } from '@heroicons/react/24/outline'



// const Weather = () => {
//   const [weatherData, setWeatherData] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedCity, setSelectedCity] = useState(null)

//   useEffect(() => {
//     fetchWeather()
//   }, [])

//   const fetchWeather = async () => {
//     try {
//       const response = await weatherAPI.getAll()
//       setWeatherData(response.data.data.cities)
//       if (response.data.data.cities.length > 0) {
//         setSelectedCity(response.data.data.cities[0])
//       }
//     } catch (error) {
//       console.error('Failed to fetch weather:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getWeatherIcon = (condition) => {
//     const main = condition?.main?.toLowerCase() || ''
//     if (main.includes('rain')) return <CloudRainIcon className="h-12 w-12 text-blue-500" />
//     if (main.includes('cloud')) return <CloudIcon className="h-12 w-12 text-slate-500 dark:text-slate-400" />
//     if (main.includes('clear')) return <SunIcon className="h-12 w-12 text-yellow-500" />
//     return <CloudIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weather Monitoring</h1>
//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Real-time weather data across monitored cities</p>
//       </div>

//       {/* Selected City Detail */}
//       {selectedCity && (
//         <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
//           <div className="card-body">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="flex items-center gap-2">
//                   <MapPinIcon className="h-5 w-5" />
//                   <h2 className="text-2xl font-bold">{selectedCity.location?.city}</h2>
//                 </div>
//                 <p className="text-primary-100 mt-1">
//                   {selectedCity.location?.state}, {selectedCity.location?.country}
//                 </p>
//                 <p className="text-primary-200 text-sm mt-1">
//                   Last updated: {new Date(selectedCity.fetchedAt).toLocaleString()}
//                 </p>
//               </div>
//               <div className="text-right">
//                 {getWeatherIcon(selectedCity.data?.condition)}
//                 <p className="text-4xl font-bold mt-2">
//                   {Math.round(selectedCity.data?.temperature?.current)}°C
//                 </p>
//                 <p className="text-primary-100 capitalize">
//                   {selectedCity.data?.condition?.description}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="bg-white/10 rounded-lg p-4">
//                 <div className="flex items-center gap-2">
//                   <ThermometerIcon className="h-5 w-5" />
//                   <span className="text-sm text-primary-100">Feels Like</span>
//                 </div>
//                 <p className="text-2xl font-bold mt-1">
//                   {Math.round(selectedCity.data?.temperature?.feelsLike)}°C
//                 </p>
//               </div>
//               <div className="bg-white/10 rounded-lg p-4">
//                 <div className="flex items-center gap-2">
//                   <DropletIcon className="h-5 w-5" />
//                   <span className="text-sm text-primary-100">Humidity</span>
//                 </div>
//                 <p className="text-2xl font-bold mt-1">{selectedCity.data?.humidity}%</p>
//               </div>
//               <div className="bg-white/10 rounded-lg p-4">
//                 <div className="flex items-center gap-2">
//                   <WindIcon className="h-5 w-5" />
//                   <span className="text-sm text-primary-100">Wind Speed</span>
//                 </div>
//                 <p className="text-2xl font-bold mt-1">{selectedCity.data?.wind?.speed} m/s</p>
//               </div>
//               <div className="bg-white/10 rounded-lg p-4">
//                 <div className="flex items-center gap-2">
//                   <CloudRainIcon className="h-5 w-5" />
//                   <span className="text-sm text-primary-100">Rainfall</span>
//                 </div>
//                 <p className="text-2xl font-bold mt-1">{selectedCity.data?.rainfall?.last1h || 0} mm</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cities Grid */}
//       <div>
//         <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">All Cities</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {weatherData.map((city) => (
//             <button
//               key={city._id}
//               onClick={() => setSelectedCity(city)}
//               className={`card text-left hover:shadow-lg transition-shadow ${
//                 selectedCity?._id === city._id ? 'ring-2 ring-primary-500' : ''
//               }`}
//             >
//               <div className="card-body">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="font-semibold text-slate-900 dark:text-white">{city.location?.city}</h3>
//                     <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
//                       {Math.round(city.data?.temperature?.current)}°C
//                     </p>
//                   </div>
//                   {getWeatherIcon(city.data?.condition)}
//                 </div>
//                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 capitalize">
//                   {city.data?.condition?.description}
//                 </p>
//                 <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
//                   <span>💧 {city.data?.humidity}%</span>
//                   <span>💨 {city.data?.wind?.speed} m/s</span>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Storm Alerts */}
//       <div className="card">
//         <div className="card-header">
//           <h2 className="text-lg font-medium text-slate-900 dark:text-white">Storm Indicators</h2>
//         </div>
//         <div className="card-body">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {weatherData.filter(w => w.stormIndicators?.isStorm || w.stormIndicators?.cycloneAlert).map((city) => (
//               <div key={city._id} className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-danger-100 rounded-full">
//                     <CloudRainIcon className="h-5 w-5 text-danger-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-danger-900">{city.location?.city}</p>
//                     <p className="text-sm text-danger-700">
//                       {city.stormIndicators?.cycloneAlert ? 'Cyclone Alert' : 'Storm Warning'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {weatherData.filter(w => w.stormIndicators?.isStorm || w.stormIndicators?.cycloneAlert).length === 0 && (
//               <p className="text-slate-500 dark:text-slate-400 col-span-2 text-center py-4">No active storm alerts</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Weather



import React, { useEffect, useState, useMemo, useRef } from 'react'
import {
  CloudIcon,
  SunIcon,
  MapPinIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

// ── Default cities to show in the grid ──────────────────────────
const DEFAULT_CITIES = [
  'Mumbai', 'Delhi', 'Chennai', 'Kolkata',
  'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad',
]

// ── WMO code → description + condition ──────────────────────────
const parseWeatherCode = (code) => {
  if (code === 0)  return { description: 'Clear sky',     main: 'clear'   }
  if (code <= 2)   return { description: 'Partly cloudy', main: 'cloud'   }
  if (code === 3)  return { description: 'Overcast',      main: 'cloud'   }
  if (code <= 49)  return { description: 'Foggy',         main: 'cloud'   }
  if (code <= 59)  return { description: 'Drizzle',       main: 'rain'    }
  if (code <= 69)  return { description: 'Rainy',         main: 'rain'    }
  if (code <= 79)  return { description: 'Snow',          main: 'snow'    }
  if (code <= 82)  return { description: 'Rain showers',  main: 'rain'    }
  if (code <= 86)  return { description: 'Snow showers',  main: 'snow'    }
  if (code <= 99)  return { description: 'Thunderstorm',  main: 'thunder' }
  return { description: 'Unknown', main: '' }
}

// ── Core: fetch weather by lat/lon from Open-Meteo ───────────────
const fetchWeatherByCoords = async (latitude, longitude, cityName = null, stateName = null, countryName = null) => {
  const wRes = await fetch(
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `wind_speed_10m,precipitation,weather_code,surface_pressure` +
    `&wind_speed_unit=ms`
  )
  const wData   = await wRes.json()
  const current = wData.current
  const { description, main } = parseWeatherCode(current.weather_code)

  return {
    city        : cityName    || 'Unknown',
    state       : stateName   || '',
    country     : countryName || '',
    latitude,
    longitude,
    temperature : Math.round(current.temperature_2m),
    feelsLike   : Math.round(current.apparent_temperature),
    humidity    : current.relative_humidity_2m,
    windSpeed   : parseFloat(current.wind_speed_10m.toFixed(1)),
    description,
    main,
    rainfall    : parseFloat((current.precipitation || 0).toFixed(1)),
    pressure    : Math.round(current.surface_pressure),
  }
}

// ── Geocode city name → coords + weather ────────────────────────
const fetchWeatherByCity = async (cityName) => {
  const geoRes  = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
  )
  const geoData = await geoRes.json()
  if (!geoData.results?.length) throw new Error(`City "${cityName}" not found.`)

  const { latitude, longitude, name, country, admin1 } = geoData.results[0]
  return fetchWeatherByCoords(latitude, longitude, name, admin1 || '', country || '')
}

// ── Reverse geocode coords → city name ──────────────────────────
const reverseGeocode = async (latitude, longitude) => {
  const res  = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`
  )
  const data = await res.json()
  const city =
    data.address?.city         ||
    data.address?.city_district||
    data.address?.town         ||
    data.address?.municipality ||
    data.address?.village      ||
    data.address?.suburb       ||
    data.address?.county       ||
    'Your Location'
  return {
    city,
    state  : data.address?.state   || '',
    country: data.address?.country || '',
  }
}

// ════════════════════════════════════════════════════════════════
const Weather = () => {
  // City grid
  const [cityWeathers,  setCityWeathers]  = useState([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [selectedCity,  setSelectedCity]  = useState(null)

  // Geolocation
  const [geoWeather,    setGeoWeather]    = useState(null)
  const [geoLoading,    setGeoLoading]    = useState(true)
  const [geoError,      setGeoError]      = useState(null)

  // Search
  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResult,  setSearchResult]  = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError,   setSearchError]   = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    loadDefaultCities()
    detectUserLocation()
  }, [])

  // ── Load all default cities in parallel ─────────────────────
  const loadDefaultCities = async () => {
    setCitiesLoading(true)
    try {
      const results = await Promise.allSettled(
        DEFAULT_CITIES.map((city) => fetchWeatherByCity(city))
      )
      const successful = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value)
      setCityWeathers(successful)
      if (successful.length > 0) setSelectedCity(successful[0])
    } catch (err) {
      console.error('Failed to load cities:', err)
    } finally {
      setCitiesLoading(false)
    }
  }

  // ── Detect user location ─────────────────────────────────────
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      setGeoLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { city, state, country } = await reverseGeocode(coords.latitude, coords.longitude)
          const weather = await fetchWeatherByCoords(coords.latitude, coords.longitude, city, state, country)
          setGeoWeather(weather)
        } catch (err) {
          setGeoError('Could not fetch weather for your location.')
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setGeoError('Location access denied. Allow location permission to see your local weather.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  // ── Search handler ───────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    setSearchLoading(true)
    setSearchError(null)
    setSearchResult(null)

    try {
      const result = await fetchWeatherByCity(query)
      setSearchResult(result)
    } catch (err) {
      setSearchError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResult(null)
    setSearchError(null)
    searchInputRef.current?.focus()
  }

  // ── Icons ────────────────────────────────────────────────────
  const getWeatherIcon = (condition, sizeClass = 'h-12 w-12') => {
    const main = (condition || '').toLowerCase()
    if (main.includes('rain'))    return <CloudIcon              className={`${sizeClass} text-blue-400`}   />
    if (main.includes('cloud'))   return <CloudIcon              className={`${sizeClass} text-slate-400 dark:text-slate-500`}   />
    if (main.includes('clear'))   return <SunIcon                className={`${sizeClass} text-yellow-500`} />
    if (main.includes('snow'))    return <CloudIcon              className={`${sizeClass} text-blue-200`}   />
    if (main.includes('thunder')) return <ExclamationTriangleIcon className={`${sizeClass} text-yellow-400`} />
    return <CloudIcon className={`${sizeClass} text-slate-400 dark:text-slate-500`} />
  }

  const stormCities = useMemo(() =>
    cityWeathers.filter((w) => w.main === 'thunder'),
    [cityWeathers]
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weather Monitoring</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Real-time weather data across monitored cities</p>
      </div>

      {/* ── YOUR LOCATION ──────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-primary-500" />
              Your Current Location
            </h2>
            {!geoLoading && (
              <button
                onClick={() => { setGeoLoading(true); setGeoError(null); detectUserLocation() }}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:text-indigo-200 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4" /> Refresh
              </button>
            )}
          </div>

          {geoLoading && (
            <div className="flex items-center gap-3 py-4 text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
              <span className="text-sm">Detecting your location...</span>
            </div>
          )}

          {geoError && !geoLoading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">{geoError}</p>
            </div>
          )}

          {geoWeather && !geoLoading && (
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    <h3 className="text-xl font-bold">{geoWeather.city}</h3>
                  </div>
                  {(geoWeather.state || geoWeather.country) && (
                    <p className="text-emerald-100 text-sm mt-0.5">
                      {geoWeather.state}{geoWeather.state && geoWeather.country ? ', ' : ''}{geoWeather.country}
                    </p>
                  )}
                  <p className="text-emerald-200 capitalize text-sm mt-1">{geoWeather.description}</p>
                </div>
                <div className="text-right">
                  {getWeatherIcon(geoWeather.main, 'h-10 w-10')}
                  <p className="text-3xl font-bold mt-1">{geoWeather.temperature}°C</p>
                  <p className="text-emerald-200 text-xs">Feels like {geoWeather.feelsLike}°C</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatMini label="Humidity" value={`${geoWeather.humidity}%`}       emoji="💧" sub="emerald" />
                <StatMini label="Wind"     value={`${geoWeather.windSpeed} m/s`}   emoji="💨" sub="emerald" />
                <StatMini label="Rainfall" value={`${geoWeather.rainfall} mm`}     emoji="🌧️" sub="emerald" />
                <StatMini label="Pressure" value={`${geoWeather.pressure} hPa`}    emoji="🌡️" sub="emerald" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Search City Weather</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city (e.g. Bareilly, London, Tokyo...)"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200/60 dark:border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
            >
              {searchLoading
                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                : <MagnifyingGlassIcon className="h-4 w-4" />}
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{searchError}</p>
            </div>
          )}

          {searchResult && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    <h3 className="text-xl font-bold">
                      {searchResult.city}
                      {searchResult.country && (
                        <span className="ml-2 text-sm font-normal text-blue-200">
                          {searchResult.state ? `${searchResult.state}, ` : ''}{searchResult.country}
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="text-blue-100 capitalize text-sm mt-1">{searchResult.description}</p>
                </div>
                <div className="text-right">
                  {getWeatherIcon(searchResult.main, 'h-10 w-10')}
                  <p className="text-3xl font-bold mt-1">{searchResult.temperature}°C</p>
                  <p className="text-blue-200 text-xs">Feels like {searchResult.feelsLike}°C</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatMini label="Humidity" value={`${searchResult.humidity}%`}     emoji="💧" sub="blue" />
                <StatMini label="Wind"     value={`${searchResult.windSpeed} m/s`} emoji="💨" sub="blue" />
                <StatMini label="Rainfall" value={`${searchResult.rainfall} mm`}   emoji="🌧️" sub="blue" />
                <StatMini label="Pressure" value={`${searchResult.pressure} hPa`}  emoji="🌡️" sub="blue" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SELECTED CITY DETAIL ───────────────────────────────── */}
      {selectedCity && (
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  <h2 className="text-2xl font-bold">{selectedCity.city}</h2>
                </div>
                {(selectedCity.state || selectedCity.country) && (
                  <p className="text-primary-100 mt-1">
                    {selectedCity.state}{selectedCity.state && selectedCity.country ? ', ' : ''}{selectedCity.country}
                  </p>
                )}
              </div>
              <div className="text-right">
                {getWeatherIcon(selectedCity.main)}
                <p className="text-4xl font-bold mt-2">{selectedCity.temperature}°C</p>
                <p className="text-primary-100 capitalize">{selectedCity.description}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<BeakerIcon     className="h-5 w-5" />} label="Feels Like" value={`${selectedCity.feelsLike}°C`}       />
              <StatCard icon={<BeakerIcon     className="h-5 w-5" />} label="Humidity"   value={`${selectedCity.humidity}%`}          />
              <StatCard icon={<ArrowPathIcon  className="h-5 w-5" />} label="Wind Speed" value={`${selectedCity.windSpeed} m/s`}      />
              <StatCard icon={<CloudIcon      className="h-5 w-5" />} label="Rainfall"   value={`${selectedCity.rainfall} mm`}        />
            </div>
          </div>
        </div>
      )}

      {/* ── ALL CITIES GRID ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">All Cities</h2>
          {citiesLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400" />
              Loading...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {citiesLoading
            ? Array(8).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card-body">
                    <div className="h-4 bg-white/50 dark:bg-black/30 rounded w-3/4 mb-3" />
                    <div className="h-8 bg-white/50 dark:bg-black/30 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-white/50 dark:bg-black/30 rounded w-full" />
                  </div>
                </div>
              ))
            : cityWeathers.map((city) => (
                <button
                  key={city.city}
                  onClick={() => setSelectedCity(city)}
                  className={`card text-left hover:shadow-lg transition-shadow ${
                    selectedCity?.city === city.city ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{city.city}</h3>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{city.temperature}°C</p>
                      </div>
                      {getWeatherIcon(city.main)}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 capitalize">{city.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                      <span>💧 {city.humidity}%</span>
                      <span>💨 {city.windSpeed} m/s</span>
                    </div>
                  </div>
                </button>
              ))
          }
        </div>
      </div>

      {/* ── STORM ALERTS ───────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Storm Indicators</h2>
        </div>
        <div className="card-body">
          {stormCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stormCities.map((city) => (
                <div key={city.city} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-full">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">{city.city}</p>
                      <p className="text-sm text-red-700">Thunderstorm Warning</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No active storm alerts</p>
          )}
        </div>
      </div>

    </div>
  )
}

// ── Reusable components ──────────────────────────────────────────
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/10 rounded-lg p-4">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-primary-100">{label}</span>
    </div>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
)

const StatMini = ({ label, value, emoji }) => (
  <div className="bg-white/15 rounded-lg p-3 text-center">
    <p className="text-lg">{emoji}</p>
    <p className="text-xs opacity-75 mt-1">{label}</p>
    <p className="text-sm font-semibold mt-0.5">{value}</p>
  </div>
)

export default Weather