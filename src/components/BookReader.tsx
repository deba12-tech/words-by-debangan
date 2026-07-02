'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Collection, Poem, SiteSettings } from '@/lib/supabaseServer';
import { 
  NibIcon, 
  StitchIcon, 
  SealIcon, 
  RibbonIcon, 
  BellIcon, 
  BookIcon, 
  FeatherLeftIcon, 
  FeatherRightIcon, 
  ThemeIcon, 
  SearchIcon, 
  CloseIcon 
} from './HandmadeIcons';

type BookReaderProps = {
  collections: Collection[];
  poems: Poem[];
  settings: SiteSettings;
};

type PageData = {
  index: number;
  type: 'cover' | 'bio' | 'toc' | 'collection_divider' | 'poem_spread' | 'blank';
  collectionId?: string;
  poemId?: string;
  title?: string;
  content?: React.ReactNode;
};

export default function BookReader({ collections, poems, settings }: BookReaderProps) {
  // Page state
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  
  // Custom theme states (rooted in the print-craft palette)
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Swipe gesture refs
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Page turn sound synthesis using Web Audio API
  const playFlipSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fine friction noise (like textured paper rubbing)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.25);
      filter.Q.value = 2.0;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
      noise.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio synthesis blocked or unsupported', e);
    }
  };

  // Compile flat book pages array
  useEffect(() => {
    const list: PageData[] = [];
    let pageCounter = 0;

    // Page 0: Cover page (Closed Book view)
    list.push({
      index: pageCounter++,
      type: 'cover',
      title: settings.site_title,
    });

    // Page 1: Bio / Introduction Page (Left page of first spread)
    list.push({
      index: pageCounter++,
      type: 'bio',
    });

    // Page 2: Table of Contents (Right page of first spread)
    list.push({
      index: pageCounter++,
      type: 'toc',
    });

    // Sort collections by display order
    const sortedCollections = [...collections].sort((a, b) => a.display_order - b.display_order);

    sortedCollections.forEach((collection) => {
      // Force collection dividers to appear on the right page (even page indices)
      if (pageCounter % 2 !== 0) {
        list.push({
          index: pageCounter++,
          type: 'blank',
        });
      }

      list.push({
        index: pageCounter++,
        type: 'collection_divider',
        collectionId: collection.id,
        title: collection.name,
        content: collection.description,
      });

      // Filter and sort published poems in this collection
      const collectionPoems = poems
        .filter((p) => p.collection_id === collection.id && p.status === 'published' && new Date(p.published_at) <= new Date())
        .sort((a, b) => a.display_order - b.display_order);

      collectionPoems.forEach((poem) => {
        if (pageCounter % 2 === 0) {
          list.push({
            index: pageCounter++,
            type: 'blank',
          });
        }

        list.push({
          index: pageCounter++,
          type: 'poem_spread',
          poemId: poem.id,
          title: poem.title,
          content: (
            <div className="flex flex-col h-full p-8 md:p-14 relative overflow-y-auto custom-scrollbar">
              <div className="absolute right-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
              <div className="my-auto">
                <div className="mb-4 text-xs font-sans tracking-widest uppercase font-semibold text-secondary-theme">
                  {collection.name}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 font-bengali text-primary-theme letterpress-ink">
                  {poem.title}
                </h2>
                {poem.translation ? (
                  <div className="italic text-secondary-theme text-sm leading-relaxed font-sans whitespace-pre-wrap break-words">
                    {poem.translation}
                  </div>
                ) : (
                  <div className="text-secondary-theme/40 text-xs italic font-sans border-l border-dashed border-current pl-4">
                    Quiet verses, bound in linen thread.
                  </div>
                )}
                <div className="mt-8 text-[11px] text-secondary-theme/60 font-sans tracking-wide">
                  PUBLISHED: {new Date(poem.published_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          ),
        });

        list.push({
          index: pageCounter++,
          type: 'poem_spread',
          poemId: poem.id,
          title: poem.title,
          content: (
            <div className={`flex flex-col h-full p-8 md:p-14 text-${poem.alignment} overflow-y-auto overflow-x-hidden custom-scrollbar relative`}>
              <div className="absolute left-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
              <div className={`my-auto whitespace-pre-wrap break-words font-bengali leading-loose text-primary-theme letterpress-ink
                ${poem.font_size === 'sm' ? 'text-xs sm:text-sm' : ''}
                ${poem.font_size === 'md' ? 'text-sm sm:text-base' : ''}
                ${poem.font_size === 'lg' ? 'text-base sm:text-lg' : ''}
                ${poem.font_size === 'xl' ? 'text-lg sm:text-xl' : ''}
                ${poem.emphasis === 'italic' ? 'italic' : ''}
                ${poem.emphasis === 'bold' ? 'font-bold' : ''}
              `}>
                {poem.content}
              </div>
            </div>
          ),
        });
      });
    });

    // Render unassigned poems
    const unassignedPoems = poems
      .filter((p) => !p.collection_id && p.status === 'published' && new Date(p.published_at) <= new Date())
      .sort((a, b) => a.display_order - b.display_order);

    if (unassignedPoems.length > 0) {
      if (pageCounter % 2 !== 0) {
        list.push({
          index: pageCounter++,
          type: 'blank',
        });
      }

      list.push({
        index: pageCounter++,
        type: 'collection_divider',
        title: 'অন্যান্য কবিতা',
        content: 'সংগ্রহের বাইরে কিছু বিক্ষিপ্ত কবিতা ও ভাবনা।',
      });

      unassignedPoems.forEach((poem) => {
        if (pageCounter % 2 === 0) {
          list.push({
            index: pageCounter++,
            type: 'blank',
          });
        }

        list.push({
          index: pageCounter++,
          type: 'poem_spread',
          poemId: poem.id,
          title: poem.title,
          content: (
            <div className="flex flex-col h-full p-8 md:p-14 relative overflow-y-auto custom-scrollbar">
              <div className="absolute right-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
              <div className="my-auto">
                <div className="mb-4 text-xs font-sans tracking-widest uppercase font-semibold text-secondary-theme">
                  অন্যান্য
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6 font-bengali text-primary-theme letterpress-ink">
                  {poem.title}
                </h2>
                {poem.translation ? (
                  <div className="italic text-secondary-theme text-sm leading-relaxed font-sans whitespace-pre-wrap break-words">
                    {poem.translation}
                  </div>
                ) : (
                  <div className="text-secondary-theme/40 text-xs italic font-sans border-l border-dashed border-current pl-4">
                    Quiet verses, bound in linen thread.
                  </div>
                )}
                <div className="mt-8 text-[11px] text-secondary-theme/60 font-sans tracking-wide">
                  PUBLISHED: {new Date(poem.published_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          ),
        });

        list.push({
          index: pageCounter++,
          type: 'poem_spread',
          poemId: poem.id,
          title: poem.title,
          content: (
            <div className={`flex flex-col h-full p-8 md:p-14 text-${poem.alignment} overflow-y-auto overflow-x-hidden custom-scrollbar relative`}>
              <div className="absolute left-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
              <div className={`my-auto whitespace-pre-wrap break-words font-bengali leading-loose text-primary-theme letterpress-ink
                ${poem.font_size === 'sm' ? 'text-xs sm:text-sm' : ''}
                ${poem.font_size === 'md' ? 'text-sm sm:text-base' : ''}
                ${poem.font_size === 'lg' ? 'text-base sm:text-lg' : ''}
                ${poem.font_size === 'xl' ? 'text-lg sm:text-xl' : ''}
                ${poem.emphasis === 'italic' ? 'italic' : ''}
                ${poem.emphasis === 'bold' ? 'font-bold' : ''}
              `}>
                {poem.content}
              </div>
            </div>
          ),
        });
      });
    }

    if (pageCounter % 2 !== 0) {
      list.push({
        index: pageCounter++,
        type: 'blank',
      });
    }

    setPages(list);

    // Read preferences
    const cachedTheme = localStorage.getItem('deb_theme') as any;
    if (cachedTheme) setTheme(cachedTheme);

    const cachedFont = localStorage.getItem('deb_font_size') as any;
    if (cachedFont) setFontSize(cachedFont);

    const cachedSound = localStorage.getItem('deb_sound');
    if (cachedSound !== null) setSoundEnabled(cachedSound === 'true');

    // Read Bookmark
    const cachedBookmark = localStorage.getItem('deb_bookmark');
    if (cachedBookmark) {
      const pageIndex = parseInt(cachedBookmark, 10);
      if (pageIndex > 0 && pageIndex < pageCounter) {
        setBookmarkedPage(pageIndex);
      }
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collections, poems, settings]);

  // Sync preferences
  useEffect(() => {
    localStorage.setItem('deb_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('deb_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('deb_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Bookmarking handlers
  const saveBookmark = () => {
    localStorage.setItem('deb_bookmark', currentPage.toString());
    setBookmarkedPage(currentPage);
    triggerToast('Bookmark pinned');
  };

  const loadBookmark = () => {
    if (bookmarkedPage !== null) {
      goToPage(bookmarkedPage);
      triggerToast('Bookmark loaded');
    }
  };

  const clearBookmark = () => {
    localStorage.removeItem('deb_bookmark');
    setBookmarkedPage(null);
    triggerToast('Bookmark removed');
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Navigations
  const goToPage = (index: number) => {
    if (index < 0 || index >= pages.length || isFlipping) return;
    
    const dir = index > currentPage ? 'next' : 'prev';
    setFlipDirection(dir);
    setIsFlipping(true);
    playFlipSound();

    if (index === 0) {
      setIsBookOpen(false);
    } else {
      setIsBookOpen(true);
    }

    setTimeout(() => {
      if (isMobile) {
        setCurrentPage(index);
      } else {
        if (index === 0) {
          setCurrentPage(0);
        } else {
          setCurrentPage(index % 2 === 0 ? index - 1 : index);
        }
      }
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  const handleNext = () => {
    if (isMobile) {
      if (currentPage < pages.length - 1) {
        goToPage(currentPage + 1);
      }
    } else {
      if (currentPage === 0) {
        goToPage(1);
      } else if (currentPage < pages.length - 2) {
        goToPage(currentPage + 2);
      }
    }
  };

  const handlePrev = () => {
    if (isMobile) {
      if (currentPage > 0) {
        goToPage(currentPage - 1);
      }
    } else {
      if (currentPage === 1) {
        goToPage(0);
      } else if (currentPage > 1) {
        goToPage(currentPage - 2);
      }
    }
  };

  // Mobile swipes
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages, isMobile, isFlipping]);

  const sharePoem = (poemId: string, title: string) => {
    const shareUrl = `${window.location.origin}/book?poem=${poemId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      triggerToast('Poem link copied');
    }
  };

  const getSearchMatches = () => {
    if (!searchQuery.trim()) return [];
    return poems
      .filter((p) => p.status === 'published' && 
        (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.content.toLowerCase().includes(searchQuery.toLowerCase())))
      .map((p) => {
        const pageIdx = pages.findIndex((pg) => pg.poemId === p.id);
        return { poem: p, pageIdx };
      })
      .filter((m) => m.pageIdx !== -1);
  };

  const navigateToPoem = (poemId: string) => {
    const index = pages.findIndex((p) => p.poemId === poemId);
    if (index !== -1) {
      goToPage(index);
      setIsSidebarOpen(false);
    }
  };

  // Render individual page components
  const renderPageContent = (page: PageData) => {
    if (!page) return null;

    switch (page.type) {
      case 'cover':
        return (
          <div 
            style={{ 
              backgroundImage: "url('/book-cover.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "28% center"
            }}
            className="flex flex-col h-full justify-between items-center text-center p-8 md:p-12 relative overflow-hidden select-none"
          >
            {/* Gold border frame on cover */}
            <div className="absolute inset-4 md:inset-6 border border-[#B5945B]/35 rounded-lg pointer-events-none" />
            <div className="absolute inset-5 md:inset-7 border border-[#B5945B]/15 rounded-lg pointer-events-none" />

            <div className="mt-auto flex flex-col items-center z-10">
              {/* Premium 3D Gold-Brass Button */}
              <button 
                onClick={handleNext}
                className="mt-6 px-8 py-3 bg-[#B5945B] hover:bg-[#c9a76d] text-amber-950 font-sans text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-3 border border-[#B5945B]/40 transition-all duration-150 transform hover:translate-y-[-1px] active:translate-y-[3px] shadow-[0_4px_0_#806436] hover:shadow-[0_5px_0_#806436] active:shadow-[0_1px_0_#806436] cursor-pointer"
              >
                <BookIcon size={14} /> Open the Book
              </button>
            </div>

            {/* Spine highlight on left edge */}
            <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/45 to-transparent pointer-events-none" />
            {/* Jute/leather texture */}
            <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none mix-blend-overlay" />
          </div>
        );

      case 'bio':
        return (
          <div className="flex flex-col h-full justify-between p-8 md:p-12 relative">
            <div className="absolute right-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-20 pointer-events-none" />
            <div className="flex flex-col items-center text-center mt-6">
              <div className="w-28 h-36 relative mb-6 shadow-md border border-current/15 rounded overflow-hidden">
                <img 
                  src="/author-photo.jpg" 
                  alt={settings.author_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-d');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="fallback-d hidden w-full h-full bg-current/5 flex items-center justify-center">
                  <span className="text-2xl font-serif text-secondary-theme font-bold">D</span>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 font-bengali text-primary-theme letterpress-ink">
                কবির কথা
              </h2>
              <div className="text-xs md:text-sm leading-relaxed text-primary-theme/80 max-w-sm whitespace-pre-line text-justify font-sans mb-4">
                {settings.author_bio || "কবিতা আমার হৃদয়ের স্পন্দন, নীরবতার ক্যানভাসে আঁকা কিছু রঙিন শব্দচিত্র। এ বই আমার যাপনের কিছু টুকরো মুহূর্ত আর ভাবনার রূপরেখা।"}
              </div>
              <a 
                href="https://www.instagram.com/words.by.debangan_?igsh=b3pwNGxtZ3B2ajJr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-secondary-theme hover:text-red-800 transition font-sans tracking-wide border border-current/15 rounded-full px-4 py-1.5 hover:bg-current/5 transition-all duration-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                Instagram: @words.by.debangan_
              </a>
            </div>

            <div className="mt-8 text-center text-[10px] text-secondary-theme/60 font-sans border-t border-dashed border-current/25 pt-4">
              {settings.author_name}. All rights reserved.
            </div>
          </div>
        );

      case 'toc':
        return (
          <div className="flex flex-col h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-center uppercase tracking-wider font-bengali text-primary-theme border-b border-current/15 pb-4 letterpress-ink">
              সূচীপত্র (Index)
            </h2>
            
            <div className="space-y-6">
              {collections.map((coll) => {
                const collPoems = poems.filter(
                  (p) => p.collection_id === coll.id && p.status === 'published' && new Date(p.published_at) <= new Date()
                );
                if (collPoems.length === 0) return null;

                return (
                  <div key={coll.id} className="space-y-3">
                    <h3 className="text-sm font-bold font-bengali text-secondary-theme border-l-2 border-accent pl-3">
                      {coll.name}
                    </h3>
                    <ul className="space-y-2 pl-4">
                      {collPoems.map((p) => {
                        const pageIdx = pages.findIndex((pg) => pg.poemId === p.id);
                        return (
                          <li key={p.id}>
                            <button
                              onClick={() => pageIdx !== -1 && goToPage(pageIdx)}
                              className="w-full flex items-baseline text-left group hover:text-accent transition cursor-pointer"
                            >
                              <span className="font-bengali text-sm text-primary-theme group-hover:text-accent">
                                {p.title}
                              </span>
                              <span className="flex-grow border-b border-dotted border-current/20 mx-2" />
                              <span className="text-xs text-secondary-theme/60 font-mono">
                                p. {pageIdx}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'collection_divider':
        return (
          <div className="flex flex-col h-full justify-center items-center text-center p-8 md:p-12 relative overflow-hidden select-none">
            <div className="absolute inset-4 md:inset-8 border border-current/5 rounded pointer-events-none" />
            <span className="text-secondary-theme text-lg mb-4 font-serif">✦</span>
            <h2 className="text-3xl md:text-4xl font-bold font-bengali text-primary-theme max-w-sm mb-4 leading-normal letterpress-ink">
              {page.title}
            </h2>
            {page.content && (
              <p className="text-xs italic text-secondary-theme/75 max-w-xs leading-relaxed font-sans mt-2">
                {page.content}
              </p>
            )}
            <div className="w-6 h-[1px] bg-current/20 mt-8" />
          </div>
        );

      case 'poem_spread':
        return page.content || null;

      case 'blank':
      default:
        return (
          <div className="flex items-center justify-center h-full text-secondary-theme/10 font-serif select-none">
            ✦
          </div>
        );
    }
  };

  // 10-strip Page Curl Physics Renderer (Desktop Spread view only)
  const renderPageCurlAnimation = () => {
    if (!isFlipping || !flipDirection) return null;

    const numStrips = 10;
    const stripWidth = 100 / numStrips;
    const isNext = flipDirection === 'next';

    // Figure out incoming pages
    const frontIdx = isNext ? currentPage + 1 : currentPage - 1;
    const backIdx = isNext ? currentPage + 2 : currentPage;

    const frontPageData = pages[frontIdx];
    const backPageData = pages[backIdx];

    if (!frontPageData || !backPageData) return null;

    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-45" style={{ perspective: '2200px' }}>
        {Array.from({ length: numStrips }).map((_, i) => {
          // Rolling wave delay from outer edge to spine
          const delay = isNext 
            ? (numStrips - 1 - i) * 32 
            : i * 32;

          return (
            <div
              key={i}
              className="absolute top-0 h-full page-strip border-y border-current/5"
              style={{
                width: `${stripWidth}%`,
                left: `${i * stripWidth}%`,
                transformOrigin: isNext ? 'left center' : 'right center',
                transition: 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: `${delay}ms`,
                transform: isFlipping 
                  ? (isNext ? 'rotateY(-180deg)' : 'rotateY(180deg)') 
                  : 'rotateY(0deg)',
                zIndex: isNext ? (numStrips - i) : i,
              }}
            >
              {/* Front Face */}
              <div className="page-face-3d w-full h-full overflow-hidden page-theme relative">
                <div 
                  className="absolute top-0 h-full"
                  style={{
                    width: `${numStrips * 100}%`,
                    left: `-${i * 100}%`,
                  }}
                >
                  {renderPageContent(frontPageData)}
                </div>
                
                {/* Rolling highlight along cylinder peak */}
                <div 
                  className="page-curl-highlight"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,${0.05 + (i / numStrips) * 0.18}) 40%, rgba(255,255,255,0) 85%)`,
                  }}
                />
              </div>

              {/* Back Face */}
              <div className="page-face-3d page-face-back w-full h-full overflow-hidden page-theme relative">
                <div 
                  className="absolute top-0 h-full"
                  style={{
                    width: `${numStrips * 100}%`,
                    left: `-${(numStrips - 1 - i) * 100}%`,
                  }}
                >
                  {renderPageContent(backPageData)}
                </div>
                
                {/* Cast shadow under turning fold */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to left, rgba(28,24,22,${0.18 - (i / numStrips) * 0.1}) 0%, rgba(28,24,22,0) 70%)`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const leftPage = pages[currentPage];
  const rightPage = pages[currentPage + 1];

  return (
    <div className={`theme-${theme} min-h-screen book-container-theme paper-texture transition-colors duration-500 overflow-hidden flex flex-col relative`}>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-accent text-amber-50 text-xs font-sans rounded shadow-lg tracking-wider uppercase z-50 select-none border border-current/10">
          {showToast}
        </div>
      )}

      {/* Header Overlay Panel */}
      <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-40 bg-gradient-to-b from-current/5 to-transparent select-none text-primary-theme">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded hover:bg-current/10 transition cursor-pointer"
            aria-label="Table of Contents"
          >
            <NibIcon size={18} />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-sans font-bold text-secondary-theme">
              {settings.site_title}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {bookmarkedPage !== null && (
            <button 
              onClick={loadBookmark}
              className="px-3 py-1.5 rounded border border-accent/30 text-accent text-xs font-sans font-medium flex items-center gap-1.5 hover:bg-accent/5 transition cursor-pointer"
            >
              <RibbonIcon size={12} /> Resume Bookmark
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded hover:bg-current/10 transition cursor-pointer text-secondary-theme"
            title="Toggle Sound"
          >
            <BellIcon size={18} className={soundEnabled ? '' : 'opacity-40'} />
          </button>

          {/* Font Size Button */}
          <div className="relative group">
            <button className="p-2 rounded hover:bg-current/10 transition cursor-pointer text-secondary-theme" title="Font Size">
              <StitchIcon size={18} />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-current/10 rounded shadow-xl py-1 hidden group-hover:block w-32 z-50 text-zinc-800 dark:text-zinc-100">
              <button onClick={() => setFontSize('sm')} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-600/10 font-sans ${fontSize === 'sm' ? 'font-bold text-amber-800' : ''}`}>Small</button>
              <button onClick={() => setFontSize('md')} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-600/10 font-sans ${fontSize === 'md' ? 'font-bold text-amber-800' : ''}`}>Medium</button>
              <button onClick={() => setFontSize('lg')} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-600/10 font-sans ${fontSize === 'lg' ? 'font-bold text-amber-800' : ''}`}>Large</button>
              <button onClick={() => setFontSize('xl')} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-600/10 font-sans ${fontSize === 'xl' ? 'font-bold text-amber-800' : ''}`}>Extra Large</button>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center bg-current/5 border border-current/15 rounded p-0.5">
            <button 
              onClick={() => setTheme('light')} 
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-sans ${theme === 'light' ? 'bg-accent text-white shadow-sm' : ''}`}
              title="Light Mode"
            >
              L
            </button>
            <button 
              onClick={() => setTheme('sepia')} 
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-sans ${theme === 'sepia' ? 'bg-accent text-white shadow-sm' : ''}`}
              title="Sepia Mode"
            >
              S
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-sans ${theme === 'dark' ? 'bg-accent text-white shadow-sm' : ''}`}
              title="Dark Mode"
            >
              D
            </button>
          </div>
        </div>
      </header>

      {/* Main Book View */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 pt-20 pb-20 select-none relative z-10">
        
        <div 
          className={`relative max-w-full w-[1000px] h-[650px] max-h-[75vh] ${currentPage === 0 ? 'w-[500px]' : ''} transition-all duration-500`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Stacked Pages behind (depth simulation) */}
          {isBookOpen && !isMobile && (
            <div className="absolute inset-0 bg-transparent rounded transform translate-y-1 translate-x-1 shadow-md border border-current/5 pointer-events-none -z-10">
              <div className="w-full h-full page-theme rounded border-r border-current/10" />
            </div>
          )}

          {/* Book Wrapper */}
          <div className={`w-full h-full rounded shadow-2xl relative border overflow-hidden flex transition-all duration-500 ${
            currentPage === 0 
              ? 'bg-[#400c14] dark:bg-[#1a0508] border-[#B5945B]/20 text-amber-50' 
              : 'border-current/15 page-theme'
          }`}>
            
            {!isMobile ? (
              currentPage === 0 ? (
                // Closed Book
                <div className="w-full h-full relative">
                  {renderPageContent(pages[0])}
                </div>
              ) : (
                // Open Book Spread
                <div className="w-full h-full flex relative">
                  
                  {/* Left Page */}
                  <div className="w-1/2 h-full relative border-r border-current/10 overflow-hidden pr-2">
                    {renderPageContent(leftPage)}
                    
                    {leftPage && leftPage.type !== 'cover' && (
                      <div className="absolute bottom-4 left-6 text-xs text-secondary-theme/60 font-mono">
                        {leftPage.index}
                      </div>
                    )}
                  </div>

                  {/* Spine Shadow */}
                  <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-8 book-gutter pointer-events-none z-30" />

                  {/* Right Page */}
                  <div className="w-1/2 h-full relative overflow-hidden pl-2">
                    {renderPageContent(rightPage)}

                    {rightPage && rightPage.type !== 'cover' && (
                      <div className="absolute bottom-4 right-6 text-xs text-secondary-theme/60 font-mono">
                        {rightPage.index}
                      </div>
                    )}

                    {/* Bookmark Ribbon */}
                    {rightPage && rightPage.type === 'poem_spread' && (
                      <button 
                        onClick={saveBookmark}
                        className={`absolute top-0 right-8 w-6 h-16 bg-accent hover:bg-accent/90 shadow cursor-pointer transition-transform duration-300 transform origin-top hover:scale-y-110 flex flex-col justify-end pb-2 items-center ${bookmarkedPage === currentPage ? 'opacity-100 scale-y-100' : 'opacity-40 hover:opacity-100'}`}
                        title="Pin Bookmark"
                      >
                        <RibbonIcon size={12} className="text-white" />
                      </button>
                    )}

                    {/* Share Action */}
                    {rightPage && rightPage.type === 'poem_spread' && rightPage.poemId && (
                      <button 
                        onClick={() => sharePoem(rightPage.poemId!, rightPage.title || 'Poem')}
                        className="absolute bottom-4 right-16 p-1.5 rounded-full hover:bg-current/10 transition text-secondary-theme/70 cursor-pointer"
                        title="Copy Link"
                      >
                        <NibIcon size={14} />
                      </button>
                    )}
                  </div>

                  {/* 10-strip Page Turn Physics Rendering */}
                  {renderPageCurlAnimation()}

                </div>
              )
            ) : (
              // Mobile Single Page view (optimized sliding/fold)
              <div 
                className={`w-full h-full relative overflow-hidden transition-transform duration-500 ${isFlipping ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'}`}
              >
                <div className="absolute top-0 bottom-0 left-0 w-6 mobile-binding pointer-events-none z-30" />
                {renderPageContent(pages[currentPage])}

                {currentPage > 0 && (
                  <div className="absolute bottom-4 right-6 text-xs text-secondary-theme/60 font-mono">
                    {currentPage} / {pages.length - 1}
                  </div>
                )}

                {currentPage > 0 && pages[currentPage]?.type === 'poem_spread' && (
                  <button 
                    onClick={saveBookmark}
                    className={`absolute top-0 right-6 w-5 h-12 bg-accent shadow cursor-pointer transition-transform duration-300 transform origin-top hover:scale-y-110 flex items-end justify-center pb-1 ${bookmarkedPage === currentPage ? 'opacity-100' : 'opacity-40'}`}
                    title="Pin Bookmark"
                  >
                    <RibbonIcon size={10} className="text-white" />
                  </button>
                )}
              </div>
            )}
            
            {/* Paper overlay textures */}
            <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none mix-blend-multiply z-20" />
          </div>
        </div>
      </main>

      {/* Footer Navigation Bar */}
      {isBookOpen && (
        <footer className="absolute bottom-0 inset-x-0 h-16 flex items-center justify-between px-8 z-40 bg-gradient-to-t from-current/5 to-transparent text-primary-theme select-none">
          <button 
            onClick={handlePrev}
            disabled={currentPage <= 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-current/10 transition cursor-pointer text-xs font-sans uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none font-bold"
          >
            <FeatherLeftIcon size={16} /> Prev
          </button>

          <span className="text-xs font-serif text-secondary-theme/80">
            {currentPage === 0 ? '' : isMobile ? `Page ${currentPage}` : `Pages ${currentPage} - ${currentPage + 1}`}
          </span>

          <button 
            onClick={handleNext}
            disabled={isMobile ? currentPage >= pages.length - 1 : currentPage >= pages.length - 2}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-current/10 transition cursor-pointer text-xs font-sans uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none font-bold"
          >
            Next <FeatherRightIcon size={16} />
          </button>
        </footer>
      )}

      {/* Table of Contents Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex">
          <div className="w-[320px] max-w-[85%] h-full bg-page border-r border-current/15 shadow-2xl flex flex-col p-6 overflow-y-auto text-primary-theme relative">
            
            <div className="absolute right-0 top-1/4 bottom-1/4 ledger-stitch-line opacity-10 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-current/15">
              <h3 className="font-bold text-lg font-bengali text-secondary-theme">সূচীপত্র</h3>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded hover:bg-current/15 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {bookmarkedPage !== null && (
              <div className="mb-6 p-3 bg-accent/5 border border-accent/20 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RibbonIcon size={14} className="text-accent" />
                  <span className="text-xs font-medium font-sans">Active Bookmark</span>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    onClick={loadBookmark}
                    className="text-xs font-semibold underline text-accent hover:text-primary-theme cursor-pointer"
                  >
                    Go
                  </button>
                  <button 
                    onClick={clearBookmark}
                    className="text-xs font-semibold underline text-primary-theme/60 hover:text-red-700 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Quick Search */}
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-theme/40">
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                placeholder="Search poems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-current/15 rounded bg-current/5 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-primary-theme font-sans"
              />
            </div>

            {/* Search results */}
            {searchQuery.trim() !== '' ? (
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-theme/60 font-sans">Search Results</h4>
                {getSearchMatches().length > 0 ? (
                  <ul className="space-y-2">
                    {getSearchMatches().map((m) => (
                      <li key={m.poem.id}>
                        <button
                          onClick={() => navigateToPoem(m.poem.id)}
                          className="w-full text-left p-2 rounded hover:bg-accent/10 transition cursor-pointer"
                        >
                          <div className="font-bengali text-sm font-semibold">{m.poem.title}</div>
                          <div className="text-xs text-secondary-theme/60 font-sans truncate">{m.poem.content.substring(0, 40)}...</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs italic text-secondary-theme/40 font-sans">No matches found.</div>
                )}
              </div>
            ) : null}

            {/* Classic index links */}
            <div className="space-y-6">
              <div className="space-y-1">
                <button
                  onClick={() => { goToPage(0); setIsSidebarOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-current/10 font-sans text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  📖 Front Cover Page
                </button>
                <button
                  onClick={() => { goToPage(1); setIsSidebarOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-current/10 font-sans text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  ✍️ Poet Biography
                </button>
                <button
                  onClick={() => { goToPage(2); setIsSidebarOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-current/10 font-sans text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  📜 Table of Contents
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-current/15">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-theme/60 font-sans">Collections & Chapters</h4>
                {collections.map((coll) => {
                  const collPoems = poems.filter(
                    (p) => p.collection_id === coll.id && p.status === 'published' && new Date(p.published_at) <= new Date()
                  );
                  if (collPoems.length === 0) return null;

                  return (
                    <div key={coll.id} className="space-y-1.5">
                      <div className="text-sm font-bold font-bengali text-secondary-theme pl-2">
                        {coll.name}
                      </div>
                      <ul className="space-y-1 pl-4 border-l border-current/10">
                        {collPoems.map((p) => (
                          <li key={p.id}>
                            <button
                              onClick={() => navigateToPoem(p.id)}
                              className="w-full text-left px-2 py-1 text-xs font-bengali text-primary-theme/75 hover:text-accent hover:bg-current/5 rounded transition cursor-pointer"
                            >
                              {p.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-grow cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
        </div>
      )}

    </div>
  );
}
