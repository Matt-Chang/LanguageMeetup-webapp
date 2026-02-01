'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TABLE_DISPLAY_NAMES } from '../lib/venues';
import CommentModal from './CommentModal';

interface Comment {
    id: string;
    user_name: string;
    message: string;
    attended_date: string;
    table_type: string;
    created_at: string;
}

export default function TestimonialsSection() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('comment_type', 'Thank You Note')
                .order('created_at', { ascending: false })
                .limit(6);

            if (data) setComments(data);
            setLoading(false);
        };

        fetchComments();
    }, []);

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <section className="py-16 bg-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading">
                        What People Say About Us
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Stories from our community members.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : comments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                <div className="text-primary text-4xl font-serif leading-none mb-4 opacity-30">"</div>
                                <p className="text-gray-700 italic mb-6 flex-grow whitespace-pre-line text-sm md:text-base">
                                    {comment.message}
                                </p>
                                <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-end">
                                    <div>
                                        <div className="font-bold text-gray-800">{comment.user_name}</div>
                                        <div className="text-xs text-blue-500 font-medium">{TABLE_DISPLAY_NAMES[comment.table_type] || comment.table_type}</div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {formatDate(comment.attended_date)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-2xl mb-12">
                        No testimonials yet. Be the first to share your story!
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-full transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                    >
                        ✍️ Leave a Comment
                    </button>
                </div>
            </div>

            <CommentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
}
