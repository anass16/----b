import { ColumnDef } from '@tanstack/react-table';
import { ParsedEmployeeRow } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const employeeImportColumns: ColumnDef<ParsedEmployeeRow>[] = [
  {
    id: 'validationStatus',
    header: 'Status',
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
  { accessorKey: 'matricule', header: 'Matricule' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'email', header: 'Email' },
];
