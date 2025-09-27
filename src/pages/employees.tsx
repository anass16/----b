import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2 } from 'lucide-react'
import { columns as getColumns } from '@/features/employees/columns'
import { DataTable } from '@/components/ui/data-table'
import { EmployeeForm } from '@/features/employees/employee-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { User } from '@/lib/data'
import { useLang } from '@/hooks/useLang';

export function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const queryClient = useQueryClient()
  const navigate = useNavigate();
  const { t } = useLang();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  })

  const closeAlert = () => {
    setIsAlertOpen(false);
    setTimeout(() => {
        setEmployeeToDelete(null);
        setIsBulkDelete(false);
    }, 300);
  }

  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success(t('alerts.deleteSuccess'));
      closeAlert();
    },
    onError: () => {
      toast.error(t('alerts.deleteError'));
      closeAlert();
    }
  })
  
  const deleteAllMutation = useMutation({
    mutationFn: employeeApi.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(t('alerts.deleteSuccess'));
      closeAlert();
    },
    onError: () => {
      toast.error(t('alerts.deleteError'));
      closeAlert();
    }
  });

  const handleEdit = (employee: User) => {
    setSelectedEmployee(employee)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setSelectedEmployee(null)
    setIsFormOpen(true)
  }

  const handleViewProfile = (matricule: string) => {
    navigate(`/employees/${matricule}`);
  }

  const handleDelete = (employee: User) => {
    setIsBulkDelete(false);
    setEmployeeToDelete(employee);
    setIsAlertOpen(true);
  };

  const handleDeleteAllClick = () => {
    setIsBulkDelete(true);
    setEmployeeToDelete(null);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (isBulkDelete) {
        deleteAllMutation.mutate();
    } else if (employeeToDelete) {
        deleteMutation.mutate(employeeToDelete.matricule);
    }
  };
  
  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete, onViewProfile: handleViewProfile });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
        <div className="flex items-center space-x-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('buttons.addNewEmployee')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEmployee ? t('employee.editTitle') : t('employee.addTitle')}</DialogTitle>
              </DialogHeader>
              <EmployeeForm employee={selectedEmployee} onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteAllClick}>
            <Trash2 className="mr-2 h-4 w-4" /> {t('buttons.deleteAll')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees || []}
        isLoading={isLoading}
        filterColumnId="name"
        filterPlaceholder={t('employees.filterPlaceholder')}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBulkDelete ? t('alerts.deleteAllEmployeesTitle') : t('alerts.deleteEmployeeTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDelete ? t('alerts.deleteAllEmployeesDescription') : t('alerts.deleteEmployeeDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAlert}>{t('buttons.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending || deleteAllMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
