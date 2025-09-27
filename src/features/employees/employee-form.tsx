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
import { useLang } from '@/hooks/useLang'

interface EmployeeFormProps {
  employee: User | null
  onFinished: () => void
}

export function EmployeeForm({ employee, onFinished }: EmployeeFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLang();

  const formSchema = z.object({
    name: z.string().min(2, t('validation.nameMin')),
    department: z.string().min(1, t('validation.departmentRequired')),
    status: z.enum(['Active', 'Inactive']),
  })

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
      return employeeApi.create({ ...values, role: 'EMPLOYEE' })
    },
    onSuccess: () => {
      toast.success(t(employee ? 'alerts.employeeUpdateSuccess' : 'alerts.employeeCreateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      if (employee) {
        queryClient.invalidateQueries({ queryKey: ['employee', employee.matricule] });
      }
      onFinished()
    },
    onError: () => {
      toast.error(t('alerts.error'))
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
              <FormLabel>{t('employee.name')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t('employee.department')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoadingDepartments}>
                    <SelectValue placeholder={t('common.selectDepartment')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingDepartments ? (
                    <SelectItem value="loading" disabled>{t('common.loadingDepartments')}</SelectItem>
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
              <FormLabel>{t('employee.status')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectStatus')} />
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
            <Button type="button" variant="outline" onClick={onFinished}>{t('buttons.cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('buttons.saving') : t('buttons.save')}
            </Button>
        </div>
      </form>
    </Form>
  )
}
