import apiClient from './ApiClient'

export const register = (payload) => apiClient.post('/auth/register', payload)
export const login = (payload) => apiClient.post('/auth/login', payload)
export const resetPassword = (payload) => apiClient.post('/auth/reset-password', payload)
export const getProfile = () => apiClient.get('/auth/me')
export const getUsers = () => apiClient.get('/auth/users')
export const createUser = (payload) => apiClient.post('/auth/register', payload)
export const updateUser = (id, payload) => apiClient.put(`/auth/users/${id}`, payload)