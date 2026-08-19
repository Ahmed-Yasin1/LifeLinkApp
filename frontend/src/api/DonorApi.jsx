import apiClient from './ApiClient'

export const createDonor = (payload) => apiClient.post('/donors', payload)
export const updateDonor = (id, payload) => apiClient.put(`/donors/${id}`, payload)
export const deleteDonor = (id) => apiClient.delete(`/donors/${id}`)
export const searchDonors = (query = '') => apiClient.get('/donors/search', { params: { q: query } })
export const getDonorEligibility = (id) => apiClient.get(`/donors/${id}/eligibility`)
export const getDonorById = (id) => apiClient.get(`/donors/${id}`)
export const getDonationHistory = (id) => apiClient.get(`/donors/${id}/history`)
export const addDonationRecord = (id, payload) => apiClient.post(`/donors/${id}/donations`, payload)
export const updateDonationRecord = (id, donationId, payload) => apiClient.put(`/donors/${id}/donations/${donationId}`, payload)
export const deleteDonationRecord = (id, donationId) => apiClient.delete(`/donors/${id}/donations/${donationId}`)