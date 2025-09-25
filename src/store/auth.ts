import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/data'
import { localDB } from '@/lib/local-db'

type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  role: Role | null
  login: (matricule: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      role: null,
      login: async (matricule: string) => {
        const user = await localDB.auth.findUser(matricule);
        if (user) {
          set({ isAuthenticated: true, user, role: user.role })
          return true
        }
        return false
      },
      logout: () => {
        localDB.clearAllData();
        set({ isAuthenticated: false, user: null, role: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        role: state.role,
       }),
    }
  )
)
