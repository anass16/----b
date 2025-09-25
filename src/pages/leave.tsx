import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leaveApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { columns } from '@/features/leave/columns'
import { DataTable } from '@/components/ui/data-table'
import { LeaveForm } from '@/features/leave/leave-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function LeavePage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: leaveApi.getAll,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <LeaveForm onFinished={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns()}
        data={leaveRequests || []}
        isLoading={isLoading}
        filterColumnId="name"
        filterPlaceholder="Filter by name..."
      />
    </div>
  )
}
