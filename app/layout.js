import { Inter } from 'next/font/google'
import './globals.css'
import { AuthContextProvider } from '@/lib/auth/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Attendance Tracker - Company Attendance Management',
    description: 'Modern attendance tracking system with QR codes, geolocation, and real-time reporting',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthContextProvider>
                    {children}
                </AuthContextProvider>
            </body>
        </html>
    )
}
