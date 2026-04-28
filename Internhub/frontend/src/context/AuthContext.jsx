import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../api/client'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      usersAPI.me().then(r => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const login = async (creds) => {
    const { data } = await authAPI.login(creds)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const signup = async (body) => {
    const { data } = await authAPI.signup(body)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = () => { localStorage.clear(); setUser(null) }

  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
