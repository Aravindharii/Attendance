'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function EmployeesPage() {
    const router = useRouter()
    const { userData, loading } = useAuth()

    // Redirect if not admin
    useEffect(() => {
        if (!loading && userData && userData.role !== 'admin') {
            router.push('/dashboard')
        }
    }, [userData, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!userData || userData.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        )
    }

    // Rest of the employees page code remains the same...
    return <EmployeesPageContent />
}

function EmployeesPageContent() {
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        role: 'employee',
    })

    // Import statements at top
    const { useState } = require('react')
    const { UserPlus, Search, Edit, Trash2, MoreVertical } = require('lucide-react')
    const Button = require('@/components/ui/Button').default
    const Card = require('@/components/ui/Card').default
    const Input = require('@/components/ui/Input').default
    const Modal = require('@/components/ui/Modal').default

    // Mock data - will be replaced with Firebase
    const employees = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@company.com',
            employeeId: 'EMP001',
            department: 'Engineering',
            role: 'admin',
            status: 'active',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@company.com',
            employeeId: 'EMP002',
            department: 'Marketing',
            role: 'employee',
            status: 'active',
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@company.com',
            employeeId: 'EMP003',
            department: 'Sales',
            role: 'employee',
            status: 'active',
        },
    ]

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddEmployee = (e) => {
        e.preventDefault()
        console.log('Adding employee:', formData)
        setShowAddModal(false)
        // Will be replaced with Firebase
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Management</h1>
                    <p className="text-gray-600">Manage all employees and their information</p>
                </div>
                <Button
                    icon={<UserPlus className="w-4 h-4" />}
                    onClick={() => setShowAddModal(true)}
                >
                    Add Employee
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{employees.length}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Employees</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-success-600">
                            {employees.filter(e => e.status === 'active').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Active</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">
                            {employees.filter(e => e.role === 'admin').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Admins</p>
                    </div>
                </Card>
                <Card glass>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-secondary-600">
                            {new Set(employees.map(e => e.department)).size}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Departments</p>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card glass>
                <Input
                    placeholder="Search employees by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                />
            </Card>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                    <Card key={employee.id} glass hover>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {employee.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                                    <p className="text-xs text-gray-500">{employee.employeeId}</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Email:</span>
                                <span className="text-gray-800 font-medium truncate ml-2">{employee.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Department:</span>
                                <span className="text-gray-800 font-medium">{employee.department}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Role:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.role === 'admin'
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {employee.role}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                                    {employee.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                            <Button variant="outline" size="sm" className="flex-1" icon={<Edit className="w-3 h-3" />}>
                                Edit
                            </Button>
                            <Button variant="danger" size="sm" className="flex-1" icon={<Trash2 className="w-3 h-3" />}>
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Employee"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddEmployee}>
                            Add Employee
                        </Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Employee ID"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        required
                    />
                    <Input
                        label="Department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
