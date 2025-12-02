import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const useUIStore = create(
  devtools((set) => ({
    theme: 'light',
    isLoading: false,
    notifications: [],
    
    setTheme: (theme) => set({ theme }),
    
    toggleTheme: () => set((state) => ({ 
      theme: state.theme === 'light' ? 'dark' : 'light' 
    })),
    
    setLoading: (isLoading) => set({ isLoading }),
    
    addNotification: (notification) => set((state) => ({ 
      notifications: [...state.notifications, { 
        id: Date.now(), 
        ...notification 
      }] 
    })),
    
    removeNotification: (id) => set((state) => ({ 
      notifications: state.notifications.filter(n => n.id !== id) 
    })),
    
    clearNotifications: () => set({ notifications: [] }),
  }))
)

export default useUIStore
