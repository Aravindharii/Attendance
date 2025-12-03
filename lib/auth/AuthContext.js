"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Firestore data (role, companyId)
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeMapping = null;
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                // User is signed in, listen to user_mappings
                const mappingRef = doc(db, "user_mappings", authUser.uid);

                unsubscribeMapping = onSnapshot(mappingRef, (mappingSnap) => {
                    console.log("AuthContext: Mapping snapshot update", mappingSnap.exists());
                    if (mappingSnap.exists()) {
                        const mapping = mappingSnap.data();
                        console.log("AuthContext: Found mapping", mapping);
                        const { companyId, role } = mapping;

                        // Listen to full profile
                        const collectionName = role === 'employee' ? 'employees' : 'admins';
                        const profileRef = doc(db, `companies/${companyId}/${collectionName}`, authUser.uid);

                        if (unsubscribeProfile) unsubscribeProfile();

                        unsubscribeProfile = onSnapshot(profileRef, (profileSnap) => {
                            console.log("AuthContext: Profile snapshot update", profileSnap.exists());
                            if (profileSnap.exists()) {
                                setUserData({ ...profileSnap.data(), role, companyId, uid: authUser.uid });
                            } else {
                                // Profile might be deleted or not created yet, but mapping exists
                                console.warn("AuthContext: Profile missing for mapped user");
                                setUserData({ role, companyId, uid: authUser.uid });
                            }
                            setLoading(false);
                        });
                    } else {
                        console.log("AuthContext: No user mapping found yet for", authUser.uid);
                        setUserData(null);
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("AuthContext: Error fetching user mapping:", error);
                    setLoading(false);
                });

            } else {
                // User signed out
                if (unsubscribeMapping) unsubscribeMapping();
                if (unsubscribeProfile) unsubscribeProfile();
                setUserData(null);
                setLoading(false);
            }
            setUser(authUser);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeMapping) unsubscribeMapping();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const logout = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
