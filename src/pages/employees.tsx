import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { columns } from '@/features/employees/columns'
import { DataTable } from '@/components/ui/data-table'
import { EmployeeForm } from '@/features/employees/employee-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User } from '@/lib/data'

export function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  })

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
  
  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })

  const handleDelete = (matricule: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(matricule)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            </DialogHeader>
            <EmployeeForm employee={selectedEmployee} onFinished={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete, onViewProfile: handleViewProfile })}
        data={employees || []}
        isLoading={isLoading}
        filterColumnId="name"
        filterPlaceholder="Filter by name..."
      />
    </div>
  )
}
