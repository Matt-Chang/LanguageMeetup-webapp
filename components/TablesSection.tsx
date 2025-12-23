'use client';

import { useState, useEffect } from 'react';
import { VENUES } from '../lib/venues';
import { getTablesWithVenues, TableWrapper } from '../lib/tables';

interface TablesSectionProps {
    onVenueSelect: (id: 'mercy' | 't2') => void;
}

export default function TablesSection({ onVenueSelect }: TablesSectionProps) {
    const [tables, setTables] = useState<TableWrapper[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [availableVenues, setAvailableVenues] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getTablesWithVenues();
                setTables(data);
            } catch (err) {
                console.error("Failed to load tables", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleTableClick = (table: TableWrapper) => {
        setSelectedTable(table.id);
        setIsModalOpen(true);

        // Filter venues based on table.venues (IDs)
        const filtered = Object.values(VENUES).filter(venue =>
            table.venues.includes(venue.id)
        );
        setAvailableVenues(filtered);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    const handleVenueClick = (venueId: string) => {
        onVenueSelect(venueId as 'mercy' | 't2');
        closeModal();
    };

    return (
        <section id="tables" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading border-b-4 border-primary inline-block pb-2">
                        Our Tables
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Choose your topic. Click to see where it's available.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {tables.map(table => (
                            <div
                                key={table.id}
                                onClick={() => handleTableClick(table)}
                                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center cursor-pointer group relative
                                    ${table.id === 'board-game' ? 'border-purple-100' : ''}`}
                            >
                                <div className={`text-4xl mb-6 group-hover:scale-110 transition-transform duration-300
                                     ${table.id === 'board-game' ? 'w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12' : ''}`}>
                                    {table.icon}
                                </div>
                                <h3 className={`text-xl font-bold text-gray-800 mb-3 ${table.id === 'board-game' ? 'font-heading text-2xl' : ''}`}>
                                    {table.title}
                                </h3>
                                <p className="text-gray-600 mb-6 flex-grow whitespace-pre-line text-sm md:text-base leading-relaxed">
                                    {table.description}
                                </p>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${table.level_color_bg} ${table.level_color_text}`}>
                                    {table.level_label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Venue List Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fadeInUp">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Available Locations</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {availableVenues.length > 0 ? (
                                <div className="space-y-3">
                                    {availableVenues.map((venue) => (
                                        <button
                                            key={venue.id}
                                            onClick={() => handleVenueClick(venue.id)}
                                            className="w-full text-left p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/50 hover:shadow-md hover:bg-orange-50/30 transition-all duration-200 flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold text-sm px-2 py-0.5 rounded text-white ${venue.id === 'mercy' ? 'bg-[#F97316]' : 'bg-[#002B49]'}`}>
                                                        {venue.id === 'mercy' ? 'Mercy' : 'T2'}
                                                    </span>
                                                    <span className="font-bold text-gray-800 px-1">{venue.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 pl-1">{venue.time}</div>
                                            </div>
                                            <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm">
                                                View Details →
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No venues currently hosting this table.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
