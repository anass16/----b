import { ColumnDef } from '@tanstack/react-table'
import { LeaveRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { formatDateToDDMMYYYY } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLang } from '@/hooks/useLang'
import { useEventBus } from '@/hooks/useEventBus'

interface ColumnsProps {
  onEdit: (request: LeaveRequest) => void;
  onDelete: (request: LeaveRequest) => void;
}

const StatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
  const variant = {
    PENDING: 'default',
    APPROVED: 'success',
    REJECTED: 'destructive',
  }[status] as 'default' | 'success' | 'destructive'
  return <Badge variant={variant}>{status}</Badge>
}

const ActionButtons = ({ request, onEdit, onDelete }: { request: LeaveRequest } & ColumnsProps) => {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    const { t } = useLang()
    const { emit } = useEventBus();
    
    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: LeaveRequest['status'] }) => leaveApi.updateStatus(id, status),
        onSuccess: (data) => {
            if (data) {
                toast.success(t('alerts.leaveStatusUpdateSuccess'))
                queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
                emit('notification', { type: 'leave:statusChanged', data });
            }
        },
        onError: () => toast.error(t('alerts.leaveStatusUpdateFailed'))
    })

    const canApprove = user?.role === 'MANAGER' || user?.role === 'ADMIN';
    const canEditDelete = user?.role === 'ADMIN' || user?.matricule === request.matricule;

    return (
        <div className="flex items-center space-x-2">
            {canApprove && request.status === 'PENDING' && (
                <>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => mutation.mutate({ id: request.id, status: 'APPROVED' })}>{t('buttons.approve')}</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => mutation.mutate({ id: request.id, status: 'REJECTED' })}>{t('buttons.reject')}</Button>
                </>
            )}
            {canEditDelete && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('employees.actions.menu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(request)}>
                            <Edit className="mr-2 h-4 w-4" /> {t('buttons.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(request)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> {t('buttons.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<LeaveRequest>[] => {
  const { t } = useLang();
  return [
    { accessorKey: 'name', header: t('leave.table.employee') },
    { 
      accessorKey: 'startDate', 
      header: t('leave.table.startDate'),
      cell: ({ row }) => formatDateToDDMMYYYY(row.original.startDate)
    },
    { 
      accessorKey: 'endDate', 
      header: t('leave.table.endDate'),
      cell: ({ row }) => formatDateToDDMMYYYY(row.original.endDate)
    },
    { accessorKey: 'reason', header: t('leave.table.reason') },
    {
      accessorKey: 'notes',
      header: t('leave.table.notes'),
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (!notes) return <span className="text-muted-foreground">{t('common.na')}</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="truncate max-w-[150px]">{notes}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs whitespace-normal">{notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: 'status',
      header: t('leave.table.status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: t('leave.table.actions'),
      cell: ({ row }) => <ActionButtons request={row.original} onEdit={onEdit} onDelete={onDelete} />,
    },
  ]
}
