import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Filter, Download, Calendar as CalendarIcon } from "lucide-react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function AttendancePage({ params }) {
    const { companyId } = params;
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // In a real app, we'd query by date range. For now, let's fetch all and filter client-side 
        // or fetch by specific date if we had a proper composite index setup.
        // Let's try to fetch all for today first.

        // Note: Firestore requires composite indexes for complex queries.
        // We'll keep it simple: fetch recent attendance.
        const q = query(
            collection(db, `companies/${companyId}/attendance`),
            orderBy("date", "desc"),
            // limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAttendance(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [companyId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Absent': return 'bg-red-100 text-red-700';
            case 'Late': return 'bg-orange-100 text-orange-700';
            case 'Half Day': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredAttendance = attendance.filter(record => {
        const matchesDate = record.date === filterDate;
        const matchesSearch = record.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Overview</h1>
                <div className="flex gap-2">
                    <button className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 glass-input w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="date"
                            className="pl-10 glass-input"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Clock In</th>
                                <th className="px-6 py-4">Clock Out</th>
                                <th className="px-6 py-4">Work Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : filteredAttendance.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No records found for this date</td></tr>
                            ) : (
                                filteredAttendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {record.userName}
                                        </td>
                                        <td className="px-6 py-4">{record.date}</td>
                                        <td className="px-6 py-4">{record.clockIn || '-'}</td>
                                        <td className="px-6 py-4">{record.clockOut || '-'}</td>
                                        <td className="px-6 py-4">{record.workHours || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
