import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { attendanceApi, holidays } from '@/lib/api';
import { getMonthDays, getMonthName, isSameMonth, isToday } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from '@/types';
import { DayDetailModal } from './DayDetailModal';
import { useLang } from '@/hooks/useLang';

interface AttendanceHeatmapProps {
  matricule: string;
}

const Legend = () => {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
      <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 mr-1"></div>{t('heatmap.legend.noData')}</div>
      <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-green-500 mr-1"></div>{t('heatmap.legend.worked')}</div>
      <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-red-500 mr-1"></div>{t('heatmap.legend.absent')}</div>
      <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-blue-500 mr-1"></div>{t('heatmap.legend.holidayWorked')}</div>
      <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-[#FFD700] mr-1"></div>{t('heatmap.legend.holiday')}</div>
    </div>
  );
};

export function AttendanceHeatmap({ matricule }: AttendanceHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentLanguage, t } = useLang();
  const locale = currentLanguage === 'fr' ? fr : enUS;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['monthlyAttendance', matricule, year, month],
    queryFn: () => attendanceApi.getMonthlyAttendance(matricule, year, month),
  });

  const daysInMonth = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const dayNames = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
        // 2017-01-02 is a Monday
        list.push(format(new Date(2017, 0, 2 + i), 'E', { locale }));
    }
    return list;
  }, [locale]);
  
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceData?.forEach(record => map.set(record.date, record));
    return map;
  }, [attendanceData]);

  const changeMonth = (amount: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + amount));
    setCurrentDate(new Date(newDate));
  };

  const handleDayClick = (day: Date) => {
    const record = attendanceMap.get(format(day, 'yyyy-MM-dd'));
    if (record) {
      setSelectedRecord(record);
      setIsModalOpen(true);
    }
  };

  const getDayColor = (day: Date): string => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const record = attendanceMap.get(dayStr);
    const isHoliday = !!holidays[dayStr];

    if (record && record.hours > 0) {
      return record.isHolidayWorked ? 'bg-blue-500' : 'bg-green-500';
    }
    if (isHoliday) {
      return 'bg-[#FFD700]';
    }
    if (record && record.status === 'Absent') {
      return 'bg-red-500';
    }
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('heatmap.title')}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="w-32 text-center font-semibold">{getMonthName(currentDate, locale)}</span>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500">
              {dayNames.map(name => <div key={name}>{name}</div>)}
            </div>
            <motion.div 
              key={currentDate.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-7 gap-2 mt-2"
            >
              {daysInMonth.map((day, index) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const record = attendanceMap.get(dayKey);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const holidayName = holidays[dayKey];

                return (
                  <TooltipProvider key={dayKey} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.01 }}
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            'aspect-square rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-200 ease-out transform hover:scale-110 hover:shadow-lg',
                            isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 opacity-50',
                            isToday(day) && 'ring-2 ring-blue-500',
                            isCurrentMonth ? getDayColor(day) : 'bg-gray-100 dark:bg-gray-800'
                          )}
                        >
                          {format(day, 'd')}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {holidayName ? (
                          <p className="font-semibold">{`${holidayName} — ${format(day, 'dd/MM/yyyy')}`}</p>
                        ) : (
                          <p>{format(day, 'PPP', { locale })}</p>
                        )}
                        {record && (
                          <>
                            <p>{t('heatmap.tooltip.status')}: {record.status}</p>
                            {record.hours > 0 && <p>{t('heatmap.tooltip.hours')}: {record.hours.toFixed(2)}</p>}
                          </>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </motion.div>
          </>
        )}
        <Legend />
      </CardContent>
      <DayDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} record={selectedRecord} />
    </Card>
  );
}
