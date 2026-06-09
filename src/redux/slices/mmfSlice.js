import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const initialState = {
  plans: [],
  investments: [],
  activeInvestments: [],
  isLoading: false,
}

export const fetchPlans = createAsyncThunk('mmf/fetchPlans', async (_, thunkAPI) => {
  try { return (await api.get('/api/mmf/plans')).data }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const invest = createAsyncThunk('mmf/invest', async (data, thunkAPI) => {
  try { return (await api.post('/api/mmf/invest', data)).data }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Investment failed') }
})

export const fetchInvestments = createAsyncThunk('mmf/fetchInvestments', async (_, thunkAPI) => {
  try { return (await api.get('/api/mmf/investments')).data }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed') }
})

const mmfSlice = createSlice({
  name: 'mmf',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlans.pending, (s) => { s.isLoading = true })
    b.addCase(fetchPlans.fulfilled, (s, a) => {
      s.isLoading = false
      s.plans = a.payload.plans || a.payload
    })
    b.addCase(fetchPlans.rejected, (s) => { s.isLoading = false })

    b.addCase(invest.fulfilled, (s, a) => {
      s.activeInvestments.push(a.payload)
    })

    b.addCase(fetchInvestments.fulfilled, (s, a) => {
      const list = a.payload.investments || a.payload
      s.investments = list
      s.activeInvestments = list.filter(i => i.status === 'active')
    })
  },
})

export default mmfSlice.reducer
