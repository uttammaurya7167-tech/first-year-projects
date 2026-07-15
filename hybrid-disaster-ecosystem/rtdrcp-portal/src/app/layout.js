import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'RTDRCP — Real-Time Disaster Relief Coordination Portal',
  description:
    'Military-grade, real-time disaster relief command dashboard with GIS mapping, AI triage, and mesh network integration for coordinating emergency response operations.',
  keywords: 'disaster relief, emergency management, GIS, situational awareness, command portal',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-navy-950 text-slate-200 overflow-hidden h-screen">
        {children}
      </body>
    </html>
  );
}
