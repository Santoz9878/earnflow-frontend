import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// FAKE USER FOR TESTING - REMOVE THIS IN PRODUCTION
const fakeUser = {
  id: 1,
  email: 'demo@earnflow.com',
  promo_code: 'DEMO123',
  is_admin: true,
  is_agent: false,
  balance: 100,
}
const fakeToken = 'fake-token-for-testing'

const initialState = {
  user: fakeUser, // Auto-logged in as demo user
  token: fakeToken,
  isLoading: false,
  isError: false,
  message: '',
}

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try { return await authService.login(credentials) }
  catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed') }
})

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try { return await authService.register(data) }
  catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed') }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
})

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    reset: (state) => { state.isLoading = false; state.isError = false; state.message = '' },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.isLoading = true; s.isError = false })
      .addCase(login.fulfilled, (s, a) => {
        s.isLoading = false; s.user = a.payload.user; s.token = a.payload.access_token
        localStorage.setItem('user', JSON.stringify(a.payload.user))
        localStorage.setItem('token', a.payload.access_token)
      })
      .addCase(login.rejected, (s, a) => { s.isLoading = false; s.isError = true; s.message = a.payload })
      .addCase(register.pending, (s) => { s.isLoading = true })
      .addCase(register.fulfilled, (s) => { s.isLoading = false })
      .addCase(register.rejected, (s, a) => { s.isLoading = false; s.isError = true; s.message = a.payload })
      .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null })
  },
})

export const { reset, updateUser } = authSlice.actions
export default authSlice.reducer