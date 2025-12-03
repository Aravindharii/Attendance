'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function QRGenerator({ sessionId, expiresAt, onGenerate }) {
    const canvasRef = useRef(null)
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        if (sessionId && canvasRef.current) {
            QRCode.toCanvas(
                canvasRef.current,
                JSON.stringify({ sessionId, type: 'attendance' }),
                {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#0ea5e9',
                        light: '#ffffff',
                    },
                }
            )
        }
    }, [sessionId])

    useEffect(() => {
        if (expiresAt) {
            const interval = setInterval(() => {
                const now = Date.now()
                const remaining = Math.max(0, expiresAt - now)
                setTimeLeft(remaining)

                if (remaining === 0) {
                    clearInterval(interval)
                }
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [expiresAt])

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000)
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <Card title="QR Code Generator" subtitle="Generate QR code for attendance marking">
            <div className="flex flex-col items-center gap-6">
                {sessionId ? (
                    <>
                        <div className="p-6 bg-white rounded-xl shadow-lg">
                            <canvas ref={canvasRef} />
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Time remaining</p>
                            <p className={`text-3xl font-bold ${timeLeft < 60000 ? 'text-danger-500' : 'text-primary-600'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={onGenerate}
                        >
                            Generate New QR Code
                        </Button>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No active QR session</p>
                        <Button onClick={onGenerate}>
                            Generate QR Code
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    )
}
