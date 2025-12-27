'use client';

import { useState, useEffect } from 'react';
import { getTablesWithVenues, createTable, updateTable, deleteTable, TableWrapper } from '../../lib/tables';
import { getVenues } from '../../lib/data/venues';
import { Venue } from '../../lib/venues';

export default function AdminTables() {
    const [tables, setTables] = useState<TableWrapper[]>([]);
    const [venuesList, setVenuesList] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [getError, setGetError] = useState('');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TableWrapper>({
        id: '',
        title: '',
        description: '',
        icon: '',
        level_label: 'All Levels',
        level_color_bg: 'bg-green-100',
        level_color_text: 'text-green-700',
        sort_order: 0,
        venues: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [tablesData, venuesData] = await Promise.all([
                getTablesWithVenues(),
                getVenues()
            ]);
            setTables(tablesData);
            setVenuesList(venuesData);
        } catch (err) {
            console.error("Failed to load data", err);
            setGetError("Failed to load tables or venues.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            id: '',
            title: '',
            description: '',
            icon: '',
            level_label: 'All Levels',
            level_color_bg: 'bg-green-100',
            level_color_text: 'text-green-700',
            sort_order: tables.length + 1,
            venues: []
        });
        setIsModalOpen(false);
    };

    const handleEdit = (table: TableWrapper) => {
        setEditingId(table.id);
        setFormData({ ...table });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this table? This action affects the public site immediately.')) return;

        try {
            await deleteTable(id);
            loadData(); // Reload both to be safe
        } catch (err) {
            alert('Failed to delete table');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateTable(editingId, formData);
            } else {
                await createTable(formData);
            }
            resetForm();
            loadData();
        } catch (err) {
            console.error(err);
            alert('Failed to save table');
        }
    };

    const toggleVenue = (venueId: string) => {
        setFormData(prev => {
            const exists = prev.venues.includes(venueId);
            if (exists) {
                return { ...prev, venues: prev.venues.filter(v => v !== venueId) };
            } else {
                return { ...prev, venues: [...prev.venues, venueId] };
            }
        });
    };

    const getVenueName = (id: string) => {
        const v = venuesList.find(v => v.id === id);
        return v ? v.name : id;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage Tables</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    + Add New Table
                </button>
            </div>

            {isLoading && <div className="text-gray-500">Loading tables...</div>}
            {getError && <div className="text-red-500">{getError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map(table => (
                    <div key={table.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group bg-gray-50">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(table)} className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200 hover:text-primary">
                                ✏️
                            </button>
                            <button onClick={() => handleDelete(table.id)} className="bg-white p-1.5 rounded-md shadow-sm border border-gray-200 hover:text-red-600">
                                🗑️
                            </button>
                        </div>

                        <div className="text-3xl mb-3">{table.icon}</div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{table.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden line-clamp-2">{table.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${table.level_color_bg} ${table.level_color_text}`}>
                                {table.level_label}
                            </span>
                        </div>

                        <div className="border-t pt-3 flex flex-wrap gap-1">
                            {table.venues.map(vId => (
                                <span key={vId} className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                    {getVenueName(vId)}
                                </span>
                            ))}
                            {table.venues.length === 0 && <span className="text-xs text-red-400 italic">No venues linked</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Table' : 'New Table'}</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ID (Slug)</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={!!editingId}
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                                        placeholder="e.g. board-game"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Unique ID, cannot verify if changed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-[80px_1fr] gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Icon</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-center text-xl"
                                        placeholder="☕"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="e.g. English Free Talk"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 h-20"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Level Label</label>
                                    <input
                                        type="text"
                                        value={formData.level_label}
                                        onChange={e => setFormData({ ...formData, level_label: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Color (BG)</label>
                                    <input
                                        type="text"
                                        value={formData.level_color_bg}
                                        onChange={e => setFormData({ ...formData, level_color_bg: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        placeholder="bg-green-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Color (Text)</label>
                                    <input
                                        type="text"
                                        value={formData.level_color_text}
                                        onChange={e => setFormData({ ...formData, level_color_text: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        placeholder="text-green-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Available Venues</label>
                                <div className="flex flex-wrap gap-2">
                                    {venuesList.map(venue => (
                                        <label key={venue.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${formData.venues.includes(venue.id) ? 'bg-primary/10 border-primary text-primary font-bold' : 'border-gray-200 text-gray-500'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.venues.includes(venue.id)}
                                                onChange={() => toggleVenue(venue.id)}
                                            />
                                            {venue.name}
                                        </label>
                                    ))}
                                    {venuesList.length === 0 && <p className="text-gray-500 text-sm">No venues created. Go to Venues tab to add one.</p>}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-md">
                                    {editingId ? 'Save Changes' : 'Create Table'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
