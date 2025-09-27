import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format, Locale } from 'date-fns';

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  const days = eachDayOfInterval({ start, end });
  
  // Pad start of the month to align with Monday
  const firstDayOfWeek = getDay(start); // Sunday is 0
  const startPadding = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); // Monday is 0
  
  for (let i = 0; i < startPadding; i++) {
    days.unshift(new Date(start.getTime() - (i + 1) * 24 * 60 * 60 * 1000));
  }
  
  // Pad end of the month to fill the grid
  while (days.length % 7 !== 0) {
    days.push(new Date(days[days.length - 1].getTime() + 24 * 60 * 60 * 1000));
  }
  
  return days;
};

export const getMonthName = (date: Date, locale?: Locale): string => {
  return format(date, 'MMMM yyyy', { locale });
};

export const isSameMonth = (day: Date, month: Date): boolean => {
  return day.getMonth() === month.getMonth();
};

export const isToday = (day: Date): boolean => {
  const today = new Date();
  return day.getDate() === today.getDate() &&
         day.getMonth() === today.getMonth() &&
         day.getFullYear() === today.getFullYear();
};
