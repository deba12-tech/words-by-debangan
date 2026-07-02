import { createClient } from '@/lib/supabaseServer';
import BookReader from '@/components/BookReader';
import { Collection, Poem, SiteSettings } from '@/lib/supabaseServer';
import type { Metadata } from 'next';

export const revalidate = 0; // Disable caching to ensure always showing fresh published poems

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: settingsArray } = await supabase
      .from('site_settings')
      .select('site_title, author_name')
      .eq('id', 1);

    const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null;
    const authorName = settings?.author_name || 'Debangan';
    const siteTitle = settings?.site_title || 'Words by Debangan';

    return {
      title: `The Book | ${siteTitle}`,
      description: `Read the published chapters and verses of ${authorName} inside the interactive digital book reader.`,
      openGraph: {
        title: `The Book | ${siteTitle}`,
        description: `Read the published chapters and verses of ${authorName} inside the interactive digital book reader.`,
        images: ['/book-cover.jpg'],
        url: 'https://wordsbydebangan.com/book',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `The Book | ${siteTitle}`,
        description: `Read the published chapters and verses of ${authorName} inside the interactive digital book reader.`,
        images: ['/book-cover.jpg'],
      },
    };
  } catch (error) {
    return {
      title: 'The Book | Words by Debangan',
      description: 'Read the published chapters and verses of Debangan inside the interactive digital book reader.',
    };
  }
}

export default async function BookPage() {
  const supabase = await createClient();

  // Fetch collections
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch published poems
  const { data: poems } = await supabase
    .from('poems')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch site settings
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
    <BookReader
      collections={collections || []}
      poems={poems || []}
      settings={settings}
    />
  );
}
