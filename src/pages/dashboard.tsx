import React from 'react'
import { FileText, Download, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react'
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
    queryFn: analyticsApi.getSummary
  })

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: analyticsApi.getAnalyticsData,
  })

  // Chart options
  const attendanceChartOptions = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [{ data: [85, 92, 88, 90, 87, 45, 0], type: 'line', smooth: true, areaStyle: {} }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  }

  const departmentChartOptions = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: analyticsData?.departmentDistribution || []
    }]
  }

  const kpiCards = [
    { title: 'Total Employees', value: summary?.totalEmployees, change: '+2.5%', icon: Users },
    { title: 'Present Today', value: summary?.presentToday, change: '93.7% rate', icon: Clock },
    { title: 'Late Arrivals', value: summary?.lateArrivals, change: '-12%', icon: AlertCircle },
    { title: 'Avg Work Hours', value: `${summary?.avgWorkHours}h`, change: '+0.3h', icon: TrendingUp },
  ]

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
                {isSummaryLoading ? <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : <div className="text-2xl font-bold">{card.value}</div>}
                <p className="text-xs text-muted-foreground">{card.change}</p>
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
              <ReactECharts option={attendanceChartOptions} style={{ height: '300px' }} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Employees by Department</CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyticsLoading ? <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : <ReactECharts option={departmentChartOptions} style={{ height: '300px' }} />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
