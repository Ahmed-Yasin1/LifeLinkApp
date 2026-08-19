import apiClient from './ApiClient'

export const addBlood = (payload) => apiClient.post('/inventory', payload)
export const getInventory = () => apiClient.get('/inventory')
export const updateInventory = (id, payload) => apiClient.put(`/inventory/${id}`, payload)
export const deleteInventory = (id) => apiClient.delete(`/inventory/${id}`)