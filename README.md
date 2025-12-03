# Attendance Tracker - Company Attendance Management System

A modern, full-featured attendance tracking web application built with Next.js, Firebase, and Tailwind CSS. Features QR code scanning, geolocation-based attendance, real-time reporting, and role-based access control.

![Attendance Tracker](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication & Authorization
- Email/password authentication via Firebase
- Role-based access control (Admin & Employee)
- Protected routes and admin-only features
- Secure session management

### ⏰ Attendance Marking
- **Manual Clock In/Out**: Simple button-based attendance
- **QR Code Scanning**: Scan admin-generated QR codes
- **Geolocation**: Location-based attendance with geofencing
- Real-time attendance status tracking
- Automatic working hours calculation

### 📊 Dashboard & Analytics
- Beautiful overview dashboard with stats
- Interactive charts using Recharts
- Real-time attendance trends
- Department-wise analytics
- Top performers tracking

### 👥 Employee Management
- Add, edit, and delete employees
- Department organization
- Employee profile management
- Bulk operations support

### 📈 Reports & Insights
- Daily, weekly, monthly, and yearly reports
- Attendance percentage calculations
- Export reports to CSV/PDF
- Custom date range filtering
- Visual data representation

### ⚙️ Settings & Configuration
- Company information management
- Working hours configuration
- Geofence radius settings
- QR code expiry settings
- Late threshold customization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd /home/aravind/Attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

   Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

4. **Set up environment variables**

   Update `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   NEXT_PUBLIC_COMPANY_NAME=Your Company Name
   NEXT_PUBLIC_COMPANY_LOCATION_LAT=0
   NEXT_PUBLIC_COMPANY_LOCATION_LNG=0
   NEXT_PUBLIC_GEOFENCE_RADIUS=100
   ```

5. **Set up Firestore Security Rules**

   In Firebase Console, go to Firestore Database > Rules and add:
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

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
attendance-tracker/
├── app/                          # Next.js App Router
│   ├── layout.js                # Root layout
│   ├── page.js                  # Login page
│   ├── globals.css              # Global styles
│   └── dashboard/               # Dashboard routes
│       ├── layout.js            # Dashboard layout
│       ├── page.js              # Overview
│       ├── attendance/          # Attendance pages
│       ├── employees/           # Employee management
│       ├── reports/             # Reports & analytics
│       ├── settings/            # Settings
│       └── profile/             # User profile
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.js
│   │   ├── Modal.js
│   │   ├── Input.js
│   │   ├── Card.js
│   │   └── Toast.js
│   ├── layout/                  # Layout components
│   │   ├── Navbar.js
│   │   ├── Sidebar.js
│   │   └── DashboardLayout.js
│   ├── attendance/              # Attendance components
│   │   ├── QRGenerator.js
│   │   ├── QRScanner.js
│   │   ├── ClockInOut.js
│   │   ├── AttendanceStats.js
│   │   └── AttendanceTable.js
│   └── charts/                  # Chart components
│       ├── AttendanceChart.js
│       └── ReportsChart.js
├── lib/                         # Utilities & helpers
│   ├── firebase/                # Firebase configuration
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── firestore.js
│   │   └── storage.js
│   ├── utils/                   # Utility functions
│   │   ├── timeFormatter.js
│   │   ├── dateHelpers.js
│   │   └── calculations.js
│   └── hooks/                   # Custom React hooks
│       ├── useAuth.js
│       └── useAttendance.js
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── package.json                 # Dependencies
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Charts**: Recharts
- **QR Code**: qrcode, html5-qrcode
- **Date Handling**: date-fns
- **Icons**: lucide-react

## 📱 Features Breakdown

### For Employees
- ✅ Mark attendance (Manual, QR, Geolocation)
- ✅ View personal attendance history
- ✅ Check attendance statistics
- ✅ Update profile information
- ✅ View working hours and status

### For Admins
- ✅ All employee features
- ✅ Manage employees (Add, Edit, Delete)
- ✅ Generate QR codes for attendance
- ✅ View all attendance records
- ✅ Generate comprehensive reports
- ✅ Configure company settings
- ✅ Set working hours and policies
- ✅ Manage geofencing parameters

## 🔒 Security Features

- Firebase Authentication for secure login
- Role-based access control (RBAC)
- Firestore security rules
- QR code session expiry (5 minutes)
- Geofence validation
- Protected API routes
- Secure environment variables

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: QR code scanning and geolocation features require:
- HTTPS in production
- Camera permissions
- Location permissions

## 📝 Usage Guide

### First Time Setup

1. **Create Admin Account**
   - Sign up with email and password
   - First user is automatically set as admin (or configure manually in Firestore)

2. **Configure Settings**
   - Go to Settings page
   - Set company name, working hours, location, etc.

3. **Add Employees**
   - Navigate to Employees page
   - Click "Add Employee"
   - Fill in employee details

### Daily Operations

**For Employees:**
1. Login to the system
2. Go to "Mark Attendance"
3. Choose method (Manual/QR/Geolocation)
4. Clock in at start of day
5. Clock out at end of day

**For Admins:**
1. Generate QR code (if using QR method)
2. Monitor attendance in real-time
3. Review reports and analytics
4. Manage employee records

## 🔧 Configuration

### Working Hours
Set in Settings > Working Hours
- Start time (e.g., 09:00)
- End time (e.g., 18:00)
- Late threshold (minutes)

### Geolocation
Set in Settings > Geolocation
- Office latitude
- Office longitude
- Geofence radius (meters)

### QR Code
Set in Settings > QR Code
- Expiry duration (minutes)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@yourcompany.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Leave management system
- [ ] Shift scheduling
- [ ] Payroll integration
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Advanced analytics with AI
- [ ] Multi-language support
- [ ] Dark mode

## 👏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling utilities
- Recharts for beautiful charts
- All open-source contributors

---

Made with ❤️ by Your Company
# Attendance
