import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { walletService } from '../../services/walletService'

const initialState = {
  balance: 1450,
  transactions: [
    { id: 1, type: 'credit', description: 'Signup Bonus', amount: 100, created_at: new Date().toISOString() },
    { id: 2, type: 'credit', description: 'YouTube Video Task', amount: 20, created_at: new Date().toISOString() },
    { id: 3, type: 'credit', description: 'Referral Bonus - John', amount: 200, created_at: new Date().toISOString() },
    { id: 4, type: 'debit', description: 'MMF Investment - Bronze', amount: 500, created_at: new Date().toISOString() },
  ],
  withdrawals: [],
  isLoading: false,
}

export const fetchBalance = createAsyncThunk('wallet/fetchBalance', async () => {
  return { balance: 1450 }
})

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async () => {
  return [
    { id: 1, type: 'credit', description: 'Signup Bonus', amount: 100, created_at: new Date().toISOString() },
    { id: 2, type: 'credit', description: 'YouTube Video - Monday', amount: 20, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, type: 'credit', description: 'Referral Bonus - John D.', amount: 200, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, type: 'debit', description: 'MMF Investment - Bronze Plan', amount: 500, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 5, type: 'credit', description: 'YouTube Video - Monday', amount: 20, created_at: new Date(Date.now() - 90000000).toISOString() },
  ]
})

export const requestWithdrawal = createAsyncThunk('wallet/requestWithdrawal', async (data) => {
  return { new_balance: 1450 - data.amount, message: 'Withdrawal submitted' }
})

export const requestTopUp = createAsyncThunk('wallet/requestTopUp', async (data) => {
  return { new_balance: 1450 + data.amount, message: 'Top-up submitted' }
})

export const fetchWithdrawals = createAsyncThunk('wallet/fetchWithdrawals', async () => {
  return [
    { id: 1, amount: 1000, status: 'processed', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 2, amount: 550, status: 'pending', created_at: new Date().toISOString() },
  ]
})

const walletSlice = createSlice({
  name: 'wallet', initialState,
  reducers: { updateBalance: (s, a) => { s.balance = a.payload } },
  extraReducers: (builder) => {
    builder.addCase(fetchBalance.fulfilled, (s, a) => { s.balance = a.payload.balance })
    builder.addCase(fetchTransactions.fulfilled, (s, a) => { s.transactions = a.payload })
    builder.addCase(requestWithdrawal.fulfilled, (s, a) => { s.balance = a.payload.new_balance })
    builder.addCase(requestTopUp.fulfilled, (s, a) => { s.balance = a.payload.new_balance })
    builder.addCase(fetchWithdrawals.fulfilled, (s, a) => { s.withdrawals = a.payload })
  },
})

export const { updateBalance } = walletSlice.actions
export default walletSlice.reducer