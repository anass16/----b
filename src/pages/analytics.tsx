import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useLang } from '@/hooks/useLang';

export function AnalyticsPage() {
  const { t } = useLang();
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: analyticsApi.getAnalyticsData,
  });

  const departmentOptions = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 10, data: analyticsData?.departmentDistribution.map(d => d.name) },
    series: [{
      name: t('employee.department'),
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: '30', fontWeight: 'bold' } },
      labelLine: { show: false },
      data: analyticsData?.departmentDistribution || [],
    }],
  };

  const statusOptions = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center' },
    series: [{
      name: t('employee.status'),
      type: 'pie',
      radius: '50%',
      data: analyticsData?.statusDistribution || [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    }],
  };

  const placeholderOptions = {
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { type: 'value' },
    series: [{ data: [8.1, 8.2, 8.0, 8.3, 8.4, 8.2], type: 'bar' }],
    tooltip: { trigger: 'axis' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>{t('analytics.byDepartment')}</CardTitle></CardHeader>
            <CardContent>
              <ReactECharts option={departmentOptions} style={{ height: '400px' }} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>{t('analytics.statusDistribution')}</CardTitle></CardHeader>
            <CardContent>
              <ReactECharts option={statusOptions} style={{ height: '400px' }} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.avgHours')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('analytics.placeholder')}</p>
            </CardHeader>
            <CardContent>
              <ReactECharts option={placeholderOptions} style={{ height: '400px' }} />
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.performance')}</CardTitle>
               <p className="text-sm text-muted-foreground">{t('analytics.performancePlaceholder')}</p>
            </CardHeader>
            <CardContent>
              <ReactECharts option={placeholderOptions} style={{ height: '400px' }} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
