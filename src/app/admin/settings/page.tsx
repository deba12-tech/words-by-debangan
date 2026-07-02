'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  StitchIcon, 
  SealIcon 
} from '@/components/HandmadeIcons';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [defaultTheme, setDefaultTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  
  // Non-blocking wax seal animation trigger state
  const [animateSeal, setAnimateSeal] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (data) {
          setSiteTitle(data.site_title);
          setAuthorName(data.author_name);
          setAuthorBio(data.author_bio || '');
          setDefaultTheme(data.default_theme);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Optimistic / Non-blocking visual feedback trigger
    setAnimateSeal(true);
    setTimeout(() => setAnimateSeal(false), 2000);

    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_title: siteTitle,
          author_name: authorName,
          author_bio: authorBio || null,
          default_theme: defaultTheme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture flex font-sans transition-colors duration-500">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto z-10 text-primary-theme">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-bengali text-secondary-theme letterpress-ink">গ্রন্থাগার বিবরণ ও রূপরেখা</h1>
          <p className="text-xs text-primary-theme/75 tracking-wider uppercase mt-1">Global Site configurations & parameters</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs tracking-widest uppercase text-secondary-theme/60">Reading configurations...</div>
        ) : (
          <div className="max-w-2xl card-theme rounded border shadow-sm p-6 relative">
            {/* Sewn margin decoration */}
            <div className="absolute left-6 top-6 bottom-6 ledger-stitch-line opacity-15 pointer-events-none" />
            
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary-theme mb-6 flex items-center gap-2 pl-6">
              <StitchIcon size={14} /> Book Metadata Settings
            </h2>

            <form onSubmit={handleSave} className="space-y-6 pl-6 relative">
              {/* Animated Wax Seal Overlay (shows on save, non-blocking) */}
              {animateSeal && (
                <div className="absolute right-4 top-0 pointer-events-none z-30 flex flex-col items-center gap-1 select-none">
                  <div className="text-accent wax-seal-animate">
                    <SealIcon size={64} fill="currentColor" className="text-accent" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-accent tracking-widest">Sealed</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Book / Website Title
                </label>
                <input
                  type="text"
                  required
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-bengali"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Poet Name
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-bengali"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Poet Biography / Preface
                </label>
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-sans leading-relaxed"
                  placeholder="Tell your readers about yourself or introduce this volume..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Default Reading Theme
                </label>
                <select
                  value={defaultTheme}
                  onChange={(e) => setDefaultTheme(e.target.value as any)}
                  className="w-full px-3 py-2 border border-current/15 rounded bg-current/5 text-[11px] font-bold uppercase tracking-wider focus:outline-none text-secondary-theme font-sans"
                >
                  <option value="light">Light (Cream Paper)</option>
                  <option value="sepia">Sepia (Aged Parchment)</option>
                  <option value="dark">Dark (Charcoal Soot)</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-accent hover:bg-zinc-900 dark:hover:bg-amber-100 dark:hover:text-black text-amber-50 text-xs font-bold uppercase tracking-widest rounded shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-current/10"
                >
                  <SealIcon size={12} />
                  {saving ? 'Sealing...' : 'Stamp & Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
