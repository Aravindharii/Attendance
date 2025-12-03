# Setup Instructions - Attendance Tracker

## Quick Start Guide

Follow these steps to get your Attendance Tracker up and running.

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., "attendance-tracker")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**
5. Click "Save"

### 1.3 Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose a location closest to you
5. Click "Enable"

### 1.4 Set Up Firestore Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the rules with:

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

3. Click "Publish"

### 1.5 Enable Storage (Optional)

1. Go to **Build > Storage**
2. Click "Get Started"
3. Use default security rules
4. Click "Done"

### 1.6 Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app (name: "Attendance Tracker Web")
5. Copy the configuration values

## Step 2: Application Setup

### 2.1 Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_COMPANY_NAME=Your Company Name
NEXT_PUBLIC_COMPANY_LOCATION_LAT=0
NEXT_PUBLIC_COMPANY_LOCATION_LNG=0
NEXT_PUBLIC_GEOFENCE_RADIUS=100
```

### 2.2 Get Your Office Coordinates (for Geolocation)

1. Go to [Google Maps](https://maps.google.com)
2. Right-click on your office location
3. Click on the coordinates to copy them
4. Update `NEXT_PUBLIC_COMPANY_LOCATION_LAT` and `NEXT_PUBLIC_COMPANY_LOCATION_LNG`

## Step 3: Run the Application

### 3.1 Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 3.2 Create First Admin Account

1. Open the app in your browser
2. Click "Sign Up"
3. Fill in the registration form
4. After creating the account, go to Firebase Console
5. Navigate to **Firestore Database**
6. Find the `users` collection
7. Open your user document
8. Edit the `role` field and change it to `"admin"`
9. Save the changes
10. Refresh the app and log in again

## Step 4: Configure Company Settings

1. Log in as admin
2. Go to **Settings** page
3. Configure:
   - Company name
   - Working hours (start and end time)
   - Late threshold (minutes)
   - Office location (latitude and longitude)
   - Geofence radius (meters)
   - QR code expiry duration (minutes)
4. Click "Save Settings"

## Step 5: Add Employees

1. Go to **Employees** page
2. Click "Add Employee"
3. Fill in employee details:
   - Full Name
   - Email
   - Employee ID
   - Department
   - Role (Employee or Admin)
4. Click "Add Employee"
5. The employee will receive credentials via email (if configured)

## Step 6: Test Attendance Features

### Test Manual Attendance
1. Go to **Mark Attendance**
2. Select "Manual Clock In/Out"
3. Click "Clock In"
4. Wait a few seconds
5. Click "Clock Out"
6. Check **Attendance** page to see the record

### Test QR Code Attendance (Admin Only)
1. Go to **Attendance > QR Code**
2. Click "Generate QR Code"
3. On another device or browser, log in as employee
4. Go to **Mark Attendance**
5. Select "QR Code Scan"
6. Click "Start Scanning"
7. Scan the QR code
8. Attendance should be marked

### Test Geolocation Attendance
1. Go to **Mark Attendance**
2. Select "Geolocation"
3. Click "Mark Attendance with Location"
4. Allow location permissions
5. If within geofence radius, attendance will be marked

## Step 7: Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables from `.env.local`
6. Click "Deploy"
7. Your app will be live!

### Important for Production

- **HTTPS Required**: Geolocation and camera features require HTTPS
- **Environment Variables**: Add all env vars in Vercel dashboard
- **Firebase Security**: Review and tighten security rules
- **Domain**: Configure custom domain in Vercel settings

## Troubleshooting

### Issue: "Firebase not configured"
- **Solution**: Check `.env.local` file exists and has correct values
- Restart the dev server after changing env vars

### Issue: "Permission denied" in Firestore
- **Solution**: Check Firestore security rules are published
- Ensure user is authenticated

### Issue: QR Scanner not working
- **Solution**: Use HTTPS (required for camera access)
- Check browser permissions for camera
- Try a different browser (Chrome recommended)

### Issue: Geolocation not working
- **Solution**: Use HTTPS in production
- Check browser location permissions
- Ensure coordinates are correct in settings

### Issue: "Module not found" errors
- **Solution**: Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall

## Next Steps

1. ✅ Customize the UI colors in `tailwind.config.js`
2. ✅ Add your company logo
3. ✅ Configure email notifications (optional)
4. ✅ Set up backup strategies for Firestore
5. ✅ Train employees on using the system
6. ✅ Monitor usage and gather feedback

## Support

For help and support:
- Check the README.md file
- Review Firebase documentation
- Create an issue on GitHub

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong passwords** for admin accounts
3. **Regularly review** Firestore security rules
4. **Enable 2FA** on Firebase account
5. **Monitor** Firebase usage and costs
6. **Backup** Firestore data regularly
7. **Update dependencies** regularly

---

🎉 **Congratulations!** Your Attendance Tracker is now set up and ready to use!
