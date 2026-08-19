import axios from 'axios'

// In development, Vite forwards /api requests to the Express server.
// Set VITE_API_URL to the API origin; /api is added when omitted.
const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const apiBaseUrl = configuredApiUrl.replace(/\/$/, '').endsWith('/api')
  ? configuredApiUrl.replace(/\/$/, '')
  : `${configuredApiUrl.replace(/\/$/, '')}/api`

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getApiError = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  'Something went wrong. Please try again.'

export default apiClient