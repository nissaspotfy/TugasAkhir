import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import api from '../lib/api'

const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: true }),
        
        setToken: (token) => set({ token }),
        
        login: async (email, password) => {
            set({ isLoading: true, error: null });
            try {
                const response = await api.post('/auth/login', { email, password });
                const data = response.data;

                set({ 
                    user: data.data, 
                    token: data.data.token, 
                    isAuthenticated: true,
                    isLoading: false 
                });
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Login failed';
                set({ error: message, isLoading: false });
                throw error;
            }
        },

        register: async (userData) => {
            set({ isLoading: true, error: null });
            try {
                await api.post('/auth/register', userData);
                set({ isLoading: false, error: null });
            } catch (error) {
                const message = error.response?.data?.message || error.message || 'Registration failed';
                set({ error: message, isLoading: false });
                throw error;
            }
        },
        
        logout: () => set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null
        }),
        
        updateUser: (userData) => set((state) => ({ 
          user: { ...state.user, ...userData } 
        })),
      }),
      {
        name: 'auth-storage',
      }
    )
  )
)

export default useAuthStore