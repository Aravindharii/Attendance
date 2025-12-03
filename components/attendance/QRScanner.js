'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function QRScanner({ onScan, onError }) {
    const [scanning, setScanning] = useState(false)
    const [cameras, setCameras] = useState([])
    const [selectedCamera, setSelectedCamera] = useState(null)
    const scannerRef = useRef(null)
    const html5QrCodeRef = useRef(null)

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length) {
                    setCameras(devices)
                    setSelectedCamera(devices[0].id)
                }
            })
            .catch(err => {
                console.error('Error getting cameras:', err)
            })

        return () => {
            stopScanning()
        }
    }, [])

    const startScanning = async () => {
        if (!selectedCamera) {
            onError?.('No camera available')
            return
        }

        try {
            html5QrCodeRef.current = new Html5Qrcode('qr-reader')

            await html5QrCodeRef.current.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText)
                        if (data.type === 'attendance' && data.sessionId) {
                            onScan?.(data)
                            stopScanning()
                        }
                    } catch (err) {
                        console.error('Invalid QR code:', err)
                    }
                },
                (errorMessage) => {
                    // Ignore scan errors (happens continuously while scanning)
                }
            )

            setScanning(true)
        } catch (err) {
            console.error('Error starting scanner:', err)
            onError?.('Failed to start camera')
        }
    }

    const stopScanning = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop()
                html5QrCodeRef.current.clear()
                html5QrCodeRef.current = null
            } catch (err) {
                console.error('Error stopping scanner:', err)
            }
        }
        setScanning(false)
    }

    return (
        <Card title="QR Code Scanner" subtitle="Scan QR code to mark attendance">
            <div className="space-y-4">
                {cameras.length > 1 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Camera
                        </label>
                        <select
                            value={selectedCamera || ''}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                            disabled={scanning}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {cameras.map(camera => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div
                    id="qr-reader"
                    className="rounded-lg overflow-hidden bg-gray-900"
                    style={{ minHeight: scanning ? 'auto' : '300px' }}
                />

                <div className="flex justify-center">
                    {!scanning ? (
                        <Button
                            onClick={startScanning}
                            icon={<Camera className="w-4 h-4" />}
                            disabled={!selectedCamera}
                        >
                            Start Scanning
                        </Button>
                    ) : (
                        <Button
                            onClick={stopScanning}
                            variant="danger"
                            icon={<CameraOff className="w-4 h-4" />}
                        >
                            Stop Scanning
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}
