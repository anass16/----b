import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { UserPlus, FileText, CalendarClock, CheckCircle, XCircle, Info, FileDown } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Notification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const typeIcons: Record<NotificationType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: CalendarClock,
  info: Info,
};

const getIconForMessage = (message: string): React.ElementType => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('employee')) return UserPlus;
    if (lowerMessage.includes('leave') || lowerMessage.includes('congé')) return CalendarClock;
    if (lowerMessage.includes('report') || lowerMessage.includes('rapport')) return FileDown;
    return Info;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const { currentLanguage } = useLang();
  const locale = currentLanguage === 'fr' ? fr : enUS;

  const Icon = getIconForMessage(notification.message);

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.link && notification.link !== '#') {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenuItem
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer focus:bg-accent',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-900/30'
      )}
      onSelect={(e) => { e.preventDefault(); handleClick(); }}
    >
      <Icon className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-sm text-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 self-center flex-shrink-0" />
      )}
    </DropdownMenuItem>
  );
}
