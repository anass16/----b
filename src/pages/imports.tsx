import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertTriangle, CheckCircle, List, Building, Download, Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { parseEmployeesFromFile, rebuildCorrectedWorkbook } from '@/utils/parseEmployeesFromExcel';
import { localDB } from '@/lib/local-db';
import { ParseResult, ParsedEmployeeRow } from '@/types';
import { User } from '@/lib/data';
import { ColumnDef } from '@tanstack/react-table';

const StatusCell = ({ row }: { row: { original: ParsedEmployeeRow } }) => {
  const employee = row.original;
  const hasErrors = employee.__errors.length > 0;

  if (hasErrors) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="h-5 w-5 text-red-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <ul className="list-disc pl-4">
              {employee.__errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <CheckCircle className="h-5 w-5 text-green-500" />;
};

const columns: ColumnDef<ParsedEmployeeRow>[] = [
  { id: 'validationStatus', header: 'Status', cell: StatusCell },
  { accessorKey: 'matricule', header: 'Matricule' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Emp. Status' },
];

export function EmployeeImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setIsLoading(true);
    setParseResult(null);

    try {
      const result = await parseEmployeesFromFile(droppedFile);
      if (result.errors.length > 0) {
        toast.error(result.errors[0]);
      } else {
        toast.success(`Parsed ${result.stats.total} rows (${result.stats.valid} valid, ${result.stats.invalid} invalid)`);
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

  const handleImport = () => {
    if (!parseResult || parseResult.stats.valid === 0) return;
    const validRows = parseResult.rows.filter(r => r.__errors.length === 0);
    
    const newUsers: User[] = validRows.map(row => ({
      id: row.matricule!,
      matricule: row.matricule!,
      firstName: row.firstName!,
      lastName: row.lastName!,
      name: `${row.firstName} ${row.lastName}`.trim(),
      department: row.department || 'Unassigned',
      email: row.email,
      phone: row.phone,
      hireDate: row.hireDate,
      status: row.status || 'Active',
      role: 'EMPLOYEE',
      worksSaturday: false,
      createdAt: new Date().toISOString(),
    }));

    localDB.employees.overwriteAll(newUsers);
    
    toast.success(`Import successful! ${newUsers.length} employees added. Refreshing all app data...`);
    
    // Invalidate all relevant queries to force a full app refresh
    queryClient.invalidateQueries({ queryKey: ['employees'] });
    queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    queryClient.invalidateQueries({ queryKey: ['analyticsData'] });
    queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    queryClient.invalidateQueries({ queryKey: ['attendance'] }); // Invalidate all attendance queries

    handleReset();
    navigate('/employees');
  };

  const handleDownloadCorrected = () => {
    if (!parseResult) return;
    rebuildCorrectedWorkbook(parseResult.rows);
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setFilterText('');
    setFilterDepartment('all');
  };

  const filteredData = useMemo(() => {
    if (!parseResult) return [];
    return parseResult.rows.filter(row => {
      const matchesDept = filterDepartment === 'all' || row.department === filterDepartment;
      const matchesText = filterText === '' ||
        Object.values(row).some(val => String(val).toLowerCase().includes(filterText.toLowerCase()));
      return matchesDept && matchesText;
    });
  }, [parseResult, filterText, filterDepartment]);

  const statCards = [
    { title: "Total Rows", value: parseResult?.stats.total, icon: List },
    { title: "Valid Rows", value: parseResult?.stats.valid, icon: CheckCircle, color: "text-green-500" },
    { title: "Invalid Rows", value: parseResult?.stats.invalid, icon: AlertTriangle, color: "text-red-500" },
    { title: "Departments", value: parseResult?.stats.departments.length, icon: Building },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Import Employees</h1>
        {parseResult && (
          <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4" /> Start Over</Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!parseResult && (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
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
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Preview</CardTitle>
              <div className="flex items-center space-x-4 pt-4">
                <Input
                  placeholder="Search in preview..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {parseResult.stats.departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredData}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={handleDownloadCorrected} disabled={parseResult.rows.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Download Corrected File
            </Button>
            <Button onClick={handleImport} disabled={parseResult.stats.valid === 0}>
              <Upload className="mr-2 h-4 w-4" /> Import {parseResult.stats.valid} Valid Rows
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
