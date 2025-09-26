import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const predefinedReasons = [
  'Adoption Leave',
  'Annual / Paid Leave',
  'Authorized Absence',
  'Exceptional Leave (Bereavement, Wedding, etc.)',
  'Maternity / Paternity Leave',
  'Military Service Leave',
  'Parental Leave',
  'Professional Mission',
  'Sabbatical Leave',
  'Sick Leave',
  'Strike',
  'Training / Internship',
  'Unjustified Absence',
  'Unjustified Lateness',
  'UNJUSTIFIED_EARLY_DEPARTURE',
  'Unpaid Leave',
];

interface ReasonsState {
  customReasons: string[];
  addCustomReason: (reason: string) => void;
}

export const useReasonsStore = create<ReasonsState>()(
  persist(
    (set) => ({
      customReasons: [],
      addCustomReason: (reason: string) => {
        set((state) => ({
          customReasons: [...new Set([...state.customReasons, reason])]
        }));
      },
    }),
    {
      name: 'attendance-reasons-storage',
    }
  )
);
