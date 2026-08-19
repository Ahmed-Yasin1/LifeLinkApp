import apiClient from './ApiClient'

export const createEmergency = (payload) => apiClient.post('/emergency', payload)
export const getEmergencies = (params) => apiClient.get('/emergency', { params })
export const getEmergency = (id) => apiClient.get(`/emergency/${id}`)
export const updateEmergency = (id, payload) => apiClient.put(`/emergency/${id}`, payload)
export const deleteEmergency = (id) => apiClient.delete(`/emergency/${id}`)
export const updateEmergencyStatus = (id, status) => apiClient.patch(`/emergency/${id}/status`, { status })
export const matchEmergencyDonors = (id) => apiClient.get(`/emergency/${id}/match`)
export const respondToEmergency = (id, status) => apiClient.post(`/emergency/${id}/respond`, { response: status })
export const getPublicEmergenciesToday = () => apiClient.get('/emergency/public/today')