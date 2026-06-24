import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
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
          localStorage.removeItem('adminActiveTab');
          localStorage.removeItem('customerActiveTab');
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
        storage: {
          getItem: (name) => {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const key = isAdminPath ? 'admin-auth-storage' : 'customer-auth-storage';
            const value = localStorage.getItem(key);
            try {
              if (value) {
                const parsed = JSON.parse(value);
                if (parsed && parsed.state) {
                  parsed.state.isLoading = false;
                  parsed.state.error = null;
                }
                return parsed;
              }
              return null;
            } catch (e) {
              console.error('Error parsing auth state in getItem', e);
              return null;
            }
          },
          setItem: (name, value) => {
            const stringified = JSON.stringify(value);
            try {
              const user = value.state?.user;
              if (user) {
                const roleVal = typeof user.role === 'string' ? user.role : (user.role?.nama_role || 'user');
                const role = roleVal.toLowerCase();
                if (role === 'admin') {
                  localStorage.setItem('admin-auth-storage', stringified);
                  return;
                } else {
                  localStorage.setItem('customer-auth-storage', stringified);
                  return;
                }
              }
            } catch (e) {
              console.error('Error handling auth state in setItem', e);
            }
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const key = isAdminPath ? 'admin-auth-storage' : 'customer-auth-storage';
            localStorage.setItem(key, stringified);
          },
          removeItem: (name) => {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const key = isAdminPath ? 'admin-auth-storage' : 'customer-auth-storage';
            localStorage.removeItem(key);
          }
        },
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
)

export const getUserRole = (user) => {
  if (!user) return 'user';
  const roleVal = typeof user.role === 'string' ? user.role : (user.role?.nama_role || 'user');
  return roleVal.toLowerCase();
};

export default useAuthStore;