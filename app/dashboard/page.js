'use client'

import { TrendingUp, Users, Clock, Calendar } from 'lucide-react'
import Card from '@/components/ui/Card'
import AttendanceStats from '@/components/attendance/AttendanceStats'
import AttendanceChart from '@/components/charts/AttendanceChart'
import AttendanceTable from '@/components/attendance/AttendanceTable'

export default function DashboardPage() {
    // Mock data - will be replaced with Firebase data
    const stats = {
        totalDays: 22,
        present: 20,
        absent: 2,
        avgHours: 8.5,
        presentTrend: 5,
        absentTrend: -2,
        hoursTrend: 3,
    }

    const chartData = [
        { name: 'Mon', present: 45, absent: 5, late: 3 },
        { name: 'Tue', present: 48, absent: 2, late: 2 },
        { name: 'Wed', present: 47, absent: 3, late: 4 },
        { name: 'Thu', present: 46, absent: 4, late: 2 },
        { name: 'Fri', present: 49, absent: 1, late: 1 },
        { name: 'Sat', present: 25, absent: 25, late: 0 },
        { name: 'Sun', present: 0, absent: 50, late: 0 },
    ]

    const recentAttendance = [
        {
            date: '2025-11-26',
            employeeId: 'EMP001',
            name: 'John Doe',
            clockIn: new Date('2025-11-26T09:00:00'),
            clockOut: new Date('2025-11-26T18:00:00'),
            totalHours: 8.5,
            status: 'present',
            method: 'qr',
        },
        {
            date: '2025-11-25',
            employeeId: 'EMP002',
            name: 'Jane Smith',
            clockIn: new Date('2025-11-25T09:15:00'),
            clockOut: new Date('2025-11-25T18:00:00'),
            totalHours: 8.25,
            status: 'late',
            method: 'manual',
        },
        {
            date: '2025-11-24',
            employeeId: 'EMP003',
            name: 'Bob Johnson',
            clockIn: null,
            clockOut: null,
            totalHours: 0,
            status: 'absent',
            method: '-',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>

            {/* Stats */}
            <AttendanceStats stats={stats} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    glass
                    hover
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/dashboard/attendance/mark'}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 gradient-primary rounded-xl">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Mark Attendance</h3>
                            <p className="text-sm text-gray-600">Clock in/out now</p>
                        </div>
                    </div>
                </Card>

                <Card
                    glass
                    hover
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/dashboard/employees'}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 gradient-secondary rounded-xl">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Manage Employees</h3>
                            <p className="text-sm text-gray-600">View all employees</p>
                        </div>
                    </div>
                </Card>

                <Card
                    glass
                    hover
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/dashboard/reports'}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 gradient-success rounded-xl">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">View Reports</h3>
                            <p className="text-sm text-gray-600">Generate reports</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Chart */}
            <AttendanceChart data={chartData} type="bar" />

            {/* Recent Attendance */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Attendance</h2>
                <AttendanceTable data={recentAttendance} />
            </div>
        </div>
    )
}
