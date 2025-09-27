import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, Download, Users, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLang } from '@/hooks/useLang'
import { motion } from 'framer-motion'
import ReactECharts from 'echarts-for-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { localDB } from '@/lib/local-db'
import { exportToCSV } from '@/lib/export'
import { AttendanceRecord } from '@/types'
import { formatWorkHours, formatDelay, formatDecimalHoursToHM } from '@/lib/utils'

export function Dashboard() {
  const { t, currentLanguage } = useLang()
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: analyticsApi.getSummary,
    staleTime: 0,
  })

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: analyticsApi.getAnalyticsData,
    staleTime: 0,
  })

  const handleViewReports = () => {
    navigate('/analytics')
  }

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(t('alerts.exportingData'));
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const monthStr = String(month + 1).padStart(2, '0');
      const monthName = now.toLocaleString(currentLanguage, { month: 'long' });

      const allEmployees = await localDB.employees.findMany();
      const allAttendance = await localDB.attendance.getAll();

      if (allAttendance.length === 0) {
        toast.dismiss(toastId);
        toast.error(t('alerts.noDataToExport'));
        setIsExporting(false);
        return;
      }

      const monthlyAttendance = allAttendance.filter(rec => rec.date.startsWith(`${year}-${monthStr}`));
      const attendanceByEmployee = new Map<string, AttendanceRecord[]>();
      monthlyAttendance.forEach(rec => {
        if (!attendanceByEmployee.has(rec.matricule)) {
          attendanceByEmployee.set(rec.matricule, []);
        }
        attendanceByEmployee.get(rec.matricule)!.push(rec);
      });

      const headerKeys = {
        matricule: t('employee.matricule'),
        employeeName: t('employee.name'),
        department: t('employee.department'),
        status: t('employee.status'),
        firstIn: t('attendance.firstIn'),
        lastOut: t('attendance.lastOut'),
        workHours: t('attendance.hours'),
        delay: t('attendance.delay'),
        daysWorked: t('kpi.daysWorked'),
        daysAbsent: t('kpi.daysAbsent'),
        totalHours: t('kpi.totalHours'),
        avgDelay: t('kpi.avgDelay'),
        lateDays: t('kpi.lateDays'),
        minorDelays: t('kpi.minorDelays'),
        holidaysWorked: t('kpi.holidaysWorked'),
      };

      const exportData = allEmployees.map(employee => {
        const records = attendanceByEmployee.get(employee.matricule) || [];

        const daysWorked = records.filter(r => r.credit > 0).length;
        const daysAbsent = records.filter(r => r.status === 'Absent').length;
        const totalHours = records.reduce((sum, r) => sum + r.hours, 0);
        const lateRecords = records.filter(r => r.delayMin > 0);
        const avgDelay = lateRecords.length > 0 ? lateRecords.reduce((sum, r) => sum + r.delayMin, 0) / lateRecords.length : 0;
        const lateDays = records.filter(r => r.status === 'Late').length;
        const minorDelays = records.filter(r => r.delayMin > 0 && r.delayMin <= 10).length;
        const holidaysWorked = records.filter(r => r.isHolidayWorked).length;

        const lastRecord = [...records].sort((a, b) => b.date.localeCompare(a.date))[0];

        return {
          [headerKeys.matricule]: employee.matricule,
          [headerKeys.employeeName]: employee.name,
          [headerKeys.department]: employee.department || 'N/A',
          [headerKeys.status]: employee.status || 'N/A',
          [headerKeys.firstIn]: lastRecord?.firstIn || 'N/A',
          [headerKeys.lastOut]: lastRecord?.lastOut || 'N/A',
          [headerKeys.workHours]: formatWorkHours(lastRecord?.hours || 0),
          [headerKeys.delay]: formatDelay(lastRecord?.delayMin || 0),
          [headerKeys.daysWorked]: daysWorked,
          [headerKeys.daysAbsent]: daysAbsent,
          [headerKeys.totalHours]: formatDecimalHoursToHM(totalHours),
          [headerKeys.avgDelay]: formatDelay(avgDelay),
          [headerKeys.lateDays]: lateDays,
          [headerKeys.minorDelays]: minorDelays,
          [headerKeys.holidaysWorked]: holidaysWorked,
        };
      });

      const orderedHeaders = [
        headerKeys.matricule, headerKeys.employeeName, headerKeys.department, headerKeys.status,
        headerKeys.firstIn, headerKeys.lastOut, headerKeys.workHours, headerKeys.delay,
        headerKeys.daysWorked, headerKeys.daysAbsent, headerKeys.totalHours, headerKeys.avgDelay,
        headerKeys.lateDays, headerKeys.minorDelays, headerKeys.holidaysWorked
      ];

      exportToCSV(exportData, orderedHeaders, `attendance_${monthName}_${year}.csv`);
      toast.dismiss(toastId);
      toast.success(t('alerts.exportSuccess'));
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(t('alerts.exportFailed'));
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const processedDeptData = useMemo(() => {
    if (!analyticsData?.departmentDistribution) {
      return { categories: [], data: [], total: 0 };
    }

    const sortedData = [...analyticsData.departmentDistribution].sort((a, b) => b.value - a.value);
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);

    let displayData = sortedData;
    if (sortedData.length > 8) {
      const top7 = sortedData.slice(0, 7);
      const otherValue = sortedData.slice(7).reduce((sum, item) => sum + item.value, 0);
      displayData = [...top7, { name: 'Other', value: otherValue }];
    }

    displayData.reverse();

    return {
      categories: displayData.map(item => item.name),
      data: displayData.map(item => item.value),
      total,
    };
  }, [analyticsData]);

  const attendanceChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: analyticsData?.weeklyAttendanceTrend.map(d => d.day) || [] },
    yAxis: { type: 'value', name: 'Present Employees' },
    series: [{ data: analyticsData?.weeklyAttendanceTrend.map(d => d.presentCount) || [], type: 'line', smooth: true, areaStyle: {} }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  }

  const departmentChartOptions = {
    color: ['#83a6ed', '#8e98ee', '#a288e4', '#b978d9', '#d068c8', '#e758b4', '#fd469d', '#ff3185'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0];
        const percent = processedDeptData.total > 0 ? ((data.value / processedDeptData.total) * 100).toFixed(1) : 0;
        return `${data.name}: <strong>${data.value}</strong> employees (${percent}%)`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01], axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', data: processedDeptData.categories, axisTick: { show: false }, axisLine: { show: false } },
    series: [{ name: 'Employees', type: 'bar', data: processedDeptData.data, barMaxWidth: 30, label: { show: true, position: 'right', color: 'inherit', formatter: '{c}' } }]
  };

  const kpiCards = [
    { title: t('dashboard.totalEmployees'), value: summary?.totalEmployees, icon: Users },
    { title: t('dashboard.presentToday'), value: summary?.presentToday, icon: Clock },
    { title: t('dashboard.lateArrivalsToday'), value: summary?.lateArrivals, icon: AlertCircle },
    { title: t('dashboard.avgMonthlyHours'), value: `${summary?.avgWorkHours}h`, icon: TrendingUp },
  ]

  const isLoading = isSummaryLoading || isAnalyticsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleViewReports}><FileText className="h-4 w-4 mr-2" />{t('buttons.viewReports')}</Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {t('buttons.export')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : <div className="text-2xl font-bold">{card.value}</div>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle>{t('dashboard.weeklyTrend')}</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <div className="flex items-center justify-center h-[300px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : <ReactECharts option={attendanceChartOptions} style={{ height: '300px' }} />}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>{t('dashboard.byDepartment')}</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <div className="flex items-center justify-center h-[300px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : <ReactECharts option={departmentChartOptions} style={{ height: '300px' }} />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
