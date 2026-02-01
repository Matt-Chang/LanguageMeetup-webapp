'use client';

import { useState, useEffect } from 'react';
import JoinModal from '../components/JoinModal';
import RegistrantTicker from '../components/RegistrantTicker';
import TablesSection from '../components/TablesSection';
import VenueSection from '../components/VenueSection';
import GallerySection from '../components/GallerySection';
import CalendarSection from '../components/CalendarSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { useVenues } from '../hooks/useVenues';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Default to empty; set once venues are loaded
    const [activeVenueId, setActiveVenueId] = useState<string>('');

    const { venues, loading: venuesLoading } = useVenues();

    useEffect(() => {
        if (venues.length > 0 && !activeVenueId) {
            const mercy = venues.find(v => v.id === 'mercy');
            setActiveVenueId(mercy ? mercy.id : venues[0].id);
        }
    }, [venues, activeVenueId]);

    const handleVenueSelect = (id: string) => {
        setActiveVenueId(id);
        // Optional: Scroll to venue section if triggered from calendar
        const venueSection = document.getElementById('venue');
        if (venueSection) {
            venueSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="min-h-screen font-body">
            {/* Hero Section */}
            <header id="home" className="relative h-screen min-h-[600px] flex items-center justify-center text-center text-white bg-cover bg-center md:bg-fixed" style={{ backgroundImage: "url('/assets/hero-bg-new.jpg')" }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 max-w-[800px] px-5 animate-fadeInUp">

                    {/* New Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-6 text-white drop-shadow-md font-heading leading-tight">
                        Connect, Share, Learn
                    </h1>

                    {/* New Description */}
                    <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto font-light">
                        We are a vibrant community dedicated to making language practice fun and accessible for everyone.
                    </p>

                    <div className="flex flex-col items-center gap-6">

                        <div className="flex gap-6 justify-center">
                            {/* Updated Button: Scrolls to #join-cta */}
                            <a
                                href="#calendar"
                                className="bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                Join Next Meetup
                            </a>

                            <a href="#tables" className="hidden md:inline-block border-2 border-white hover:bg-white hover:text-secondary text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:-translate-y-1">
                                Our Tables
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <TestimonialsSection />
            <TablesSection onVenueSelect={handleVenueSelect} venues={venues} />
            <GallerySection />
            {/* CalendarSection manages its own data but triggers venue selection */}
            <CalendarSection onVenueSelect={(id) => handleVenueSelect(id)} />

            {activeVenueId && (
                <VenueSection
                    activeVenueId={activeVenueId}
                    onVenueChange={setActiveVenueId}
                    onJoinClick={() => setIsModalOpen(true)}
                    venues={venues}
                />
            )}

            {activeVenueId && (
                <JoinModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialVenueId={activeVenueId}
                    venues={venues}
                />
            )}
        </main>
    );
}
