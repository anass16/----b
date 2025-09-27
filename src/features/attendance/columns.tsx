import { ColumnDef } from '@tanstack/react-table';
import { AttendanceRecord, AttendanceStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDelay, formatWorkHours } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const { t } = useLang();
  const variant = {
    Present: 'success',
    Late: 'warning',
    Absent: 'destructive',
    Holiday: 'secondary',
  }[status] as 'success' | 'warning' | 'destructive' | 'secondary';
  
  const statusText = {
    Present: t('attendance.present'),
    Late: t('attendance.late'),
    Absent: t('attendance.absent'),
    Holiday: t('attendance.holiday'),
  }[status];

  return <Badge variant={variant}>{statusText}</Badge>;
};

export const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: 'matricule',
    header: () => useLang().t('attendance.table.matricule'),
  },
  {
    accessorKey: 'name',
    header: () => useLang().t('attendance.table.employeeName'),
  },
  {
    accessorKey: 'status',
    header: () => useLang().t('attendance.table.status'),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'firstIn',
    header: () => useLang().t('attendance.table.firstIn'),
    cell: ({ row }) => row.original.firstIn || 'N/A',
  },
  {
    accessorKey: 'lastOut',
    header: () => useLang().t('attendance.table.lastOut'),
    cell: ({ row }) => row.original.lastOut || 'N/A',
  },
  {
    accessorKey: 'hours',
    header: () => useLang().t('attendance.table.workHours'),
    cell: ({ row }) => formatWorkHours(row.original.hours),
  },
  {
    accessorKey: 'delayMin',
    header: () => useLang().t('attendance.table.delayMin'),
    cell: ({ row }) => formatDelay(row.original.delayMin),
  },
];
