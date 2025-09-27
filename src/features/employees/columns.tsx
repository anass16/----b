import { ColumnDef } from '@tanstack/react-table'
import { User } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { useLang } from '@/hooks/useLang'

interface ColumnsProps {
  onEdit: (employee: User) => void;
  onDelete: (employee: User) => void;
  onViewProfile: (matricule: string) => void;
}

export const columns = ({ onEdit, onDelete, onViewProfile }: ColumnsProps): ColumnDef<User>[] => {
  const { t } = useLang();
  
  return [
    {
      accessorKey: 'matricule',
      header: t('employees.table.matricule'),
    },
    {
      accessorKey: 'name',
      header: t('employees.table.name'),
    },
    {
      accessorKey: 'department',
      header: t('employees.table.department'),
    },
    {
      accessorKey: 'role',
      header: t('employees.table.role'),
      cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
    },
    {
      accessorKey: 'status',
      header: t('employees.table.status'),
      cell: ({ row }) => {
        const isActive = row.original.status === 'Active';
        return <Badge variant={isActive ? 'success' : 'destructive'}>{row.original.status}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const employee = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t('employees.actions.menu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile(employee.matricule)}>
                <Eye className="mr-2 h-4 w-4" /> {t('employees.actions.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Edit className="mr-2 h-4 w-4" /> {t('employees.actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(employee)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> {t('employees.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
