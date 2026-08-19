import apiClient from './ApiClient'

export const sendNotification = (payload) => apiClient.post('/notification', payload)
export const getNotifications = (userId, params) => apiClient.get(`/notification/user/${userId}`, { params })
export const getAllNotifications = (params) => apiClient.get('/notification/user/all', { params })
export const getHospitalSentNotifications = (params) => apiClient.get('/notification/sent', { params })
export const markNotificationRead = (id) => apiClient.patch(`/notification/${id}/read`)
export const markAllNotificationsRead = (userId) => apiClient.patch(`/notification/read-all/${userId}`)
export const markAllHospitalNotificationsRead = () => apiClient.patch('/notification/read-all/sent')
export const deleteNotification = (id) => apiClient.delete(`/notification/${id}`)