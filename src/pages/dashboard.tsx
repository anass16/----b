import React, { useMemo } from 'react'
import { FileText, Download, Users, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLang } from '@/hooks/useLang'
import { motion } from 'framer-motion'
import ReactECharts from 'echarts-for-react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'

export function Dashboard() {
  const { t } = useLang()

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: analyticsApi.getSummary,
    staleTime: 0, // Always refetch for latest data
  })

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: analyticsApi.getAnalyticsData,
    staleTime: 0, // Always refetch for latest data
  })

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

    // Reverse for horizontal bar chart display (largest on top)
    displayData.reverse();

    return {
      categories: displayData.map(item => item.name),
      data: displayData.map(item => item.value),
      total,
    };
  }, [analyticsData]);

  // Chart options
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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: processedDeptData.categories,
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        name: 'Employees',
        type: 'bar',
        data: processedDeptData.data,
        barMaxWidth: 30,
        label: {
          show: true,
          position: 'right',
          color: 'inherit',
          formatter: '{c}'
        },
      }
    ]
  };

  const kpiCards = [
    { title: 'Total Employees', value: summary?.totalEmployees, icon: Users },
    { title: 'Present Today', value: summary?.presentToday, icon: Clock },
    { title: 'Late Arrivals Today', value: summary?.lateArrivals, icon: AlertCircle },
    { title: 'Avg Monthly Hours', value: `${summary?.avgWorkHours}h`, icon: TrendingUp },
  ]

  const isLoading = isSummaryLoading || isAnalyticsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.dashboard')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your attendance overview.</p>
        </div>
        <div className="flex space-x-3">
          <Button><FileText className="h-4 w-4 mr-2" />{t('buttons.viewReports')}</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />{t('buttons.export')}</Button>
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
            <CardHeader>
              <CardTitle>Weekly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ReactECharts option={attendanceChartOptions} style={{ height: '300px' }} />
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Employees by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ReactECharts option={departmentChartOptions} style={{ height: '300px' }} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
