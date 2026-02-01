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
    const [allComments, setAllComments] = useState<Comment[]>([]);
    const [displayedComments, setDisplayedComments] = useState<Comment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchComments = async () => {
            // Fetch more than we need so we can randomize a bit
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('comment_type', 'Thank You Note')
                .order('created_at', { ascending: false })
                .limit(30);

            if (data) {
                setAllComments(data);
                // Initial shuffle
                setDisplayedComments(getRandomComments(data, 6));
            }
            setLoading(false);
        };

        fetchComments();
    }, []);

    // Auto-refresh every 3 seconds
    useEffect(() => {
        if (allComments.length <= 6) return; // No need to shuffle if we don't have enough

        const interval = setInterval(() => {
            setDisplayedComments(getRandomComments(allComments, 6));
        }, 3000);

        return () => clearInterval(interval);
    }, [allComments]);

    const getRandomComments = (pool: Comment[], count: number) => {
        if (!pool || pool.length === 0) return [];
        // Create a copy to sort
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <section className="py-20 relative overflow-hidden bg-gradient-to-br from-orange-50/50 via-white to-blue-50/50">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

            {/* Floating Orbs for style */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 font-heading inline-block relative">
                        What People Say About Us
                        <span className="block h-2 w-full bg-gradient-to-r from-orange-400 to-red-400 mt-2 rounded-full transform -rotate-1 opacity-80"></span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Real stories from our language learning community.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : displayedComments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 min-h-[400px]">
                        {displayedComments.map((comment) => (
                            <div key={comment.id} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col group hover:-translate-y-1">
                                <div className="text-orange-400 text-5xl font-serif leading-none mb-6 opacity-40 group-hover:scale-110 transition-transform origin-top-left">"</div>
                                <p className="text-gray-700 italic mb-8 flex-grow whitespace-pre-line text-lg leading-relaxed">
                                    {comment.message}
                                </p>
                                <div className="mt-auto border-t border-gray-100 pt-6 flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-lg">{comment.user_name}</span>
                                        <span className="text-xs font-semibold text-primary/80 uppercase tracking-widest mt-1">
                                            {TABLE_DISPLAY_NAMES[comment.table_type] || comment.table_type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">
                                        {formatDate(comment.attended_date)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400 italic bg-white/50 rounded-3xl border border-dashed border-gray-300 mb-12 backdrop-blur-sm">
                        No testimonials yet. Be the first to share your story!
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary font-heading rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Tell us what you think
                        <span className="ml-2 transition-transform group-hover:rotate-12">👋</span>
                    </button>
                </div>
            </div>

            <CommentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
}
