'use client'

import { TrendingUp, TrendingDown, Users, Clock, Calendar, CheckCircle } from 'lucide-react'
import Card from '../ui/Card'

export default function AttendanceStats({ stats }) {
    const statCards = [
        {
            title: 'Total Days',
            value: stats?.totalDays || 0,
            icon: Calendar,
            color: 'primary',
            trend: null,
        },
        {
            title: 'Present',
            value: stats?.present || 0,
            icon: CheckCircle,
            color: 'success',
            trend: stats?.presentTrend || 0,
        },
        {
            title: 'Absent',
            value: stats?.absent || 0,
            icon: Users,
            color: 'danger',
            trend: stats?.absentTrend || 0,
        },
        {
            title: 'Avg Hours',
            value: stats?.avgHours || '0.0',
            icon: Clock,
            color: 'secondary',
            suffix: 'hrs',
            trend: stats?.hoursTrend || 0,
        },
    ]

    const colorClasses = {
        primary: 'from-primary-500 to-primary-600',
        success: 'from-success-500 to-success-600',
        danger: 'from-danger-500 to-danger-600',
        secondary: 'from-secondary-500 to-secondary-600',
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                const hasPositiveTrend = stat.trend > 0
                const hasNegativeTrend = stat.trend < 0

                return (
                    <Card key={index} glass hover className="relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[stat.color]} opacity-10 rounded-full -mr-16 -mt-16`} />

                        <div className="relative">
                            {/* Icon */}
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} mb-4`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Value */}
                            <div className="space-y-1">
                                <p className="text-3xl font-bold text-gray-800">
                                    {stat.value}
                                    {stat.suffix && <span className="text-lg text-gray-600 ml-1">{stat.suffix}</span>}
                                </p>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                            </div>

                            {/* Trend */}
                            {stat.trend !== null && stat.trend !== 0 && (
                                <div className={`flex items-center gap-1 mt-2 text-sm ${hasPositiveTrend ? 'text-success-600' : 'text-danger-600'}`}>
                                    {hasPositiveTrend ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    <span className="font-medium">{Math.abs(stat.trend)}%</span>
                                    <span className="text-gray-500">vs last month</span>
                                </div>
                            )}
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
