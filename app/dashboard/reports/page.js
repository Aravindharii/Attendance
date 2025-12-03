'use client'

import { useState } from 'react'
import { Calendar, Download, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AttendanceChart from '@/components/charts/AttendanceChart'
import ReportsChart from '@/components/charts/ReportsChart'

export default function ReportsPage() {
    const [reportType, setReportType] = useState('weekly')
    const [dateRange, setDateRange] = useState({
        start: '2025-11-01',
        end: '2025-11-26',
    })

    // Mock data
    const weeklyData = [
        { name: 'Mon', present: 45, absent: 5, late: 3 },
        { name: 'Tue', present: 48, absent: 2, late: 2 },
        { name: 'Wed', present: 47, absent: 3, late: 4 },
        { name: 'Thu', present: 46, absent: 4, late: 2 },
        { name: 'Fri', present: 49, absent: 1, late: 1 },
    ]

    const departmentData = [
        { name: 'Engineering', value: 25 },
        { name: 'Marketing', value: 15 },
        { name: 'Sales', value: 20 },
        { name: 'HR', value: 10 },
        { name: 'Finance', value: 12 },
    ]

    const statusData = [
        { name: 'Present', value: 235 },
        { name: 'Absent', value: 15 },
        { name: 'Late', value: 12 },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
                    <p className="text-gray-600">View detailed attendance reports and insights</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                        Filter
                    </Button>
                    <Button icon={<Download className="w-4 h-4" />}>
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Report Type Selector */}
            <Card glass>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Report Type:</span>
                    <div className="flex gap-2 flex-wrap">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setReportType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${reportType === type
                                        ? 'gradient-primary text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Date Range */}
            <Card glass>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">262</p>
                        <p className="text-sm text-gray-600 mt-1">Total Records</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-success-600">235</p>
                        <p className="text-sm text-gray-600 mt-1">Present (89.7%)</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-danger-600">15</p>
                        <p className="text-sm text-gray-600 mt-1">Absent (5.7%)</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-yellow-600">12</p>
                        <p className="text-sm text-gray-600 mt-1">Late (4.6%)</p>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart data={weeklyData} type="bar" />
                <ReportsChart data={statusData} title="Attendance Status Distribution" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportsChart data={departmentData} title="Department-wise Distribution" />
                <Card title="Top Performers" subtitle="Employees with best attendance">
                    <div className="space-y-3">
                        {[
                            { name: 'John Doe', attendance: '100%', days: '22/22' },
                            { name: 'Jane Smith', attendance: '95.5%', days: '21/22' },
                            { name: 'Bob Johnson', attendance: '90.9%', days: '20/22' },
                        ].map((emp, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{emp.name}</p>
                                        <p className="text-xs text-gray-500">{emp.days} days</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-success-600">{emp.attendance}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
