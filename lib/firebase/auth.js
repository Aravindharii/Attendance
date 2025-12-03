import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

// Sign up new user
export const signUp = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile
        await updateProfile(user, {
            displayName: userData.name
        })

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: userData.name,
            email: email,
            employeeId: userData.employeeId,
            department: userData.department || '',
            role: userData.role || 'employee',
            photoURL: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return { success: true, user }
    } catch (error) {
        console.error('Sign up error:', error)
        return { success: false, error: error.message }
    }
}

// Sign in existing user
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        const userData = userDoc.data()

        return { success: true, user: userCredential.user, userData }
    } catch (error) {
        console.error('Sign in error:', error)
        return { success: false, error: error.message }
    }
}

// Sign out
export const logout = async () => {
    try {
        await signOut(auth)
        return { success: true }
    } catch (error) {
        console.error('Logout error:', error)
        return { success: false, error: error.message }
    }
}

// Get current user data
export const getCurrentUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() }
        } else {
            return { success: false, error: 'User not found' }
        }
    } catch (error) {
        console.error('Get user data error:', error)
        return { success: false, error: error.message }
    }
}

// Auth state observer
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback)
}
