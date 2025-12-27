'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TABLE_LIMITS, TABLE_DISPLAY_NAMES, Venue } from '../lib/venues';
import { getUpcomingEvents, EventStatus } from '../lib/schedule';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialVenueId?: string; // Optional, defaults to 'mercy'
    venues: Venue[]; // Passed from parent
}

export default function JoinModal({ isOpen, onClose, initialVenueId, venues }: JoinModalProps) {
    // Determine active venue from prop or fallback (though prop should usually be provided)
    // We update this locally if we want to allow switching inside modal, but for now we stick to initial props logic
    const activeVenue = venues.find(v => v.id === initialVenueId) || venues[0];

    const [formData, setFormData] = useState({
        name: '',
        table: '',
        date: '',
        firstTime: false,
        language: '',
        otherLangRaw: '',
        marketingSource: '',
        otherSourceRaw: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tableCounts, setTableCounts] = useState<Record<string, number>>({});

    const LANGUAGES = ['Korean', 'Spanish', 'French', 'German', 'Chinese', 'Other'];
    const MARKETING_SOURCES = ['Facebook', 'Instagram', 'Threads', 'Friend', 'Other'];

    const [availableDates, setAvailableDates] = useState<EventStatus[]>([]);

    useEffect(() => {
        if (isOpen && activeVenue) {
            getUpcomingEvents(activeVenue.id, 6).then(events => {
                setAvailableDates(events);
                // Auto-select first available date if date is empty
                const firstAvailable = events.find(e => !e.isCancelled);
                if (firstAvailable && !formData.date) {
                    setFormData(prev => ({ ...prev, date: firstAvailable.date }));
                }
            });
        }
    }, [isOpen, activeVenue?.id]);

    // Fetch Counts
    useEffect(() => {
        if (isOpen && formData.date && activeVenue) {
            // Logic to reset other fields if needed, or just keep them
            fetchCounts(formData.date);
        }
    }, [isOpen, formData.date, activeVenue?.id]); // Re-run if modal opens or date changes

    // Update counts when date changes (if user manually changes date)
    useEffect(() => {
        if (formData.date && activeVenue) {
            fetchCounts(formData.date);
        }
    }, [formData.date, activeVenue?.id]);

    const fetchCounts = async (targetDate: string) => {
        if (!activeVenue) return;

        const { data, error } = await supabase
            .from('registrations')
            .select('table_type')
            .eq('event_date', targetDate);

        if (data) {
            const counts: Record<string, number> = {};
            // Initialize 0 for ALL known tables just in case, or just active venue tables?
            // Safer to init for active venue tables
            activeVenue.tables.forEach(t => counts[t] = 0);

            // Count
            data.forEach((row: any) => {
                if (row.table_type && counts[row.table_type] !== undefined) {
                    counts[row.table_type]++;
                } else if (row.table_type) {
                    // Handle edge case where table might exist in DB but not in current list
                    counts[row.table_type] = (counts[row.table_type] || 0) + 1;
                }
            });
            setTableCounts(counts);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.table) {
            alert("Please select a table.");
            return;
        }
        if (!formData.date) {
            alert("Please select a date.");
            return;
        }
        if (!activeVenue) return;

        setLoading(true);

        try {
            // 1. Check for Double Registration
            const { data: existing } = await supabase
                .from('registrations')
                .select('id')
                .eq('user_name', formData.name)
                .eq('event_date', formData.date);

            if (existing && existing.length > 0) {
                alert(`You have already registered for ${formData.date}!`);
                setLoading(false);
                return;
            }

            // 2. Prepare Source Strings
            let finalLanguage = formData.language;
            if (formData.language === 'Other') {
                finalLanguage = `Other: ${formData.otherLangRaw}`;
            }

            let finalSource = formData.marketingSource;
            if (formData.marketingSource === 'Other') {
                finalSource = `Other: ${formData.otherSourceRaw}`;
            }

            // 3. Insert (Include venue_id)
            const { error } = await supabase.from('registrations').insert([
                {
                    user_name: formData.name,
                    table_type: formData.table,
                    event_date: formData.date,
                    is_first_time: formData.firstTime,
                    language_goals: finalLanguage,
                    marketing_source: finalSource,
                    venue_id: activeVenue.id, // Add venue_id
                },
            ]);

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            console.error('Error inserting:', err);
            alert('Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !activeVenue) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-body">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative animate-fadeIn mx-auto my-auto h-auto max-h-[90vh] overflow-y-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
                >
                    &times;
                </button>

                <div className="p-8 md:p-10">
                    {success ? (
                        <div className="text-center py-10">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Confirmed!</h2>
                            <p className="text-gray-600 mb-6">
                                See you on <strong>{formData.date}</strong> at the <strong>{TABLE_DISPLAY_NAMES[formData.table]}</strong>
                                <br />
                                <span className="text-sm text-gray-400">({activeVenue.name})</span>
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-primary mb-2 font-heading">
                                Join Next Meetup
                            </h2>
                            <p className="text-gray-500 text-sm mb-1">
                                Reserve your spot for <strong>{activeVenue.name}</strong>!
                            </p>
                            <p className="text-xs text-gray-400 mb-8 uppercase tracking-wide font-bold">
                                {activeVenue.time}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* First Time Checkbox */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="first-time"
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                                        checked={formData.firstTime}
                                        onChange={(e) => setFormData({ ...formData, firstTime: e.target.checked })}
                                    />
                                    <label htmlFor="first-time" className="text-sm text-gray-700 cursor-pointer select-none">
                                        Is this your first time?
                                    </label>
                                </div>

                                {/* Table Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Select a Table</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white appearance-none text-gray-700 cursor-pointer"
                                            value={formData.table}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, table: val });
                                                if (val === 'it') {
                                                    alert("Please note that everyone is expected to share at least one thing related to IT news, skills, or research.");
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Choose a table...</option>
                                            {/* Map over Active Venue Tables ONLY */}
                                            {activeVenue.tables.map((key) => {
                                                const label = TABLE_DISPLAY_NAMES[key] || key;
                                                const limit = TABLE_LIMITS[key] || 10;
                                                const current = tableCounts[key] || 0;
                                                const left = Math.max(0, limit - current);
                                                const isFull = left === 0;

                                                return (
                                                    <option key={key} value={key} disabled={isFull}>
                                                        {label} (spot left this week: {left})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>

                                    {/* IT Table Warning */}
                                    {formData.table === 'it' && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 animate-fadeIn">
                                            ℹ️ Please note that everyone is expected to share at least one thing related to IT news, skills, or research.
                                        </div>
                                    )}
                                </div>

                                {/* Other Languages */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Other Interested Languages? <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white appearance-none text-gray-700 cursor-pointer"
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                        >
                                            <option value="">Select a language...</option>
                                            {LANGUAGES.map((lang) => (
                                                <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>

                                    {/* Conditional Other Input */}
                                    {formData.language === 'Other' && (
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 mt-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400 animate-fade-in-up"
                                            placeholder="Please specify..."
                                            value={formData.otherLangRaw}
                                            onChange={(e) => setFormData({ ...formData, otherLangRaw: e.target.value })}
                                        />
                                    )}
                                </div>

                                {/* Marketing Source (Only if First Time) */}
                                {formData.firstTime && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-bold text-gray-800 mb-2">How did you know about us?</label>
                                        <div className="relative">
                                            <select
                                                required={formData.firstTime}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white appearance-none text-gray-700 cursor-pointer"
                                                value={formData.marketingSource}
                                                onChange={(e) => setFormData({ ...formData, marketingSource: e.target.value })}
                                            >
                                                <option value="" disabled>Select an option...</option>
                                                {MARKETING_SOURCES.map((source) => (
                                                    <option key={source} value={source}>{source}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                            </div>
                                        </div>

                                        {/* Conditional Other Input */}
                                        {formData.marketingSource === 'Other' && (
                                            <input
                                                type="text"
                                                required={formData.firstTime}
                                                className="w-full px-4 py-3 mt-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400 animate-fade-in-up"
                                                placeholder="Please specify..."
                                                value={formData.otherSourceRaw}
                                                onChange={(e) => setFormData({ ...formData, otherSourceRaw: e.target.value })}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Date</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white appearance-none text-gray-700 cursor-pointer"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        >
                                            <option value="" disabled>Select a date...</option>
                                            {availableDates.map((event) => (
                                                <option
                                                    key={event.date}
                                                    value={event.date}
                                                    disabled={event.isCancelled}
                                                    className={event.isCancelled ? 'text-gray-400 bg-gray-100' : ''}
                                                >
                                                    {event.date} {event.isCancelled ? '(Cancelled)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                    {/* Show note for selected date if cancelled (though it shouldn't be selectable) */}
                                    {availableDates.find(e => e.date === formData.date)?.isCancelled && (
                                        <p className="text-xs text-red-500 mt-1 ml-1">
                                            This event is cancelled.
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 rounded-full font-bold text-lg text-white transition-all shadow-md mt-6
                    ${loading ? 'bg-gray-400 cursor-wait' : 'bg-[#F97316] hover:bg-[#EA580C] hover:shadow-xl transform hover:-translate-y-0.5'}`}
                                >
                                    {loading ? 'Submitting...' : 'Submit Registration'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
