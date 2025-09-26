import { ColumnDef } from '@tanstack/react-table';
import { AttendanceRecord, AttendanceStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDelay, formatWorkHours } from '@/lib/utils';

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const variant = {
    Present: 'success',
    Late: 'warning',
    Absent: 'destructive',
    Holiday: 'secondary',
  }[status] as 'success' | 'warning' | 'destructive' | 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
};

export const columns: ColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: 'matricule',
    header: 'Matricule',
  },
  {
    accessorKey: 'name',
    header: 'Employee Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'firstIn',
    header: 'First In',
    cell: ({ row }) => row.original.firstIn || 'N/A',
  },
  {
    accessorKey: 'lastOut',
    header: 'Last Out',
    cell: ({ row }) => row.original.lastOut || 'N/A',
  },
  {
    accessorKey: 'hours',
    header: 'Work Hours',
    cell: ({ row }) => formatWorkHours(row.original.hours),
  },
  {
    accessorKey: 'delayMin',
    header: 'Delay (min)',
    cell: ({ row }) => formatDelay(row.original.delayMin),
  },
];
