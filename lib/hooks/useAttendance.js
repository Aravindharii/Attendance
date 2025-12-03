'use client'

import { useState, useEffect } from 'react'
import { getAttendanceByUser, getAllAttendance } from '../firebase/firestore'

export function useAttendance(userId = null, startDate = null, endDate = null) {
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAttendance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, startDate, endDate])

    const fetchAttendance = async () => {
        setLoading(true)
        setError(null)

        try {
            let result
            if (userId) {
                result = await getAttendanceByUser(userId, startDate, endDate)
            } else {
                result = await getAllAttendance(startDate, endDate)
            }

            if (result.success) {
                setAttendance(result.data)
            } else {
                setError(result.error)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const refetch = () => {
        fetchAttendance()
    }

    return { attendance, loading, error, refetch }
}
