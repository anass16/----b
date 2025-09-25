import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClockState {
  hour12: boolean;
  setHour12: (is12: boolean) => void;
}

export const useClockStore = create<ClockState>()(
  persist(
    (set) => ({
      hour12: false, // Default to 24-hour format
      setHour12: (is12) => set({ hour12: is12 }),
    }),
    {
      name: 'clock-preferences',
    }
  )
);
