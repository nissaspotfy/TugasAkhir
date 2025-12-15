import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import api, { setAuthToken } from '../lib/api'

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
        
        setToken: (token) => {
            setAuthToken(token);
            set({ token });
        },
        
        login: async (email, password) => {
            set({ isLoading: true, error: null });
            try {
                const response = await api.post('/auth/login', { email, password });
                const data = response.data;
                const token = data.data.token;

                // Set token immediately for subsequent requests
                setAuthToken(token);

                set({ 
                    user: data.data, 
                    token: token, 
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
        
        logout: () => {
          setAuthToken(null);
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            error: null
          })
        },
        
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