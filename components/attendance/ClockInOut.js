'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function ClockInOut({ currentStatus, onClockIn, onClockOut, loading }) {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <Card glass>
            <div className="text-center space-y-6">
                {/* Current Time */}
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
                    <p className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                        {formatTime(currentTime)}
                    </p>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${currentStatus?.clockedIn ? 'bg-success-500 animate-pulse' : 'bg-gray-400'}`} />
                    <p className="text-lg font-medium text-gray-700">
                        {currentStatus?.clockedIn ? 'Clocked In' : 'Not Clocked In'}
                    </p>
                </div>

                {/* Clock In/Out Times */}
                {currentStatus?.clockedIn && currentStatus?.clockIn && (
                    <div className="glass rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Clock In Time:</span>
                            <span className="font-semibold text-gray-800">
                                {new Date(currentStatus.clockIn).toLocaleTimeString()}
                            </span>
                        </div>
                        {currentStatus.clockOut && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Clock Out Time:</span>
                                <span className="font-semibold text-gray-800">
                                    {new Date(currentStatus.clockOut).toLocaleTimeString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                    {!currentStatus?.clockedIn ? (
                        <Button
                            size="lg"
                            onClick={onClockIn}
                            loading={loading}
                            icon={<Clock className="w-5 h-5" />}
                            className="w-full"
                        >
                            Clock In
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            variant="danger"
                            onClick={onClockOut}
                            loading={loading}
                            icon={<Clock className="w-5 h-5" />}
                            className="w-full"
                        >
                            Clock Out
                        </Button>
                    )}
                </div>

                {/* Info */}
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location tracking enabled
                </p>
            </div>
        </Card>
    )
}
