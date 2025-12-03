"use client";

import { use, useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Clock, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, 
    BarChart3, Download, ChevronRight, Activity, TrendingUp, 
    ArrowUp, ArrowDown, Zap, Target, Award, Timer, DollarSign,
    Building2, Briefcase
} from "lucide-react";
import {
    doc, getDoc, setDoc, updateDoc,
    serverTimestamp, query, collection,
    where, getDocs, orderBy, limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/auth/AuthContext";
import { motion } from "framer-motion";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function EmployeeDashboard({ params }) {
    const { companyId, employeeId } = use(params);
    const { user, userData } = useAuth();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [status, setStatus] = useState("loading");
    const [todayRecord, setTodayRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState("");
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    
    // New states for enhanced features
    const [workSites, setWorkSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [payrollInfo, setPayrollInfo] = useState(null);
    const [workClassification, setWorkClassification] = useState({
        regular: 0,
        overtime: 0,
        weekend: 0,
        holiday: 0
    });
    
    const [monthlyStats, setMonthlyStats] = useState({
        present: 0,
        late: 0,
        absent: 0,
        totalDays: 0,
        avgCheckInTime: "--:--",
        totalHours: 0,
        overtimeHours: 0,
        regularHours: 0,
        weekendHours: 0,
        holidayHours: 0
    });
    
    const [weeklyBreakdown, setWeeklyBreakdown] = useState({
        weekHours: 0,
        weekendHours: 0,
        overtimeHours: 0
    });
    
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [performanceInsights, setPerformanceInsights] = useState([]);
    const [achievements, setAchievements] = useState([]);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch work sites
    useEffect(() => {
        if (!companyId) return;

        const fetchWorkSites = async () => {
            try {
                const sitesRef = collection(db, `companies/${companyId}/workSites`);
                const snapshot = await getDocs(sitesRef);
                const sites = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setWorkSites(sites);
                
                // Set default site if only one exists
                if (sites.length === 1) {
                    setSelectedSite(sites[0].id);
                }
            } catch (error) {
                console.error("Error fetching work sites:", error);
            }
        };

        fetchWorkSites();
    }, [companyId]);

    // Fetch employee data and payroll info
    useEffect(() => {
        if (!companyId || !employeeId) return;

        const fetchEmployeeData = async () => {
            try {
                const empRef = doc(db, `companies/${companyId}/employees`, employeeId);
                const empSnap = await getDoc(empRef);
                
                if (empSnap.exists()) {
                    const data = empSnap.data();
                    setEmployeeData(data);
                    
                    // Calculate payroll info
                    const hourlyRate = data.hourlyRate || 0;
                    const overtimeMultiplier = data.overtimeMultiplier || 1.5;
                    const weekendMultiplier = data.weekendMultiplier || 2;
                    const holidayMultiplier = data.holidayMultiplier || 2.5;
                    
                    setPayrollInfo({
                        hourlyRate,
                        overtimeMultiplier,
                        weekendMultiplier,
                        holidayMultiplier,
                        currency: data.currency || "INR"
                    });
                }
            } catch (error) {
                console.error("Error fetching employee data:", error);
            }
        };

        fetchEmployeeData();
    }, [companyId, employeeId]);

    // Calculate elapsed time since clock in
    useEffect(() => {
        if (status === "clocked-in" && todayRecord?.clockIn) {
            const interval = setInterval(() => {
                const [hours, minutes] = todayRecord.clockIn.split(':').map(Number);
                const clockInTime = new Date();
                clockInTime.setHours(hours, minutes, 0);
                
                const now = new Date();
                const diff = now - clockInTime;
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                
                setElapsedTime(`${hrs}h ${mins}m ${secs}s`);
            }, 1000);
            
            return () => clearInterval(interval);
        } else {
            setElapsedTime("");
        }
    }, [status, todayRecord?.clockIn]);

    // Get user's current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            setGettingLocation(true);
            setLocationError(null);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    setLocation(locationData);
                    setGettingLocation(false);
                    resolve(locationData);
                },
                (error) => {
                    let errorMessage = "Unable to retrieve your location";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location permission denied. Please enable location access.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out.";
                            break;
                    }
                    setLocationError(errorMessage);
                    setGettingLocation(false);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // Determine work classification based on date and time
    const getWorkClassification = (date, clockIn, clockOut) => {
        const workDate = new Date(date);
        const dayOfWeek = workDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Check if it's a holiday (you can maintain a holidays collection)
        // For now, we'll just classify as weekend/weekday
        
        if (!clockIn || !clockOut) return { type: 'incomplete', hours: 0 };
        
        const totalHours = calculateHours(clockIn, clockOut);
        const standardHours = 8;
        
        if (isWeekend) {
            return {
                type: 'weekend',
                hours: totalHours,
                regularHours: 0,
                overtimeHours: 0,
                weekendHours: totalHours
            };
        }
        
        const regularHours = Math.min(totalHours, standardHours);
        const overtimeHours = Math.max(0, totalHours - standardHours);
        
        return {
            type: 'regular',
            hours: totalHours,
            regularHours,
            overtimeHours,
            weekendHours: 0
        };
    };

    // Fetch today's attendance status
    useEffect(() => {
        if (!companyId || !employeeId) return;

        const fetchTodayStatus = async () => {
            try {
                const todayStr = new Date().toISOString().split('T')[0];
                const recordId = `${employeeId}_${todayStr}`;
                const docRef = doc(db, `companies/${companyId}/attendance`, recordId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTodayRecord(data);
                    if (data.clockOut) {
                        setStatus("completed");
                    } else if (data.clockIn) {
                        setStatus("clocked-in");
                        if (data.workSiteId) {
                            setSelectedSite(data.workSiteId);
                        }
                    } else {
                        setStatus("clocked-out");
                    }
                } else {
                    setStatus("clocked-out");
                }
            } catch (error) {
                console.error("Error fetching today's status:", error);
                setStatus("clocked-out");
            } finally {
                setLoading(false);
            }
        };

        fetchTodayStatus();
    }, [companyId, employeeId]);

    // Fetch monthly statistics with enhanced classification
    useEffect(() => {
        if (!companyId || !employeeId) return;

        const fetchMonthlyStats = async () => {
            try {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const attendanceRef = collection(db, `companies/${companyId}/attendance`);
                const q = query(
                    attendanceRef,
                    where("employeeId", "==", employeeId),
                    where("date", ">=", firstDay),
                    where("date", "<=", lastDay)
                );

                const snapshot = await getDocs(q);
                let present = 0, late = 0, absent = 0;
                let checkInTimes = [];
                let totalHours = 0;
                let regularHours = 0;
                let overtimeHours = 0;
                let weekendHours = 0;
                let holidayHours = 0;

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.clockIn) {
                        present++;
                        if (data.status === "late") late++;
                        
                        if (data.clockOut) {
                            const classification = getWorkClassification(data.date, data.clockIn, data.clockOut);
                            totalHours += classification.hours;
                            regularHours += classification.regularHours || 0;
                            overtimeHours += classification.overtimeHours || 0;
                            weekendHours += classification.weekendHours || 0;
                        }
                        
                        const [h, m] = data.clockIn.split(':').map(Number);
                        checkInTimes.push(h * 60 + m);
                    }
                });

                const workingDays = now.getDate();
                absent = Math.max(0, workingDays - present);

                let avgCheckInTime = "--:--";
                if (checkInTimes.length > 0) {
                    const avgMinutes = Math.round(checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length);
                    const avgHours = Math.floor(avgMinutes / 60);
                    const avgMins = avgMinutes % 60;
                    avgCheckInTime = `${String(avgHours).padStart(2, '0')}:${String(avgMins).padStart(2, '0')}`;
                }

                setMonthlyStats({
                    present,
                    late,
                    absent,
                    totalDays: workingDays,
                    avgCheckInTime,
                    totalHours: Math.round(totalHours * 10) / 10,
                    regularHours: Math.round(regularHours * 10) / 10,
                    overtimeHours: Math.round(overtimeHours * 10) / 10,
                    weekendHours: Math.round(weekendHours * 10) / 10,
                    holidayHours: Math.round(holidayHours * 10) / 10
                });

                setWorkClassification({
                    regular: regularHours,
                    overtime: overtimeHours,
                    weekend: weekendHours,
                    holiday: holidayHours
                });
            } catch (error) {
                console.error("Error fetching monthly stats:", error);
            }
        };

        fetchMonthlyStats();
    }, [companyId, employeeId]);

    // Fetch weekly breakdown
    useEffect(() => {
        if (!companyId || !employeeId) return;

        const fetchWeeklyBreakdown = async () => {
            try {
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                const startDate = startOfWeek.toISOString().split('T')[0];

                const attendanceRef = collection(db, `companies/${companyId}/attendance`);
                const q = query(
                    attendanceRef,
                    where("employeeId", "==", employeeId),
                    where("date", ">=", startDate)
                );

                const snapshot = await getDocs(q);
                let weekHours = 0;
                let weekendHours = 0;
                let overtimeHours = 0;

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.clockIn && data.clockOut) {
                        const classification = getWorkClassification(data.date, data.clockIn, data.clockOut);
                        
                        if (classification.type === 'weekend') {
                            weekendHours += classification.hours;
                        } else {
                            weekHours += classification.regularHours;
                            overtimeHours += classification.overtimeHours;
                        }
                    }
                });

                setWeeklyBreakdown({
                    weekHours: Math.round(weekHours * 10) / 10,
                    weekendHours: Math.round(weekendHours * 10) / 10,
                    overtimeHours: Math.round(overtimeHours * 10) / 10
                });
            } catch (error) {
                console.error("Error fetching weekly breakdown:", error);
            }
        };

        fetchWeeklyBreakdown();
    }, [companyId, employeeId]);

    // Fetch recent attendance
    useEffect(() => {
        if (!companyId || !employeeId) return;

        const fetchRecentAttendance = async () => {
            try {
                const attendanceRef = collection(db, `companies/${companyId}/attendance`);
                const q = query(
                    attendanceRef,
                    where("employeeId", "==", employeeId),
                    orderBy("date", "desc"),
                    limit(30)
                );

                const snapshot = await getDocs(q);
                const records = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setRecentAttendance(records);
                processWeeklyData(records);
                generateInsights(records);
                calculateAchievements(records);
            } catch (error) {
                console.error("Error fetching recent attendance:", error);
            }
        };

        fetchRecentAttendance();
    }, [companyId, employeeId]);

    // Process weekly data for charts
    const processWeeklyData = (records) => {
        const last7Days = records.slice(0, 7).reverse();
        const chartData = last7Days.map(record => {
            const classification = getWorkClassification(record.date, record.clockIn, record.clockOut);
            
            return {
                date: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
                regularHours: Math.round((classification.regularHours || 0) * 10) / 10,
                overtimeHours: Math.round((classification.overtimeHours || 0) * 10) / 10,
                weekendHours: Math.round((classification.weekendHours || 0) * 10) / 10,
                totalHours: Math.round(classification.hours * 10) / 10,
                target: 8,
                fullDate: record.date
            };
        });
        
        setWeeklyData(chartData);
    };

    // Generate performance insights
    const generateInsights = (records) => {
        if (records.length === 0) return;
        
        const insights = [];
        const last7 = records.slice(0, 7);
        const onTimeCount = last7.filter(r => r.status === "present" && r.status !== "late").length;
        const punctualityRate = (onTimeCount / Math.max(1, last7.length)) * 100;
        
        if (punctualityRate >= 90) {
            insights.push({
                icon: Award,
                color: "green",
                title: "Excellent Punctuality!",
                description: `You've been on time ${Math.round(punctualityRate)}% this week`,
                trend: "up"
            });
        } else if (punctualityRate < 70) {
            insights.push({
                icon: AlertCircle,
                color: "orange",
                title: "Focus on Punctuality",
                description: `Only ${Math.round(punctualityRate)}% on-time arrivals this week`,
                trend: "down"
            });
        }
        
        let currentStreak = 0;
        for (const record of records) {
            if (record.clockIn) currentStreak++;
            else break;
        }
        
        if (currentStreak >= 5) {
            insights.push({
                icon: Zap,
                color: "purple",
                title: `${currentStreak} Day Streak!`,
                description: "Keep up the consistent attendance",
                trend: "up"
            });
        }
        
        const avgHours = last7.reduce((sum, r) => {
            const classification = getWorkClassification(r.date, r.clockIn, r.clockOut);
            return sum + classification.hours;
        }, 0) / Math.max(1, last7.length);
        
        if (avgHours > 8.5) {
            insights.push({
                icon: Target,
                color: "blue",
                title: "High Productivity",
                description: `Averaging ${avgHours.toFixed(1)} hours/day this week`,
                trend: "up"
            });
        }
        
        setPerformanceInsights(insights);
    };

    // Calculate achievements
    const calculateAchievements = (records) => {
        const badges = [];
        
        const thisMonth = records.filter(r => {
            const recordDate = new Date(r.date);
            const now = new Date();
            return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        });
        
        if (thisMonth.length >= 20 && thisMonth.every(r => r.clockIn)) {
            badges.push({
                name: "Perfect Month",
                icon: "🏆",
                description: "20+ days attended",
                color: "gold"
            });
        }
        
        const earlyCount = records.filter(r => {
            if (!r.clockIn) return false;
            const [h] = r.clockIn.split(':').map(Number);
            return h < 9;
        }).length;
        
        if (earlyCount >= 10) {
            badges.push({
                name: "Early Bird",
                icon: "🌅",
                description: "10+ early arrivals",
                color: "orange"
            });
        }
        
        let streak = 0;
        for (const record of records) {
            if (record.clockIn) streak++;
            else break;
        }
        
        if (streak >= 30) {
            badges.push({
                name: "30 Day Streak",
                icon: "🔥",
                description: "Unstoppable!",
                color: "red"
            });
        }
        
        setAchievements(badges);
    };

    // Calculate hours between times
    const calculateHours = (clockIn, clockOut) => {
        if (!clockIn || !clockOut) return 0;
        
        try {
            const [inHours, inMinutes] = clockIn.split(':').map(Number);
            const [outHours, outMinutes] = clockOut.split(':').map(Number);
            
            const inDate = new Date();
            inDate.setHours(inHours, inMinutes, 0);
            
            const outDate = new Date();
            outDate.setHours(outHours, outMinutes, 0);
            
            const diffMs = outDate - inDate;
            return diffMs / (1000 * 60 * 60);
        } catch {
            return 0;
        }
    };

    // Calculate total hours worked
    const calculateHoursWorked = (clockIn, clockOut) => {
        if (!clockIn || !clockOut) return "--";

        try {
            const hours = calculateHours(clockIn, clockOut);
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return `${h}h ${m}m`;
        } catch {
            return "--";
        }
    };

    // Calculate estimated earnings
    const calculateEstimatedEarnings = () => {
        if (!payrollInfo) return 0;
        
        const regularEarnings = monthlyStats.regularHours * payrollInfo.hourlyRate;
        const overtimeEarnings = monthlyStats.overtimeHours * payrollInfo.hourlyRate * payrollInfo.overtimeMultiplier;
        const weekendEarnings = monthlyStats.weekendHours * payrollInfo.hourlyRate * payrollInfo.weekendMultiplier;
        const holidayEarnings = monthlyStats.holidayHours * payrollInfo.hourlyRate * payrollInfo.holidayMultiplier;
        
        return regularEarnings + overtimeEarnings + weekendEarnings + holidayEarnings;
    };

    // Handle clock in/out with location and work site
    const handleClockAction = async () => {
        // Validate work site selection if sites exist
        if (status === "clocked-out" && workSites.length > 0 && !selectedSite) {
            alert("Please select a work site before clocking in");
            return;
        }

        setActionLoading(true);
        
        try {
            // Get current location
            const locationData = await getCurrentLocation();
            
            const todayStr = new Date().toISOString().split('T')[0];
            const recordId = `${employeeId}_${todayStr}`;
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            if (status === "clocked-out") {
                // Clock In
                const [hours] = timeString.split(':').map(Number);
                const isLate = hours >= 9;
                
                const selectedSiteData = workSites.find(site => site.id === selectedSite);
                
                const clockInData = {
                    employeeId,
                    userName: userData?.name || user?.email || "Unknown",
                    email: userData?.email || user?.email,
                    date: todayStr,
                    clockIn: timeString,
                    clockInLocation: locationData,
                    workSiteId: selectedSite || null,
                    workSiteName: selectedSiteData?.name || "Default Site",
                    status: isLate ? "late" : "present",
                    createdAt: serverTimestamp(),
                };

                await setDoc(doc(db, `companies/${companyId}/attendance`, recordId), clockInData);

                setStatus("clocked-in");
                setTodayRecord({ ...clockInData, clockIn: timeString, clockInLocation: locationData });
            } else if (status === "clocked-in") {
                // Clock Out
                const updateData = {
                    clockOut: timeString,
                    clockOutLocation: locationData,
                    updatedAt: serverTimestamp(),
                };

                await updateDoc(doc(db, `companies/${companyId}/attendance`, recordId), updateData);

                setStatus("completed");
                setTodayRecord(prev => ({ ...prev, clockOut: timeString, clockOutLocation: locationData }));
            }
        } catch (error) {
            console.error("Error clocking:", error);
            alert(error.message || "Failed to clock. Please enable location access and try again.");
        } finally {
            setActionLoading(false);
        }
    };

    // Download report
    const downloadReport = () => {
        const csv = [
            ["Date", "Clock In", "Clock Out", "Hours", "Status", "Work Site", "Classification", "Location"],
            ...recentAttendance.map(r => {
                const classification = getWorkClassification(r.date, r.clockIn, r.clockOut);
                return [
                    r.date,
                    r.clockIn || "--",
                    r.clockOut || "--",
                    calculateHoursWorked(r.clockIn, r.clockOut),
                    r.status || "N/A",
                    r.workSiteName || "Default",
                    classification.type,
                    r.clockInLocation ? `${r.clockInLocation.latitude}, ${r.clockInLocation.longitude}` : "N/A"
                ];
            })
        ].map(row => row.join(",")).join("\n");
        
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const attendanceRate = monthlyStats.totalDays > 0
        ? ((monthlyStats.present / monthlyStats.totalDays) * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome back, {userData?.name || "Employee"}!
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {formatDate(currentTime)}
                    </p>
                </div>
                
                <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all"
                >
                    <Download size={18} />
                    <span className="text-sm font-medium">Download Report</span>
                </button>
            </motion.div>

            {/* Payroll Summary Card */}
            {payrollInfo && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <GlassCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <DollarSign size={24} className="text-green-600" />
                                Monthly Payroll Summary
                            </h3>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Estimated Earnings</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {payrollInfo.currency} {calculateEstimatedEarnings().toFixed(2)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Regular Hours</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{monthlyStats.regularHours}h</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {payrollInfo.currency} {(monthlyStats.regularHours * payrollInfo.hourlyRate).toFixed(2)}
                                </p>
                            </div>
                            
                            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Overtime ({payrollInfo.overtimeMultiplier}x)</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{monthlyStats.overtimeHours}h</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {payrollInfo.currency} {(monthlyStats.overtimeHours * payrollInfo.hourlyRate * payrollInfo.overtimeMultiplier).toFixed(2)}
                                </p>
                            </div>
                            
                            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Weekend ({payrollInfo.weekendMultiplier}x)</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">{monthlyStats.weekendHours}h</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {payrollInfo.currency} {(monthlyStats.weekendHours * payrollInfo.hourlyRate * payrollInfo.weekendMultiplier).toFixed(2)}
                                </p>
                            </div>
                            
                            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Hourly Rate</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">
                                    {payrollInfo.currency} {payrollInfo.hourlyRate}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Base rate</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Location Status */}
            {locationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-400">Location Error</p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{locationError}</p>
                        </div>
                    </div>
                </div>
            )}

            {location && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-3">
                        <MapPin className="text-green-600" size={24} />
                        <div>
                            <p className="font-medium text-green-800 dark:text-green-400">Location Captured</p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)} 
                                (Accuracy: ±{Math.round(location.accuracy)}m)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Insights */}
            {performanceInsights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performanceInsights.map((insight, index) => {
                        const Icon = insight.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-${insight.color}-50 dark:bg-${insight.color}-900/20`}>
                                            <Icon className={`text-${insight.color}-600`} size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-800 dark:text-white">{insight.title}</h4>
                                                {insight.trend === "up" ? (
                                                    <ArrowUp size={16} className="text-green-500" />
                                                ) : insight.trend === "down" ? (
                                                    <ArrowDown size={16} className="text-red-500" />
                                                ) : null}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{insight.description}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Clock In/Out Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clock Section */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Time Display */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-gray-500 font-medium uppercase tracking-wider text-sm mb-2">
                                    Current Time
                                </h2>
                                <div className="text-5xl md:text-6xl font-bold font-mono text-gray-800 dark:text-white tracking-tight">
                                    {formatTime(currentTime)}
                                </div>
                                
                                {/* Work Site Display */}
                                <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm text-gray-500">
                                    {todayRecord?.workSiteName && (
                                        <div className="flex items-center gap-1">
                                            <Building2 size={16} />
                                            <span>{todayRecord.workSiteName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={16} />
                                        <span>General Shift</span>
                                    </div>
                                </div>
                                
                                {/* Live Elapsed Time */}
                                {elapsedTime && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                                    >
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                                Active: {elapsedTime}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Clock Button with Work Site Selection */}
                            <div className="w-full md:w-64">
                                {status === "completed" ? (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-6 rounded-2xl text-center">
                                        <CheckCircle className="mx-auto mb-3" size={48} />
                                        <p className="font-semibold text-lg mb-1">Shift Complete!</p>
                                        <p className="text-sm opacity-80">
                                            Hours: {calculateHoursWorked(todayRecord?.clockIn, todayRecord?.clockOut)}
                                        </p>
                                        {todayRecord?.workSiteName && (
                                            <p className="text-xs mt-2 flex items-center justify-center gap-1">
                                                <Building2 size={12} />
                                                {todayRecord.workSiteName}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Work Site Selector (only show when clocking in) */}
                                        {status === "clocked-out" && workSites.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                    <Building2 size={16} />
                                                    Select Work Site
                                                </label>
                                                <select
                                                    value={selectedSite || ""}
                                                    onChange={(e) => setSelectedSite(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500"
                                                >
                                                    <option value="">Choose a site...</option>
                                                    {workSites.map(site => (
                                                        <option key={site.id} value={site.id}>
                                                            {site.name} - {site.location}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        
                                        <button
                                            onClick={handleClockAction}
                                            disabled={actionLoading || gettingLocation}
                                            className={`
                                                w-full py-6 rounded-2xl text-lg font-bold shadow-xl 
                                                transform transition-all active:scale-95 disabled:opacity-50
                                                ${status === "clocked-in"
                                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                    : "bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white"
                                                }
                                            `}
                                        >
                                            {actionLoading || gettingLocation ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    {gettingLocation ? "Getting Location..." : "Processing..."}
                                                </span>
                                            ) : (
                                                <>
                                                    <Clock className="inline mr-2" size={20} />
                                                    {status === "clocked-in" ? "Clock Out" : "Clock In"}
                                                </>
                                            )}
                                        </button>

                                        {status === "clocked-in" && todayRecord?.clockIn && (
                                            <div className="text-center text-sm text-gray-500">
                                                <p>Clocked in at <span className="font-semibold text-gray-700 dark:text-gray-300">{todayRecord.clockIn}</span></p>
                                                {todayRecord.clockInLocation && (
                                                    <p className="text-xs mt-1 flex items-center justify-center gap-1">
                                                        <MapPin size={12} />
                                                        Location captured
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Today's Activity */}
                <GlassCard>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Activity size={20} />
                        Today's Activity
                    </h3>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                        <div className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${todayRecord?.clockIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <p className="text-sm text-gray-500">Clock In</p>
                            <p className="font-semibold text-lg">{todayRecord?.clockIn || "--:--"}</p>
                            {todayRecord?.clockInLocation && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <MapPin size={10} />
                                    Location tracked
                                </p>
                            )}
                        </div>
                        <div className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${todayRecord?.clockOut ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                            <p className="text-sm text-gray-500">Clock Out</p>
                            <p className="font-semibold text-lg">{todayRecord?.clockOut || "--:--"}</p>
                            {todayRecord?.clockOutLocation && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <MapPin size={10} />
                                    Location tracked
                                </p>
                            )}
                        </div>
                        <div className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${todayRecord?.clockIn && todayRecord?.clockOut ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <p className="text-sm text-gray-500">Total Hours</p>
                            <p className="font-semibold text-lg">
                                {calculateHoursWorked(todayRecord?.clockIn, todayRecord?.clockOut)}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Work Classification Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={24} />
                        Monthly Hours Breakdown
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Regular Hours</span>
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white">{monthlyStats.regularHours}h</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Overtime Hours</span>
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white">{monthlyStats.overtimeHours}h</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Weekend Hours</span>
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white">{monthlyStats.weekendHours}h</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Holiday Hours</span>
                            </div>
                            <span className="font-bold text-gray-800 dark:text-white">{monthlyStats.holidayHours}h</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total Hours</span>
                            <span className="text-2xl font-bold text-primary-600">{monthlyStats.totalHours}h</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={24} />
                        This Week Summary
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekday Hours</p>
                            <p className="text-3xl font-bold text-blue-600">{weeklyBreakdown.weekHours}h</p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overtime This Week</p>
                            <p className="text-3xl font-bold text-purple-600">{weeklyBreakdown.overtimeHours}h</p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekend Hours</p>
                            <p className="text-3xl font-bold text-orange-600">{weeklyBreakdown.weekendHours}h</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GlassCard className="hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Present Days</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{monthlyStats.present}</p>
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <TrendingUp size={14} />
                                    {attendanceRate}% attendance
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="text-green-600" size={28} />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <GlassCard className="hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Avg Check-in</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{monthlyStats.avgCheckInTime}</p>
                                <p className="text-xs text-gray-400 mt-1">This month</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Timer className="text-blue-600" size={28} />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <GlassCard className="hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Hours</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white">{monthlyStats.totalHours}</p>
                                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                    <Zap size={14} />
                                    +{monthlyStats.overtimeHours}h overtime
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <Clock className="text-purple-600" size={28} />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <GlassCard className="bg-gradient-to-br from-primary-500 to-purple-600 text-white hover:shadow-lg transition-all border-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Late Arrivals</p>
                                <p className="text-3xl font-bold">{monthlyStats.late}</p>
                                <p className="text-xs text-white/70 mt-1">This month</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <AlertCircle size={28} />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={24} />
                        Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {achievements.map((badge, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
                            >
                                <div className="text-center">
                                    <div className="text-4xl mb-2">{badge.icon}</div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{badge.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Weekly Performance Chart */}
            {weeklyData.length > 0 && (
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Weekly Hours Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="regularHours" stackId="a" fill="#6366f1" name="Regular" />
                            <Bar dataKey="overtimeHours" stackId="a" fill="#8b5cf6" name="Overtime" />
                            <Bar dataKey="weekendHours" stackId="a" fill="#f59e0b" name="Weekend" />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            {/* Recent Attendance Table */}
            <GlassCard>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Attendance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Clock In</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Clock Out</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Hours</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Site</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentAttendance.slice(0, 10).map((record, index) => {
                                const classification = getWorkClassification(record.date, record.clockIn, record.clockOut);
                                return (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-3 text-sm font-mono text-gray-700 dark:text-gray-300">{record.clockIn || "--:--"}</td>
                                        <td className="p-3 text-sm font-mono text-gray-700 dark:text-gray-300">{record.clockOut || "--:--"}</td>
                                        <td className="p-3 text-sm font-semibold text-gray-800 dark:text-white">
                                            {calculateHoursWorked(record.clockIn, record.clockOut)}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                classification.type === 'weekend' ? 'bg-orange-100 text-orange-700' :
                                                classification.overtimeHours > 0 ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {classification.type === 'weekend' ? 'Weekend' : 
                                                 classification.overtimeHours > 0 ? 'OT' : 'Regular'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                                            {record.workSiteName || "Default"}
                                        </td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                record.status === "present" ? "bg-green-100 text-green-700" :
                                                record.status === "late" ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                                {record.status || "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
