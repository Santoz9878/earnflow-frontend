import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '../../services/userService'

const initialState = {
  profile: null,
  kycStatus: 'pending',
  isLoading: false,
  isError: false,
  message: '',
}

export const fetchProfile = createAsyncThunk('user/fetchProfile', async (_, thunkAPI) => {
  try {
    return await userService.getProfile()
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
  }
})

export const updateMpesaNumber = createAsyncThunk('user/updateMpesa', async (d, thunkAPI) => {
  try {
    return await userService.updateMpesaNumber(d)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update M-Pesa number')
  }
})

export const uploadProfilePhoto = createAsyncThunk('user/uploadProfilePhoto', async (formData, thunkAPI) => {
  try {
    return await userService.uploadProfilePhoto(formData)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload profile photo')
  }
})

export const submitKYC = createAsyncThunk('user/submitKYC', async (formData, thunkAPI) => {
  try {
    return await userService.submitKYC(formData)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit KYC')
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProfile.pending, (s) => {
      s.isLoading = true
      s.isError = false
      s.message = ''
    })
    b.addCase(fetchProfile.fulfilled, (s, a) => {
      s.isLoading = false
      s.profile = a.payload
      s.kycStatus = a.payload.kyc_status
    })
    b.addCase(fetchProfile.rejected, (s, a) => {
      s.isLoading = false
      s.isError = true
      s.message = a.payload
    })
    b.addCase(updateMpesaNumber.fulfilled, (s, a) => {
      s.profile = { ...s.profile, ...a.payload }
    })
    b.addCase(uploadProfilePhoto.fulfilled, (s, a) => {
      s.profile.selfie_url = a.payload.selfie_url
    })
    b.addCase(submitKYC.fulfilled, (s, a) => {
      s.kycStatus = a.payload.kyc_status || 'pending'
      s.profile.kyc_status = a.payload.kyc_status || 'pending'
    })
  },
})

export default userSlice.reducer