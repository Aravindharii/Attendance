// Calculate working hours between clock in and clock out
export const calculateWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0

    const start = new Date(clockIn)
    const end = new Date(clockOut)
    const diff = end - start

    // Convert to hours
    const hours = diff / (1000 * 60 * 60)
    return Math.max(0, hours)
}

// Calculate overtime hours
export const calculateOvertime = (totalHours, standardHours = 8) => {
    return Math.max(0, totalHours - standardHours)
}

// Determine attendance status
export const determineAttendanceStatus = (clockIn, workingHoursStart, lateThreshold = 15) => {
    if (!clockIn) return 'absent'

    const clockInTime = new Date(clockIn)
    const [hours, minutes] = workingHoursStart.split(':')
    const startTime = new Date(clockInTime)
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const diffMinutes = (clockInTime - startTime) / (1000 * 60)

    if (diffMinutes <= 0) return 'present'
    if (diffMinutes <= lateThreshold) return 'present'
    return 'late'
}

// Calculate attendance percentage
export const calculateAttendancePercentage = (presentDays, totalDays) => {
    if (totalDays === 0) return 0
    return ((presentDays / totalDays) * 100).toFixed(1)
}

// Calculate average hours
export const calculateAverageHours = (attendanceRecords) => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0

    const totalHours = attendanceRecords.reduce((sum, record) => {
        return sum + (record.totalHours || 0)
    }, 0)

    return (totalHours / attendanceRecords.length).toFixed(1)
}

// Validate geolocation
export const validateGeolocation = (userLat, userLng, officeLat, officeLng, radius = 100) => {
    // Haversine formula to calculate distance
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (userLat * Math.PI) / 180
    const φ2 = (officeLat * Math.PI) / 180
    const Δφ = ((officeLat - userLat) * Math.PI) / 180
    const Δλ = ((officeLng - userLng) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c // Distance in meters

    return {
        isValid: distance <= radius,
        distance: Math.round(distance),
    }
}

// Generate attendance statistics
export const generateAttendanceStats = (attendanceRecords) => {
    const total = attendanceRecords.length
    const present = attendanceRecords.filter(r => r.status === 'present').length
    const late = attendanceRecords.filter(r => r.status === 'late').length
    const absent = attendanceRecords.filter(r => r.status === 'absent').length

    const avgHours = calculateAverageHours(attendanceRecords.filter(r => r.totalHours > 0))

    return {
        totalDays: total,
        present,
        late,
        absent,
        avgHours: parseFloat(avgHours),
        attendanceRate: calculateAttendancePercentage(present + late, total),
    }
}
