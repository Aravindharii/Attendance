"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, Building2, Users, ShieldCheck } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000" />

            <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 pb-2">
                        Attendify
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        The modern, multi-tenant attendance management system for forward-thinking companies.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <Building2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">For Companies</h3>
                        <p className="text-sm text-gray-500 mb-4">Create your workspace, manage shifts, and track attendance.</p>
                        <Link href="/register-company" className="text-primary-600 font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all">
                            Register Company <ArrowRight size={16} />
                        </Link>
                    </GlassCard>

                    <GlassCard className="hover:scale-105 transition-transform cursor-pointer border-primary-500/30 ring-2 ring-primary-500/20">
                        <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Already Registered?</h3>
                        <p className="text-sm text-gray-500 mb-4">Login to your admin or employee dashboard.</p>
                        <Link href="/login" className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium inline-block hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30">
                            Login Now
                        </Link>
                    </GlassCard>

                    <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <Users size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">For Employees</h3>
                        <p className="text-sm text-gray-500 mb-4">Join your company workspace using your Company ID.</p>
                        <Link href="/register-employee" className="text-primary-600 font-medium flex items-center justify-center gap-1 hover:gap-2 transition-all">
                            Join Company <ArrowRight size={16} />
                        </Link>
                    </GlassCard>
                </div>
            </div>

            <footer className="absolute bottom-4 text-center text-sm text-gray-500">
                © 2025 Attendify. Secure & Scalable.
            </footer>
        </div>
    );
}
