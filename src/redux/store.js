import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import walletReducer from './slices/walletSlice'
import tasksReducer from './slices/tasksSlice'
import mmfReducer from './slices/mmfSlice'
import referralReducer from './slices/referralSlice'
import liveFeedReducer from './slices/liveFeedSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    wallet: walletReducer,
    tasks: tasksReducer,
    mmf: mmfReducer,
    referral: referralReducer,
    liveFeed: liveFeedReducer,
  },
})
