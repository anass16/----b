import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [matricule, setMatricule] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matricule) {
      toast.error('Please enter your Matricule.')
      return
    }
    setIsLoading(true)
    const success = await login(matricule)
    if (success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error('Invalid Matricule. Please import a file or try again.')
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
          <CardTitle className="text-2xl">HR Attendance Login</CardTitle>
          <CardDescription>Enter your Matricule to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="e.g., EMP001"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
            </Button>
            <div className="text-xs text-center text-gray-500 pt-4">
              <p>The system starts empty.</p>
              <p>Go to <b>Imports</b> to upload an employee file, then log in with a valid Matricule.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
