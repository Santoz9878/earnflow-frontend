import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  plans: [
    { id: 1, name: 'Bronze', min_invest: 500, max_invest: 5000, return_percent: 10, duration_type: '24h', is_active: true },
    { id: 2, name: 'Silver', min_invest: 1000, max_invest: 10000, return_percent: 20, duration_type: '48h', is_active: true },
    { id: 3, name: 'Gold', min_invest: 5000, max_invest: 50000, return_percent: 30, duration_type: 'weekly', is_active: true },
  ],
  investments: [
    { id: 1, plan_name: 'Bronze', amount: 500, return_percent: 10, status: 'active', start_date: new Date().toISOString(), maturity_date: new Date(Date.now() + 86400000).toISOString(), duration_type: '24h' },
  ],
  activeInvestments: [
    { id: 1, plan_name: 'Bronze', amount: 500, return_percent: 10, status: 'active', start_date: new Date().toISOString(), maturity_date: new Date(Date.now() + 86400000).toISOString(), duration_type: '24h' },
  ],
  isLoading: false,
}

export const fetchPlans = createAsyncThunk('mmf/fetchPlans', async () => {
  return [
    { id: 1, name: 'Bronze', min_invest: 500, max_invest: 5000, return_percent: 10, duration_type: '24h', is_active: true },
    { id: 2, name: 'Silver', min_invest: 1000, max_invest: 10000, return_percent: 20, duration_type: '48h', is_active: true },
    { id: 3, name: 'Gold', min_invest: 5000, max_invest: 50000, return_percent: 30, duration_type: 'weekly', is_active: true },
  ]
})

export const invest = createAsyncThunk('mmf/invest', async (d) => {
  return { id: Date.now(), plan_name: 'Bronze', amount: d.amount, return_percent: 10, status: 'active', start_date: new Date().toISOString(), maturity_date: new Date(Date.now() + 86400000).toISOString(), duration_type: '24h' }
})

export const fetchInvestments = createAsyncThunk('mmf/fetchInvestments', async () => {
  return [
    { id: 1, plan_name: 'Bronze', amount: 500, return_percent: 10, status: 'active', start_date: new Date().toISOString(), maturity_date: new Date(Date.now() + 86400000).toISOString(), duration_type: '24h' },
  ]
})

const mmfSlice = createSlice({
  name: 'mmf', initialState, reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlans.fulfilled, (s, a) => { s.plans = a.payload })
    b.addCase(invest.fulfilled, (s, a) => { s.activeInvestments.push(a.payload) })
    b.addCase(fetchInvestments.fulfilled, (s, a) => {
      s.investments = a.payload
      s.activeInvestments = a.payload.filter(i => i.status === 'active')
    })
  },
})

export default mmfSlice.reducer