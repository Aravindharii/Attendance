'use client'

import { useState } from 'react'
import { Camera, Save, Mail, User, Briefcase, Calendar } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

export default function ProfilePage() {
    const [editing, setEditing] = useState(false)
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@company.com',
        employeeId: 'EMP001',
        department: 'Engineering',
        role: 'admin',
        joinDate: '2024-01-15',
        phone: '+1 234 567 8900',
    })

    const handleSave = (e) => {
        e.preventDefault()
        console.log('Saving profile:', profile)
        setEditing(false)
        alert('Profile updated successfully!')
        // Will be replaced with Firebase
    }

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your personal information</p>
                </div>
                {!editing && (
                    <Button onClick={() => setEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card glass className="lg:col-span-1">
                    <div className="text-center space-y-4">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-5xl">
                                    {profile.name.charAt(0)}
                                </span>
                            </div>
                            {editing && (
                                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                                    <Camera className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                            <p className="text-gray-600 capitalize">{profile.role}</p>
                            <p className="text-sm text-gray-500 mt-1">{profile.employeeId}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-2xl font-bold text-primary-600">95%</p>
                                <p className="text-xs text-gray-600">Attendance</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-success-600">8.5h</p>
                                <p className="text-xs text-gray-600">Avg Hours</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Profile Details */}
                <Card className="lg:col-span-2">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={profile.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    icon={<User className="w-4 h-4" />}
                                    disabled={!editing}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    icon={<Mail className="w-4 h-4" />}
                                    disabled={!editing}
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    disabled={!editing}
                                />
                                <Input
                                    label="Employee ID"
                                    value={profile.employeeId}
                                    disabled
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Department"
                                    value={profile.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    icon={<Briefcase className="w-4 h-4" />}
                                    disabled={!editing}
                                />
                                <Input
                                    label="Role"
                                    value={profile.role}
                                    disabled
                                />
                                <Input
                                    label="Join Date"
                                    type="date"
                                    value={profile.joinDate}
                                    icon={<Calendar className="w-4 h-4" />}
                                    disabled
                                />
                            </div>
                        </div>

                        {editing && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" icon={<Save className="w-4 h-4" />}>
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>
            </div>

            {/* Attendance History */}
            <Card title="Recent Attendance" subtitle="Your last 5 attendance records">
                <div className="space-y-3">
                    {[
                        { date: '2025-11-26', clockIn: '09:00 AM', clockOut: '06:00 PM', hours: '8.5h', status: 'present' },
                        { date: '2025-11-25', clockIn: '09:05 AM', clockOut: '06:00 PM', hours: '8.4h', status: 'present' },
                        { date: '2025-11-24', clockIn: '09:15 AM', clockOut: '06:10 PM', hours: '8.4h', status: 'late' },
                        { date: '2025-11-23', clockIn: '08:55 AM', clockOut: '05:55 PM', hours: '8.5h', status: 'present' },
                        { date: '2025-11-22', clockIn: '09:00 AM', clockOut: '06:00 PM', hours: '8.5h', status: 'present' },
                    ].map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-800">{record.date}</p>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-600">In: </span>
                                        <span className="font-medium text-gray-800">{record.clockIn}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Out: </span>
                                        <span className="font-medium text-gray-800">{record.clockOut}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-gray-800">{record.hours}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'present'
                                        ? 'bg-success-100 text-success-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {record.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
