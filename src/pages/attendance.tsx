import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/features/attendance/columns';
import { useLang } from '@/hooks/useLang';
import { AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const { t } = useLang();

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: () => attendanceApi.getDailyAttendance(selectedDate),
  });

  const stats = useMemo(() => {
    if (!attendanceData) {
      return { present: 0, absent: 0, late: 0 };
    }
    return attendanceData.reduce(
      (acc, record) => {
        if (record.status === 'Present') acc.present++;
        if (record.status === 'Absent') acc.absent++;
        if (record.status === 'Late') acc.late++;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
  }, [attendanceData]);

  const filterCards = [
    { title: t('common.all'), value: attendanceData?.length || 0, status: 'all', icon: Clock, color: 'text-blue-500' },
    { title: t('attendance.present'), value: stats.present, status: 'Present', icon: UserCheck, color: 'text-green-500' },
    { title: t('attendance.absent'), value: stats.absent, status: 'Absent', icon: UserX, color: 'text-red-500' },
    { title: t('attendance.late'), value: stats.late, status: 'Late', icon: AlertTriangle, color: 'text-yellow-500' },
  ] as const;

  const filteredData = useMemo(() => {
    if (!attendanceData) return [];
    if (statusFilter === 'all') return attendanceData;
    return attendanceData.filter(record => record.status === statusFilter);
  }, [attendanceData, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('attendance.title')}</h1>
        <div className="w-48">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filterCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card
              onClick={() => setStatusFilter(card.status)}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md hover:-translate-y-1',
                statusFilter === card.status ? 'ring-2 ring-primary shadow-lg' : 'ring-0'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 text-muted-foreground ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        filterColumnId="name"
        filterPlaceholder={t('attendance.filterPlaceholder')}
      />
    </div>
  );
}
