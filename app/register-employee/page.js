"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getDocs, query, collection, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { AlertCircle, Building2, Mail, Lock } from "lucide-react";

export default function RegisterEmployee() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyId: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Verify employee exists in company
            const employeesRef = collection(db, `companies/${formData.companyId}/employees`);
            const q = query(employeesRef, where("email", "==", formData.email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError("You are not registered in this company. Please contact your admin to add you first.");
                setLoading(false);
                return;
            }

            const employeeDoc = querySnapshot.docs[0];
            const employeeData = employeeDoc.data();

            // 2. Check if employee has been set up by admin
            if (!employeeData.uid) {
                setError("Your account hasn't been activated by admin yet. Please wait for admin to create your account.");
                setLoading(false);
                return;
            }

            // 3. Verify company ID from user_mappings
            const mappingRef = doc(db, "user_mappings", employeeData.uid);
            const mappingSnap = await getDoc(mappingRef);

            if (!mappingSnap.exists()) {
                setError("Account mapping not found. Please contact your administrator.");
                setLoading(false);
                return;
            }

            const mappingData = mappingSnap.data();
            if (mappingData.companyId !== formData.companyId) {
                setError("Company ID does not match your employee record.");
                setLoading(false);
                return;
            }

            // 4. Try to sign in with provided credentials
            try {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);

                // 5. Redirect to employee dashboard
                router.push(`/dashboard/${formData.companyId}/employee/${employeeData.uid}`);
            } catch (signInError) {
                if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
                    setError("Invalid password. Please use the password provided by your admin or reset your password.");
                } else {
                    setError("Login failed: " + signInError.message);
                }
                setLoading(false);
            }

        } catch (err) {
            console.error("Verification Error:", err);
            setError(err.message || "An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 mb-4">
                        <Building2 className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                        Employee Access
                    </h1>
                    <p className="text-gray-500 mt-2">Verify your company credentials</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                First time accessing?
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                Your admin must add you to the company first. Ask your admin for:
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside mt-1 space-y-0.5">
                                <li>Company ID</li>
                                <li>Your login credentials (email & password)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Company ID
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="companyId"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="e.g. acme-corp-1234"
                                value={formData.companyId}
                                onChange={handleChange}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Provided by your company admin
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="you@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use the password provided by your admin
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                            </span>
                        ) : (
                            "Access Dashboard"
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
                        <p>
                            Already have full credentials?{" "}
                            <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                Login directly
                            </Link>
                        </p>
                        <p>
                            Company admin?{" "}
                            <Link href="/register-company" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                Register your company
                            </Link>
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
