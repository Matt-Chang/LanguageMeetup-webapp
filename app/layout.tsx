import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Hsinchu Language Meetup | Connect, Share, Learn',
  description: 'Join the Hsinchu Language Meetup! Connect with language lovers, practice English, Mandarin, Japanese, and more in Hsinchu, Taiwan.',
  keywords: ['Hsinchu', 'Language Exchange', 'English Meetup', 'Taiwan', 'Learn English', 'Practice Japanese', 'Mandarin Exchange', 'Language Club', 'Zhubei'],
  authors: [{ name: 'Hsinchu Language Meetup' }],
  alternates: {
    canonical: 'https://language-meetup-webpage.vercel.app',
  },
  openGraph: {
    title: 'Hsinchu Language Meetup | English, Mandarin & Japanese Exchange',
    description: 'A vibrant community dedicated to making language practice fun and accessible in Hsinchu, Taiwan. Join our weekly events!',
    url: 'https://language-meetup-webpage.vercel.app',
    siteName: 'Hsinchu Language Meetup',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hsinchu Language Meetup',
    description: 'Practice English, Mandarin, Japanese & more in Hsinchu!',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${jakarta.variable} antialiased bg-gray-50 text-gray-700 font-body flex flex-col min-h-screen`}>
        <Navbar />
        <div className="flex-grow pt-20"> {/* Add padding for fixed navbar */}
          {children}
        </div>
        <Footer />

        {/* JSON-LD Structured Data for AI/SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Hsinchu Language Meetup",
              "description": "A vibrant community dedicated to making language practice fun and accessible. Practice English, Mandarin, Japanese, and more in Hsinchu.",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "eventStatus": "https://schema.org/EventScheduled",
              "location": {
                "@type": "Place",
                "name": "慕溪園Mercy caf’e & lunch box",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "302, Hsinchu County, Zhubei City, Section 5, Xinglong Rd, 71號一樓",
                  "addressLocality": "Zhubei City",
                  "addressRegion": "Hsinchu County",
                  "addressCountry": "TW"
                }
              },
              "organizer": {
                "@type": "Organization",
                "name": "Hsinchu Language Meetup",
                "url": "https://language-meetup-webapp.vercel.app/"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
