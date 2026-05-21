import { api } from './api'

export const userService = {
  getProfile: async () => (await api.get('/api/user/profile')).data,
  updateMpesaNumber: async (data) => (await api.post('/api/user/update-mpesa', data)).data,
  uploadProfilePhoto: async (formData) => (await api.post('/api/user/profile/selfie', formData)).data,
  submitKYC: async (formData) => (await api.post('/api/user/kyc/submit', formData)).data,
}
