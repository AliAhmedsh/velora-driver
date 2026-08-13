import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { hydrateRideState, syncRideState } from '@store';
import { subscribeToRides } from '../services/rideService';

export function useRideSync(enabled = true) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;
    dispatch(hydrateRideState());
  }, [dispatch, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeToRides(() => {
      dispatch(syncRideState());
    });

    const interval = setInterval(() => {
      dispatch(syncRideState());
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [dispatch, enabled]);
}
