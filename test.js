const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function generateAttendance() {
  const batch = db.batch();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const hour = 9 + Math.floor(Math.random() * 2);
    const checkInDate = new Date(date);
    checkInDate.setHours(hour, 0, 0, 0);
    
    const checkOutDate = new Date(date);
    checkOutDate.setHours(18, 0, 0, 0);
    
    const docRef = db.collection('attendance').doc();
    batch.set(docRef, {
      userId: 'RAX23lj878cvKz3OzCWEPVWFdFv2',
      userName: 'Aravind V H',
      employeeId: '1001',
      checkIn: admin.firestore.Timestamp.fromDate(checkInDate),
      checkOut: admin.firestore.Timestamp.fromDate(checkOutDate),
      date: dateStr,
      status: hour > 9 ? 'late' : 'present',
      method: 'qr',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log('✅ Generated 7 days of attendance records');
  process.exit(0);
}

generateAttendance().catch(console.error);
