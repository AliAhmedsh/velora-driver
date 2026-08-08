import { configureStore } from '@reduxjs/toolkit';
import { rideReducer } from './slices/rideSlice';

export const store = configureStore({
  reducer: {
    ride: rideReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './slices/rideSlice';
