'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Clock,
    Users,
    FileText,
    Settings,
    User,
    ChevronLeft,
    ChevronRight,
    QrCode
} from 'lucide-react'

export default function Sidebar({ user, collapsed, setCollapsed }) {
    const pathname = usePathname()

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Clock, label: 'Attendance', href: '/dashboard/attendance' },
        { icon: QrCode, label: 'Mark Attendance', href: '/dashboard/attendance/mark' },
        { icon: Users, label: 'Employees', href: '/dashboard/employees', adminOnly: true },
        { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings', adminOnly: true },
        { icon: User, label: 'Profile', href: '/dashboard/profile' },
    ]

    const filteredMenuItems = menuItems.filter(item => {
        if (item.adminOnly && user.role !== 'admin') {
            return false
        }
        return true
    })

    return (
        <aside
            className={`
        glass border-r border-white/20 h-screen sticky top-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
        >
            <div className="flex flex-col h-full">
                {/* Toggle Button */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-3 space-y-1">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive
                                        ? 'gradient-primary text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                  ${collapsed ? 'justify-center' : ''}
                `}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && (
                                    <span className="font-medium text-sm">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info */}
                {!collapsed && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role || 'Employee'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}
