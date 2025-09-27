import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/features/monthly-report/columns';
import { useLang } from '@/hooks/useLang';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MonthlyReportRow {
  matricule: string;
  name: string;
  department: string;
  daysWorked: number;
}

export function MonthlyReportPage() {
  const { t, currentLanguage } = useLang();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => currentYear - 5 + i), [currentYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i).toLocaleString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' })
  })), [currentLanguage]);

  const { data: reportData = [], isLoading } = useQuery<MonthlyReportRow[]>({
    queryKey: ['monthlyWorkedDaysReport', year, month],
    queryFn: () => analyticsApi.getMonthlyWorkedDaysReport(year, month),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('monthlyReport.title')}</h1>
      <p className="text-muted-foreground">{t('monthlyReport.description')}</p>

      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('common.filter')}</CardTitle>
            <CardDescription>{t('monthlyReport.selectMonthAndYear')}</CardDescription>
          </div>
          <div className="flex gap-4">
            <Select value={String(month)} onValueChange={(val) => setMonth(Number(val))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('monthlyReport.selectMonth')} />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('monthlyReport.selectYear')} />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reportData}
            isLoading={isLoading}
            filterColumnId="name"
            filterPlaceholder={t('employees.filterPlaceholder')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
