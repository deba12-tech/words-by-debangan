'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Collection, Poem } from '@/lib/supabaseServer';
import { 
  NibIcon, 
  StitchIcon, 
  SealIcon, 
  FeatherLeftIcon, 
  BookIcon, 
  ThemeIcon,
  CloseIcon
} from './HandmadeIcons';

const cleanBengaliText = (text: string): string => {
  if (!text) return '';
  return text
    // Normalize Windows line endings \r\n to standard Unix \n
    .replace(/\r\n/g, '\n')
    // Remove individual carriage returns \r
    .replace(/\r/g, '\n')
    // Replace non-breaking spaces with standard spaces to allow wrapping
    .replace(/\u00A0/g, ' ')
    // Remove zero-width spaces which are invisible but show up as blocks
    .replace(/\u200B/g, '')
    // Remove other non-printable ASCII control characters (excluding tab \t, linefeed \n)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
};

type PoemFormProps = {
  poemId?: string;
};

export default function PoemForm({ poemId }: PoemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!poemId);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [content, setContent] = useState('');
  const [translation, setTranslation] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [emphasis, setEmphasis] = useState<'normal' | 'italic' | 'bold'>('normal');

  // Preview options
  const [previewTheme, setPreviewTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [showPreview, setShowPreview] = useState(true);
  const [animateSeal, setAnimateSeal] = useState(false);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const { data: collData } = await supabase
          .from('collections')
          .select('*')
          .order('display_order', { ascending: true });
        setCollections(collData || []);

        if (poemId) {
          const { data: poem } = await supabase
            .from('poems')
            .select('*')
            .eq('id', poemId)
            .single();

          if (poem) {
            setTitle(poem.title);
            setSlug(poem.slug);
            setCollectionId(poem.collection_id || '');
            setContent(poem.content);
            setTranslation(poem.translation || '');
            setDisplayOrder(poem.display_order);
            setStatus(poem.status);
            
            const date = new Date(poem.published_at);
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
            setPublishedAt(adjustedDate.toISOString().slice(0, 16));
            
            setAlignment(poem.alignment);
            setFontSize(poem.font_size);
            setEmphasis(poem.emphasis);
          }
        } else {
          const nowStr = new Date().toISOString().slice(0, 16);
          setPublishedAt(nowStr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchInitData();
  }, [poemId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!poemId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      alert('Please fill in title, slug, and content.');
      return;
    }

    setLoading(true);
    setAnimateSeal(true);
    setTimeout(() => setAnimateSeal(false), 2000);

    const dateObj = new Date(publishedAt);

    const poemData = {
      title,
      slug,
      collection_id: collectionId || null,
      content: cleanBengaliText(content),
      translation: translation ? cleanBengaliText(translation) : null,
      display_order: displayOrder,
      status,
      published_at: status === 'published' ? new Date(Date.now() - 5 * 60 * 1000).toISOString() : dateObj.toISOString(),
      alignment,
      font_size: fontSize,
      emphasis,
      updated_at: new Date().toISOString(),
    };

    try {
      if (poemId) {
        const { error } = await supabase
          .from('poems')
          .update(poemData)
          .eq('id', poemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poems')
          .insert([poemData]);
        if (error) throw error;
      }

      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to save poem.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen theme-sepia book-container-theme paper-texture flex items-center justify-center font-sans text-secondary-theme">
        Opening parchment registry...
      </div>
    );
  }

  const activeCollectionName = collections.find(c => c.id === collectionId)?.name || 'Unassigned Collection';

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture flex flex-col transition-colors duration-500 font-sans">
      
      {/* Header bar */}
      <header className="card-theme border-b px-6 py-4 flex items-center justify-between shadow-sm text-primary-theme">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="p-2 hover:bg-current/10 text-secondary-theme rounded transition cursor-pointer"
          >
            <FeatherLeftIcon size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-bengali text-secondary-theme letterpress-ink">
              {poemId ? 'সম্পাদনা (Edit Entry)' : 'নতুন সংযোজন (New Entry)'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-current/15 hover:bg-current/5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer text-secondary-theme"
          >
            <ThemeIcon size={12} />
            {showPreview ? 'Hide Live Layout' : 'Show Live Layout'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-accent hover:bg-zinc-900 dark:hover:bg-amber-100 dark:hover:text-black text-amber-50 rounded text-xs font-bold uppercase tracking-widest transition cursor-pointer disabled:opacity-50 border border-current/10 flex items-center gap-2"
          >
            <SealIcon size={12} />
            {loading ? 'Sealing...' : 'Seal & Save'}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Animated Wax Seal Stamp */}
        {animateSeal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 flex flex-col items-center gap-2 select-none">
            <div className="text-accent wax-seal-animate shadow-2xl">
              <SealIcon size={120} fill="currentColor" className="text-accent" />
            </div>
            <span className="text-sm uppercase font-bold text-accent tracking-widest bg-page px-4 py-1.5 rounded shadow border border-current/10">Ledger Sealed</span>
          </div>
        )}

        {/* Editor Column */}
        <div className={`flex-1 p-6 overflow-y-auto ${showPreview ? 'lg:max-w-[45%]' : ''} border-r border-current/15 relative text-primary-theme`}>
          {/* Sewn margin decoration */}
          <div className="absolute left-6 top-6 bottom-6 ledger-stitch-line opacity-15 pointer-events-none" />
          
          <form className="space-y-6 pl-8" onSubmit={handleSave}>
            
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Title (Bangla / English)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-bengali"
                  placeholder="e.g. বুকের ভিতর শঙ্খ বাজে"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-mono"
                />
              </div>
            </div>

            {/* Collection & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Chapter Collection
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-3 py-2 border border-current/15 rounded bg-current/5 text-xs font-bold uppercase tracking-wider focus:outline-none text-secondary-theme font-sans"
                >
                  <option value="">Unassigned</option>
                  {collections.map((coll) => (
                    <option key={coll.id} value={coll.id}>{coll.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-sans"
                />
              </div>
            </div>

            {/* Content (Bangla) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                Poem Content (Bengali)
              </label>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(cleanBengaliText(e.target.value))}
                className="w-full px-4 py-3 border border-current/15 rounded bg-current/5 text-base focus:outline-none focus:ring-1 focus:ring-accent font-bengali leading-loose text-primary-theme custom-scrollbar"
                placeholder="এখানে কবিতা লিখুন... লাইন ও স্তবক ঠিকভাবে বজায় থাকবে।"
              />
              <p className="text-[9px] text-secondary-theme/50 mt-1 uppercase tracking-wider">Exact whitespace formatting is locked & preserved.</p>
            </div>

            {/* Translation (English) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                English Translation (Optional)
              </label>
              <textarea
                rows={8}
                value={translation}
                onChange={(e) => setTranslation(cleanBengaliText(e.target.value))}
                className="w-full px-4 py-3 border border-current/15 rounded bg-current/5 text-sm focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed text-primary-theme custom-scrollbar"
                placeholder="Write the translation..."
              />
            </div>

            {/* Styling options */}
            <div className="bg-current/5 p-4 rounded border border-current/10 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 flex items-center gap-2">
                <StitchIcon size={12} /> Visual Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-secondary-theme/50 mb-1">Alignment</label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-current/15 rounded bg-page text-[10px] font-bold uppercase focus:outline-none text-secondary-theme font-sans"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-secondary-theme/50 mb-1">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-current/15 rounded bg-page text-[10px] font-bold uppercase focus:outline-none text-secondary-theme font-sans"
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-secondary-theme/50 mb-1">Emphasis</label>
                  <select
                    value={emphasis}
                    onChange={(e) => setEmphasis(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-current/15 rounded bg-page text-[10px] font-bold uppercase focus:outline-none text-secondary-theme font-sans"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Publishing details */}
            <div className="bg-current/5 p-4 rounded border border-current/10 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 flex items-center gap-2">
                <SealIcon size={12} /> Registry Options
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-secondary-theme/50 mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-current/15 rounded bg-page text-[10px] font-bold uppercase focus:outline-none text-secondary-theme font-sans"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase text-secondary-theme/50 mb-1">Release Timestamp</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-2 py-1 border-b border-current/25 bg-transparent text-[10px] text-primary-theme focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Live Preview Column */}
        {showPreview && (
          <div className="flex-1 bg-zinc-300/40 dark:bg-zinc-950 p-6 flex flex-col justify-center items-center overflow-y-auto">
            <div className="w-full max-w-[700px] flex items-center justify-between mb-4 select-none">
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-theme/60 font-sans">Handcrafted Print Layout Preview</span>
              <div className="flex items-center bg-current/5 border border-current/15 rounded p-0.5 text-secondary-theme">
                <button type="button" onClick={() => setPreviewTheme('light')} className={`px-2 py-0.5 rounded text-[10px] font-sans ${previewTheme === 'light' ? 'bg-accent text-white' : ''}`}>Light</button>
                <button type="button" onClick={() => setPreviewTheme('sepia')} className={`px-2 py-0.5 rounded text-[10px] font-sans ${previewTheme === 'sepia' ? 'bg-accent text-white' : ''}`}>Sepia</button>
                <button type="button" onClick={() => setPreviewTheme('dark')} className={`px-2 py-0.5 rounded text-[10px] font-sans ${previewTheme === 'dark' ? 'bg-accent text-white' : ''}`}>Dark</button>
              </div>
            </div>

            {/* Book Simulation container */}
            <div className={`theme-${previewTheme} w-full max-w-[700px] h-[480px] rounded border border-current/15 shadow-2xl overflow-hidden book-container-theme paper-texture transition-all duration-300 flex relative`}>
              
              {/* Left Page */}
              <div className="w-1/2 h-full relative border-r border-current/10 overflow-hidden page-theme pr-2 flex flex-col justify-center p-8 text-left">
                <div className="absolute left-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
                <span className="text-[10px] text-secondary-theme uppercase tracking-wider font-sans mb-2">{activeCollectionName}</span>
                <h2 className="text-2xl font-bold font-bengali text-primary-theme mb-4 letterpress-ink">{title || 'বুকের ভিতর শঙ্খ বাজে'}</h2>
                {translation ? (
                  <div className="italic text-secondary-theme text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-[250px] overflow-y-auto custom-scrollbar">
                    {translation}
                  </div>
                ) : (
                  <div className="text-secondary-theme/30 text-xs italic font-sans border-l border-dashed border-current pl-4">No translation bound yet.</div>
                )}
                <div className="absolute bottom-4 left-6 text-[10px] text-secondary-theme/50 font-mono">p. L</div>
              </div>

              {/* Gutter */}
              <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-6 book-gutter pointer-events-none z-30" />

              {/* Right Page */}
              <div className={`w-1/2 h-full relative overflow-hidden page-theme pl-2 flex flex-col justify-center p-8 text-${alignment}`}>
                {content ? (
                  <div className={`whitespace-pre font-bengali leading-loose max-h-[360px] overflow-y-auto custom-scrollbar text-primary-theme letterpress-ink
                    ${fontSize === 'sm' ? 'text-xs' : ''}
                    ${fontSize === 'md' ? 'text-sm' : ''}
                    ${fontSize === 'lg' ? 'text-base' : ''}
                    ${fontSize === 'xl' ? 'text-lg' : ''}
                    ${emphasis === 'italic' ? 'italic' : ''}
                    ${emphasis === 'bold' ? 'font-bold' : ''}
                  `}>
                    {content}
                  </div>
                ) : (
                  <div className="text-primary-theme/35 text-sm italic font-bengali text-center">কবিতার মূল হরফ এখানে প্রদর্শিত হবে।</div>
                )}
                <div className="absolute bottom-4 right-6 text-[10px] text-secondary-theme/50 font-mono">p. R</div>
              </div>

              {/* Texture overlay */}
              <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none mix-blend-multiply z-20" />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
