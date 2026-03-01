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
  description: 'Join the Hsinchu Language Meetup! Connect with language lovers, practice English, Mandarin, Japanese, and more.',
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
                "name": "Hsinchu City",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Hsinchu",
                  "addressRegion": "Hsinchu City",
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
