import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { hydrateRideState, syncRideState } from '@store';

export function useRideSync(enabled = true) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;
    dispatch(hydrateRideState());
  }, [dispatch, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      dispatch(syncRideState());
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatch, enabled]);
}
