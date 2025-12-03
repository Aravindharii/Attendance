'use client'

import { useState } from 'react'
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Input from '../ui/Input'

export default function AttendanceTable({ data = [], loading = false }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })

    // Filter data
    const filteredData = data.filter(item => {
        const searchLower = searchTerm.toLowerCase()
        return (
            item.employeeId?.toLowerCase().includes(searchLower) ||
            item.name?.toLowerCase().includes(searchLower) ||
            item.date?.includes(searchTerm)
        )
    })

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    // Paginate data
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-success-100 text-success-700',
            late: 'bg-yellow-100 text-yellow-700',
            absent: 'bg-danger-100 text-danger-700',
        }
        return colors[status] || 'bg-gray-100 text-gray-700'
    }

    // Helper function to format hours
    const formatHours = (hours) => {
        if (!hours) return '-'
        const numHours = typeof hours === 'string' ? parseFloat(hours) : hours
        return isNaN(numHours) ? '-' : `${numHours.toFixed(1)}h`
    }

    return (
        <Card>
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Search by name, ID, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                        Filter
                    </Button>
                    <Button variant="outline" icon={<Download className="w-4 h-4" />}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('date')}
                            >
                                Date
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('employeeId')}
                            >
                                Employee ID
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                                onClick={() => handleSort('name')}
                            >
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Clock In
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Clock Out
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Hours
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Method
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                    No attendance records found
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-800">{item.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.employeeId}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {item.clockIn ? new Date(item.clockIn).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {item.clockOut ? new Date(item.clockOut).toLocaleTimeString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                        {formatHours(item.totalHours)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.method}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} entries
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    )
}
