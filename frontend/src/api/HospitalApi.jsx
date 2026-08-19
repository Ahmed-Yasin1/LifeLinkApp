import apiClient from './ApiClient'

export const createHospital = (payload) => apiClient.post('/hospitals', payload)
export const getHospitals = () => apiClient.get('/hospitals')
export const getHospital = (id) => apiClient.get(`/hospitals/${id}`)
export const updateHospital = (id, payload) => apiClient.put(`/hospitals/${id}`, payload)
export const deleteHospital = (id) => apiClient.delete(`/hospitals/${id}`)