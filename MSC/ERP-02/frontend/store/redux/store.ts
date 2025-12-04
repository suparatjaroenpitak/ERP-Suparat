import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

type AppState = {
  sidebarOpen: boolean
}

const initialState: AppState = {
  sidebarOpen: true,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebar(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
  },
})

export const { toggleSidebar, setSidebar } = appSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
