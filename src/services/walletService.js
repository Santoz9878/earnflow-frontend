import { api } from './api'
export const walletService = {
  getBalance: async () => (await api.get('/api/user/balance')).data,
  getTransactions: async (params) => (await api.get('/api/transactions', { params })).data,
  requestWithdrawal: async (data) => (await api.post('/api/withdraw/request', data)).data,
  getWithdrawals: async () => (await api.get('/api/withdraw/history')).data,
}
