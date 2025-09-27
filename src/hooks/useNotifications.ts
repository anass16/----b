import { useEffect, useCallback } from 'react';
import { useEventBus } from './useEventBus';
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notifications';
import { notificationApi } from '@/lib/api';
import { useLang } from './useLang';
import { Notification } from '@/types';

export const useNotifications = () => {
  const { listen } = useEventBus();
  const { user } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { t } = useLang();

  const handleNotificationEvent = useCallback(async (eventDetail: any) => {
    if (!user) return;

    let notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'userId'> | null = null;

    switch (eventDetail.type) {
      case 'employee:created':
        notificationData = {
          message: t('notifications.employeeAdded', { name: eventDetail.data.name }),
          type: 'success',
          link: `/employees/${eventDetail.data.matricule}`
        };
        break;
      case 'leave:submitted':
        notificationData = {
          message: t('notifications.leaveSubmitted', { name: eventDetail.data.name }),
          type: 'info',
          link: `/leave`
        };
        break;
      case 'leave:statusChanged':
        notificationData = {
            message: t('notifications.leaveStatusChanged', { name: eventDetail.data.name, status: eventDetail.data.status.toLowerCase() }),
            type: eventDetail.data.status === 'APPROVED' ? 'success' : 'warning',
            link: `/leave`
        };
        break;
      case 'report:exported':
        notificationData = {
            message: t('notifications.reportExported', { name: eventDetail.data.fileName }),
            type: 'info',
            link: `#` // No link for this one
        };
        break;
    }

    if (notificationData) {
      await notificationApi.create({ ...notificationData, userId: user.matricule });
      fetchNotifications(user.matricule); // Refetch to update the list
    }
  }, [user, t, fetchNotifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.matricule);
      const unsubscribe = listen('notification', handleNotificationEvent);
      return () => unsubscribe();
    }
  }, [user, listen, handleNotificationEvent, fetchNotifications]);
};
