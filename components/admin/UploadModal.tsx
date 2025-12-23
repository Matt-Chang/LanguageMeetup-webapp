'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UploadModal({ onClose }: { onClose: () => void }) {
    const [files, setFiles] = useState<FileList | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const router = useRouter();

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No context');

                    const MAX_SIZE = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject('Compression failed');
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0) return;

        setLoading(true);
        setProgress(0);

        try {
            const total = files.length;
            let successCount = 0;

            for (let i = 0; i < total; i++) {
                const file = files[i];
                const isVideo = file.type.startsWith('video');

                // 1. Prepare File
                let fileToUpload: File | Blob = file;
                let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                let type = file.type;

                if (!isVideo && file.type.startsWith('image')) {
                    // Compress images only
                    try {
                        fileToUpload = await compressImage(file);
                        ext = 'jpg';
                        type = 'image/jpeg';
                    } catch (e) {
                        console.warn('Compression skipped for', file.name, e);
                    }
                }

                const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

                // 2. Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(filename, fileToUpload, {
                        contentType: type,
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                // 3. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(filename);

                // 4. Insert to Database
                const { error: dbError } = await supabase
                    .from('gallery_photos')
                    .insert([{
                        url: publicUrl,
                        date: date,
                        caption: isVideo ? 'Video' : 'Community Photo'
                    }]);

                if (dbError) throw dbError;

                successCount++;
                setProgress(Math.round(((i + 1) / total) * 100));
            }

            // Finished
            alert(`Successfully uploaded ${successCount} items!`);
            router.refresh();
            onClose();

        } catch (err: any) {
            console.error('Upload failed', err);
            alert('Upload error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-heading text-gray-800">Add Media</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Photos or Videos</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-primary
                hover:file:bg-orange-100 cursor-pointer"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Photos will be optimized. Videos uploaded as-is.
                            {files && files.length > 0 && <span className="text-primary font-bold block mt-1">{files.length} files selected</span>}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Date Taken</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
              ${loading ? 'bg-gray-400 cursor-wait' : 'bg-primary hover:bg-primary-dark hover:scale-[1.02]'}`}
                    >
                        {loading ? `Uploading... ${progress}%` : 'Upload Media'}
                    </button>
                </form>
            </div>
        </div>
    );
}

