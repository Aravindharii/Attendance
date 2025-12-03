"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Bell, Search, Menu } from "lucide-react";

export const Topbar = ({ user }) => {
    return (
        <header className="h-16 glass border-b border-white/20 dark:border-slate-700/30 flex items-center justify-between px-6 z-10">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <Menu size={20} />
                </button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-primary-500/50 outline-none text-sm w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 relative hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};
