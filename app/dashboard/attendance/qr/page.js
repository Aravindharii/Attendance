'use client'

import { useState } from 'react'
import QRGenerator from '@/components/attendance/QRGenerator'
import Card from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'
import AdminProtected from '@/components/auth/AdminProtected'

export default function QRPage() {
    return (
        <AdminProtected>
            <QRPageContent />
        </AdminProtected>
    )
}

function QRPageContent() {
    const [qrSession, setQrSession] = useState(null)

    const generateQRSession = () => {
        // Generate new QR session - will be replaced with Firebase
        const sessionId = 'session_' + Date.now()
        const expiresAt = Date.now() + (5 * 60 * 1000) // 5 minutes

        setQrSession({
            sessionId,
            expiresAt,
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Generator</h1>
                <p className="text-gray-600">Generate QR codes for employees to scan and mark attendance</p>
            </div>

            {/* Admin Only Notice */}
            <Card glass className="border-l-4 border-primary-500">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Admin Only Feature</h3>
                        <p className="text-sm text-gray-600">
                            This feature is only available to administrators. Generated QR codes expire after 5 minutes for security.
                        </p>
                    </div>
                </div>
            </Card>

            {/* QR Generator */}
            <div className="max-w-2xl mx-auto">
                <QRGenerator
                    sessionId={qrSession?.sessionId}
                    expiresAt={qrSession?.expiresAt}
                    onGenerate={generateQRSession}
                />
            </div>

            {/* Instructions */}
            <Card title="How to Use" glass>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">Generate QR Code</h4>
                            <p className="text-sm text-gray-600">Click the button to generate a new QR code session</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">Display QR Code</h4>
                            <p className="text-sm text-gray-600">Show the QR code on a screen visible to employees</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">Employees Scan</h4>
                            <p className="text-sm text-gray-600">Employees scan the code using their devices to mark attendance</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">Auto Expiry</h4>
                            <p className="text-sm text-gray-600">QR code expires after 5 minutes. Generate a new one as needed</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
