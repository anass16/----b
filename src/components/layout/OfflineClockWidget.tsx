import React, { useState, useEffect, useMemo } from 'react';
import { useClockStore } from '@/store/clock';
import { useLang } from '@/hooks/useLang';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const StatusIndicator = ({ isOnline, onlineText, offlineText }: { isOnline: boolean, onlineText: string, offlineText: string }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOnline ? 'online' : 'offline'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-medium",
          isOnline 
            ? "bg-green-100/80 dark:bg-green-900/50 text-green-800 dark:text-green-200" 
            : "bg-yellow-100/80 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
        )}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isOnline ? "bg-green-400" : "bg-yellow-400"
            )}
          ></span>
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isOnline ? "bg-green-500" : "bg-yellow-500"
            )}
          ></span>
        </span>
        <span>{isOnline ? onlineText : offlineText}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export function OfflineClockWidget() {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { hour12 } = useClockStore();
  const { currentLanguage, t } = useLang();

  useEffect(() => {
    let animationFrameId: number;
    const updateClock = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(updateClock);
    };
    animationFrameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeFormatter = useMemo(() => {
    const lang = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(lang, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: hour12,
      timeZone: 'Africa/Casablanca',
    });
  }, [currentLanguage, hour12]);

  const dateFormatter = useMemo(() => {
    const lang = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(lang, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Casablanca',
    });
  }, [currentLanguage]);

  return (
    <div className="flex items-center space-x-4 rounded-xl border border-black/5 dark:border-white/10 bg-gray-500/10 dark:bg-gray-900/20 p-2 shadow-lg backdrop-blur-md">
      <div className="flex flex-col items-center justify-center min-w-[120px]">
        <div className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums tracking-wider">
          {timeFormatter.format(time)}
        </div>
        <div className="text-[11px] text-gray-600 dark:text-gray-400 uppercase tracking-widest">
          {dateFormatter.format(time)}
        </div>
      </div>
      <StatusIndicator isOnline={isOnline} onlineText={t('common.online')} offlineText={t('common.offline')} />
    </div>
  );
}
