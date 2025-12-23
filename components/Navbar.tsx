'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white shadow-sm font-heading transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/assets/logo.jpg"
                                alt="Hsinchu Language Meetup Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight group-hover:text-primary transition-colors">
                            Hsinchu Language Meetup
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-600 hover:text-primary font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/#tables" className="text-gray-600 hover:text-primary font-medium transition-colors">
                            Tables
                        </Link>
                        <Link href="/#gallery" className="text-gray-600 hover:text-primary font-medium transition-colors">
                            Gallery
                        </Link>
                        <Link
                            href="https://hsinchu-language-meetup-579134451089.us-west1.run.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-[#F97316] font-medium transition-colors flex items-center gap-1"
                        >
                            Board Games
                            <span className="text-xs transform -translate-y-1">↗</span>
                        </Link>
                        <Link
                            href="/#calendar"
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                        >
                            Join Us
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
                        aria-label="Toggle navigation"
                    >
                        <div className="w-6 h-5 relative flex flex-col justify-between">
                            <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                            <span className={`w-full h-0.5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className={`md:hidden absolute w-full bg-white shadow-md transition-all duration-300 ease-in-out border-t border-gray-100 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                <div className="flex flex-col px-4 pt-2 pb-6 space-y-2">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg bg-gray-50 text-gray-800 font-medium active:bg-gray-100">
                        Home
                    </Link>
                    <Link href="/#tables" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg text-gray-600 font-medium hover:bg-gray-50 active:bg-gray-100">
                        Tables
                    </Link>
                    <Link href="/#gallery" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 rounded-lg text-gray-600 font-medium hover:bg-gray-50 active:bg-gray-100">
                        Gallery
                    </Link>
                    <a href="https://boardgame-tools.vercel.app/" target="_blank" className="block py-3 px-4 rounded-lg text-gray-600 font-medium hover:bg-gray-50 active:bg-gray-100">
                        Board Game Tools ↗
                    </a>
                    <Link href="/#calendar" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-4 mt-2 text-center rounded-lg bg-primary text-white font-bold shadow-sm active:bg-primary-dark">
                        Join Next Meetup
                    </Link>
                </div>
            </div>
        </nav>
    );
}
