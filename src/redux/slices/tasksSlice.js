import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'
import { DAILY_EARNING_LIMIT } from '../../utils/constants'
import { isWeekday } from '../../utils/formatCurrency'

const initialState = {
  todayTasks: [],
  todayEarnings: 0,
  dailyLimit: DAILY_EARNING_LIMIT,
  completedTasks: [],
  schedule: null,
  isWeekday: isWeekday(),
  isLoading: false,
}

export const fetchTodayTasks = createAsyncThunk('tasks/fetchTodayTasks', async (_, thunkAPI) => {
  try {
    const data = await (await api.get('/api/tasks/today')).data
    return data
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed')
  }
})

export const fetchTodayEarnings = createAsyncThunk('tasks/fetchTodayEarnings', async (_, thunkAPI) => {
  try {
    return await (await api.get('/api/tasks/today/earnings')).data
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed')
  }
})

export const completeTask = createAsyncThunk('tasks/completeTask', async ({ task_id }, thunkAPI) => {
  try {
    const data = await (await api.post(`/api/tasks/${task_id}/complete`, { task_id })).data
    return { ...data, task_id }
  } catch (e) {
    return thunkAPI.rejectWithValue(e.response?.data?.message || 'Failed to complete task')
  }
})

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTodayTasks.pending, (s) => { s.isLoading = true })
    b.addCase(fetchTodayTasks.fulfilled, (s, a) => {
      s.isLoading = false
      s.todayTasks = a.payload.tasks || []
      // Build completedTasks from task objects that have completed=true
      s.completedTasks = (a.payload.tasks || [])
        .filter(t => t.completed)
        .map(t => t.id)
    })
    b.addCase(fetchTodayTasks.rejected, (s) => { s.isLoading = false })

    b.addCase(fetchTodayEarnings.fulfilled, (s, a) => {
      s.todayEarnings = a.payload.today_earned || 0
    })

    b.addCase(completeTask.fulfilled, (s, a) => {
      s.todayEarnings += a.payload.reward || 0
      if (a.payload.task_id && !s.completedTasks.includes(a.payload.task_id)) {
        s.completedTasks.push(a.payload.task_id)
      }
    })
  },
})

export default tasksSlice.reducer
