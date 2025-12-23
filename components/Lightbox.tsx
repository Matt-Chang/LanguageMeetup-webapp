'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    media: {
        url: string;
        type: 'image' | 'video';
    }[];
    initialIndex: number;
}

export default function Lightbox({ isOpen, onClose, media, initialIndex }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    if (!isOpen) return null;

    const currentItem = media[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Navigation Buttons */}
            {media.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Main Content */}
            <div className="w-full h-full p-4 md:p-10 flex items-center justify-center" onClick={onClose}>
                <div
                    className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {currentItem.type === 'video' ? (
                        <video
                            src={currentItem.url}
                            controls
                            autoPlay
                            className="max-h-[85vh] max-w-full shadow-2xl rounded-lg"
                        />
                    ) : (
                        <div className="relative w-full h-full">
                            <Image
                                src={currentItem.url}
                                alt="Gallery View"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-mono text-sm bg-black/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {media.length}
            </div>
        </div>
    );
}
