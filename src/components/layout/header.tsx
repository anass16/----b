import React, { useState } from 'react'
import { Search, Bell, User, Globe, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/hooks/useLang'
import { languages } from '@/lib/i18n'
import { useAuthStore } from '@/store/auth'
import { useNavigate } from 'react-router-dom'
import { OfflineClockWidget } from './OfflineClockWidget'
import { useClockStore } from '@/store/clock'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function Header() {
  const { currentLanguage, setLanguage, t } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { hour12, setHour12 } = useClockStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('buttons.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80 bg-gray-100 dark:bg-gray-700"
          />
        </form>
      </div>

      <div className="flex items-center space-x-4">
        <OfflineClockWidget />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={currentLanguage === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              New employee added: John Doe
            </DropdownMenuItem>
            <DropdownMenuItem>
              Attendance report for May is ready.
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('header.myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              {t('header.profile')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default">
              <div className="flex items-center justify-between w-full">
                <Label htmlFor="hour-format-toggle" className="pr-2 font-normal cursor-pointer">{t('common.hourFormat24')}</Label>
                <Switch
                  id="hour-format-toggle"
                  checked={!hour12}
                  onCheckedChange={(checked) => setHour12(!checked)}
                />
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-100/50 dark:focus:bg-red-900/50">
                <LogOut className="mr-2 h-4 w-4" />
                {t('login.button')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
