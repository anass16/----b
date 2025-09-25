import { ColumnDef } from '@tanstack/react-table'
import { LeaveRequest } from '@/lib/mock-db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
  const variant = {
    PENDING: 'default',
    APPROVED: 'success',
    REJECTED: 'destructive',
  }[status] as 'default' | 'success' | 'destructive'
  return <Badge variant={variant}>{status}</Badge>
}

const ActionButtons = ({ request }: { request: LeaveRequest }) => {
    const queryClient = useQueryClient()
    const { role } = useAuthStore()
    
    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: LeaveRequest['status'] }) => leaveApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success('Leave status updated!')
            queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
        },
        onError: () => toast.error('Failed to update status.')
    })

    if (role !== 'MANAGER' || request.status !== 'PENDING') return null

    return (
        <div className="space-x-2">
            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => mutation.mutate({ id: request.id, status: 'APPROVED' })}>Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => mutation.mutate({ id: request.id, status: 'REJECTED' })}>Reject</Button>
        </div>
    )
}

export const columns = (): ColumnDef<LeaveRequest>[] => [
  { accessorKey: 'name', header: 'Employee' },
  { accessorKey: 'startDate', header: 'Start Date' },
  { accessorKey: 'endDate', header: 'End Date' },
  { accessorKey: 'reason', header: 'Reason' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionButtons request={row.original} />,
  },
]
