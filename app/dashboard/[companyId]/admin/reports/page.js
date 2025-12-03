import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassCard className="flex flex-col gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Monthly Attendance</h3>
                        <p className="text-sm text-gray-500">Detailed log of all employee attendance for the current month.</p>
                    </div>
                    <button className="mt-auto w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} /> Download CSV
                    </button>
                </GlassCard>

                <GlassCard className="flex flex-col gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Late Arrivals</h3>
                        <p className="text-sm text-gray-500">Report of employees who arrived late this month.</p>
                    </div>
                    <button className="mt-auto w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} /> Download PDF
                    </button>
                </GlassCard>
            </div>
        </div>
    );
}
