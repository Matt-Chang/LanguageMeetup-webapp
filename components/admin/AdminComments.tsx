'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TABLE_DISPLAY_NAMES } from '../../lib/venues';

interface Comment {
    id: string;
    user_name: string;
    message: string;
    attended_date: string;
    table_type: string;
    comment_type: string;
    created_at: string;
}

export default function AdminComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            alert('Failed to fetch comments');
        } else {
            setComments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, []);

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">💬 User Comments & Feedback</h2>
                <button
                    onClick={fetchComments}
                    className="text-primary hover:text-primary-dark text-sm font-bold"
                >
                    ↻ Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No comments found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="p-3">Received</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Attended</th>
                                <th className="p-3">Table</th>
                                <th className="p-3 w-1/3">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {comments.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors align-top">
                                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(c.created_at)}
                                    </td>
                                    <td className="p-3 font-bold text-gray-700 whitespace-nowrap">
                                        {c.user_name}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap
                                            ${c.comment_type === 'Thank You Note' ? 'bg-green-100 text-green-700' :
                                                c.comment_type === 'Improvement' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                            {c.comment_type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600 whitespace-nowrap">
                                        {c.attended_date}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600 whitespace-nowrap">
                                        {TABLE_DISPLAY_NAMES[c.table_type] || c.table_type}
                                    </td>
                                    <td className="p-3 text-sm text-gray-600 italic">
                                        "{c.message}"
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
