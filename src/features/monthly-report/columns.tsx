import { ColumnDef } from '@tanstack/react-table';
import { useLang } from '@/hooks/useLang';

interface MonthlyReportRow {
  matricule: string;
  name: string;
  department: string;
  daysWorked: number;
}

export const columns: ColumnDef<MonthlyReportRow>[] = [
  {
    accessorKey: 'matricule',
    header: () => useLang().t('monthlyReport.table.matricule'),
  },
  {
    accessorKey: 'name',
    header: () => useLang().t('monthlyReport.table.name'),
  },
  {
    accessorKey: 'department',
    header: () => useLang().t('monthlyReport.table.department'),
  },
  {
    accessorKey: 'daysWorked',
    header: () => <div className="text-center">{useLang().t('monthlyReport.table.daysWorked')}</div>,
    cell: ({ row }) => <div className="text-center font-bold text-lg">{row.original.daysWorked}</div>,
  },
];
