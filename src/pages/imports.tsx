import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertTriangle, CheckCircle, List, FileText, Download, Upload, X, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { parseAttendanceFromFile, downloadUnmatchedRowsAsCSV } from '@/utils/parseAttendanceFromExcel';
import { parseEmployeesFromFile, rebuildCorrectedWorkbook } from '@/utils/parseEmployeesFromExcel';
import { localDB } from '@/lib/local-db';
import { AttendanceParseResult, ParseResult, ParsedAttendanceRow, User } from '@/types';
import { columns as attendanceImportColumns } from '@/features/attendance/import-columns';
import { employeeImportColumns } from '@/features/employees/employee-import-columns';
import { useLang } from '@/hooks/useLang';

type UnifiedParseResult = { type: 'attendance', data: AttendanceParseResult } | { type: 'employees', data: ParseResult };

export function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<UnifiedParseResult | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLang();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setIsLoading(true);
    setParseResult(null);

    try {
      const buffer = await droppedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (data.length < 1) {
        toast.error(t('alerts.fileEmpty'));
        setIsLoading(false);
        return;
      }

      const headers = data[0].map(h => String(h).toLowerCase().trim());
      const isAttendanceFile = headers.includes('temps.') || headers.includes('e/s.') || headers.includes('e/s calculée.');
      const isEmployeeFile = headers.includes('department') && (headers.includes('name') || (headers.includes('firstname') && headers.includes('lastname'))) && headers.includes('status');

      if (isAttendanceFile) {
        const result = await parseAttendanceFromFile(droppedFile);
        if (result.errors.length > 0) toast.error(result.errors[0]);
        else toast.success(t('alerts.attendanceParsedSuccess', { count: result.stats.total }));
        setParseResult({ type: 'attendance', data: result });
      } else if (isEmployeeFile) {
        const result = await parseEmployeesFromFile(droppedFile);
        if (result.errors.length > 0) toast.error(result.errors[0]);
        else toast.success(t('alerts.employeeParsedSuccess', { count: result.stats.total }));
        setParseResult({ type: 'employees', data: result });
      } else {
        toast.error(t('alerts.unrecognizedFormat'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('alerts.parseFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!parseResult) return;
    setIsLoading(true);

    try {
      if (parseResult.type === 'attendance') {
        const { processedRecords, stats } = parseResult.data;
        if (stats.matched === 0) {
          toast.error(t('alerts.noValidRecords'));
          return;
        }
        await localDB.attendance.overwriteAll(processedRecords);
        toast.success(t('alerts.uploadSuccess', { count: stats.matched }));
        await queryClient.invalidateQueries();
        handleReset();
        navigate('/');
      } else if (parseResult.type === 'employees') {
        const validRows = parseResult.data.rows.filter(r => r.__errors.length === 0);
        if (validRows.length === 0) {
          toast.error(t('alerts.noValidRecords'));
          return;
        }
        const newUsers: User[] = validRows.map(row => ({
          id: row.matricule!, matricule: row.matricule!,
          firstName: row.firstName!, lastName: row.lastName!,
          name: `${row.firstName} ${row.lastName}`,
          department: row.department || 'N/A', role: 'EMPLOYEE',
          status: row.status || 'Active', worksSaturday: false,
          createdAt: new Date().toISOString(), email: row.email,
          phone: row.phone, hireDate: row.hireDate,
        }));
        localDB.employees.overwriteAll(newUsers);
        toast.success(t('alerts.uploadSuccess', { count: newUsers.length }));
        await queryClient.invalidateQueries({ queryKey: ['employees'] });
        handleReset();
        navigate('/employees');
      }
    } catch (error) {
      toast.error(t('alerts.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadUnmatched = () => parseResult?.type === 'attendance' && downloadUnmatchedRowsAsCSV(parseResult.data.unmatchedRows);
  const handleCorrectAndDownload = () => parseResult?.type === 'employees' && rebuildCorrectedWorkbook(parseResult.data.rows);
  const handleReset = () => { setFile(null); setParseResult(null); };

  const renderContent = () => {
    if (!parseResult) {
      return (
        <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Card>
            <CardHeader><CardTitle>{t('imports.uploadFile')}</CardTitle></CardHeader>
            <CardContent>
              <div {...getRootProps()} className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                <input {...getInputProps()} />
                {isLoading ? (
                  <><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-lg font-semibold">{t('imports.processing')}</p></>
                ) : (
                  <><UploadCloud className="h-12 w-12 text-gray-400" /><p className="mt-4 text-lg font-semibold">{t('imports.dropzone')}</p><p className="text-sm text-muted-foreground">{t('imports.dropzoneSubtext')}</p></>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    if (parseResult.type === 'attendance') {
      const { stats, rows } = parseResult.data;
      const statCards = [
        { title: t('imports.totalRows'), value: stats.total, icon: List },
        { title: t('imports.matchedRows'), value: stats.matched, icon: CheckCircle, color: "text-green-500" },
        { title: t('imports.unmatchedRows'), value: stats.unmatched, icon: AlertTriangle, color: "text-red-500" },
        { title: t('imports.period'), value: `${stats.period.start} to ${stats.period.end}`, icon: FileText },
      ];
      return (
        <motion.div key="attendance-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{card.title}</CardTitle><card.icon className={`h-4 w-4 text-muted-foreground ${card.color || ''}`} /></CardHeader>
                <CardContent><div className={card.title === t('imports.period') ? 'text-sm font-semibold' : 'text-2xl font-bold'}>{card.value}</div></CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>{t('imports.previewTitle')}</CardTitle><p className="text-sm text-muted-foreground">{t('imports.previewSubtitle')}</p></CardHeader>
            <CardContent><DataTable columns={attendanceImportColumns} data={rows} /></CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            {stats.unmatched > 0 && <Button variant="secondary" onClick={handleDownloadUnmatched}><Download className="mr-2 h-4 w-4" /> {t('imports.downloadUnmatched')}</Button>}
            <Button onClick={handleImport} disabled={isLoading || stats.matched === 0}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} {t('buttons.importRecords', { count: stats.matched })}</Button>
          </div>
        </motion.div>
      );
    }

    if (parseResult.type === 'employees') {
      const { stats, rows } = parseResult.data;
      const statCards = [
        { title: t('imports.totalRows'), value: stats.total, icon: List },
        { title: t('imports.validRows'), value: stats.valid, icon: CheckCircle, color: "text-green-500" },
        { title: t('imports.invalidRows'), value: stats.invalid, icon: AlertTriangle, color: "text-red-500" },
        { title: t('imports.departmentsFound'), value: stats.departments.length, icon: Users },
      ];
      return (
        <motion.div key="employee-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{card.title}</CardTitle><card.icon className={`h-4 w-4 text-muted-foreground ${card.color || ''}`} /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{card.value}</div></CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>{t('imports.previewTitle')}</CardTitle><p className="text-sm text-muted-foreground">{t('imports.previewSubtitle')}</p></CardHeader>
            <CardContent><DataTable columns={employeeImportColumns} data={rows} /></CardContent>
          </Card>
          <div className="flex justify-end space-x-4">
            {stats.invalid > 0 && <Button variant="secondary" onClick={handleCorrectAndDownload}><Download className="mr-2 h-4 w-4" /> {t('buttons.downloadCorrected')}</Button>}
            <Button onClick={handleImport} disabled={isLoading || stats.valid === 0}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} {t('buttons.importRecords', { count: stats.valid })}</Button>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('imports.title')}</h1>
        {parseResult && <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" /> {t('buttons.startOver')}</Button>}
      </div>
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}
