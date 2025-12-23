import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import GalleryGrid from '@/components/GalleryGrid';
import GalleryClientWrapper from '@/components/GalleryClientWrapper';

// Revalidate every minute so upload appears eventually even if not hard-refreshed, 
// though router.refresh() usually handles it.
export const revalidate = 60;

export default async function GalleryPage() {
    // 1. Check Admin Status
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const isAdmin = session?.value === 'true';

    // 2. Fetch Photos
    const { data: photos } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('date', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20">
            {/* Hero / Banner */}
            <div className="container mx-auto px-4 mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-4">
                    Our Past Meetups
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Capturing the smiles, conversations, and connections from our weekly Thursdays.
                </p>

                {/* Admin Controls */}
                {isAdmin && (
                    <GalleryClientWrapper />
                )}
            </div>

            <div className="container mx-auto px-4">
                <GalleryGrid photos={photos || []} isAdmin={isAdmin} />
            </div>
        </div>
    );
}
