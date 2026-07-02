import { createClient } from '@/lib/supabaseServer';
import LandingPageContent from '@/components/LandingPageContent';
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
        images: ['/landing-cover.jpg'],
        url: 'https://wordsbydebangan.com',
        siteName: title,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Bengali Poetry & Verses`,
        description,
        images: ['/landing-cover.jpg'],
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
    <LandingPageContent settings={settings} />
  );
}
