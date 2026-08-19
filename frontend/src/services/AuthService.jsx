import { getProfile, login, register, createUser as createUserApi, updateUser as updateUserApi, resetPassword as resetPasswordRequest } from '../api/AuthApi'

export const loginUser = async (credentials) => {
  const { data } = await login(credentials)
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export const registerUser = async (user) => (await register(user)).data
export const createUser = async (user) => (await createUserApi(user)).data
export const updateUser = async (id, user) => (await updateUserApi(id, user)).data
export const resetPassword = async (payload) => (await resetPasswordRequest(payload)).data
export const getCurrentUser = async () => (await getProfile()).data.user

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}