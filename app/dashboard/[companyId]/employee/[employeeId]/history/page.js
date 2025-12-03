import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar as CalendarIcon } from "lucide-react";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function HistoryPage({ params }) {
    const { companyId, employeeId } = params;
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ideally use composite index: where employeeId == X, orderBy date desc
        // For now, client-side sort if index missing, or simple query
        const q = query(
            collection(db, `companies/${companyId}/attendance`),
            // where("employeeId", "==", employeeId) // Needs index with orderBy
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(doc => doc.employeeId === employeeId) // Client-side filter for now
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Client-side sort

            setAttendance(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [companyId, employeeId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Absent': return 'bg-red-100 text-red-700';
            case 'Late': return 'bg-orange-100 text-orange-700';
            case 'Half Day': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Attendance History</h1>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Clock In</th>
                                <th className="px-6 py-4">Clock Out</th>
                                <th className="px-6 py-4">Work Hours</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No records found</td></tr>
                            ) : (
                                attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {record.date}
                                        </td>
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
