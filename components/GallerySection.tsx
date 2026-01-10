'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function GallerySection() {
    return (
        <section id="gallery" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-heading border-b-4 border-primary inline-block pb-2">
                        Our Moments
                    </h2>
                    <p className="text-gray-600">
                        See what our meetups look like.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        '/assets/group1.jpg',
                        '/assets/group2.jpg',
                        '/assets/group3.jpg',
                    ].map((src, index) => (
                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                            <Image
                                src={src}
                                alt={`Hsinchu Language Meetup Moment ${index + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105"
                    >
                        View Full Gallery <span>→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
