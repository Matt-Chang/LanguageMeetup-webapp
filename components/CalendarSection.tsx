'use client';

import { useEffect, useState } from 'react';
import { getEventsForMonth, EventStatus } from '../lib/schedule';

interface CalendarSectionProps {
    onVenueSelect: (id: 'mercy' | 't2') => void;
}

export default function CalendarSection({ onVenueSelect }: CalendarSectionProps) {
    const [currentDate, setCurrentDate] = useState(new Date()); // Tracks the month we are viewing
    const [events, setEvents] = useState<EventStatus[]>([]);
    const [loading, setLoading] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Fetch events when month changes
    useEffect(() => {
        const fetchMonth = async () => {
            setLoading(true);
            try {
                const data = await getEventsForMonth(year, month);
                setEvents(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMonth();
    }, [year, month]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    // Calendar Generation Logic
    const getCalendarDays = () => {
        const days = [];
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Days from prev month to fill row
        const startDay = firstDayOfMonth.getDay(); // 0=Sun
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null }); // Filler
        }

        // Actual days
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            // Find event(s) for this day
            const dayEvents = events.filter(e => e.date === dateStr);
            days.push({ day: i, dateStr, events: dayEvents });
        }

        return days;
    };

    const calendarDays = getCalendarDays();
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <section className="py-20 bg-white" id="calendar">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading">
                        Event Calendar
                    </h2>
                    <p className="text-gray-600">
                        Plan your visit! Click on an event to see details.
                    </p>
                </div>

                {/* Calendar Container */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 bg-[#FFF9F0] border-b border-orange-100">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 rounded-full hover:bg-white text-gray-600 hover:text-[#F97316] transition-colors"
                        >
                            ◀ Prev
                        </button>
                        <h3 className="text-2xl font-bold text-gray-800 font-heading tracking-wide">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 rounded-full hover:bg-white text-gray-600 hover:text-[#F97316] transition-colors"
                        >
                            Next ▶
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-[1px]">
                        {calendarDays.map((cell, idx) => {
                            if (!cell.day) {
                                return <div key={idx} className="bg-white min-h-[100px] md:min-h-[140px]"></div>;
                            }

                            const isToday = new Date().toISOString().split('T')[0] === cell.dateStr;

                            return (
                                <div key={idx} className={`bg-white min-h-[100px] md:min-h-[140px] p-2 flex flex-col relative group transition-colors hover:bg-gray-50`}>
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2
                                        ${isToday ? 'bg-[#F97316] text-white' : 'text-gray-400 group-hover:text-gray-700'}
                                    `}>
                                        {cell.day}
                                    </span>

                                    <div className="space-y-1 overflow-y-auto max-h-[80px] md:max-h-[100px] custom-scrollbar">
                                        {cell.events.map(ev => (
                                            <div
                                                key={ev.venueId}
                                                className={`text-[9px] md:text-xs p-1 md:p-1.5 rounded-md border leading-tight transition-all
                                                    ${ev.isCancelled
                                                        ? 'bg-red-50 border-red-100 text-red-500 line-through opacity-70'
                                                        : 'bg-orange-50 border-orange-100 text-orange-800 hover:shadow-md cursor-pointer hover:scale-[1.02]'
                                                    }
                                                `}
                                                title={ev.note || (ev.isCancelled ? 'Cancelled' : 'Available')}
                                                onClick={() => !ev.isCancelled && onVenueSelect(ev.venueId as 'mercy' | 't2')}
                                            >
                                                <div className="font-bold truncate">
                                                    {ev.venueName.replace('Mercy Café', 'Mercy').replace('T2 Café', 'T2')}
                                                </div>
                                                {ev.isCancelled && (
                                                    <div className="text-[8px] font-bold mt-0.5 no-underline">CANCELLED</div>
                                                )}
                                                {!ev.isCancelled && (
                                                    <div className="text-[8px] md:text-[9px] opacity-80 mt-0.5 transform">{ev.venueId === 'mercy' ? '7 PM' : '6 PM'}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Loading Overlay for month transition (optional visual) */}
                                    {loading && <div className="absolute inset-0 bg-white/50 z-10"></div>}
                                </div>
                            );
                        })}
                        {/* Fill remaining empty cells for visual completeness if needed, currently CSS grid handles it well enough */}
                    </div>
                </div>
            </div>
        </section>
    );
}
