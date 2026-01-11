'use client';

import { useState, useEffect } from 'react';
import JoinModal from './JoinModal';
import RegistrantTicker from './RegistrantTicker';
import { getUpcomingEvents, EventStatus } from '../lib/schedule';
import { Venue } from '../lib/venues';

interface VenueSectionProps {
    activeVenueId: string;
    onVenueChange: (id: any) => void;
    onJoinClick: () => void;
    venues: Venue[]; // Passed from parent
}

export default function VenueSection({ activeVenueId, onVenueChange, onJoinClick, venues }: VenueSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextEvent, setNextEvent] = useState<EventStatus | null>(null);
    const [nextActiveEvent, setNextActiveEvent] = useState<EventStatus | null>(null);

    const activeVenue = venues.find(v => v.id === activeVenueId) || venues[0];

    useEffect(() => {
        if (!activeVenue) return;

        const checkSchedule = async () => {
            const events = await getUpcomingEvents(activeVenue.id, 4);
            if (events.length > 0) {
                setNextEvent(events[0]);
                // Find first non-cancelled event
                const active = events.find(e => !e.isCancelled);
                setNextActiveEvent(active || null);
            }
        };
        checkSchedule();
    }, [activeVenue?.id]);

    if (!activeVenue) return null; // Should wait for loading in parent

    const getDayName = (d: number) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[d] || '';
    };

    return (
        <section id="venue" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">

                {/* Main Card Container */}
                <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 md:p-12 border border-gray-100 relative">

                    {/* 0. Header */}
                    <h2 className="text-3xl font-bold text-center text-[#F97316] mb-8 font-heading">
                        Event Details
                    </h2>

                    {/* Venue Tabs */}
                    <div className="flex justify-center mb-10 overflow-x-auto">
                        <div className="bg-gray-100 p-1.5 rounded-full inline-flex whitespace-nowrap">
                            {venues.map(venue => (
                                <button
                                    key={venue.id}
                                    onClick={() => onVenueChange(venue.id)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeVenueId === venue.id
                                        ? 'bg-white text-[#F97316] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {venue.name.split('(')[0].trim()} ({getDayName(venue.dayOfWeek)})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 1. Centered Location */}
                    <div className="text-center mb-12 animate-fadeIn key={activeVenueId}">

                        <h3 className="text-3xl md:text-3xl font-extrabold text-[#002B49] mb-4 font-heading px-4 whitespace-nowrap overflow-hidden text-ellipsis">
                            {activeVenue.name}
                        </h3>
                        <div className="text-gray-600 space-y-1">
                            <p className="font-bold text-sm">{activeVenue.description}</p>
                            <p className="text-xs text-black font-medium max-w-md mx-auto">{activeVenue.address}</p>
                        </div>
                        <div className="mt-8 border-b border-gray-100 w-full max-w-[200px] mx-auto"></div>
                    </div>

                    {/* 2. Info Cards (Time & Fee) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fadeIn key={activeVenueId + '-info'}">
                        {/* Time Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                            <div className="text-[#F97316] font-bold uppercase text-xs mb-3 flex justify-center items-center gap-1">
                                <span>🕖</span> Time
                            </div>
                            <p className="text-gray-700 font-bold text-sm mb-1">{activeVenue.time}</p>
                            <p className="text-gray-400 text-[10px]">(Come and go as you please)</p>
                        </div>

                        {/* Fee Card */}
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 relative group">
                            <div className="text-[#F97316] font-bold uppercase text-xs mb-3 flex justify-center items-center gap-1">
                                Entrance Fee
                                {activeVenue.id === 'mercy' && (
                                    <div className="relative inline-block">
                                        <span className="text-[10px] border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-gray-400 cursor-help hover:text-primary hover:border-primary transition-colors">i</span>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-left">
                                            <div className="font-bold mb-1 border-b border-gray-700 pb-1">How the fee is used:</div>
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    <span className="bg-blue-500 text-white w-3 h-3 rounded text-[8px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                                    <span>Venue, Tea & Snacks</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="bg-blue-500 text-white w-3 h-3 rounded text-[8px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                                    <span>Board Games & Tools</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="bg-blue-500 text-white w-3 h-3 rounded text-[8px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                                    <span>Support for Table Hosts</span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 font-bold text-sm mb-1">{activeVenue.fee}</p>
                            <p className="text-gray-400 text-[10px] mb-1">{activeVenue.feeNote}</p>
                            <p className="text-[#F97316] font-bold text-[10px]">Please pay at the front desk.</p>
                        </div>
                    </div>

                    {/* 3. Important Info (Orange Box) */}
                    <div className="bg-[#FFF9F0] rounded-2xl p-8 border border-orange-100 mb-12 text-center text-[#F97316] animate-fadeIn key={activeVenueId + '-notes'}">
                        <div className="text-[#F97316] font-bold text-xl mb-6 flex justify-center items-center gap-2">
                            <span className="text-2xl">⚠️</span> Important Info
                        </div>
                        <ul className="text-left text-gray-700 space-y-3 leading-relaxed text-sm md:text-base max-w-lg mx-auto list-disc pl-5 marker:text-[#F97316]">
                            {/* Cancellation Warning */}
                            {nextEvent?.isCancelled && (
                                <li className="font-bold text-red-500">
                                    NOTICE: Event on {nextEvent.date} is CANCELLED. ({nextEvent.note})
                                </li>
                            )}
                            {activeVenue.importantInfo.map((info, idx) => (
                                <li key={idx}>{info}</li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Map (Conditionally Rendered) */}
                    {activeVenue.mapType === 'mercy' && (
                        <div className="text-center mb-10 text-[#F97316] animate-fadeIn">
                            <div className="flex items-center justify-center gap-2 font-bold tracking-wide uppercase text-xl mb-6 text-black">
                                <span>📍</span> VENUE MAP
                            </div>

                            {/* Mercy Map Container */}
                            <div className="mx-auto max-w-[420px] bg-[#FFF9F0] rounded-3xl border-2 border-[#002B49] p-4 md:p-8 pb-14 relative shadow-lg">
                                {/* Inner Room Line */}
                                <div className="absolute inset-x-4 md:inset-x-6 inset-t-6 bottom-[56px] border-2 border-[#002B49] rounded-xl pointer-events-none"></div>

                                {/* Front Desk - Top Right */}
                                <div className="absolute top-0 right-[5%] w-[120px] md:w-[140px] h-8 bg-[#1F2937] rounded-b-lg flex items-center justify-center z-20 shadow-md">
                                    <span className="text-white font-bold text-xs">Front Desk</span>
                                </div>

                                {/* Door Gap Mask */}
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 w-20 h-2 bg-[#FFF9F0] z-10"></div>

                                {/* tick marks */}
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 -ml-10 w-[2px] h-3 bg-[#002B49]"></div>
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 ml-10 w-[2px] h-3 bg-[#002B49]"></div>

                                <div className="relative h-[450px] w-full mt-6">
                                    {/* Card Games Top Left */}
                                    <div className="absolute top-[5%] left-2 md:left-[5%] w-[70px] md:w-[80px] h-[140px] bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-xs md:text-sm leading-tight">Card<br />Games<br />Table</span>
                                    </div>
                                    {/* Japanese Top Right */}
                                    <div className="absolute top-[7%] right-2 md:right-[5%] w-[120px] md:w-[140px] h-[80px] bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-xs md:text-sm leading-tight">Japanese<br />Table</span>
                                    </div>
                                    {/* Reserved Bottom Left */}
                                    <div className="absolute bottom-[10%] left-2 md:left-[5%] w-[70px] md:w-[80px] h-[120px] bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-xs md:text-sm leading-tight">Reserved</span>
                                    </div>
                                    {/* Free Talk Bottom Right */}
                                    <div className="absolute bottom-[10%] right-2 md:right-[5%] w-[70px] md:w-[80px] h-[160px] bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-xs md:text-sm leading-tight">Free Talk<br />Table</span>
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#002B49] font-bold text-base whitespace-nowrap">
                                    Front Door
                                </div>
                            </div>
                        </div>
                    )}

                    {activeVenue.mapType === 't2' && (
                        <div className="text-center mb-10 text-[#F97316] animate-fadeIn">
                            <div className="flex items-center justify-center gap-2 font-bold tracking-wide uppercase text-xl mb-6 text-black">
                                <span>📍</span> VENUE MAP
                            </div>

                            {/* T2 Map Container - Custom Layout */}
                            <div className="mx-auto max-w-[420px] bg-[#FFF9F0] rounded-3xl border-2 border-[#002B49] p-8 pb-14 relative shadow-lg">
                                {/* Inner Room Line */}
                                <div className="absolute inset-x-6 inset-t-6 bottom-[56px] border-2 border-[#002B49] rounded-xl pointer-events-none"></div>

                                {/* Front Desk (Top Right) */}
                                <div className="absolute top-0 right-[5%] w-[140px] h-8 bg-[#1F2937] rounded-b-lg flex items-center justify-center z-20 shadow-md">
                                    <span className="text-white font-bold text-xs">Front Desk</span>
                                </div>

                                {/* Door Gap Mask */}
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 w-20 h-2 bg-[#FFF9F0] z-10"></div>

                                {/* tick marks */}
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 -ml-10 w-[2px] h-3 bg-[#002B49]"></div>
                                <div className="absolute bottom-[54px] left-1/2 transform -translate-x-1/2 ml-10 w-[2px] h-3 bg-[#002B49]"></div>

                                <div className="relative h-[450px] w-full mt-6">
                                    {/* Board Games (Top Left) */}
                                    <div className="absolute top-4 left-2 w-32 h-48 bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-sm leading-tight">Board<br />Games<br />Table</span>
                                    </div>

                                    {/* Free Talk (Bottom Left) */}
                                    <div className="absolute bottom-4 left-2 w-32 h-44 bg-[#FFF0E0] border-2 border-[#F97316] rounded-2xl flex items-center justify-center p-2 text-center shadow-sm z-10">
                                        <span className="text-[#1F2937] font-bold text-sm leading-tight">Free Talk<br />Table</span>
                                    </div>
                                </div>

                                {/* Label */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#002B49] font-bold text-base whitespace-nowrap">
                                    Front Door
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. Bottom CTA */}
                    <div id="join-cta" className="text-center space-y-6 pt-4 border-t border-gray-100">
                        {/* Cancellation Warning */}
                        {nextEvent?.isCancelled && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
                                <p className="text-red-600 font-bold text-lg mb-1">
                                    ⚠️ Next Meetup Cancelled ({nextEvent.date})
                                </p>
                                <p className="text-red-500 text-sm">
                                    {nextEvent.note || "Please check the schedule for the next available date."}
                                </p>
                            </div>
                        )}

                        {/* Ticker & Button */}
                        {/* Use nextActiveEvent or nextEvent (if active) */}
                        <RegistrantTicker theme="light" venueId={activeVenueId} />

                        {(nextActiveEvent || (!nextEvent?.isCancelled && nextEvent)) ? (
                            <button
                                onClick={onJoinClick}
                                className="bg-[#F97316] hover:bg-[#EA580C] text-white text-base md:text-lg font-bold py-3 px-12 rounded-full shadow-lg hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-300 w-full md:w-auto"
                            >
                                Join {nextEvent?.isCancelled ? `Next Available (${nextActiveEvent?.date.slice(5)})` : `Next Meetup (${activeVenue.dayOfWeek === 4 ? 'Thu' : 'Fri'})`}
                            </button>
                        ) : (
                            <button
                                disabled
                                className="bg-gray-300 text-white text-lg font-bold py-3 px-12 rounded-full cursor-not-allowed w-full md:w-auto"
                            >
                                No Upcoming Events
                            </button>
                        )}

                        {/* Secondary Link */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 text-gray-500 underline text-sm hover:text-gray-700 block mx-auto"
                        >
                            Register for a different date
                        </button>
                    </div>
                </div>

            </div>
            <JoinModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialVenueId={activeVenueId}
                venues={venues} // Pass venues
            />
        </section >
    );
}
