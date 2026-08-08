import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Ride } from '../types/ride';
import {
  loadActiveRide,
  loadRideHistory,
  persistActiveRide,
  persistRideHistory,
} from '../../services/rideSync';

export const DRIVER_NAME = 'Hassan Khan';
const DRIVER_RATING = 4.9;

type RideState = {
  isOnline: boolean;
  activeRide: Ride | null;
  history: Ride[];
  isLoading: boolean;
};

const initialState: RideState = {
  isOnline: false,
  activeRide: null,
  history: [],
  isLoading: false,
};

export const hydrateRideState = createAsyncThunk('ride/hydrate', async () => {
  const [activeRide, history] = await Promise.all([loadActiveRide(), loadRideHistory()]);
  return { activeRide, history };
});

export const syncRideState = createAsyncThunk('ride/sync', async () => {
  const [activeRide, history] = await Promise.all([loadActiveRide(), loadRideHistory()]);
  return { activeRide, history };
});

export const acceptRide = createAsyncThunk('ride/accept', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride || ride.status !== 'searching') return null;

  const updated: Ride = {
    ...ride,
    status: 'driver_assigned',
    driverName: DRIVER_NAME,
    driverRating: DRIVER_RATING,
  };
  await persistActiveRide(updated);
  return updated;
});

export const declineRide = createAsyncThunk('ride/decline', async () => {
  await persistActiveRide(null);
  return null;
});

export const advanceRideStatus = createAsyncThunk('ride/advance', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride) return { ride: null, history: state.ride.history };

  const nextStatus: Record<string, Ride['status'] | undefined> = {
    driver_assigned: 'driver_arriving',
    driver_arriving: 'in_progress',
    in_progress: 'completed',
  };

  const next = nextStatus[ride.status];
  if (!next) return { ride, history: state.ride.history };

  const updated: Ride = { ...ride, status: next };

  if (next === 'completed') {
    const history = [...state.ride.history, updated];
    await persistRideHistory(history);
    await persistActiveRide(updated);
    return { ride: updated, history };
  }

  await persistActiveRide(updated);
  return { ride: updated, history: state.ride.history };
});

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setActiveRide(state, action: PayloadAction<Ride | null>) {
      state.activeRide = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateRideState.pending, state => {
        state.isLoading = true;
      })
      .addCase(hydrateRideState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload.activeRide;
        state.history = action.payload.history;
      })
      .addCase(hydrateRideState.rejected, state => {
        state.isLoading = false;
      })
      .addCase(syncRideState.fulfilled, (state, action) => {
        const ride = action.payload.activeRide;
        if (ride?.status === 'searching' && !state.isOnline) {
          state.activeRide = null;
        } else {
          state.activeRide = ride;
        }
        state.history = action.payload.history;
      })
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(declineRide.fulfilled, state => {
        state.activeRide = null;
      })
      .addCase(advanceRideStatus.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.history = action.payload.history;
      });
  },
});

export const { setOnline, setActiveRide } = rideSlice.actions;
export const rideReducer = rideSlice.reducer;
