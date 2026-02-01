'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TABLE_DISPLAY_NAMES } from '../lib/venues';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommentModal({ isOpen, onClose }: CommentModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        date: '',
        table: '',
        type: 'Thank You Note' // Default
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    user_name: formData.name,
                    message: formData.message,
                    attended_date: formData.date,
                    table_type: formData.table,
                    comment_type: formData.type
                });

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            alert('Failed to submit comment. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-body">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                    &times;
                </button>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">💌</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                            <p className="text-gray-600 mb-6">Your feedback has been received.</p>
                            <button
                                onClick={onClose}
                                className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-dark transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 font-heading">Leave a Comment</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Attended Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Table Attended</label>
                                    <select
                                        required
                                        value={formData.table}
                                        onChange={e => setFormData({ ...formData, table: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                                    >
                                        <option value="" disabled>Select a table...</option>
                                        {Object.entries(TABLE_DISPLAY_NAMES).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Comment Type</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none bg-white"
                                    >
                                        <option value="Thank You Note">Thank You Note</option>
                                        <option value="Improvement">Improvement Idea</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 outline-none"
                                        placeholder="What would you like to say?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all mt-2
                                        ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg'}`}
                                >
                                    {loading ? 'Submitting...' : 'Submit Comment'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
