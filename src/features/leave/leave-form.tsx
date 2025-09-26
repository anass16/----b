import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { GenericReasonSelector } from '@/components/shared/GenericReasonSelector'
import { useLang } from '@/hooks/useLang'
import { LeaveRequest } from '@/types'
import { EmployeeSelector } from '@/components/shared/EmployeeSelector'

const formSchema = z.object({
  id: z.string().optional(),
  matricule: z.string().min(1, 'Employee is required.'),
  name: z.string(),
  startDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Invalid date" }),
  reason: z.string().min(1, 'Reason is required.'),
  notes: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

type LeaveFormValues = z.infer<typeof formSchema>;

interface LeaveFormProps {
  leaveRequestToEdit?: LeaveRequest | null;
  onFinished: () => void;
}

export function LeaveForm({ leaveRequestToEdit, onFinished }: LeaveFormProps) {
  const queryClient = useQueryClient()
  const { user, role } = useAuthStore()
  const { t } = useLang()
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: leaveRequestToEdit ? {
      ...leaveRequestToEdit,
      notes: leaveRequestToEdit.notes || '',
    } : {
      matricule: user?.matricule || '',
      name: user?.name || '',
      startDate: '',
      endDate: '',
      reason: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: LeaveFormValues) => {
      const { id, ...data } = values;
      if (id) {
        return leaveApi.update(id, data);
      }
      return leaveApi.create(data);
    },
    onSuccess: () => {
      toast.success(`Leave request ${leaveRequestToEdit ? 'updated' : 'submitted'}!`);
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      onFinished();
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  })

  function onSubmit(values: LeaveFormValues) {
    mutation.mutate(values);
  }

  const isAdmin = role === 'ADMIN' || role === 'MANAGER';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isAdmin && (
          <FormField
            control={form.control}
            name="matricule"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('common.employee')}</FormLabel>
                <EmployeeSelector
                  value={field.value}
                  onSelect={({ matricule, name }) => {
                    form.setValue('matricule', matricule, { shouldValidate: true });
                    form.setValue('name', name);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('common.startDate')}</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('common.endDate')}</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.reason')}</FormLabel>
              <FormControl>
                <GenericReasonSelector 
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('common.selectOrAddReason')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.notes')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('common.notesPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>{t('buttons.cancel')}</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('buttons.submitting') : (leaveRequestToEdit ? t('buttons.save') : t('buttons.submitRequest'))}
            </Button>
        </div>
      </form>
    </Form>
  )
}
