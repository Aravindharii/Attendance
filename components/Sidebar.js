"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Settings,
    FileBarChart,
    Clock,
    LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export const Sidebar = ({ role, companyId }) => {
    const pathname = usePathname();
    const { logout, auth } = useAuth();

    const adminLinks = [
        { href: `/dashboard/${companyId}/admin`, label: "Dashboard", icon: LayoutDashboard },
        { href: `/dashboard/${companyId}/admin/employees`, label: "Employees", icon: Users },
        { href: `/dashboard/${companyId}/admin/attendance`, label: "Attendance", icon: CalendarCheck },
        { href: `/dashboard/${companyId}/admin/reports`, label: "Reports", icon: FileBarChart },
        { href: `/dashboard/${companyId}/admin/settings`, label: "Settings", icon: Settings },
    ];

    const employeeLinks = [
        { href: `/dashboard/${companyId}/employee/${auth?.currentUser?.uid}`, label: "My Dashboard", icon: LayoutDashboard },
        { href: `/dashboard/${companyId}/employee/${auth?.currentUser?.uid}/history`, label: "History", icon: Clock },
        { href: `/dashboard/${companyId}/employee/${auth?.currentUser?.uid}/profile`, label: "Profile", icon: Users },
    ];

    const links = role === "company_admin" || role === "sub_admin" ? adminLinks : employeeLinks;

    return (
        <aside className="w-64 glass border-r border-white/20 dark:border-slate-700/30 flex flex-col h-full hidden md:flex">
            <div className="p-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600">
                    Attendify
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 " +
                                (isActive
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50")
                            }
                        >
                            <Icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
