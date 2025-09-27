import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'
import { useLang } from '@/hooks/useLang'

export function LoginPage() {
  const [matricule, setMatricule] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const { t } = useLang()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matricule) {
      toast.error(t('login.matriculeRequired'))
      return
    }
    setIsLoading(true)
    const success = await login(matricule)
    if (success) {
      toast.success(t('login.success'))
      navigate('/')
    } else {
      toast.error(t('login.invalid'))
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder={t('login.placeholder')}
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('login.loading') : <><LogIn className="mr-2 h-4 w-4" /> {t('login.button')}</>}
            </Button>
            <div className="text-xs text-center text-gray-500 pt-4">
              <p>{t('login.helpText1')}</p>
              <p>{t('login.helpText2')}</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
