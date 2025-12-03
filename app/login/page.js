"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user mapping to determine redirect
            const mappingRef = doc(db, "user_mappings", user.uid);
            const mappingSnap = await getDoc(mappingRef);

            if (mappingSnap.exists()) {
                const { companyId, role } = mappingSnap.data();

                if (role === 'company_admin' || role === 'sub_admin') {
                    router.push(`/dashboard/${companyId}/admin`);
                } else {
                    router.push(`/dashboard/${companyId}/employee/${user.uid}`);
                }
            } else {
                // Fallback or error if no mapping found
                setError("User profile not found. Please contact support.");
                // Optionally sign out if invalid state
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 mt-2">Login to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="glass-input w-full"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="glass-input w-full"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary-600 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
                    <p>
                        Don't have a company account?{" "}
                        <Link href="/register-company" className="text-primary-600 hover:underline">
                            Register Company
                        </Link>
                    </p>
                    <p>
                        New Employee?{" "}
                        <Link href="/register-employee" className="text-primary-600 hover:underline">
                            Join your Team
                        </Link>
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
