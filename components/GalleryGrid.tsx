'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Lightbox from './Lightbox';

interface Photo {
    id: string;
    url: string;
    date: string;
    caption?: string;
}

interface Props {
    photos: Photo[];
    isAdmin: boolean;
}

const isVideo = (url: string) => {
    return /\.(mp4|webm|mov)$/i.test(url);
};

export default function GalleryGrid({ photos, isAdmin }: Props) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    const handleDelete = async (e: React.MouseEvent, id: string, url: string) => {
        e.stopPropagation(); // Prevent opening lightbox
        if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

        setDeletingId(id);
        try {
            const { error: dbError } = await supabase
                .from('gallery_photos')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            const filename = url.split('/').pop();
            if (filename) {
                await supabase.storage.from('gallery').remove([filename]);
            }

            router.refresh();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    // Helper: Group photos by date
    const groupedPhotos = photos.reduce((acc, photo) => {
        const date = photo.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(photo);
        return acc;
    }, {} as Record<string, Photo[]>);

    // Sort dates descending
    const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Prepare flat media list for Lightbox navigation
    const mediaList = photos.map(p => ({
        url: p.url,
        type: isVideo(p.url) ? 'video' : 'image'
    })) as { url: string; type: 'video' | 'image' }[];

    const openLightbox = (photoId: string) => {
        // Find index in the flat list
        const index = photos.findIndex(p => p.id === photoId);
        if (index !== -1) {
            setInitialIndex(index);
            setLightboxOpen(true);
        }
    };

    if (photos.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No photos or videos yet.</p>
                <p className="text-sm">Be the first to upload one!</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-12">
                {sortedDates.map((date) => (
                    <div key={date}>
                        {/* Date Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {new Date(date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h2>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>

                        {/* Grid for this Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {groupedPhotos[date].map((photo) => {
                                const video = isVideo(photo.url);
                                return (
                                    <div
                                        key={photo.id}
                                        onClick={() => openLightbox(photo.id)}
                                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="relative aspect-[4/3] w-full bg-black">
                                            {video ? (
                                                <video
                                                    src={photo.url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    playsInline
                                                    onMouseOver={e => (e.target as HTMLVideoElement).play()}
                                                    onMouseOut={e => {
                                                        const v = e.target as HTMLVideoElement;
                                                        v.pause();
                                                        v.currentTime = 0;
                                                    }}
                                                />
                                            ) : (
                                                <Image
                                                    src={photo.url}
                                                    alt={photo.caption || 'Event Media'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            )}

                                            {/* Video Icon Overlay */}
                                            {video && (
                                                <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm z-10 pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        </div>

                                        {/* Caption (Hidden in Grid, shown in Lightbox usually, but we keep structure) */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            {/* Date is redundant here since it's the header, maybe just caption */}
                                            <p className="text-xs opacity-90">{photo.caption}</p>
                                        </div>

                                        {/* Admin Delete Button */}
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => handleDelete(e, photo.id, photo.url)}
                                                disabled={deletingId === photo.id}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors z-20"
                                                title="Delete Item"
                                            >
                                                {deletingId === photo.id ? (
                                                    <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                media={mediaList}
                initialIndex={initialIndex}
            />
        </>
    );
}

