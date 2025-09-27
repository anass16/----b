import { ColumnDef } from '@tanstack/react-table';
import { ParsedAttendanceRow } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useLang } from '@/hooks/useLang';

export const columns: ColumnDef<ParsedAttendanceRow>[] = [
  {
    id: 'validationStatus',
    header: () => useLang().t('imports.table.status'),
    cell: ({ row }) => {
      const errors = row.original.__errors;
      if (errors.length > 0) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-5 w-5 text-red-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    },
  },
  { accessorKey: 'matricule', header: () => useLang().t('imports.table.matricule') },
  { accessorKey: 'date', header: () => useLang().t('imports.table.date') },
  { accessorKey: 'in', header: () => useLang().t('imports.table.in') },
  { accessorKey: 'out', header: () => useLang().t('imports.table.out') },
  { accessorKey: 'hours', header: () => useLang().t('imports.table.hours') },
  { accessorKey: 'delayMin', header: () => useLang().t('imports.table.delayMin') },
  { accessorKey: 'status', header: () => useLang().t('imports.table.status') },
];
