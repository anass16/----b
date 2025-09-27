import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/hooks/use-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import { Label } from '@/components/ui/label'
import { useLang } from '@/hooks/useLang'

export function SettingsPage() {
  const { user } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const { t } = useLang()

  const profileSchema = z.object({
    name: z.string().min(2, t('validation.nameMin')),
    matricule: z.string(),
    department: z.string(),
  })

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      matricule: user?.matricule || '',
      department: user?.department || '',
    },
  })

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    console.log(values)
    toast.success(t('alerts.profileUpdateSuccess'))
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileTitle')}</CardTitle>
          <CardDescription>{t('settings.profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('employee.name')}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="matricule" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('employee.matricule')}</FormLabel>
                  <FormControl><Input {...field} disabled /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('employee.department')}</FormLabel>
                  <FormControl><Input {...field} disabled /></FormControl>
                </FormItem>
              )} />
              <Button type="submit">{t('buttons.saveChanges')}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearanceTitle')}</CardTitle>
          <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <Label htmlFor="dark-mode">{t('settings.darkMode')}</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
