import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const initialState = {
  stats: { totalReferrals: 0, totalEarned: 0, pendingApprovals: 0 },
  referrals: [],
  isLoading: false,
}

export const fetchReferralStats = createAsyncThunk('referral/fetchStats', async (_, thunkAPI) => {
  try { return (await api.get('/api/referrals/stats')).data }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchReferrals = createAsyncThunk('referral/fetchReferrals', async (_, thunkAPI) => {
  try { return (await api.get('/api/referrals')).data }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchReferralStats.fulfilled, (s, a) => { s.stats = a.payload })
    b.addCase(fetchReferrals.fulfilled, (s, a) => {
      s.referrals = a.payload.referrals || a.payload
    })
  },
})

export default referralSlice.reducer
