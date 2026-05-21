import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  profile: {
    email: 'demo@earnflow.com',
    promo_code: 'DEMO123',
    mpesa_withdrawal_number: '0712345678',
    kyc_status: 'pending',
    created_at: new Date(Date.now() - 2592000000).toISOString(),
  },
  kycStatus: 'pending',
  isLoading: false,
  isError: false,
}

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () => {
  return {
    email: 'demo@earnflow.com',
    promo_code: 'DEMO123',
    mpesa_withdrawal_number: '0712345678',
    kyc_status: 'pending',
    created_at: new Date(Date.now() - 2592000000).toISOString(),
  }
})

export const updateMpesaNumber = createAsyncThunk('user/updateMpesa', async (d) => {
  return { mpesa_withdrawal_number: d.mpesa_number }
})

export const submitKYC = createAsyncThunk('user/submitKYC', async () => {
  return { kyc_status: 'pending' }
})

const userSlice = createSlice({
  name: 'user', initialState, reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProfile.fulfilled, (s, a) => { s.profile = a.payload; s.kycStatus = a.payload.kyc_status })
    b.addCase(updateMpesaNumber.fulfilled, (s, a) => { s.profile = { ...s.profile, ...a.payload } })
    b.addCase(submitKYC.fulfilled, (s) => { s.kycStatus = 'pending' })
  },
})

export default userSlice.reducer