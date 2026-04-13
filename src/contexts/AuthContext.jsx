import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set auth token in API headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me')
          setUser(response.data.data.user)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth check failed:', error)
          logout()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data.data
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)

      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      delete api.defaults.headers.common['Authorization']

      return {
        success: true,
        message: response.data.message || 'Registration successful. Please log in to continue.'
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    delete api.defaults.headers.common['Authorization']
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData)
      setUser(response.data.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      }
    }
  }

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
