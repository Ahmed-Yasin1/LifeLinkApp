import apiClient from './ApiClient'

export const getReport = (params) => apiClient.get('/reports', { params })
export const getDashboardStats = (params) => apiClient.get('/dashboard', { params })