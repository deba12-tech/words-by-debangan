'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  NibIcon, 
  StitchIcon, 
  BookIcon, 
  PlusIcon, 
  CloseIcon, 
  FeatherRightIcon 
} from './HandmadeIcons';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BookIcon },
    { name: 'Collections', href: '/admin/collections', icon: NibIcon },
    { name: 'Add Poem', href: '/admin/poems/new', icon: PlusIcon },
    { name: 'Settings', href: '/admin/settings', icon: StitchIcon },
  ];

  return (
    <aside className="w-64 card-theme border-r flex flex-col h-screen font-sans sticky top-0 relative select-none text-primary-theme">
      {/* Decorative Stitch Line */}
      <div className="absolute left-6 top-4 bottom-4 ledger-stitch-line opacity-20 pointer-events-none" />
      
      <div className="p-6 border-b border-current/10 flex items-center gap-3 pl-10">
        <span className="text-secondary-theme">
          <NibIcon size={22} />
        </span>
        <span className="font-bold text-sm uppercase tracking-wider text-secondary-theme font-sans">
          Poet Registry
        </span>
      </div>

      <nav className="flex-1 p-4 pl-10 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-secondary-theme/75 hover:bg-current/5 hover:text-primary-theme'
              }`}
            >
              <Icon size={14} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 pl-10 border-t border-current/10 space-y-1.5">
        <Link
          href="/book"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-secondary-theme/75 hover:bg-current/5 hover:text-primary-theme transition"
        >
          <FeatherRightIcon size={14} />
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-accent hover:bg-red-800/5 transition text-left cursor-pointer"
        >
          <CloseIcon size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
