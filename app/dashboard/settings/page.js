'use client'

import { useState } from 'react'
import { Save, Building, MapPin, Clock, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import AdminProtected from '@/components/auth/AdminProtected'

export default function SettingsPage() {
    return (
        <AdminProtected>
            <SettingsPageContent />
        </AdminProtected>
    )
}

function SettingsPageContent() {
    const [settings, setSettings] = useState({
        companyName: 'Your Company Name',
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        lateThreshold: '15',
        locationLat: '0',
        locationLng: '0',
        geofenceRadius: '100',
        qrExpiry: '5',
    })

    const handleSave = (e) => {
        e.preventDefault()
        console.log('Saving settings:', settings)
        alert('Settings saved successfully!')
        // Will be replaced with Firebase
    }

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-gray-600">Manage company settings and preferences</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Company Settings */}
                <Card
                    title="Company Information"
                    subtitle="Basic company details"
                    icon={<Building className="w-5 h-5" />}
                >
                    <div className="space-y-4">
                        <Input
                            label="Company Name"
                            value={settings.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            required
                        />
                    </div>
                </Card>

                {/* Working Hours */}
                <Card
                    title="Working Hours"
                    subtitle="Set standard working hours"
                    icon={<Clock className="w-5 h-5" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Start Time"
                            type="time"
                            value={settings.workingHoursStart}
                            onChange={(e) => handleChange('workingHoursStart', e.target.value)}
                            required
                        />
                        <Input
                            label="End Time"
                            type="time"
                            value={settings.workingHoursEnd}
                            onChange={(e) => handleChange('workingHoursEnd', e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Late Threshold (minutes)"
                            type="number"
                            value={settings.lateThreshold}
                            onChange={(e) => handleChange('lateThreshold', e.target.value)}
                            helperText="Employees arriving after this many minutes will be marked as late"
                            required
                        />
                    </div>
                </Card>

                {/* Geolocation Settings */}
                <Card
                    title="Geolocation Settings"
                    subtitle="Configure location-based attendance"
                    icon={<MapPin className="w-5 h-5" />}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Office Latitude"
                                type="number"
                                step="any"
                                value={settings.locationLat}
                                onChange={(e) => handleChange('locationLat', e.target.value)}
                                placeholder="0.0000"
                            />
                            <Input
                                label="Office Longitude"
                                type="number"
                                step="any"
                                value={settings.locationLng}
                                onChange={(e) => handleChange('locationLng', e.target.value)}
                                placeholder="0.0000"
                            />
                        </div>
                        <Input
                            label="Geofence Radius (meters)"
                            type="number"
                            value={settings.geofenceRadius}
                            onChange={(e) => handleChange('geofenceRadius', e.target.value)}
                            helperText="Employees must be within this radius to mark attendance"
                        />
                    </div>
                </Card>

                {/* QR Code Settings */}
                <Card
                    title="QR Code Settings"
                    subtitle="Configure QR code behavior"
                    icon={<Shield className="w-5 h-5" />}
                >
                    <Input
                        label="QR Code Expiry (minutes)"
                        type="number"
                        value={settings.qrExpiry}
                        onChange={(e) => handleChange('qrExpiry', e.target.value)}
                        helperText="QR codes will expire after this duration for security"
                        required
                    />
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button">
                        Reset to Defaults
                    </Button>
                    <Button type="submit" icon={<Save className="w-4 h-4" />}>
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    )
}
