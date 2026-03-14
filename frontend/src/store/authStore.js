import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const authStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      employeeId: null,
      isAuthenticated: false,
      setAuth: (token, role, employeeId) => set({
        token,
        role,
        employeeId,
        isAuthenticated: true,
      }),
      clearAuth: () => set({
        token: null,
        role: null,
        employeeId: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => sessionStorage.getItem(name),
        setItem: (name, value) => sessionStorage.setItem(name, value),
        removeItem: (name) => sessionStorage.removeItem(name)
      }
    }
  )
);