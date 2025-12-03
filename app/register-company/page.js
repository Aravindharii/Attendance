"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterCompany() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: "",
        companyAddress: "",
        adminName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Generate Company ID (slug-like)
            const companyId = formData.companyName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4);

            // 3. Create Company Document
            await setDoc(doc(db, "companies", companyId), {
                name: formData.companyName,
                address: formData.companyAddress,
                createdAt: serverTimestamp(),
                ownerId: user.uid,
            });

            // 4. Create Admin Profile in Company Sub-collection
            await setDoc(doc(db, `companies/${companyId}/admins`, user.uid), {
                uid: user.uid,
                name: formData.adminName,
                email: formData.email,
                role: "company_admin",
                createdAt: serverTimestamp(),
            });

            // 5. Create Global User Mapping (Critical for Login)
            await setDoc(doc(db, "user_mappings", user.uid), {
                uid: user.uid,
                email: formData.email,
                companyId: companyId,
                role: "company_admin",
            });

            // 6. Redirect
            router.push(`/dashboard/${companyId}/admin`);
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                        Register Company
                    </h1>
                    <p className="text-gray-500 mt-2">Start your attendance management journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    {step === 1 && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    className="glass-input w-full"
                                    placeholder="Acme Corp"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="companyAddress"
                                    required
                                    className="glass-input w-full"
                                    placeholder="123 Business St..."
                                    value={formData.companyAddress}
                                    onChange={handleChange}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors"
                            >
                                Next: Admin Details
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                <input
                                    type="text"
                                    name="adminName"
                                    required
                                    className="glass-input w-full"
                                    placeholder="John Doe"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="glass-input w-full"
                                    placeholder="admin@acme.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="glass-input w-full"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="glass-input w-full"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-2/3 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary-600 hover:underline">
                        Login here
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
