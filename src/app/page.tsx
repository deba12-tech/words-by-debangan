import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import { BookIcon } from '@/components/HandmadeIcons';
import { SiteSettings } from '@/lib/supabaseServer';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: settingsArray } = await supabase
      .from('site_settings')
      .select('site_title, author_bio')
      .eq('id', 1);

    const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null;
    const title = settings?.site_title || 'Words by Debangan';
    const description = settings?.author_bio || 'Bengali poet and writer. A collection of verses from the heart.';

    return {
      title: `${title} | Bengali Poetry & Verses`,
      description,
      openGraph: {
        title: `${title} | Bengali Poetry & Verses`,
        description,
        images: ['/book-cover.jpg'],
        url: 'https://wordsbydebangan.com',
        siteName: title,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Bengali Poetry & Verses`,
        description,
        images: ['/book-cover.jpg'],
      },
    };
  } catch (error) {
    return {
      title: 'Words by Debangan | Bengali Poetry & Verses',
      description: 'Bengali poet and writer. A collection of verses from the heart.',
    };
  }
}

export default async function Home() {
  const supabase = await createClient();
  const { data: settingsArray } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1);

  const defaultSettings: SiteSettings = {
    id: 1,
    site_title: 'Words by Debangan',
    author_name: 'Debangan',
    author_bio: 'Bengali poet and writer. A collection of verses from the heart.',
    author_avatar_url: null,
    cover_image_url: null,
    default_theme: 'sepia',
    updated_at: new Date().toISOString(),
  };

  const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : defaultSettings;

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture transition-all duration-500 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Decorative borders */}
      <div className="absolute inset-4 md:inset-8 border border-current/10 rounded-lg pointer-events-none" />
      
      <div className="absolute top-10 left-10 text-xs tracking-widest text-secondary-theme uppercase font-sans select-none">
        WORDS BY DEBANGAN
      </div>
      
      <div className="absolute top-10 right-10 select-none z-20">
        <Link href="/admin/login" className="text-xs tracking-wider text-secondary-theme hover:text-amber-800 transition font-sans underline">
          Admin CRM
        </Link>
      </div>

      <main className="z-10 max-w-md w-full flex flex-col items-center text-center">
        
        {/* Physical Book Cover Card */}
        <div 
          style={{ 
            backgroundImage: "url('/book-cover.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "28% center"
          }}
          className="w-[280px] h-[380px] md:w-[320px] md:h-[440px] border-[12px] border-amber-950/15 rounded-r-2xl shadow-2xl relative flex flex-col justify-end p-6 mb-12 transform hover:scale-[1.02] transition-transform duration-500 select-none"
        >
          {/* Spine simulation */}
          <div className="absolute top-0 bottom-0 left-[-12px] w-2.5 bg-gradient-to-r from-amber-950/45 to-transparent pointer-events-none" />
          <div className="absolute inset-2 border border-[#B5945B]/25 rounded pointer-events-none" />
        </div>

        {/* Bio Text */}
        <p className="text-sm md:text-base italic text-secondary-theme leading-relaxed font-sans max-w-sm mb-10 px-4">
          "{settings.author_bio || 'কবিতা আমার হৃদয়ের স্পন্দন, নীরবতার ক্যানভাসে আঁকা কিছু রঙিন শব্দচিত্র।'}"
        </p>

        {/* Call to Action: Premium 3D Book Button */}
        <Link 
          href="/book"
          className="px-8 py-3.5 bg-accent hover:bg-red-800 text-amber-50 rounded-full font-sans text-xs uppercase tracking-widest flex items-center gap-3 border border-red-950/20 transition-all duration-150 transform hover:translate-y-[-1px] active:translate-y-[4px] shadow-[0_5px_0_#4c0f1a] hover:shadow-[0_6px_0_#4c0f1a] active:shadow-[0_1px_0_#4c0f1a] cursor-pointer"
        >
          <BookIcon size={14} /> Open the Book
        </Link>
      </main>

      {/* Footer info */}
      <footer className="absolute bottom-8 text-center z-10 flex flex-col items-center gap-3">
        <a 
          href="https://www.instagram.com/words.by.debangan_?igsh=b3pwNGxtZ3B2ajJr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-secondary-theme hover:text-red-800 transition font-sans tracking-wide"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
          @words.by.debangan_
        </a>
        <p className="text-[10px] tracking-widest text-secondary-theme uppercase font-sans select-none">
          Designed for reading &bull; &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
