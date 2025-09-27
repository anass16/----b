import React, { useState } from 'react'
import { Search, Bell, User, Globe, LogOut, MailCheck, Trash2 } from 'lucide-react'
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
import { useNotificationStore } from '@/store/notifications'
import { NotificationItem } from './NotificationItem'
import { ScrollArea } from '../ui/scroll-area'

export function Header() {
  const { currentLanguage, setLanguage, t } = useLang()
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { hour12, setHour12 } = useClockStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

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

  const handleMarkAsRead = (id: string) => {
    if(user) markAsRead(id, user.matricule);
  }
  
  const handleMarkAllRead = () => {
    if(user) markAllAsRead(user.matricule);
  }

  const handleClearAll = () => {
    if(user) clearAll(user.matricule);
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
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <DropdownMenuLabel className="p-3 flex justify-between items-center">
              {t('header.notifications')}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs">{t('notifications.markAllRead')}</Button>
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto px-2 py-1 text-xs text-destructive">{t('notifications.clearAll')}</Button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-0" />
            <ScrollArea className="h-[400px]">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onRead={handleMarkAsRead} />
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground p-8">
                  {t('notifications.empty')}
                </div>
              )}
            </ScrollArea>
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
