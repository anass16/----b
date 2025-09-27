import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  BarChart3, 
  Upload, 
  Settings,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang } from '@/hooks/useLang'

const navigation = [
  {
    name: 'nav.dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'nav.employees',
    href: '/employees',
    icon: Users
  },
  {
    name: 'nav.attendance',
    href: '/attendance',
    icon: Clock
  },
  {
    name: 'nav.leave',
    href: '/leave',
    icon: Calendar
  },
  {
    name: 'nav.analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    name: 'nav.imports',
    href: '/imports',
    icon: Upload
  },
  {
    name: 'nav.settings',
    href: '/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const location = useLocation()
  const { t } = useLang()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('sidebar.title')}</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {t(item.name)}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
