'use client';

import { useState, useEffect } from 'react';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../../lib/data/venues';
import { Venue } from '../../lib/venues';

export default function AdminVenues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    // Initial Form State
    const initialFormState: Venue = {
        id: '',
        name: '',
        address: '',
        googleMapsLink: '',
        dayOfWeek: 4,
        time: '',
        fee: '',
        feeNote: '',
        description: '',
        tables: [],
        importantInfo: [],
        mapType: 'none',
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Venue>(initialFormState);

    // Helpers for array inputs
    const [tablesInput, setTablesInput] = useState('');
    const [infoInput, setInfoInput] = useState('');

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {
        setIsLoading(true);
        try {
            const data = await getVenues();
            setVenues(data);
        } catch (err) {
            console.error("Failed to load venues", err);
            setError("Failed to load venues.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setTablesInput('');
        setInfoInput('');
        setIsModalOpen(false);
        setError('');
    };

    const handleEdit = (venue: Venue) => {
        setEditingId(venue.id);
        setFormData({ ...venue });
        setTablesInput(venue.tables.join(', '));
        setInfoInput(venue.importantInfo.join('\n'));
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this venue? It will be removed from the website immediately.')) return;

        try {
            await deleteVenue(id);
            loadVenues();
        } catch (err) {
            alert('Failed to delete venue');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process inputs
        const processedData: Venue = {
            ...formData,
            tables: tablesInput.split(',').map(s => s.trim()).filter(Boolean),
            importantInfo: infoInput.split('\n').map(s => s.trim()).filter(Boolean)
        };

        try {
            if (editingId) {
                await updateVenue(processedData);
            } else {
                await createVenue(processedData);
            }
            resetForm();
            loadVenues();
        } catch (err) {
            console.error(err);
            alert('Failed to save venue');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage Venues</h2>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                    + Add New Venue
                </button>
            </div>

            {isLoading && <div className="text-gray-500">Loading venues...</div>}
            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 gap-6">
                {venues.map(venue => (
                    <div key={venue.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group bg-gray-50 flex flex-col md:flex-row gap-6">
                        <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-xl text-gray-800">{venue.name}</h3>
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded font-mono">{venue.id}</span>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${venue.dayOfWeek === 4 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {venue.dayOfWeek === 4 ? 'Thursday' : (venue.dayOfWeek === 5 ? 'Friday' : `Day ${venue.dayOfWeek}`)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">📍 {venue.address}</p>
                            <p className="text-sm text-gray-600 mb-1">🕒 {venue.time}</p>
                            <p className="text-sm text-gray-600">💵 {venue.fee}</p>
                        </div>

                        <div className="flex items-center gap-2 md:self-start opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(venue)} className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:text-primary font-medium">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(venue.id)} className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:text-red-600 font-medium">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Venue' : 'New Venue'}</h3>

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
                                        placeholder="e.g. t2"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Unique ID used in URL/code.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Display Name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Day of Week</label>
                                    <select
                                        value={formData.dayOfWeek}
                                        onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value={0}>Sunday</option>
                                        <option value={1}>Monday</option>
                                        <option value={2}>Tuesday</option>
                                        <option value={3}>Wednesday</option>
                                        <option value={4}>Thursday</option>
                                        <option value={5}>Friday</option>
                                        <option value={6}>Saturday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="e.g. 7:00 – 10:00 PM"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fee}
                                        onChange={e => setFormData({ ...formData, fee: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="e.g. NTD 150"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee Note</label>
                                    <input
                                        type="text"
                                        value={formData.feeNote}
                                        onChange={e => setFormData({ ...formData, feeNote: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Optional note"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Location/Chinese)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tables (comma separated IDs)</label>
                                <input
                                    type="text"
                                    value={tablesInput}
                                    onChange={e => setTablesInput(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="free-talk, it, board-game"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Important Info (one per line)</label>
                                <textarea
                                    value={infoInput}
                                    onChange={e => setInfoInput(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 h-24"
                                    placeholder="No outside food...&#10;Be polite..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Map Type</label>
                                <select
                                    value={formData.mapType}
                                    onChange={e => setFormData({ ...formData, mapType: e.target.value as any })}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="none">None</option>
                                    <option value="mercy">Mercy Map (Special)</option>
                                    <option value="t2">T2 Map (Special)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-md">
                                    {editingId ? 'Save Changes' : 'Create Venue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
