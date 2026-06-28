import { create } from 'zustand';
import api from '../lib/api';
import { connectSocket, disconnectSocket as cleanupSocket } from '../lib/socket';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const data = response.data?.data || [];
      const unreadCount = data.filter(n => !n.is_read).length;
      set({ notifications: data, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      const updatedNotifications = get().notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
      set({ notifications: updatedNotifications, unreadCount });
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/read-all');
      const updatedNotifications = get().notifications.map(n => ({ ...n, is_read: true }));
      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  initializeSocket: (token) => {
    if (!token) return;
    const socket = connectSocket(token);

    socket.off('notification_received'); // Clean up duplicate listeners
    socket.on('notification_received', (newNotif) => {
      console.log('Socket notification received:', newNotif);

      const currentNotifications = get().notifications;
      const updatedNotifications = [newNotif, ...currentNotifications];
      const unreadCount = updatedNotifications.filter(n => !n.is_read).length;

      set({ notifications: updatedNotifications, unreadCount });

      // Dispatch a custom browser event for instant updates across components
      window.dispatchEvent(new CustomEvent('new_notification_alert', { detail: newNotif }));
    });
  },

  disconnectSocket: () => {
    cleanupSocket();
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
    cleanupSocket();
  }
}));

export default useNotificationStore;
