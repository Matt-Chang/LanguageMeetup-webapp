'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 font-body">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">

                {/* Brand */}
                <div>
                    <h3 className="text-2xl font-bold font-heading mb-4 text-white">
                        Hsinchu Language Meetup
                    </h3>
                    <p className="text-gray-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                        Connecting Taiwan through language, culture, and shared moments since 2019.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-primary">Quick Links</h4>
                    <ul className="space-y-3 text-gray-300">
                        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link href="/#tables" className="hover:text-white transition-colors">Our Tables</Link></li>
                        <li><Link href="/#gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                        <li><Link href="/#join" className="hover:text-white transition-colors">Join Event</Link></li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-primary">Follow Us</h4>
                    <div className="flex justify-center md:justify-start gap-4">
                        <a
                            href="https://www.facebook.com/profile.php?id=61577962754762"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:-translate-y-1"
                            aria-label="Facebook"
                        >
                            FB
                        </a>
                        <a
                            href="https://www.instagram.com/hsinchu_language_meetup/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all transform hover:-translate-y-1"
                            aria-label="Instagram"
                        >
                            IG
                        </a>
                        <a
                            href="https://www.threads.com/@hsinchu_language_meetup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black hover:text-white hover:border hover:border-gray-600 transition-all transform hover:-translate-y-1"
                            aria-label="Threads"
                        >
                            TH
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Hsinchu Language Meetup. All rights reserved.</p>
                <div className="mt-4">
                    {/* Admin Link (Temporary Placeholder) */}
                    <Link href="/admin" className="text-gray-600 hover:text-gray-400 transition-colors">
                        Admin Login
                    </Link>
                </div>
            </div>
        </footer>
    );
}
