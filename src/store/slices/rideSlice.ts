import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Ride } from '../types/ride';
import {
  acceptRideRequest,
  advanceRideStatus,
  declineRideRequest,
  fetchActiveRide,
  fetchRideHistory,
} from '../../services/rideService';

type RideState = {
  isOnline: boolean;
  activeRide: Ride | null;
  history: Ride[];
  isLoading: boolean;
  error: string | null;
};

const initialState: RideState = {
  isOnline: false,
  activeRide: null,
  history: [],
  isLoading: false,
  error: null,
};

export const hydrateRideState = createAsyncThunk('ride/hydrate', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const [activeRide, history] = await Promise.all([
    fetchActiveRide(state.ride.isOnline),
    fetchRideHistory(),
  ]);
  return { activeRide, history };
});

export const syncRideState = createAsyncThunk('ride/sync', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const [activeRide, history] = await Promise.all([
    fetchActiveRide(state.ride.isOnline),
    fetchRideHistory(),
  ]);
  return { activeRide, history };
});

export const acceptRide = createAsyncThunk('ride/accept', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride || ride.status !== 'searching') return null;
  return await acceptRideRequest(ride.id);
});

export const declineRide = createAsyncThunk('ride/decline', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride || ride.status !== 'searching') return null;
  await declineRideRequest(ride.id);
  return await fetchActiveRide(state.ride.isOnline);
});

export const advanceRideStatusAction = createAsyncThunk('ride/advance', async (_, { getState }) => {
  const state = getState() as { ride: RideState };
  const ride = state.ride.activeRide;
  if (!ride) return { ride: null, history: state.ride.history };

  const updated = await advanceRideStatus(ride.id, ride.status);
  const history = await fetchRideHistory();

  if (updated.status === 'completed') {
    return { ride: updated, history };
  }

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
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateRideState.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(hydrateRideState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload.activeRide;
        state.history = action.payload.history;
      })
      .addCase(hydrateRideState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load rides';
      })
      .addCase(syncRideState.fulfilled, (state, action) => {
        state.activeRide = action.payload.activeRide;
        state.history = action.payload.history;
      })
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(declineRide.fulfilled, (state, action) => {
        state.activeRide = action.payload;
      })
      .addCase(advanceRideStatusAction.fulfilled, (state, action) => {
        state.activeRide = action.payload.ride;
        state.history = action.payload.history;
      });
  },
});

export const { setOnline, setActiveRide, clearError } = rideSlice.actions;
export const rideReducer = rideSlice.reducer;
