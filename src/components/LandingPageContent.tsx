'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookIcon } from './HandmadeIcons';
import { SiteSettings } from '@/lib/supabaseServer';

interface LandingPageContentProps {
  settings: SiteSettings;
}

interface Quote {
  bengali: string;
  english: string;
}

const FEATURED_QUOTES: Quote[] = [
  {
    bengali: "কিছু কথা, কিছু অনুভব, কিছু নীরবতা—শব্দের আশ্রয়ে।",
    english: "Some words, some feelings, some silence—seeking refuge in language."
  },
  {
    bengali: "নীরবতার ক্যানভাসে আঁকা কিছু রঙিন শব্দচিত্র।",
    english: "Color-drenched word-paintings drawn on the canvas of silence."
  },
  {
    bengali: "কবিতা তো আসলে হৃদয়ের স্পন্দন, যা কাগজের পাতায় খুঁজে পায় রূপ।",
    english: "Poetry is but the heartbeat of the soul, finding its form on sheets of paper."
  },
  {
    bengali: "যেখানে গদ্য শেষ হয়, সেখান থেকেই কবিতার ডানা মেলা শুরু।",
    english: "Where prose reaches its limit, the wings of poetry begin to soar."
  }
];

export default function LandingPageContent({ settings }: LandingPageContentProps) {
  // Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, active: false });
  const cardRef = useRef<HTMLDivElement>(null);

  // Carousel State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteOpacity, setQuoteOpacity] = useState(1);

  // Audio playing ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mouse Move Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const maxRotateX = 18; // Degrees
    const maxRotateY = 18; // Degrees

    const rotateX = ((centerY - y) / centerY) * maxRotateX;
    const rotateY = ((x - centerX) / centerX) * maxRotateY;

    setTilt({
      rotateX,
      rotateY,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, active: false });
  };

  // Rotate Quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteOpacity(0);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % FEATURED_QUOTES.length);
        setQuoteOpacity(1);
      }, 800);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  // Web Audio API Page Flip Synthesizer
  const playPageFlipSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const duration = 0.45; // seconds
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink/white noise with low-frequency roll-off
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to simulate crisp paper rustling
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Add a lowpass filter to soften the harsh frequencies
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(4500, ctx.currentTime);

      // Gain Envelope (Fade-in rapidly, fade-out smoothly)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.02);

      // Connections: Noise -> Filters -> Gain -> Destination
      noise.connect(filter);
      filter.connect(lpFilter);
      lpFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start();
    } catch (err) {
      console.warn('AudioContext playback blocked or failed:', err);
    }
  };

  const currentQuote = FEATURED_QUOTES[currentQuoteIndex];

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture transition-all duration-500 flex flex-col justify-between items-center p-6 py-8 md:p-12 relative overflow-hidden">
      
      {/* Decorative Ornate Borders & Vignette */}
      <div className="absolute inset-4 md:inset-8 border border-current/10 rounded-lg pointer-events-none z-0" />
      <div className="absolute inset-5 md:inset-9 border border-current/5 rounded-lg pointer-events-none z-0" />
      
      {/* Warm Ambient Vignette Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-amber-950/10 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none select-none z-0" />

      {/* Floating Bookmark Ribbon */}
      <div className="absolute top-0 right-16 md:right-24 w-6 h-36 md:h-44 bg-gradient-to-b from-[#841B2D] to-[#60121F] shadow-lg flex flex-col justify-end items-center pointer-events-none select-none z-10 transition-transform duration-500 hover:translate-y-2">
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-[#EADFC9]" />
        <div className="absolute top-8 text-[9px] text-amber-100 font-sans tracking-widest vertical-text uppercase select-none opacity-40">
          POETRY
        </div>
      </div>
      
      {/* Header Navigation */}
      <header className="w-full max-w-4xl flex justify-between items-center z-20 mb-6 select-none">
        <div className="text-xs tracking-[0.25em] text-secondary-theme uppercase font-sans font-semibold">
          WORDS BY DEBANGAN
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="group text-xs tracking-widest text-secondary-theme hover:text-red-900 transition-all font-sans font-medium uppercase flex items-center gap-1.5 py-1 px-3 border border-current/15 rounded-full hover:bg-[#841B2D]/5 transition-colors duration-300">
            <span className="w-1.5 h-1.5 bg-[#841B2D] rounded-full scale-100 group-hover:scale-125 transition-transform" />
            Admin CRM
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="z-10 max-w-lg w-full flex-grow flex flex-col items-center justify-center text-center my-6">
        
        {/* Realistic 3D Book Container */}
        <div 
          className="perspective-[1500px] w-[270px] h-[405px] md:w-[310px] md:h-[465px] mb-8 select-none cursor-pointer flex justify-center items-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={playPageFlipSound}
        >
          {/* Main Book Object */}
          <div
            ref={cardRef}
            style={{
              transform: tilt.active 
                ? `rotateY(${tilt.rotateY}deg) rotateX(${tilt.rotateX}deg) scale(1.04)` 
                : 'rotateY(-4deg) rotateX(2deg) scale(1)',
              transition: tilt.active ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              transformStyle: 'preserve-3d',
              backgroundImage: "url('/landing-cover.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            className="w-full h-full rounded-r-md shadow-[15px_20px_35px_rgba(28,24,22,0.38)] relative border border-amber-950/15"
          >
            {/* 3D Page Edges simulation on right side */}
            <div 
              style={{
                transform: 'rotateY(90deg) translateZ(1px)',
                transformOrigin: 'right center',
                backgroundImage: 'linear-gradient(to right, #F4ECE1 0%, #E6DCCD 100%)',
                backgroundSize: '100% 100%'
              }}
              className="absolute top-[2px] bottom-[2px] right-[-14px] w-[14px] shadow-inner flex flex-col overflow-hidden pointer-events-none rounded-r-[3px]"
            >
              {/* Fake Page lines */}
              <div className="w-full h-full opacity-[0.22] bg-[linear-gradient(to_bottom,transparent_45%,#6E5F47_50%,transparent_55%)] bg-[length:100%_3px]" />
            </div>

            {/* Book Spine Simulation overlay */}
            <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/45 via-black/10 to-transparent pointer-events-none z-10" />
            
            {/* Front Cover Gold Border Inner Frame */}
            <div className="absolute inset-3 border border-[#8C6D3D]/30 rounded pointer-events-none z-10" />
            <div className="absolute inset-4 border border-[#8C6D3D]/10 rounded pointer-events-none z-10" />
          </div>
        </div>

        {/* Dynamic Poem Preview Carousel Box */}
        <div className="w-full max-w-md min-h-[140px] md:min-h-[160px] flex flex-col justify-center items-center px-6 mb-6 select-none">
          {/* Ornamental Divider Top */}
          <div className="flex items-center justify-center gap-3 w-1/3 mb-4 opacity-35 text-secondary-theme">
            <div className="h-[1px] flex-grow bg-current" />
            <span className="text-xs">❦</span>
            <div className="h-[1px] flex-grow bg-current" />
          </div>

          <div 
            style={{ opacity: quoteOpacity }} 
            className="transition-opacity duration-700 ease-in-out flex flex-col items-center"
          >
            <p className="text-base md:text-lg font-bengali font-bold text-primary-theme leading-relaxed letterpress-ink max-w-sm mb-3">
              {currentQuote.bengali}
            </p>
            <p className="text-[11px] md:text-xs tracking-wider italic text-secondary-theme font-serif max-w-xs opacity-75 leading-relaxed">
              "{currentQuote.english}"
            </p>
          </div>

          {/* Ornamental Divider Bottom */}
          <div className="flex items-center justify-center gap-3 w-1/3 mt-4 opacity-35 text-secondary-theme">
            <div className="h-[1px] flex-grow bg-current" />
            <span className="text-xs">❦</span>
            <div className="h-[1px] flex-grow bg-current" />
          </div>
        </div>

        {/* Call to Action Button */}
        <Link 
          href="/book"
          onClick={playPageFlipSound}
          className="group relative px-9 py-4 bg-[#841B2D] hover:bg-[#9E2337] text-amber-50 rounded-full font-sans text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-3.5 border border-red-950/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-[2px] shadow-[0_6px_0_#4c0f1a] hover:shadow-[0_8px_0_#4c0f1a] active:shadow-[0_2px_0_#4c0f1a] cursor-pointer z-10"
        >
          <BookIcon size={13} className="transform group-hover:rotate-6 transition-transform duration-300" /> 
          Open the Book
          <span className="absolute -inset-0.5 rounded-full border border-amber-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
      </main>

      {/* Footer Info & Social Links */}
      <footer className="w-full text-center z-10 flex flex-col items-center gap-3.5 select-none mt-6">
        <a 
          href="https://www.instagram.com/words.by.debangan_?igsh=b3pwNGxtZ3B2ajJr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-secondary-theme/80 hover:text-[#841B2D] hover:scale-105 transition-all duration-300 font-sans tracking-widest font-medium py-1 px-3 border border-transparent hover:border-current/10 rounded-full hover:bg-white/5"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
          @words.by.debangan_
        </a>
        <p className="text-[9px] tracking-[0.25em] text-secondary-theme/60 uppercase font-sans">
          Designed for reading
        </p>
      </footer>

      {/* Vertical text styling */}
      <style jsx global>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}
