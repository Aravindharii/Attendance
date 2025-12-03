import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB52DyENVhTO_RJbwwpYzWIW8aFQAgwI9w",
    authDomain: "attendance-9830a.firebaseapp.com",
    projectId: "attendance-9830a",
    storageBucket: "attendance-9830a.firebasestorage.app",
    messagingSenderId: "154690577552",
    appId: "1:154690577552:web:05ca0d637731b6a9f76415",
};

console.log('🔥 Initializing Firebase with config:', {
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
    projectId: firebaseConfig.projectId
});

// Initialize Firebase
let app;
try {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    } else {
        app = getApps()[0];
        console.log('✅ Using existing Firebase app');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
}

// Initialize services
console.log('🔥 Initializing Firebase services...');
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
console.log('✅ Firebase services initialized');

export default app;
