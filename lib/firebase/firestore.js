import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ===== USER OPERATIONS =====

export const createUser = async (uid, userData) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...userData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        })
        return { success: true }
    } catch (error) {
        console.error('Create user error:', error)
        return { success: false, error: error.message }
    }
}

export const getUser = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() }
        }
        return { success: false, error: 'User not found' }
    } catch (error) {
        console.error('Get user error:', error)
        return { success: false, error: error.message }
    }
}

export const getAllUsers = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return { success: true, data: users }
    } catch (error) {
        console.error('Get all users error:', error)
        return { success: false, error: error.message }
    }
}

export const updateUser = async (uid, userData) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            ...userData,
            updatedAt: Timestamp.now(),
        })
        return { success: true }
    } catch (error) {
        console.error('Update user error:', error)
        return { success: false, error: error.message }
    }
}

export const deleteUser = async (uid) => {
    try {
        await deleteDoc(doc(db, 'users', uid))
        return { success: true }
    } catch (error) {
        console.error('Delete user error:', error)
        return { success: false, error: error.message }
    }
}

// ===== ATTENDANCE OPERATIONS =====

export const markAttendance = async (attendanceData) => {
    try {
        const attendanceRef = doc(collection(db, 'attendance'))
        await setDoc(attendanceRef, {
            ...attendanceData,
            createdAt: Timestamp.now(),
        })
        return { success: true, id: attendanceRef.id }
    } catch (error) {
        console.error('Mark attendance error:', error)
        return { success: false, error: error.message }
    }
}

export const getAttendanceByUser = async (userId, startDate, endDate) => {
    try {
        let q = query(
            collection(db, 'attendance'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        )

        if (startDate && endDate) {
            q = query(
                collection(db, 'attendance'),
                where('userId', '==', userId),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc')
            )
        }

        const snapshot = await getDocs(q)
        const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return { success: true, data: attendance }
    } catch (error) {
        console.error('Get attendance error:', error)
        return { success: false, error: error.message }
    }
}

export const getAllAttendance = async (startDate, endDate) => {
    try {
        let q = query(collection(db, 'attendance'), orderBy('date', 'desc'))

        if (startDate && endDate) {
            q = query(
                collection(db, 'attendance'),
                where('date', '>=', startDate),
                where('date', '<=', endDate),
                orderBy('date', 'desc')
            )
        }

        const snapshot = await getDocs(q)
        const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return { success: true, data: attendance }
    } catch (error) {
        console.error('Get all attendance error:', error)
        return { success: false, error: error.message }
    }
}

export const updateAttendance = async (attendanceId, data) => {
    try {
        await updateDoc(doc(db, 'attendance', attendanceId), data)
        return { success: true }
    } catch (error) {
        console.error('Update attendance error:', error)
        return { success: false, error: error.message }
    }
}

// ===== QR SESSION OPERATIONS =====

export const createQRSession = async (sessionData) => {
    try {
        await setDoc(doc(db, 'companySettings', 'qrSession'), {
            ...sessionData,
            createdAt: Timestamp.now(),
        })
        return { success: true }
    } catch (error) {
        console.error('Create QR session error:', error)
        return { success: false, error: error.message }
    }
}

export const getQRSession = async () => {
    try {
        const sessionDoc = await getDoc(doc(db, 'companySettings', 'qrSession'))
        if (sessionDoc.exists()) {
            return { success: true, data: sessionDoc.data() }
        }
        return { success: false, error: 'No active session' }
    } catch (error) {
        console.error('Get QR session error:', error)
        return { success: false, error: error.message }
    }
}

// ===== COMPANY SETTINGS =====

export const getCompanySettings = async () => {
    try {
        const settingsDoc = await getDoc(doc(db, 'companySettings', 'general'))
        if (settingsDoc.exists()) {
            return { success: true, data: settingsDoc.data() }
        }
        return { success: false, error: 'Settings not found' }
    } catch (error) {
        console.error('Get settings error:', error)
        return { success: false, error: error.message }
    }
}

export const updateCompanySettings = async (settings) => {
    try {
        await setDoc(doc(db, 'companySettings', 'general'), {
            ...settings,
            updatedAt: Timestamp.now(),
        })
        return { success: true }
    } catch (error) {
        console.error('Update settings error:', error)
        return { success: false, error: error.message }
    }
}
