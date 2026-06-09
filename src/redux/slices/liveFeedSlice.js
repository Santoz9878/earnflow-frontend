import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../services/api'

const initialState = { feed: [] }

export const fetchLiveFeed = createAsyncThunk('liveFeed/fetch', async () => {
  return (await api.get('/api/live-feed')).data
})

const liveFeedSlice = createSlice({
  name: 'liveFeed', initialState,
  reducers: {
    addFeedItem: (s, a) => { s.feed.unshift(a.payload); if (s.feed.length > 20) s.feed.pop() }
  },
  extraReducers: (b) => {
    b.addCase(fetchLiveFeed.fulfilled, (s, a) => {
      s.feed = a.payload.feed || a.payload
    })
  },
})

export const { addFeedItem } = liveFeedSlice.actions
export default liveFeedSlice.reducer
