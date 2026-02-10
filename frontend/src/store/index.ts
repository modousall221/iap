import { configureStore } from '@reduxjs/toolkit'

// Placeholder reducers (to be implemented in Week 1)
const placeholderReducer = (state = {}) => state

export const store = configureStore({
  reducer: {
    auth: placeholderReducer,
    projects: placeholderReducer,
    investments: placeholderReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
