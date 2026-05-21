import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { WEEKLY_SCHEDULE, DAILY_EARNING_LIMIT } from '../../utils/constants'
import { getTodayName, isWeekday } from '../../utils/formatCurrency'

const today = getTodayName()
const schedule = WEEKLY_SCHEDULE[today]

const initialState = {
  todayTasks: schedule?.tasks || [],
  todayEarnings: 40,
  dailyLimit: DAILY_EARNING_LIMIT,
  completedTasks: schedule?.tasks ? [schedule.tasks[0]?.id, schedule.tasks[1]?.id] : [],
  schedule: schedule,
  isWeekday: isWeekday(),
  isLoading: false,
}

export const fetchTodayTasks = createAsyncThunk('tasks/fetchTodayTasks', async () => {
  return { tasks: schedule?.tasks || [], completed: schedule?.tasks ? [schedule.tasks[0]?.id, schedule.tasks[1]?.id] : [] }
})

export const fetchTodayEarnings = createAsyncThunk('tasks/fetchTodayEarnings', async () => {
  return { earnings: 40 }
})

export const completeTask = createAsyncThunk('tasks/completeTask', async (d) => {
  return { reward: 20, task_id: d.task_id }
})

const tasksSlice = createSlice({
  name: 'tasks', initialState, reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchTodayTasks.fulfilled, (s, a) => {
      s.todayTasks = a.payload.tasks || s.todayTasks
      s.completedTasks = a.payload.completed || []
    })
    b.addCase(fetchTodayEarnings.fulfilled, (s, a) => { s.todayEarnings = a.payload.earnings || 0 })
    b.addCase(completeTask.fulfilled, (s, a) => {
      s.todayEarnings += a.payload.reward
      s.completedTasks.push(a.payload.task_id)
    })
  },
})

export default tasksSlice.reducer