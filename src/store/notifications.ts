import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationApi } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string, userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  fetchNotifications: async (userId: string) => {
    const notifications = await notificationApi.getNotifications(userId);
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  },

  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: async (id: string, userId: string) => {
    await notificationApi.markAsRead(id);
    get().fetchNotifications(userId);
  },

  markAllAsRead: async (userId: string) => {
    await notificationApi.markAllAsRead(userId);
    get().fetchNotifications(userId);
  },

  clearAll: async (userId: string) => {
    await notificationApi.deleteAll(userId);
    set({ notifications: [], unreadCount: 0 });
  },
}));
