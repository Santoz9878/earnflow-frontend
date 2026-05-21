import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  stats: { totalReferrals: 5, totalEarned: 1000, pendingApprovals: 1 },
  referrals: [
    { id: 1, referred_user_email: 'john@email.com', bonus_amount: 200, status: 'credited', created_at: new Date().toISOString() },
    { id: 2, referred_user_email: 'mary@email.com', bonus_amount: 200, status: 'credited', created_at: new Date().toISOString() },
    { id: 3, referred_user_email: 'peter@email.com', bonus_amount: 200, status: 'pending', created_at: new Date().toISOString() },
  ],
  isLoading: false,
}

export const fetchReferralStats = createAsyncThunk('referral/fetchStats', async () => {
  return { totalReferrals: 5, totalEarned: 1000, pendingApprovals: 1 }
})

export const fetchReferrals = createAsyncThunk('referral/fetchReferrals', async () => {
  return [
    { id: 1, referred_user_email: 'john@email.com', bonus_amount: 200, status: 'credited', created_at: new Date().toISOString() },
    { id: 2, referred_user_email: 'mary@email.com', bonus_amount: 200, status: 'credited', created_at: new Date().toISOString() },
    { id: 3, referred_user_email: 'peter@email.com', bonus_amount: 200, status: 'pending', created_at: new Date().toISOString() },
  ]
})

const referralSlice = createSlice({
  name: 'referral', initialState, reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchReferralStats.fulfilled, (s, a) => { s.stats = a.payload })
    b.addCase(fetchReferrals.fulfilled, (s, a) => { s.referrals = a.payload })
  },
})

export default referralSlice.reducer