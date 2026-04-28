import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.clear()
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default api

export const authAPI        = { login: b => api.post('/auth/login', b), signup: b => api.post('/auth/signup', b) }
export const usersAPI       = { me: () => api.get('/users/me'), list: p => api.get('/users', { params: p }), create: b => api.post('/users', b), remove: id => api.delete(`/users/${id}`) }
export const internshipsAPI = { list: () => api.get('/internships'), create: b => api.post('/internships', b), remove: id => api.delete(`/internships/${id}`) }
export const tasksAPI       = { list: () => api.get('/tasks'), create: b => api.post('/tasks', b), update: (id, b) => api.patch(`/tasks/${id}`, b), remove: id => api.delete(`/tasks/${id}`) }
export const reportsAPI     = { list: () => api.get('/reports'), submit: b => api.post('/reports', b), feedback: (id, b) => api.patch(`/reports/${id}/feedback`, b) }
export const analyticsAPI   = { progress: () => api.get('/analytics/progress') }
