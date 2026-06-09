import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { walletService } from '../../services/walletService'

const initialState = {
  balance: 0,
  transactions: [],
  withdrawals: [],
  isLoading: false,
}

export const fetchBalance = createAsyncThunk('wallet/fetchBalance', async (_, thunkAPI) => {
  try { return await walletService.getBalance() }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async (params, thunkAPI) => {
  try { return await walletService.getTransactions(params) }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const requestWithdrawal = createAsyncThunk('wallet/requestWithdrawal', async (data, thunkAPI) => {
  try { return await walletService.requestWithdrawal(data) }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchWithdrawals = createAsyncThunk('wallet/fetchWithdrawals', async (_, thunkAPI) => {
  try { return await walletService.getWithdrawals() }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

// Top-up is handled via M-Pesa externally; this just refreshes balance
export const requestTopUp = createAsyncThunk('wallet/requestTopUp', async (_, thunkAPI) => {
  try { return await walletService.getBalance() }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateBalance: (s, a) => { s.balance = a.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalance.pending, (s) => { s.isLoading = true })
      .addCase(fetchBalance.fulfilled, (s, a) => { s.isLoading = false; s.balance = a.payload.balance })
      .addCase(fetchBalance.rejected, (s) => { s.isLoading = false })
      .addCase(fetchTransactions.pending, (s) => { s.isLoading = true })
      .addCase(fetchTransactions.fulfilled, (s, a) => {
        s.isLoading = false
        s.transactions = a.payload.transactions || a.payload
      })
      .addCase(fetchTransactions.rejected, (s) => { s.isLoading = false })
      .addCase(requestWithdrawal.fulfilled, (s, a) => {
        // balance already deducted server-side, refresh via fetchBalance
      })
      .addCase(fetchWithdrawals.fulfilled, (s, a) => {
        s.withdrawals = a.payload.withdrawals || a.payload
      })
      .addCase(requestTopUp.fulfilled, (s, a) => {
        s.balance = a.payload.balance
      })
  },
})

export const { updateBalance } = walletSlice.actions
export default walletSlice.reducer
