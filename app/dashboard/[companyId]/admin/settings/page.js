import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Clock, Calendar, Trash2, Edit } from "lucide-react";
import { collection, query, onSnapshot, doc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function SettingsPage({ params }) {
    const { companyId } = params;
    const [shifts, setShifts] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [activeTab, setActiveTab] = useState("shifts");

    // Modal states (simplified for this file, ideally separate components)
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

    // Form states
    const [shiftForm, setShiftForm] = useState({ name: "", startTime: "09:00", endTime: "17:00" });
    const [holidayForm, setHolidayForm] = useState({ name: "", date: "" });

    useEffect(() => {
        const qShifts = query(collection(db, `companies/${companyId}/shifts`));
        const unsubShifts = onSnapshot(qShifts, (snap) => {
            setShifts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const qHolidays = query(collection(db, `companies/${companyId}/holidays`));
        const unsubHolidays = onSnapshot(qHolidays, (snap) => {
            setHolidays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubShifts(); unsubHolidays(); };
    }, [companyId]);

    const handleSaveShift = async (e) => {
        e.preventDefault();
        try {
            const id = Date.now().toString();
            await setDoc(doc(db, `companies/${companyId}/shifts`, id), {
                ...shiftForm,
                createdAt: serverTimestamp()
            });
            setIsShiftModalOpen(false);
            setShiftForm({ name: "", startTime: "09:00", endTime: "17:00" });
        } catch (err) { console.error(err); }
    };

    const handleSaveHoliday = async (e) => {
        e.preventDefault();
        try {
            const id = Date.now().toString();
            await setDoc(doc(db, `companies/${companyId}/holidays`, id), {
                ...holidayForm,
                createdAt: serverTimestamp()
            });
            setIsHolidayModalOpen(false);
            setHolidayForm({ name: "", date: "" });
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (collectionName, id) => {
        if (confirm("Are you sure?")) {
            await deleteDoc(doc(db, `companies/${companyId}/${collectionName}`, id));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Company Settings</h1>

            <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab("shifts")}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === "shifts"
                            ? "text-primary-600 border-b-2 border-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Shifts
                </button>
                <button
                    onClick={() => setActiveTab("holidays")}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === "holidays"
                            ? "text-primary-600 border-b-2 border-primary-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Holidays
                </button>
            </div>

            {activeTab === "shifts" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Shift Templates</h2>
                        <button
                            onClick={() => setIsShiftModalOpen(true)}
                            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Add Shift
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shifts.map(shift => (
                            <GlassCard key={shift.id} className="relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                                        <Clock size={18} className="text-primary-500" />
                                        {shift.name}
                                    </div>
                                    <button
                                        onClick={() => handleDelete("shifts", shift.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {shift.startTime} - {shift.endTime}
                                </p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "holidays" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Holidays</h2>
                        <button
                            onClick={() => setIsHolidayModalOpen(true)}
                            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Add Holiday
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {holidays.map(holiday => (
                            <GlassCard key={holiday.id} className="relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                                        <Calendar size={18} className="text-purple-500" />
                                        {holiday.name}
                                    </div>
                                    <button
                                        onClick={() => handleDelete("holidays", holiday.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Simple Modals (Inline for speed) */}
            {isShiftModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <GlassCard className="w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Shift</h3>
                        <form onSubmit={handleSaveShift} className="space-y-3">
                            <input
                                className="glass-input w-full"
                                placeholder="Shift Name (e.g. Morning)"
                                required
                                value={shiftForm.name}
                                onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="glass-input w-full"
                                    required
                                    value={shiftForm.startTime}
                                    onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                                />
                                <input
                                    type="time"
                                    className="glass-input w-full"
                                    required
                                    value={shiftForm.endTime}
                                    onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="px-3 py-1.5 text-sm">Cancel</button>
                                <button type="submit" className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">Save</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}

            {isHolidayModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <GlassCard className="w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Holiday</h3>
                        <form onSubmit={handleSaveHoliday} className="space-y-3">
                            <input
                                className="glass-input w-full"
                                placeholder="Holiday Name"
                                required
                                value={holidayForm.name}
                                onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })}
                            />
                            <input
                                type="date"
                                className="glass-input w-full"
                                required
                                value={holidayForm.date}
                                onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="px-3 py-1.5 text-sm">Cancel</button>
                                <button type="submit" className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm">Save</button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
