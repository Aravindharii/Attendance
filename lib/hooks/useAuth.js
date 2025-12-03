'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChange, getCurrentUserData } from '../firebase/auth'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser)

                // Get user data from Firestore
                const result = await getCurrentUserData(firebaseUser.uid)
                if (result.success) {
                    setUserData(result.data)
                }
            } else {
                setUser(null)
                setUserData(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return { user, userData, loading }
}
