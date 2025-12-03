# Firebase Authentication Integration - Setup Guide

## 🔥 Firebase Setup Required

Before you can use authentication, you need to set up Firebase:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: "attendance-tracker"
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**
5. Click "Save"

### 3. Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose a location closest to you
5. Click "Enable"

### 4. Set Up Firestore Security Rules

In Firestore Database > Rules tab, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Company settings
    match /companySettings/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app name: "Attendance Tracker Web"
5. Copy the configuration

### 6. Update Environment Variables

Edit `.env.local` and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 7. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🎯 Testing Authentication

### Create First User (Employee)

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in:
   - Name: Test Employee
   - Employee ID: EMP001
   - Department: Engineering
   - Email: employee@test.com
   - Password: password123
4. Click "Sign Up"
5. You'll be redirected to dashboard

### Create Admin User

**Option 1: Via Firebase Console**
1. Sign up a new user through the app
2. Go to Firebase Console > Firestore Database
3. Find the `users` collection
4. Open the user document
5. Edit the `role` field to `"admin"`
6. Save
7. Log out and log back in

**Option 2: Manually in Firestore**
1. Go to Firestore Database
2. Create a user in Authentication first
3. Add document to `users` collection with:
```javascript
{
  uid: "firebase-user-id",
  name: "Admin User",
  email: "admin@test.com",
  employeeId: "ADMIN001",
  department: "Management",
  role: "admin",
  createdAt: <current timestamp>,
  updatedAt: <current timestamp>
}
```

## 🔐 Role-Based Access

### Admin Access
Admins can access:
- ✅ All employee features
- ✅ Employee Management page
- ✅ QR Code Generator
- ✅ Settings page
- ✅ All reports

### Employee Access
Employees can access:
- ✅ Dashboard overview
- ✅ Mark attendance (all methods)
- ✅ View own attendance records
- ✅ Reports page
- ✅ Profile page
- ❌ Employee Management (redirected)
- ❌ QR Generator (redirected)
- ❌ Settings (redirected)

## 🧪 Test the Integration

### Test Login
1. Go to http://localhost:3000
2. Enter credentials
3. Click "Sign In"
4. Should redirect to /dashboard

### Test Signup
1. Click "Sign Up"
2. Fill all fields
3. Click "Sign Up"
4. User created in Firebase
5. Redirected to dashboard

### Test Role Protection
1. Log in as employee
2. Try to access /dashboard/employees
3. Should see "Access Denied" message
4. Log in as admin
5. Can access all pages

### Test Logout
1. Click user menu in navbar
2. Click "Logout"
3. Redirected to login page
4. Cannot access dashboard without login

## 🐛 Troubleshooting

### "Firebase not configured" error
- Check `.env.local` exists and has correct values
- Restart dev server after changing env vars

### "Permission denied" error
- Check Firestore security rules are published
- Ensure user is authenticated

### User not redirecting after login
- Check browser console for errors
- Verify Firebase config is correct

### Admin pages showing "Access Denied"
- Check user's role in Firestore
- Ensure role is exactly "admin" (lowercase)

## ✅ What's Integrated

- ✅ Firebase Authentication (Email/Password)
- ✅ User signup with profile creation
- ✅ User login with session management
- ✅ Automatic redirect if already logged in
- ✅ Protected dashboard routes
- ✅ Role-based access control (Admin/Employee)
- ✅ Admin-only page protection
- ✅ Logout functionality
- ✅ Loading states during auth
- ✅ Error handling and display

## 📝 Next Steps

1. Set up Firebase project
2. Update `.env.local`
3. Restart dev server
4. Create test users
5. Test all auth flows
6. Set first user as admin
7. Test role-based access

---

**Authentication is now fully integrated and ready to use!** 🎉
