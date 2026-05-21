import { api } from './api'
export const authService = {
  login: async (credentials) => (await api.post('/api/auth/login', credentials)).data,
  register: async (data) => (await api.post('/api/auth/register', data)).data,
  payRegistration: async (data) => (await api.post('/api/mpesa/pay-registration', data)).data,
  forgotPassword: async (email) => (await api.post('/api/auth/forgot-password', { email })).data,
}
