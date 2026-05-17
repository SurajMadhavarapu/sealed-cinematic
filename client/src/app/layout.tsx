import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SEALED - Time-Locked Letters for Loved Ones',
  description: 'A private, end-to-end encrypted app where couples and families write time-locked letters, confessions, promises, and messages — delivered only when the moment is right.',
  keywords: ['letters', 'time capsule', 'encrypted', 'couples', 'family', 'messages'],
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen text-white overflow-x-hidden bg-[#0f0f0f]">
        {/* Tinder-inspired background */}
        <div className="fixed inset-0 -z-10">
          {/* Base dark */}
          <div className="absolute inset-0 bg-[#0f0f0f]" />
          
          {/* Tinder pink glow - top */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: 'rgba(253, 41, 123, 0.15)' }} />
          
          {/* Tinder coral glow - middle */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'rgba(255, 88, 100, 0.1)' }} />
          
          {/* Tinder orange glow - bottom */}
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: 'rgba(255, 101, 91, 0.12)' }} />
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
        </div>
        
        {children}
      </body>
    </html>
  );
}
