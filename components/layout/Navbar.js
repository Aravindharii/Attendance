'use client'

import { useState } from 'react'
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'

export default function Navbar({ user, onLogout }) {
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    const notifications = [
        { id: 1, message: 'Your attendance has been marked', time: '5 min ago', read: false },
        { id: 2, message: 'Monthly report is ready', time: '1 hour ago', read: true },
    ]

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <nav className="glass border-b border-white/20 sticky top-0 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Attendance Tracker</h1>
                            <p className="text-xs text-gray-500">Company Management System</p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-xl border border-white/20 animate-slide-up">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''
                                                    }`}
                                            >
                                                <p className="text-sm text-gray-800">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-gray-200">
                                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Employee'}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-xl border border-white/20 animate-slide-up">
                                    <div className="p-3 border-b border-gray-200">
                                        <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                                        <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <div className="p-2">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm">Profile</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Settings className="w-4 h-4" />
                                            <span className="text-sm">Settings</span>
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-gray-200">
                                        <button
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
