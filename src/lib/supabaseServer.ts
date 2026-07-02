import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if middleware handles session refreshing
          }
        },
      },
    }
  );
}
export type SupabaseServerClient = ReturnType<typeof createClient>;
export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  background_texture: string | null;
  display_order: number;
  created_at: string;
};

export type Poem = {
  id: string;
  collection_id: string | null;
  title: string;
  slug: string;
  content: string;
  translation: string | null;
  display_order: number;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string;
  alignment: 'left' | 'center' | 'right';
  font_size: 'sm' | 'md' | 'lg' | 'xl';
  emphasis: 'normal' | 'italic' | 'bold';
  cover_image_url: string | null;
  background_texture: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  site_title: string;
  author_name: string;
  author_bio: string | null;
  author_avatar_url: string | null;
  cover_image_url: string | null;
  default_theme: 'light' | 'sepia' | 'dark';
  updated_at: string;
};
