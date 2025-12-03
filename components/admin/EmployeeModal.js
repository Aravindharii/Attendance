"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Note: This logs in the new user immediately if used on client.
// Issue: Creating a secondary user while logged in as admin will switch the auth context.
// Solution: We should use a secondary Firebase App instance or just create the Firestore document 
// and let the user "claim" it or use a Cloud Function to create the Auth user.
// For this "Ready-to-run UI" without backend functions ready yet, we will simulate it 
// by just creating the Firestore document and assuming the user will register/login later 
// OR we can use a temporary workaround.
// BETTER APPROACH for Client-Side Admin:
// Just create the Firestore profile. The actual Auth user creation usually happens via Invite 
// or by the user registering and the system linking them.
// HOWEVER, the prompt says "Add / Edit / Delete Employee".
// Let's create the Firestore document. The Auth part is tricky purely client-side without logging out admin.
// We will create the Firestore document. We can assume a separate "Invite" flow or just manual entry.
// For now, we'll just save the profile to Firestore.

import { db } from "@/lib/firebase/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { X } from "lucide-react";

export const EmployeeModal = ({ isOpen, onClose, companyId, employee }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "employee",
        department: "",
        shift: "General",
        joiningDate: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData(employee);
        } else {
            setFormData({
                name: "",
                email: "",
                role: "employee",
                department: "",
                shift: "General",
                joiningDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [employee]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const empId = employee ? employee.id : Date.now().toString(); // Simple ID generation
            const empRef = doc(db, `companies/${companyId}/employees`, empId);

            const data = {
                ...formData,
                updatedAt: serverTimestamp(),
            };

            if (!employee) {
                data.createdAt = serverTimestamp();
                // Also create a user_mapping placeholder so they can login later (if we had auth hookup)
                // For now, just storing the profile.
            }

            await setDoc(empRef, data, { merge: true });

            // If it's a new employee, we might want to create a user_mapping entry 
            // linking their email to this companyId, so when they DO register/login, 
            // they get routed correctly.
            // But we can't create the Auth User here without logging out.

            onClose();
        } catch (error) {
            console.error("Error saving employee:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {employee ? "Edit Employee" : "Add New Employee"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="glass-input w-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            disabled={!!employee}
                            className="glass-input w-full disabled:opacity-50"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                className="glass-input w-full"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="employee">Employee</option>
                                <option value="sub_admin">Sub Admin</option>
                                <option value="company_admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                                type="text"
                                className="glass-input w-full"
                                placeholder="e.g. Engineering"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                            <select
                                className="glass-input w-full"
                                value={formData.shift}
                                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                            >
                                <option value="General">General (9-5)</option>
                                <option value="Morning">Morning (6-2)</option>
                                <option value="Night">Night (10-6)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                            <input
                                type="date"
                                required
                                className="glass-input w-full"
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Employee"}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
