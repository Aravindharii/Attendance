'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, Filter } from 'lucide-react'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import AttendanceTable from '@/components/attendance/AttendanceTable'
import AttendanceChart from '@/components/charts/AttendanceChart'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function AttendancePage() {
    const [dateRange, setDateRange] = useState('week')
    const [attendanceData, setAttendanceData] = useState([])
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    // Calculate date range based on selection
    const getDateRange = () => {
        const now = new Date()
        let startDate = new Date()

        switch (dateRange) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
        }

        return {
            start: Timestamp.fromDate(startDate),
            end: Timestamp.fromDate(now)
        }
    }

    // Fetch attendance data from Firebase
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true)
                const { start, end } = getDateRange()

                // Query attendance collection with date range
                const q = query(
                    collection(db, 'attendance'),
                    where('checkIn', '>=', start),
                    where('checkIn', '<=', end),
                    orderBy('checkIn', 'desc')
                )

                const querySnapshot = await getDocs(q)
                const records = []

                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    records.push({
                        id: doc.id,
                        date: data.checkIn?.toDate().toISOString().split('T')[0] || '',
                        employeeId: data.userId || '',
                        name: data.userName || 'Unknown',
                        clockIn: data.checkIn?.toDate() || null,
                        clockOut: data.checkOut?.toDate() || null,
                        totalHours: calculateHours(data.checkIn, data.checkOut),
                        status: data.status || 'present',
                        method: data.method || 'qr',
                    })
                })

                setAttendanceData(records)
                generateChartData(records)
            } catch (error) {
                console.error('Error fetching attendance:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAttendance()
    }, [dateRange])

    // Calculate hours between check-in and check-out
    const calculateHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0
        const diff = checkOut.toMillis() - checkIn.toMillis()
        return (diff / (1000 * 60 * 60)).toFixed(1)
    }

    // Generate chart data from attendance records
    const generateChartData = (records) => {
        const groupedByDate = records.reduce((acc, record) => {
            const date = record.date
            if (!acc[date]) {
                acc[date] = { present: 0, absent: 0, late: 0 }
            }
            
            if (record.status === 'present') acc[date].present++
            else if (record.status === 'absent') acc[date].absent++
            else if (record.status === 'late') acc[date].late++
            
            return acc
        }, {})

        const chartArray = Object.entries(groupedByDate).map(([date, stats]) => ({
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            ...stats
        }))

        setChartData(chartArray)
    }

    // Export to CSV
    const handleExport = () => {
        const csv = [
            ['Date', 'Employee ID', 'Name', 'Clock In', 'Clock Out', 'Total Hours', 'Status', 'Method'],
            ...attendanceData.map(record => [
                record.date,
                record.employeeId,
                record.name,
                record.clockIn?.toLocaleTimeString() || '-',
                record.clockOut?.toLocaleTimeString() || '-',
                record.totalHours,
                record.status,
                record.method
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-${dateRange}-${new Date().toISOString()}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Records</h1>
                    <p className="text-gray-600">View and manage all attendance records</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                        Filter
                    </Button>
                    <Button 
                        variant="outline" 
                        icon={<Download className="w-4 h-4" />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <Button icon={<Calendar className="w-4 h-4" />}>
                        Mark Attendance
                    </Button>
                </div>
            </div>

            {/* Date Range Selector */}
            <Card glass>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <div className="flex gap-2">
                        {['today', 'week', 'month', 'year'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    dateRange === range
                                        ? 'gradient-primary text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {loading ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading attendance data...</p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Chart */}
                    {chartData.length > 0 && <AttendanceChart data={chartData} type="line" />}

                    {/* Attendance Table */}
                    {attendanceData.length > 0 ? (
                        <AttendanceTable data={attendanceData} />
                    ) : (
                        <Card>
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No attendance records found for this period</p>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
