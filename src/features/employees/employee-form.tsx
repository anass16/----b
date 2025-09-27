import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '@/lib/api'
import { User } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  department: z.string().min(1, 'Please select a department.'),
  status: z.enum(['Active', 'Inactive']),
})

interface EmployeeFormProps {
  employee: User | null
  onFinished: () => void
}

export function EmployeeForm({ employee, onFinished }: EmployeeFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || '',
      department: employee?.department || '',
      status: employee?.status || 'Active',
    },
  })

  const { data: allEmployees, isLoading: isLoadingDepartments } = useQuery<User[]>({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  const uniqueDepartments = useMemo(() => {
    if (!allEmployees) return [];
    const depts = new Set<string>();
    allEmployees.forEach(emp => {
        if (emp.department) {
            depts.add(emp.department);
        }
    });
    return Array.from(depts).sort();
  }, [allEmployees]);


  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      if (employee) {
        return employeeApi.update(employee.matricule, values)
      }
      // When creating, add a default role since it's removed from the form
      return employeeApi.create({ ...values, role: 'EMPLOYEE' })
    },
    onSuccess: () => {
      toast.success(`Employee ${employee ? 'updated' : 'created'} successfully!`)
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      if (employee) {
        queryClient.invalidateQueries({ queryKey: ['employee', employee.matricule] });
      }
      onFinished()
    },
    onError: () => {
      toast.error('An error occurred.')
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingDepartments}>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingDepartments ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
        </div>
      </form>
    </Form>
  )
}
