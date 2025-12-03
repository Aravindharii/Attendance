"use client";

import { use, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { db, auth as firebaseAuth } from "@/lib/firebase/config";
import {
    collection, query, onSnapshot, doc, where, getDocs,
    orderBy, limit, addDoc, updateDoc, deleteDoc, setDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Users, Clock, AlertCircle, CheckCircle, Building2,
    TrendingUp, TrendingDown, Calendar, Award, Zap,
    Search, Filter, Download, RefreshCw, Activity,
    UserCheck, UserX, Timer, ArrowUp, ArrowDown,
    Eye, Bell, Settings, ChevronRight, Briefcase, Mail,
    Phone, MapPin, Star, ThumbsUp, Hash, UserPlus,
    X, Edit, Trash2, Copy, EyeOff, Share2, Send, Shield, 
    Calendar as CalendarIcon, Loader, DollarSign, FileText,
    BarChart3, PieChart as PieChartIcon, AlertTriangle,
    Plus, Home, Navigation, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ComposedChart
} from "recharts";

export default function AdvancedAdminDashboard({ params }) {
    const resolvedParams = use(params);
    const { companyId } = resolvedParams;
    const { userData } = useAuth();

    // State management
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [monthlyAttendance, setMonthlyAttendance] = useState([]);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [workSites, setWorkSites] = useState([]);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [viewMode, setViewMode] = useState("grid");

    // Modal states
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [showWorkSiteModal, setShowWorkSiteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [editingWorkSite, setEditingWorkSite] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    // Form state - Enhanced with payroll and work site
    const [employeeForm, setEmployeeForm] = useState({
        // Basic Info
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        
        // Address
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        
        // Emergency Contact
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        
        // Employment Details
        employeeId: "",
        department: "",
        position: "",
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: "full-time", // full-time, part-time, contract
        workSiteId: "",
        reportingManager: "",
        
        // Payroll Information
        payType: "monthly", // hourly, weekly, monthly
        baseSalary: "",
        hourlyRate: "",
        weeklyRate: "",
        monthlyRate: "",
        currency: "INR",
        
        // Allowances
        allowances: {
            housing: 0,
            transport: 0,
            food: 0,
            medical: 0,
            other: 0
        },
        
        // Deductions
        deductions: {
            tax: 0,
            insurance: 0,
            providentFund: 0,
            other: 0
        },
        
        // Overtime & Special Rates
        overtimeEnabled: true,
        overtimeMultiplier: 1.5,
        weekendMultiplier: 2.0,
        holidayMultiplier: 2.5,
        
        // Bank Details
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        
        // Documents
        aadharNumber: "",
        panNumber: "",
        
        // Work Schedule
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5
    });

    // Work Site Form
    const [workSiteForm, setWorkSiteForm] = useState({
        name: "",
        location: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        coordinates: {
            latitude: "",
            longitude: ""
        },
        radius: 100, // meters for geofencing
        contactPerson: "",
        contactPhone: "",
        active: true,
        description: ""
    });

    // Analytics state
    const [departmentStats, setDepartmentStats] = useState([]);
    const [weeklyTrends, setWeeklyTrends] = useState([]);
    const [performanceMetrics, setPerformanceMetrics] = useState({});
    const [lateComers, setLateComers] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [payrollSummary, setPayrollSummary] = useState({
        totalMonthly: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        netPayroll: 0
    });

    // Fetch company data
    useEffect(() => {
        if (!companyId) {
            setLoading(false);
            return;
        }

        const companyRef = doc(db, "companies", companyId);
        const unsubscribe = onSnapshot(companyRef, (snapshot) => {
            if (snapshot.exists()) {
                setCompanyData(snapshot.data());
            }
        });

        return () => unsubscribe();
    }, [companyId]);

    // Fetch work sites
    useEffect(() => {
        if (!companyId) return;

        const workSitesRef = collection(db, `companies/${companyId}/workSites`);
        const unsubscribe = onSnapshot(workSitesRef, (snapshot) => {
            const sites = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkSites(sites);
        });

        return () => unsubscribe();
    }, [companyId]);

    // Fetch employees
    useEffect(() => {
        if (!companyId) {
            setLoading(false);
            return;
        }

        const employeesRef = collection(db, `companies/${companyId}/employees`);
        const unsubscribe = onSnapshot(employeesRef, (snapshot) => {
            const employeesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEmployees(employeesList);
            calculatePayrollSummary(employeesList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [companyId]);

    // Fetch attendance
    useEffect(() => {
        if (!companyId) return;

        const attendanceRef = collection(db, `companies/${companyId}/attendance`);
        const unsubscribe = onSnapshot(attendanceRef, (snapshot) => {
            const attendanceList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllAttendance(attendanceList);
            processTodayAttendance(attendanceList);
            processMonthlyAttendance(attendanceList);
            processWeeklyTrends(attendanceList);
            processLateComers(attendanceList);
            processTopPerformers(attendanceList);
            generateAlerts(attendanceList);
        });

        return () => unsubscribe();
    }, [companyId, employees]);

    // Calculate payroll summary
    const calculatePayrollSummary = (employeesList) => {
        let totalMonthly = 0;
        let totalAllowances = 0;
        let totalDeductions = 0;

        employeesList.forEach(emp => {
            if (emp.payType === "monthly" && emp.monthlyRate) {
                totalMonthly += parseFloat(emp.monthlyRate) || 0;
            } else if (emp.payType === "weekly" && emp.weeklyRate) {
                totalMonthly += (parseFloat(emp.weeklyRate) || 0) * 4.33;
            } else if (emp.payType === "hourly" && emp.hourlyRate) {
                totalMonthly += (parseFloat(emp.hourlyRate) || 0) * emp.workingHoursPerDay * emp.workingDaysPerWeek * 4.33;
            }

            if (emp.allowances) {
                Object.values(emp.allowances).forEach(val => {
                    totalAllowances += parseFloat(val) || 0;
                });
            }

            if (emp.deductions) {
                Object.values(emp.deductions).forEach(val => {
                    totalDeductions += parseFloat(val) || 0;
                });
            }
        });

        setPayrollSummary({
            totalMonthly: totalMonthly.toFixed(2),
            totalAllowances: totalAllowances.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            netPayroll: (totalMonthly + totalAllowances - totalDeductions).toFixed(2)
        });
    };

    // Search and filter employees
    useEffect(() => {
        let filtered = [...employees];

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterDepartment !== "all") {
            filtered = filtered.filter(emp => emp.department === filterDepartment);
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter(emp => {
                const attendance = todayAttendance.find(
                    a => a.employeeId === emp.uid || a.employeeId === emp.id
                );
                
                if (filterStatus === "present") {
                    return attendance?.clockIn && !attendance?.clockOut;
                } else if (filterStatus === "completed") {
                    return attendance?.clockOut;
                } else if (filterStatus === "absent") {
                    return !attendance?.clockIn;
                } else if (filterStatus === "late") {
                    return attendance?.status === "late";
                }
                return true;
            });
        }

        filtered.sort((a, b) => {
            if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "");
            } else if (sortBy === "department") {
                return (a.department || "").localeCompare(b.department || "");
            } else if (sortBy === "joinDate") {
                return new Date(b.joiningDate) - new Date(a.joiningDate);
            }
            return 0;
        });

        setFilteredEmployees(filtered);
    }, [searchTerm, filterDepartment, filterStatus, sortBy, employees, todayAttendance]);

    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

    // Process attendance functions
    const processTodayAttendance = (attendanceList) => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceList.filter(a => a.date === today);
        setTodayAttendance(todayRecords);
    };

    const processMonthlyAttendance = (attendanceList) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthlyRecords = attendanceList.filter(a => a.date >= firstDay);
        setMonthlyAttendance(monthlyRecords);
    };

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

    const processWeeklyTrends = (attendanceList) => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayRecords = attendanceList.filter(a => a.date === dateStr);
            const present = dayRecords.filter(a => a.clockIn).length;
            const late = dayRecords.filter(a => a.status === "late").length;
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                present,
                late,
                absent: employees.length - present,
                total: employees.length
            });
        }
        setWeeklyTrends(last7Days);
    };

    const processLateComers = (attendanceList) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthlyRecords = attendanceList.filter(a => a.date >= firstDay);
        const lateRecords = monthlyRecords.filter(a => a.status === "late");
        const employeeLateCount = {};

        lateRecords.forEach(record => {
            const empId = record.employeeId;
            employeeLateCount[empId] = (employeeLateCount[empId] || 0) + 1;
        });

        const lateList = Object.entries(employeeLateCount)
            .map(([empId, count]) => {
                const emp = employees.find(e => e.uid === empId || e.id === empId);
                return { employee: emp, lateCount: count };
            })
            .filter(item => item.employee)
            .sort((a, b) => b.lateCount - a.lateCount)
            .slice(0, 5);

        setLateComers(lateList);
    };

    const processTopPerformers = (attendanceList) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthlyRecords = attendanceList.filter(a => a.date >= firstDay);
        const employeeStats = {};

        monthlyRecords.forEach(record => {
            const empId = record.employeeId;
            if (!employeeStats[empId]) {
                employeeStats[empId] = { present: 0, onTime: 0, totalHours: 0 };
            }
            if (record.clockIn) {
                employeeStats[empId].present++;
                if (record.status !== "late") employeeStats[empId].onTime++;
                if (record.clockOut) {
                    employeeStats[empId].totalHours += calculateHours(record.clockIn, record.clockOut);
                }
            }
        });

        const performers = Object.entries(employeeStats)
            .map(([empId, stats]) => {
                const emp = employees.find(e => e.uid === empId || e.id === empId);
                const score = (stats.onTime / Math.max(1, stats.present)) * 100;
                return { employee: emp, ...stats, score: score.toFixed(1) };
            })
            .filter(item => item.employee && item.present >= 5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        setTopPerformers(performers);
    };

    const generateAlerts = (attendanceList) => {
        const alertsList = [];
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceList.filter(a => a.date === today);
        
        const absentCount = employees.length - todayRecords.filter(a => a.clockIn).length;
        if (absentCount > employees.length * 0.3) {
            alertsList.push({
                type: "warning",
                icon: UserX,
                title: "High Absence Rate",
                message: `${absentCount} employees absent today (${((absentCount / employees.length) * 100).toFixed(0)}%)`
            });
        }
        
        const lateCount = todayRecords.filter(a => a.status === "late").length;
        if (lateCount > employees.length * 0.2) {
            alertsList.push({
                type: "warning",
                icon: Clock,
                title: "High Late Arrivals",
                message: `${lateCount} employees arrived late today`
            });
        }
        
        setAlerts(alertsList);
    };

    // Calculate department statistics
    useEffect(() => {
        if (employees.length === 0) return;

        const depts = {};
        employees.forEach(emp => {
            const dept = emp.department || "Unassigned";
            if (!depts[dept]) {
                depts[dept] = { name: dept, total: 0, present: 0, late: 0, absent: 0 };
            }
            depts[dept].total++;
        });

        todayAttendance.forEach(record => {
            const emp = employees.find(e => e.uid === record.employeeId || e.id === record.employeeId);
            const dept = emp?.department || "Unassigned";
            if (depts[dept] && record.clockIn) {
                depts[dept].present++;
                if (record.status === "late") depts[dept].late++;
            }
        });

        Object.values(depts).forEach(dept => {
            dept.absent = dept.total - dept.present;
            dept.attendanceRate = dept.total > 0 ? ((dept.present / dept.total) * 100).toFixed(1) : 0;
        });

        setDepartmentStats(Object.values(depts));
    }, [employees, todayAttendance]);

    // Calculate performance metrics
    useEffect(() => {
        if (monthlyAttendance.length === 0 || employees.length === 0) return;

        const totalDays = new Date().getDate();
        const totalPossibleAttendance = employees.length * totalDays;
        const actualAttendance = monthlyAttendance.filter(a => a.clockIn).length;
        const lateCount = monthlyAttendance.filter(a => a.status === "late").length;

        setPerformanceMetrics({
            overallAttendanceRate: ((actualAttendance / totalPossibleAttendance) * 100).toFixed(1),
            punctualityRate: actualAttendance > 0 ? (((actualAttendance - lateCount) / actualAttendance) * 100).toFixed(1) : 0,
            productivityScore: ((actualAttendance / totalPossibleAttendance) * 100 * 0.7 + 
                (((actualAttendance - lateCount) / Math.max(1, actualAttendance)) * 100) * 0.3).toFixed(1)
        });
    }, [monthlyAttendance, employees]);

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    // Generate unique employee ID
    const generateEmployeeId = () => {
        const prefix = companyData?.name?.substring(0, 3).toUpperCase() || "EMP";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    };

    // Handle employee form submission
    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Auto-generate employee ID if not provided
            if (!employeeForm.employeeId) {
                employeeForm.employeeId = generateEmployeeId();
            }

            if (editingEmployee) {
                const employeeRef = doc(db, `companies/${companyId}/employees`, editingEmployee.id);
                await updateDoc(employeeRef, {
                    ...employeeForm,
                    updatedAt: new Date().toISOString()
                });
                alert("Employee updated successfully!");
            } else {
                // Check if email exists
                const employeesRef = collection(db, `companies/${companyId}/employees`);
                const q = query(employeesRef, where("email", "==", employeeForm.email));
                const existingEmployee = await getDocs(q);

                if (!existingEmployee.empty) {
                    alert("An employee with this email already exists.");
                    setSubmitting(false);
                    return;
                }

                const tempPassword = generatePassword();
                const userCredential = await createUserWithEmailAndPassword(
                    firebaseAuth,
                    employeeForm.email,
                    tempPassword
                );
                const user = userCredential.user;

                const newEmployee = {
                    ...employeeForm,
                    companyId,
                    uid: user.uid,
                    tempPassword: tempPassword,
                    status: "active",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await addDoc(collection(db, `companies/${companyId}/employees`), newEmployee);

                await setDoc(doc(db, "user_mappings", user.uid), {
                    uid: user.uid,
                    email: employeeForm.email,
                    companyId: companyId,
                    role: "employee",
                    createdAt: new Date().toISOString()
                });

                setSelectedEmployee({ ...newEmployee, id: user.uid });
                setShowCredentialsModal(true);
            }

            setShowEmployeeModal(false);
            setCurrentStep(1);
            setEditingEmployee(null);
            resetEmployeeForm();
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Reset employee form
    const resetEmployeeForm = () => {
        setEmployeeForm({
            name: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            gender: "",
            bloodGroup: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            employeeId: "",
            department: "",
            position: "",
            joiningDate: new Date().toISOString().split('T')[0],
            employmentType: "full-time",
            workSiteId: "",
            reportingManager: "",
            payType: "monthly",
            baseSalary: "",
            hourlyRate: "",
            weeklyRate: "",
            monthlyRate: "",
            currency: "INR",
            allowances: { housing: 0, transport: 0, food: 0, medical: 0, other: 0 },
            deductions: { tax: 0, insurance: 0, providentFund: 0, other: 0 },
            overtimeEnabled: true,
            overtimeMultiplier: 1.5,
            weekendMultiplier: 2.0,
            holidayMultiplier: 2.5,
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            accountHolderName: "",
            aadharNumber: "",
            panNumber: "",
            workingHoursPerDay: 8,
            workingDaysPerWeek: 5
        });
    };

    // Handle work site submission
    const handleWorkSiteSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingWorkSite) {
                const siteRef = doc(db, `companies/${companyId}/workSites`, editingWorkSite.id);
                await updateDoc(siteRef, {
                    ...workSiteForm,
                    updatedAt: new Date().toISOString()
                });
                alert("Work site updated successfully!");
            } else {
                await addDoc(collection(db, `companies/${companyId}/workSites`), {
                    ...workSiteForm,
                    companyId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                alert("Work site added successfully!");
            }

            setShowWorkSiteModal(false);
            setEditingWorkSite(null);
            setWorkSiteForm({
                name: "",
                location: "",
                address: "",
                city: "",
                state: "",
                zipCode: "",
                coordinates: { latitude: "", longitude: "" },
                radius: 100,
                contactPerson: "",
                contactPhone: "",
                active: true,
                description: ""
            });
        } catch (error) {
            console.error("Error saving work site:", error);
            alert("Failed to save work site");
        } finally {
            setSubmitting(false);
        }
    };

    // Delete work site
    const handleWorkSiteDelete = async (siteId) => {
        if (!confirm("Are you sure you want to delete this work site?")) return;

        try {
            await deleteDoc(doc(db, `companies/${companyId}/workSites`, siteId));
            alert("Work site deleted successfully!");
        } catch (error) {
            console.error("Error deleting work site:", error);
            alert("Failed to delete work site");
        }
    };

    const handleEmployeeDelete = async (employeeId) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;
        try {
            await deleteDoc(doc(db, `companies/${companyId}/employees`, employeeId));
            alert("Employee deleted successfully!");
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("Failed to delete employee");
        }
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        setEmployeeForm({
            ...employee,
            allowances: employee.allowances || { housing: 0, transport: 0, food: 0, medical: 0, other: 0 },
            deductions: employee.deductions || { tax: 0, insurance: 0, providentFund: 0, other: 0 }
        });
        setShowEmployeeModal(true);
    };

    const copyCredentials = (employee) => {
        const credentials = `🎉 Welcome to ${companyData?.name || 'the Company'}!\n\n` +
            `📧 Login Email: ${employee.email}\n` +
            `🔑 Temporary Password: ${employee.tempPassword}\n` +
            `🏢 Company ID: ${companyId}\n` +
            `👤 Employee ID: ${employee.employeeId}\n\n` +
            `🌐 Login URL: ${window.location.origin}/login\n\n` +
            `Please change your password after first login for security.`;
        
        navigator.clipboard.writeText(credentials);
        alert("Credentials copied to clipboard!");
    };

    const viewEmployeeDetails = async (employee) => {
        const empAttendance = allAttendance.filter(
            a => a.employeeId === employee.uid || a.employeeId === employee.id
        );
        
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthlyRecords = empAttendance.filter(a => a.date >= firstDay);
        const present = monthlyRecords.filter(a => a.clockIn).length;
        const late = monthlyRecords.filter(a => a.status === "late").length;
        const totalDays = now.getDate();
        
        let totalHours = 0;
        monthlyRecords.forEach(record => {
            if (record.clockIn && record.clockOut) {
                totalHours += calculateHours(record.clockIn, record.clockOut);
            }
        });
        
        setSelectedEmployee({
            ...employee,
            attendanceRecords: empAttendance.slice(0, 30).sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            ),
            monthlyStats: {
                present,
                late,
                absent: totalDays - present,
                totalDays,
                totalHours: totalHours.toFixed(1),
                avgHours: present > 0 ? (totalHours / present).toFixed(1) : 0,
                attendanceRate: totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : 0
            }
        });
        setShowEmployeeDetail(true);
    };

    const togglePasswordVisibility = (employeeId) => {
        setShowPassword(prev => ({ ...prev, [employeeId]: !prev[employeeId] }));
    };

    const downloadReport = () => {
        const csv = [
            ["Name", "Email", "Employee ID", "Department", "Position", "Status", "Clock In", "Clock Out"],
            ...filteredEmployees.map(emp => {
                const attendance = todayAttendance.find(
                    a => a.employeeId === emp.uid || a.employeeId === emp.id
                );
                return [
                    emp.name,
                    emp.email,
                    emp.employeeId,
                    emp.department,
                    emp.position,
                    attendance?.clockIn ? "Present" : "Absent",
                    attendance?.clockIn || "--",
                    attendance?.clockOut || "--"
                ];
            })
        ].map(row => row.join(",")).join("\n");
        
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const presentToday = todayAttendance.filter(a => a.clockIn).length;
    const lateToday = todayAttendance.filter(a => a.status === "late").length;
    const absentToday = employees.length - presentToday;
    const attendanceRate = employees.length > 0 ? ((presentToday / employees.length) * 100).toFixed(1) : 0;
    const currentlyActive = todayAttendance.filter(a => a.clockIn && !a.clockOut).length;

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

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

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
                        Advanced Analytics Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <Building2 size={16} />
                        {companyData?.name || "Your Company"}
                        <span className="mx-2">•</span>
                        <Clock size={16} />
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowWorkSiteModal(true)}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                        <Building2 size={18} />
                        <span className="hidden sm:inline">Work Sites</span>
                    </button>
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingEmployee(null);
                            resetEmployeeForm();
                            setCurrentStep(1);
                            setShowEmployeeModal(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
                    >
                        <UserPlus size={18} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </motion.div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alerts.map((alert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className={`border-l-4 ${
                                alert.type === 'warning' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <alert.icon className={`${
                                        alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                                    }`} size={24} />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">{alert.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[
                    {
                        label: "Total Employees",
                        value: employees.length,
                        icon: Users,
                        color: "blue",
                        subtitle: `${filteredEmployees.length} shown`
                    },
                    {
                        label: "Present Today",
                        value: presentToday,
                        icon: CheckCircle,
                        color: "green",
                        subtitle: `${attendanceRate}%`
                    },
                    {
                        label: "Currently Active",
                        value: currentlyActive,
                        icon: Activity,
                        color: "purple",
                        pulse: true
                    },
                    {
                        label: "Late Arrivals",
                        value: lateToday,
                        icon: Clock,
                        color: "orange"
                    },
                    {
                        label: "Absent",
                        value: absentToday,
                        icon: UserX,
                        color: "red"
                    },
                    {
                        label: "Work Sites",
                        value: workSites.length,
                        icon: Building2,
                        color: "indigo"
                    }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <GlassCard className="hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                            {metric.pulse && (
                                <div className="absolute top-2 right-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>
                            )}
                            <div className={`inline-flex p-2 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-900/20 mb-3`}>
                                <metric.icon className={`text-${metric.color}-600`} size={20} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{metric.label}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{metric.value}</p>
                            {metric.subtitle && (
                                <p className="text-xs text-gray-400 mt-1">{metric.subtitle}</p>
                            )}
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            {/* Payroll Summary Card */}
            <GlassCard className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-green-600 rounded-2xl shadow-lg">
                            <DollarSign size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Payroll Summary</h3>
                            <p className="text-3xl font-bold text-green-600 mt-1">
                                ₹{payrollSummary.netPayroll}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Net payroll this month</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Base Salary</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">₹{payrollSummary.totalMonthly}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Allowances</p>
                            <p className="text-xl font-bold text-green-600">+₹{payrollSummary.totalAllowances}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Deductions</p>
                            <p className="text-xl font-bold text-red-600">-₹{payrollSummary.totalDeductions}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Performance Score Card */}
            {performanceMetrics.productivityScore && (
                <GlassCard className="bg-gradient-to-br from-primary-500 to-purple-600 text-white border-none">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Award size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold opacity-90">Company Performance Score</h3>
                                <p className="text-3xl font-bold mt-1">{performanceMetrics.productivityScore}%</p>
                                <p className="text-sm opacity-75 mt-1">Based on attendance & punctuality</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-sm opacity-75">Attendance</p>
                                <p className="text-2xl font-bold">{performanceMetrics.overallAttendanceRate}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm opacity-75">Punctuality</p>
                                <p className="text-2xl font-bold">{performanceMetrics.punctualityRate}%</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={24} className="text-primary-600" />
                        7-Day Attendance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={weeklyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="total" fill="#e0e7ff" stroke="#6366f1" name="Total" />
                            <Bar dataKey="present" fill="#10b981" name="Present" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
                            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} name="Absent" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Activity size={24} className="text-green-600" />
                        Today's Overview
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'On Time', value: presentToday - lateToday, color: '#10b981' },
                                    { name: 'Late', value: lateToday, color: '#f59e0b' },
                                    { name: 'Absent', value: absentToday, color: '#ef4444' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                dataKey="value"
                            >
                                {[
                                    { color: '#10b981' },
                                    { color: '#f59e0b' },
                                    { color: '#ef4444' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Top Performers & Late Comers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={24} className="text-yellow-600" />
                        Top Performers This Month
                    </h3>
                    <div className="space-y-3">
                        {topPerformers.length > 0 ? (
                            topPerformers.map((performer, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600">#{index + 1}</div>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                        {performer.employee.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 dark:text-white">{performer.employee.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{performer.employee.department}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">{performer.score}%</p>
                                        <p className="text-xs text-gray-500">{performer.present} days</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No data available yet</p>
                        )}
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={24} className="text-orange-600" />
                        Most Late Arrivals This Month
                    </h3>
                    <div className="space-y-3">
                        {lateComers.length > 0 ? (
                            lateComers.map((comer, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-orange-600">#{index + 1}</div>
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                        {comer.employee.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 dark:text-white">{comer.employee.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{comer.employee.department}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-orange-600">{comer.lateCount}</p>
                                        <p className="text-xs text-gray-500">late days</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No late arrivals this month! 🎉</p>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Employee Management Section */}
            <GlassCard>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Users size={28} className="text-primary-600" />
                            Employee Management
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredEmployees.length} of {employees.length} employees
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="present">Active Now</option>
                            <option value="completed">Completed</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late Today</option>
                        </select>
                    </div>

                    <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="department">Sort by Department</option>
                            <option value="joinDate">Sort by Join Date</option>
                        </select>
                    </div>
                </div>

                {/* Employees Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEmployees.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <Users size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 text-lg mb-2">No employees found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        filteredEmployees.map((employee, index) => {
                            const attendance = todayAttendance.find(
                                a => a.employeeId === employee.uid || a.employeeId === employee.id
                            );
                            
                            return (
                                <motion.div
                                    key={employee.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-xl bg-white dark:bg-gray-800/50 relative overflow-hidden">
                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            {attendance?.clockIn && !attendance?.clockOut ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : attendance?.clockOut ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                                    Absent
                                                </span>
                                            )}
                                        </div>

                                        {/* Employee Info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {employee.name?.[0]?.toUpperCase()}
                                                </div>
                                                {attendance?.clockIn && !attendance?.clockOut && (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                                                    {employee.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <Briefcase size={14} />
                                                    {employee.position}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
                                                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-mono">
                                                    ID: {employee.employeeId}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payroll Info */}
                                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Salary</span>
                                                <span className="text-xs font-medium text-green-700 dark:text-green-400 capitalize">
                                                    {employee.payType}
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-green-600">
                                                {employee.currency} {
                                                    employee.payType === 'monthly' ? employee.monthlyRate :
                                                    employee.payType === 'weekly' ? employee.weeklyRate :
                                                    employee.payType === 'hourly' ? `${employee.hourlyRate}/hr` :
                                                    employee.baseSalary || 'N/A'
                                                }
                                            </p>
                                        </div>

                                        {/* Work Site */}
                                        {employee.workSiteId && (
                                            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin size={14} />
                                                <span>{workSites.find(s => s.id === employee.workSiteId)?.name || 'Work Site'}</span>
                                            </div>
                                        )}

                                        {/* Contact Info */}
                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 truncate">
                                                <Mail size={12} />
                                                {employee.email}
                                            </p>
                                            {employee.phone && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <Phone size={12} />
                                                    {employee.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Today's Attendance */}
                                        {attendance && (
                                            <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                                <div>
                                                    <p className="text-xs text-gray-500">Clock In</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                        {attendance.clockIn || "--:--"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Clock Out</p>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                        {attendance.clockOut || "--:--"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Credentials */}
                                        {employee.tempPassword && (
                                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1">
                                                    <Shield size={12} />
                                                    Login Credentials
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-blue-700 dark:text-blue-300">Password:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-blue-700 dark:text-blue-300">
                                                            {showPassword[employee.id] ? employee.tempPassword : '••••••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(employee.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                        >
                                                            {showPassword[employee.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => viewEmployeeDetails(employee)}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 py-2 rounded-lg transition-all font-medium"
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                            {employee.tempPassword && (
                                                <button
                                                    onClick={() => copyCredentials(employee)}
                                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                                                    title="Copy credentials"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditEmployee(employee)}
                                                className="p-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEmployeeDelete(employee.id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </GlassCard>

            {/* MODALS - DUE TO CHARACTER LIMIT, I'LL PROVIDE THE MODAL CODE IN THE NEXT PART */}
            {/* Add Employee Modal, Work Site Modal, Credentials Modal, Employee Detail Modal */}

{/* Add/Edit Employee Modal */}
<AnimatePresence>
    {showEmployeeModal && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
                setShowEmployeeModal(false);
                setCurrentStep(1);
                setEditingEmployee(null);
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h2>
                        <button
                            onClick={() => {
                                setShowEmployeeModal(false);
                                setCurrentStep(1);
                                setEditingEmployee(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                        {[
                            { num: 1, label: 'Basic Info' },
                            { num: 2, label: 'Employment' },
                            { num: 3, label: 'Payroll' },
                            { num: 4, label: 'Bank Details' }
                        ].map((step, index) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className={`flex items-center gap-2 flex-1 ${
                                    currentStep >= step.num ? 'text-primary-600' : 'text-gray-400'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                        currentStep >= step.num 
                                            ? 'bg-primary-600 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                    }`}>
                                        {step.num}
                                    </div>
                                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                                </div>
                                {index < 3 && (
                                    <div className={`h-0.5 w-full mx-2 ${
                                        currentStep > step.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleEmployeeSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={employeeForm.name}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={employeeForm.email}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="john@example.com"
                                        disabled={editingEmployee}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={employeeForm.phone}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={employeeForm.dateOfBirth}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={employeeForm.gender}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, gender: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Blood Group
                                    </label>
                                    <select
                                        value={employeeForm.bloodGroup}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, bloodGroup: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={employeeForm.address}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={employeeForm.city}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                    <input
                                        type="text"
                                        value={employeeForm.state}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, state: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        value={employeeForm.zipCode}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, zipCode: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <h4 className="text-md font-semibold text-gray-800 dark:text-white mt-6 mb-3">Emergency Contact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={employeeForm.emergencyContactName}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContactName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={employeeForm.emergencyContactPhone}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContactPhone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation</label>
                                    <input
                                        type="text"
                                        value={employeeForm.emergencyContactRelation}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContactRelation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., Spouse, Parent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Employment Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Employment Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.employeeId}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Department *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={employeeForm.department}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., Engineering, Sales"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Position *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={employeeForm.position}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., Senior Developer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Joining Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={employeeForm.joiningDate}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Employment Type *
                                    </label>
                                    <select
                                        required
                                        value={employeeForm.employmentType}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, employmentType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="intern">Intern</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Work Site
                                    </label>
                                    <select
                                        value={employeeForm.workSiteId}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, workSiteId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Work Site</option>
                                        {workSites.map(site => (
                                            <option key={site.id} value={site.id}>
                                                {site.name} - {site.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Working Hours/Day
                                    </label>
                                    <input
                                        type="number"
                                        value={employeeForm.workingHoursPerDay}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, workingHoursPerDay: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                        max="24"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Working Days/Week
                                    </label>
                                    <input
                                        type="number"
                                        value={employeeForm.workingDaysPerWeek}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, workingDaysPerWeek: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                        max="7"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Aadhar Number
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.aadharNumber}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, aadharNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="XXXX XXXX XXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.panNumber}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, panNumber: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="ABCDE1234F"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payroll Information */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Payroll Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pay Type *
                                    </label>
                                    <select
                                        required
                                        value={employeeForm.payType}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, payType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="hourly">Hourly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        value={employeeForm.currency}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>

                                {employeeForm.payType === 'monthly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Monthly Salary *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={employeeForm.monthlyRate}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, monthlyRate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="50000"
                                        />
                                    </div>
                                )}

                                {employeeForm.payType === 'weekly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Weekly Salary *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={employeeForm.weeklyRate}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, weeklyRate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="12000"
                                        />
                                    </div>
                                )}

                                {employeeForm.payType === 'hourly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Hourly Rate *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={employeeForm.hourlyRate}
                                            onChange={(e) => setEmployeeForm({ ...employeeForm, hourlyRate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="500"
                                        />
                                    </div>
                                )}
                            </div>

                            <h4 className="text-md font-semibold text-gray-800 dark:text-white mt-6 mb-3">Allowances</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['housing', 'transport', 'food', 'medical', 'other'].map(allowance => (
                                    <div key={allowance}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                                            {allowance}
                                        </label>
                                        <input
                                            type="number"
                                            value={employeeForm.allowances[allowance]}
                                            onChange={(e) => setEmployeeForm({
                                                ...employeeForm,
                                                allowances: { ...employeeForm.allowances, [allowance]: parseFloat(e.target.value) || 0 }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-md font-semibold text-gray-800 dark:text-white mt-6 mb-3">Deductions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {['tax', 'insurance', 'providentFund', 'other'].map(deduction => (
                                    <div key={deduction}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                                            {deduction === 'providentFund' ? 'PF' : deduction}
                                        </label>
                                        <input
                                            type="number"
                                            value={employeeForm.deductions[deduction]}
                                            onChange={(e) => setEmployeeForm({
                                                ...employeeForm,
                                                deductions: { ...employeeForm.deductions, [deduction]: parseFloat(e.target.value) || 0 }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-md font-semibold text-gray-800 dark:text-white mt-6 mb-3">Overtime Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Overtime Multiplier
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={employeeForm.overtimeMultiplier}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, overtimeMultiplier: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Weekend Multiplier
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={employeeForm.weekendMultiplier}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, weekendMultiplier: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Holiday Multiplier
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={employeeForm.holidayMultiplier}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, holidayMultiplier: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Bank Details */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Bank Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.bankName}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, bankName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., HDFC Bank"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.accountHolderName}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, accountHolderName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="As per bank records"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.accountNumber}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, accountNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Account number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        value={employeeForm.ifscCode}
                                        onChange={(e) => setEmployeeForm({ ...employeeForm, ifscCode: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="HDFC0001234"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-400">
                                    <strong>Note:</strong> Bank details will be used for salary transfers. Please ensure all information is accurate.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                        >
                            <ChevronRight size={18} className="rotate-180" />
                            Previous
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEmployeeModal(false);
                                    setCurrentStep(1);
                                    setEditingEmployee(null);
                                }}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="animate-spin" size={18} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            {editingEmployee ? 'Update Employee' : 'Add Employee'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

{/* Work Site Modal */}
<AnimatePresence>
    {showWorkSiteModal && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
                setShowWorkSiteModal(false);
                setEditingWorkSite(null);
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {editingWorkSite ? 'Edit Work Site' : 'Manage Work Sites'}
                        </h2>
                        <button
                            onClick={() => {
                                setShowWorkSiteModal(false);
                                setEditingWorkSite(null);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Add Work Site Form */}
                    <form onSubmit={handleWorkSiteSubmit} className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {editingWorkSite ? 'Update Work Site' : 'Add New Work Site'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Site Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={workSiteForm.name}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Main Office"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={workSiteForm.location}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Mumbai"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Address
                            </label>
                            <textarea
                                value={workSiteForm.address}
                                onChange={(e) => setWorkSiteForm({ ...workSiteForm, address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Full address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <input
                                    type="text"
                                    value={workSiteForm.city}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                                <input
                                    type="text"
                                    value={workSiteForm.state}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, state: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                                <input
                                    type="text"
                                    value={workSiteForm.zipCode}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, zipCode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    value={workSiteForm.contactPerson}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, contactPerson: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={workSiteForm.contactPhone}
                                    onChange={(e) => setWorkSiteForm({ ...workSiteForm, contactPhone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div> */}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={workSiteForm.description}
                                onChange={(e) => setWorkSiteForm({ ...workSiteForm, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Additional details about this work site"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={workSiteForm.active}
                                onChange={(e) => setWorkSiteForm({ ...workSiteForm, active: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Site
                            </label>
                        </div>

                        <div className="flex gap-2">
                            {editingWorkSite && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingWorkSite(null);
                                        setWorkSiteForm({
                                            name: "",
                                            location: "",
                                            address: "",
                                            city: "",
                                            state: "",
                                            zipCode: "",
                                            coordinates: { latitude: "", longitude: "" },
                                            radius: 100,
                                            contactPerson: "",
                                            contactPhone: "",
                                            active: true,
                                            description: ""
                                        });
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        {editingWorkSite ? 'Update Site' : 'Add Site'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Existing Work Sites List */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Existing Work Sites ({workSites.length})
                        </h3>
                        <div className="space-y-3">
                            {workSites.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Building2 size={48} className="mx-auto mb-2 text-gray-300" />
                                    <p>No work sites added yet</p>
                                </div>
                            ) : (
                                workSites.map((site) => (
                                    <div
                                        key={site.id}
                                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 transition-all bg-white dark:bg-gray-800/50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                                    <Building2 className="text-primary-600" size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-800 dark:text-white">
                                                            {site.name}
                                                        </h4>
                                                        {site.active ? (
                                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 text-xs font-medium rounded-full">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {site.location}
                                                    </p>
                                                    {site.address && (
                                                        <p className="text-xs text-gray-500 mt-1">{site.address}</p>
                                                    )}
                                                    {site.contactPerson && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Contact: {site.contactPerson} {site.contactPhone && `(${site.contactPhone})`}
                                                        </p>
                                                    )}
                                                    {site.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{site.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingWorkSite(site);
                                                        setWorkSiteForm(site);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                                    title="Edit site"
                                                >
                                                    <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleWorkSiteDelete(site.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Delete site"
                                                >
                                                    <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

{/* Credentials Modal */}
<AnimatePresence>
    {showCredentialsModal && selectedEmployee && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCredentialsModal(false)}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                Employee Added Successfully!
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Share these credentials with the employee
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-3">
                            Login Credentials
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Employee Name</label>
                                <p className="font-semibold text-gray-800 dark:text-white">{selectedEmployee.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Employee ID</label>
                                <p className="font-mono font-semibold text-gray-800 dark:text-white">
                                    {selectedEmployee.employeeId}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Email</label>
                                <p className="font-mono font-semibold text-gray-800 dark:text-white">
                                    {selectedEmployee.email}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Temporary Password</label>
                                <div className="flex items-center gap-2">
                                    <p className="font-mono font-semibold text-gray-800 dark:text-white flex-1">
                                        {showPassword[selectedEmployee.id] 
                                            ? selectedEmployee.tempPassword 
                                            : '••••••••••••'}
                                    </p>
                                    <button
                                        onClick={() => togglePasswordVisibility(selectedEmployee.id)}
                                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                    >
                                        {showPassword[selectedEmployee.id] ? (
                                            <EyeOff size={18} className="text-blue-600 dark:text-blue-400" />
                                        ) : (
                                            <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Company ID</label>
                                <p className="font-mono font-semibold text-gray-800 dark:text-white">{companyId}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400">Login URL</label>
                                <p className="font-mono text-sm text-primary-600 dark:text-primary-400 break-all">
                                    {window.location.origin}/login
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <div className="flex gap-2">
                            <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
                            <p className="text-xs text-yellow-800 dark:text-yellow-400">
                                Please ask the employee to change their password after first login for security.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => copyCredentials(selectedEmployee)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg transition-all font-medium"
                        >
                            <Copy size={18} />
                            Copy Credentials
                        </button>
                        <button
                            onClick={() => shareCredentials(selectedEmployee)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg transition-all font-medium"
                        >
                            <Send size={18} />
                            Email Credentials
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCredentialsModal(false)}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-all font-medium"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

{/* Employee Detail Modal */}
<AnimatePresence>
    {showEmployeeDetail && selectedEmployee && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmployeeDetail(false)}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {selectedEmployee.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {selectedEmployee.name}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedEmployee.position} • {selectedEmployee.department}
                                </p>
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-mono mt-1">
                                    ID: {selectedEmployee.employeeId}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEmployeeDetail(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Monthly Statistics */}
                    {selectedEmployee.monthlyStats && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Monthly Performance
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Present Days</p>
                                    <p className="text-2xl font-bold text-green-600">{selectedEmployee.monthlyStats.present}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedEmployee.monthlyStats.attendanceRate}% attendance
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Late Days</p>
                                    <p className="text-2xl font-bold text-orange-600">{selectedEmployee.monthlyStats.late}</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {selectedEmployee.monthlyStats.totalHours}h
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Hours/Day</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {selectedEmployee.monthlyStats.avgHours}h
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                                <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                                    <Mail size={16} />
                                    {selectedEmployee.email}
                                </p>
                            </div>
                            {selectedEmployee.phone && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                                    <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
                                        <Phone size={16} />
                                        {selectedEmployee.phone}
                                    </p>
                                </div>
                            )}
                            {selectedEmployee.dateOfBirth && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date of Birth</p>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {selectedEmployee.bloodGroup && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blood Group</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{selectedEmployee.bloodGroup}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Employment Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Employment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Joining Date</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employment Type</p>
                                <p className="font-medium text-gray-800 dark:text-white capitalize">
                                    {selectedEmployee.employmentType || 'Full-time'}
                                </p>
                            </div>
                            {selectedEmployee.workSiteId && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Work Site</p>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {workSites.find(s => s.id === selectedEmployee.workSiteId)?.name || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payroll Information */}
                    {selectedEmployee.payType && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Payroll Information
                            </h3>
                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pay Type</p>
                                        <p className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                                            {selectedEmployee.payType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Salary</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {selectedEmployee.currency} {
                                                selectedEmployee.payType === 'monthly' ? selectedEmployee.monthlyRate :
                                                selectedEmployee.payType === 'weekly' ? selectedEmployee.weeklyRate :
                                                selectedEmployee.payType === 'hourly' ? `${selectedEmployee.hourlyRate}/hr` :
                                                selectedEmployee.baseSalary || 'N/A'
                                            }
                                        </p>
                                    </div>
                                    {selectedEmployee.overtimeEnabled && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overtime Rate</p>
                                            <p className="text-lg font-bold text-purple-600">
                                                {selectedEmployee.overtimeMultiplier}x
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Attendance */}
                    {selectedEmployee.attendanceRecords && selectedEmployee.attendanceRecords.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Recent Attendance (Last 10 days)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Date
                                            </th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Clock In
                                            </th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Clock Out
                                            </th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Hours
                                            </th>
                                            <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEmployee.attendanceRecords.slice(0, 10).map((record, index) => {
                                            const hours = record.clockIn && record.clockOut 
                                                ? calculateHours(record.clockIn, record.clockOut).toFixed(1)
                                                : '--';
                                            return (
                                                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                                    <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {new Date(record.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="p-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                                                        {record.clockIn || '--:--'}
                                                    </td>
                                                    <td className="p-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                                                        {record.clockOut || '--:--'}
                                                    </td>
                                                    <td className="p-3 text-sm font-semibold text-gray-800 dark:text-white">
                                                        {hours}h
                                                    </td>
                                                    <td className="p-3 text-sm">
                                                        {record.clockIn ? (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                record.status === 'late'
                                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            }`}>
                                                                {record.status === 'late' ? 'Late' : 'On Time'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                Absent
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={() => setShowEmployeeDetail(false)}
                        className="w-full px-4 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

        </div>
    );
}
