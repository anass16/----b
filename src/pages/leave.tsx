import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { leaveApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { columns } from '@/features/leave/columns'
import { DataTable } from '@/components/ui/data-table'
import { LeaveForm } from '@/features/leave/leave-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LeaveRequest } from '@/types'
import { useLang } from '@/hooks/useLang'

export function LeavePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const queryClient = useQueryClient()
  const { t } = useLang()
  
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: leaveApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaveApi.delete(id),
    onSuccess: () => {
      toast.success('Leave request deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      setIsAlertOpen(false);
      setSelectedLeave(null);
    },
    onError: () => {
      toast.error('Failed to delete leave request.');
    }
  });

  const handleEdit = (request: LeaveRequest) => {
    setSelectedLeave(request);
    setIsFormOpen(true);
  }

  const handleDelete = (request: LeaveRequest) => {
    setSelectedLeave(request);
    setIsAlertOpen(true);
  }

  const handleAddNew = () => {
    setSelectedLeave(null);
    setIsFormOpen(true);
  }

  const handleFormFinished = () => {
    setIsFormOpen(false);
    setSelectedLeave(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('buttons.applyForLeave')}
        </Button>
      </div>

      <DataTable
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
        data={leaveRequests || []}
        isLoading={isLoading}
        filterColumnId="name"
        filterPlaceholder="Filter by name..."
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{selectedLeave ? t('common.editLeave') : t('common.applyLeave')}</DialogTitle>
          </DialogHeader>
          <LeaveForm onFinished={handleFormFinished} leaveRequestToEdit={selectedLeave} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('alerts.deleteLeaveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('alerts.deleteLeaveDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedLeave && deleteMutation.mutate(selectedLeave.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('buttons.submitting') : t('buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
