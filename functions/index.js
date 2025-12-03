const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// 1. Auto-close attendance at midnight
// Scheduled function (requires Blaze plan)
exports.autoCloseAttendance = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Kolkata').onRun(async (context) => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // Previous day
    const dateStr = today.toISOString().split('T')[0];

    // This is expensive to query ALL companies. 
    // In production, we'd shard this or use a task queue.
    const companiesSnap = await db.collection('companies').get();

    for (const companyDoc of companiesSnap.docs) {
        const companyId = companyDoc.id;
        const attendanceRef = db.collection(`companies/${companyId}/attendance`);

        // Find records that are not clocked out
        const snapshot = await attendanceRef
            .where('date', '==', dateStr)
            .where('clockOut', '==', null)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                clockOut: '23:59:59',
                status: 'Auto-Closed',
                autoClosed: true
            });
        });

        if (!snapshot.empty) {
            await batch.commit();
            console.log(`Auto-closed ${snapshot.size} records for company ${companyId}`);
        }
    }
});

// 2. Monthly Report Generator
exports.generateMonthlyReport = functions.pubsub.schedule('0 0 1 * *').onRun(async (context) => {
    // Logic to aggregate attendance data for the previous month
    // and save to companies/{companyId}/reports collection
    // ...
});

// 3. On Employee Delete -> Cleanup
exports.onEmployeeDelete = functions.firestore
    .document('companies/{companyId}/employees/{employeeId}')
    .onDelete(async (snap, context) => {
        const { companyId, employeeId } = context.params;

        // Delete user mapping
        await db.collection('user_mappings').doc(employeeId).delete();

        // Delete attendance records (Optional: might want to keep for history)
        // If deleting:
        const attendanceRef = db.collection(`companies/${companyId}/attendance`);
        const snapshot = await attendanceRef.where('employeeId', '==', employeeId).get();

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    });
