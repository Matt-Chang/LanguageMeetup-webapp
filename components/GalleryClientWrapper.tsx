'use client';

import { useState } from 'react';
import UploadModal from './admin/UploadModal';

export default function GalleryClientWrapper() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="mt-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                    <span>📸</span> Add New Photo
                </button>
            </div>

            {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
}
