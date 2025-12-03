"use client"
import { useAuth } from "@/lib/auth/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { User, Mail, Briefcase, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { userData } = useAuth();

    if (!userData) return null;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>

            <GlassCard className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                        {userData.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userData.name}</h2>
                        <p className="text-gray-500 capitalize">{userData.role?.replace('_', ' ')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail size={14} /> Email
                        </label>
                        <p className="font-medium text-gray-800 dark:text-white">{userData.email}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Briefcase size={14} /> Department
                        </label>
                        <p className="font-medium text-gray-800 dark:text-white">{userData.department || 'Not Assigned'}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={14} /> Joining Date
                        </label>
                        <p className="font-medium text-gray-800 dark:text-white">{userData.joiningDate || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-500 flex items-center gap-2">
                            <Briefcase size={14} /> Shift
                        </label>
                        <p className="font-medium text-gray-800 dark:text-white">{userData.shift || 'General'}</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
