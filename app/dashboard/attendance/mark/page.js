'use client'

import { useState, useEffect } from 'react'
import { QrCode, MapPin, Clock } from 'lucide-react'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/lib/hooks/useAuth'
import ClockInOut from '@/components/attendance/ClockInOut'
import QRScanner from '@/components/attendance/QRScanner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function MarkAttendancePage() {
    const { user } = useAuth()
    const [method, setMethod] = useState('manual')
    const [loading, setLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState({
        clockedIn: false,
        clockIn: null,
        clockOut: null,
        attendanceId: null,
    })

    // Check if user already clocked in today
    useEffect(() => {
        if (user?.uid) {  // Add uid check
            checkTodayAttendance()
        }
    }, [user?.uid]) // Only depend on user.uid

    const checkTodayAttendance = async () => {
        if (!user?.uid) return // Safety check

        try {
            const today = new Date().toISOString().split('T')[0]
            const q = query(
                collection(db, 'attendance'),
                where('userId', '==', user.uid),
                where('date', '==', today)
            )
            
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
                const attendanceDoc = querySnapshot.docs[0]
                const data = attendanceDoc.data()
                
                setCurrentStatus({
                    clockedIn: !data.checkOut, // Only clocked in if no checkOut
                    clockIn: data.checkIn?.toDate() || null,
                    clockOut: data.checkOut?.toDate() || null,
                    attendanceId: attendanceDoc.id,
                })
            } else {
                // No attendance today - reset to default
                setCurrentStatus({
                    clockedIn: false,
                    clockIn: null,
                    clockOut: null,
                    attendanceId: null,
                })
            }
        } catch (error) {
            console.error('Error checking attendance:', error)
        }
    }

    const handleClockIn = async (methodType = method) => {
        if (!user?.uid) {
            alert('Please login first')
            return
        }

        // Prevent duplicate clock-ins
        // if (currentStatus.clockedIn || currentStatus.attendanceId) {
        //     alert('You have already clocked in today')
        //     return
        // }

        setLoading(true)

        try {
            const now = Timestamp.now()
            const today = new Date().toISOString().split('T')[0]
            
            // Check again to prevent race condition
            const existingQuery = query(
                collection(db, 'attendance'),
                where('userId', '==', user.uid),
                where('date', '==', today)
            )
            const existingSnapshot = await getDocs(existingQuery)
            
            // if (!existingSnapshot.empty) {
            //     alert('You have already clocked in today')
            //     await checkTodayAttendance() // Refresh status
            //     setLoading(false)
            //     return
            // }
            
            // Determine status based on time (late if after 9:30 AM)
            const currentHour = new Date().getHours()
            const currentMinute = new Date().getMinutes()
            const isLate = currentHour > 9 || (currentHour === 9 && currentMinute > 30)

            // Add new attendance record
            const docRef = await addDoc(collection(db, 'attendance'), {
                userId: user.uid,
                userName: user.name || user.email,
                employeeId: user.employeeId || 'N/A',
                checkIn: now,
                checkOut: null,
                date: today,
                status: isLate ? 'late' : 'present',
                method: methodType,
                createdAt: now,
                updatedAt: now,
            })

            setCurrentStatus({
                clockedIn: true,
                clockIn: now.toDate(),
                clockOut: null,
                attendanceId: docRef.id,
            })

            alert('Clocked in successfully!')
        } catch (error) {
            console.error('Clock in error:', error)
            alert('Failed to clock in: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleClockOut = async () => {
        if (!user?.uid || !currentStatus.attendanceId) {
            alert('No active clock-in found')
            return
        }

        if (!currentStatus.clockedIn) {
            alert('You are already clocked out')
            return
        }

        setLoading(true)

        try {
            const now = Timestamp.now()
            
            // Update existing attendance record
            const attendanceRef = doc(db, 'attendance', currentStatus.attendanceId)
            await updateDoc(attendanceRef, {
                checkOut: now,
                updatedAt: now,
            })

            setCurrentStatus({
                ...currentStatus,
                clockedIn: false,
                clockOut: now.toDate(),
            })

            alert('Clocked out successfully!')
        } catch (error) {
            console.error('Clock out error:', error)
            alert('Failed to clock out: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleQRScan = async (data) => {
        console.log('QR Scanned:', data)
        
        try {
            // Check if QR session is valid
            const sessionQuery = query(
                collection(db, 'qr_sessions'),
                where('code', '==', data.code),
                where('isActive', '==', true)
            )
            
            const sessionSnapshot = await getDocs(sessionQuery)
            
            if (sessionSnapshot.empty) {
                alert('Invalid or expired QR code')
                return
            }
            
            await handleClockIn('qr')
        } catch (error) {
            console.error('QR validation error:', error)
            alert('QR code validation failed')
        }
    }

    const handleGeolocationAttendance = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                console.log('Location:', latitude, longitude)
                
                // Define company location (replace with your actual coordinates)
                const companyLat = 12.9716 // Example: Bangalore
                const companyLng = 77.5946
                const maxDistance = 0.1 // 100 meters in km
                
                // Calculate distance
                const distance = calculateDistance(latitude, longitude, companyLat, companyLng)
                
                if (distance <= maxDistance) {
                    await handleClockIn('geolocation')
                } else {
                    setLoading(false)
                    alert(`You are ${(distance * 1000).toFixed(0)}m away from the office. Please be within 100m.`)
                }
            },
            (error) => {
                setLoading(false)
                alert('Failed to get location: ' + error.message)
            }
        )
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Mark Attendance</h1>
                <p className="text-gray-600">Choose your preferred method to mark attendance</p>
            </div>

            {/* Method Selector */}
            <Card glass>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setMethod('manual')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            method === 'manual'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Clock className={`w-8 h-8 mx-auto mb-2 ${method === 'manual' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <p className={`font-medium ${method === 'manual' ? 'text-primary-700' : 'text-gray-700'}`}>
                            Manual Clock In/Out
                        </p>
                    </button>

                    <button
                        onClick={() => setMethod('qr')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            method === 'qr'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <QrCode className={`w-8 h-8 mx-auto mb-2 ${method === 'qr' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <p className={`font-medium ${method === 'qr' ? 'text-primary-700' : 'text-gray-700'}`}>
                            QR Code Scan
                        </p>
                    </button>

                    <button
                        onClick={() => setMethod('geolocation')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            method === 'geolocation'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <MapPin className={`w-8 h-8 mx-auto mb-2 ${method === 'geolocation' ? 'text-primary-600' : 'text-gray-400'}`} />
                        <p className={`font-medium ${method === 'geolocation' ? 'text-primary-700' : 'text-gray-700'}`}>
                            Geolocation
                        </p>
                    </button>
                </div>
            </Card>

            {/* Content based on method */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {method === 'manual' && (
                    <ClockInOut
                        currentStatus={currentStatus}
                        onClockIn={() => handleClockIn('manual')}
                        onClockOut={handleClockOut}
                        loading={loading}
                    />
                )}

                {method === 'qr' && (
                    <QRScanner
                        onScan={handleQRScan}
                        onError={(error) => alert(error)}
                    />
                )}

                {method === 'geolocation' && (
                    <Card glass>
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto">
                                <MapPin className="w-10 h-10 text-white" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Location-Based Attendance
                                </h3>
                                <p className="text-gray-600">
                                    Click the button below to mark attendance using your current location
                                </p>
                            </div>

                            <div className="glass rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Allowed Location:</p>
                                <p className="text-sm font-semibold text-gray-800">Company Office</p>
                                <p className="text-xs text-gray-500 mt-1">Within 100m radius</p>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleGeolocationAttendance}
                                loading={loading}
                                disabled={currentStatus.clockedIn}
                                icon={<MapPin className="w-5 h-5" />}
                                className="w-full"
                            >
                                {currentStatus.clockedIn ? 'Already Clocked In' : 'Mark Attendance with Location'}
                            </Button>

                            <p className="text-xs text-gray-500">
                                Your browser will request permission to access your location
                            </p>
                        </div>
                    </Card>
                )}

                {/* Today's Summary */}
                <Card title="Today's Summary" subtitle="Your attendance for today">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className={`text-sm font-semibold ${currentStatus.clockedIn ? 'text-success-600' : 'text-gray-800'}`}>
                                {currentStatus.clockedIn ? 'Clocked In' : 'Not Clocked In'}
                            </span>
                        </div>

                        {currentStatus.clockIn && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Clock In Time</span>
                                <span className="text-sm font-semibold text-gray-800">
                                    {new Date(currentStatus.clockIn).toLocaleTimeString()}
                                </span>
                            </div>
                        )}

                        {currentStatus.clockOut && (
                            <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Clock Out Time</span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {new Date(currentStatus.clockOut).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                                    <span className="text-sm text-success-700">Total Hours</span>
                                    <span className="text-sm font-bold text-success-700">
                                        {((currentStatus.clockOut - currentStatus.clockIn) / (1000 * 60 * 60)).toFixed(1)}h
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
