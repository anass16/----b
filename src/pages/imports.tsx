import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertTriangle, CheckCircle, List, FileText, Download, Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { parseAttendanceFromFile, downloadUnmatchedRowsAsCSV } from '@/utils/parseAttendanceFromExcel';
import { localDB } from '@/lib/local-db';
import { AttendanceParseResult, ParsedAttendanceRow } from '@/types';
import { columns } from '@/features/attendance/import-columns';

export function AttendanceImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<AttendanceParseResult | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setIsLoading(true);
    setParseResult(null);

    try {
      const result = await parseAttendanceFromFile(droppedFile);
      if (result.errors.length > 0) {
        toast.error(result.errors[0]);
      } else {
        toast.success(`Parsed ${result.stats.total} rows. ${result.stats.matched} matched, ${result.stats.unmatched} unmatched.`);
      }
      setParseResult(result);
    } catch (error) {
      console.error(error);
      toast.error("Failed to parse the file. It might be corrupted or in an unsupported format.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!parseResult || parseResult.stats.matched === 0) return;
    
    setIsLoading(true);
    try {
      await localDB.attendance.overwriteAll(parseResult.processedRecords);
      toast.success(`Import successful! ${parseResult.stats.matched} records saved. Refreshing dashboard...`);
      
      // Invalidate all relevant queries to force a full app refresh
      await queryClient.invalidateQueries();

      handleReset();
      navigate('/');
    } catch (error) {
      toast.error("An error occurred during the import process.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadUnmatched = () => {
    if (!parseResult || !parseResult.unmatchedRows) return;
    downloadUnmatchedRowsAsCSV(parseResult.unmatchedRows);
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
  };

  const statCards = [
    { title: "Total Rows", value: parseResult?.stats.total, icon: List },
    { title: "Matched Rows", value: parseResult?.stats.matched, icon: CheckCircle, color: "text-green-500" },
    { title: "Unmatched Rows", value: parseResult?.stats.unmatched, icon: AlertTriangle, color: "text-red-500" },
    { title: "Period", value: parseResult ? `${parseResult.stats.period.start} to ${parseResult.stats.period.end}` : 'N/A', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Import Attendance</h1>
        {parseResult && (
          <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" /> Start Over</Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!parseResult && (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Upload Attendance File</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div {...getRootProps()} className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                  <input {...getInputProps()} />
                  {isLoading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="mt-4 text-lg font-semibold">Processing file...</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-lg font-semibold">Drag & drop your file here, or click to browse</p>
                      <p className="text-sm text-muted-foreground">Supports .xlsx, .xls, .csv</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {parseResult && (
        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-4 w-4 text-muted-foreground ${card.color || ''}`} />
                </CardHeader>
                <CardContent>
                  <div className={card.title === 'Period' ? 'text-sm font-semibold' : 'text-2xl font-bold'}>{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Preview</CardTitle>
              <p className="text-sm text-muted-foreground">Review the parsed attendance data. Rows with errors will not be imported.</p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={parseResult.rows}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            {parseResult.stats.unmatched > 0 && (
              <Button variant="secondary" onClick={handleDownloadUnmatched}>
                <Download className="mr-2 h-4 w-4" /> Download Unmatched Rows
              </Button>
            )}
            <Button onClick={handleImport} disabled={isLoading || parseResult.stats.matched === 0}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Import {parseResult.stats.matched} Matched Records
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
