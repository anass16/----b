import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaveApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

const formSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  reason: z.string().min(2, 'Reason is required.'),
})

interface LeaveFormProps {
  onFinished: () => void
}

export function LeaveForm({ onFinished }: LeaveFormProps) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error("User not found")
      return leaveApi.create({ ...values, matricule: user.matricule, name: user.name })
    },
    onSuccess: () => {
      toast.success('Leave request submitted!')
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
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
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl><Input placeholder="e.g., Vacation" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
        </div>
      </form>
    </Form>
  )
}
