import { ColumnDef } from '@tanstack/react-table';
import { ParsedEmployeeRow } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useLang } from '@/hooks/useLang';

export const employeeImportColumns: ColumnDef<ParsedEmployeeRow>[] = [
  {
    id: 'validationStatus',
    header: () => useLang().t('imports.employeeTable.status'),
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
    size: 50,
  },
  { accessorKey: 'matricule', header: () => useLang().t('imports.employeeTable.matricule') },
  { accessorKey: 'firstName', header: () => useLang().t('imports.employeeTable.firstName') },
  { accessorKey: 'lastName', header: () => useLang().t('imports.employeeTable.lastName') },
  { accessorKey: 'department', header: () => useLang().t('imports.employeeTable.department') },
  { accessorKey: 'status', header: () => useLang().t('imports.employeeTable.status') },
  { accessorKey: 'email', header: () => useLang().t('imports.employeeTable.email') },
];
