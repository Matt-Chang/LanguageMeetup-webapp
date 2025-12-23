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
      </body>
    </html>
  );
}
