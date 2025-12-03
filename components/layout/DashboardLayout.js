'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { ToastProvider } from '../ui/Toast'

export default function DashboardLayout({ children, user, onLogout }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <ToastProvider>
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <Sidebar
                    user={user}
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Navbar */}
                    <Navbar user={user} onLogout={onLogout} />

                    {/* Page Content */}
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
