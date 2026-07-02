'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { Collection, Poem } from '@/lib/supabaseServer';
import { 
  BookIcon, 
  NibIcon, 
  PlusIcon, 
  SearchIcon, 
  EditIcon, 
  TrashIcon, 
  StitchIcon, 
  SealIcon 
} from '@/components/HandmadeIcons';

export default function AdminDashboard() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: collData } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });
      
      const { data: poemData } = await supabase
        .from('poems')
        .select('*')
        .order('display_order', { ascending: true });

      setCollections(collData || []);
      setPoems(poemData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePoem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poem?')) return;

    try {
      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPoems(poems.filter((p) => p.id !== id));
    } catch (error) {
      alert('Failed to delete poem');
      console.error(error);
    }
  };

  const getCollectionName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const c = collections.find((coll) => coll.id === id);
    return c ? c.name : 'Unknown';
  };

  const filteredPoems = poems.filter((poem) => {
    const matchesSearch = poem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          poem.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || poem.status === statusFilter;
    const matchesCollection = collectionFilter === 'all' || poem.collection_id === collectionFilter;
    return matchesSearch && matchesStatus && matchesCollection;
  });

  const publishedCount = poems.filter((p) => p.status === 'published').length;
  const draftCount = poems.filter((p) => p.status === 'draft').length;
  const scheduledCount = poems.filter((p) => p.status === 'scheduled').length;

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture flex font-sans transition-colors duration-500">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto z-10 text-primary-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-bengali text-secondary-theme letterpress-ink">কবিতা ও সংগ্রহশালা</h1>
            <p className="text-xs text-primary-theme/75 tracking-wider uppercase mt-1">Poem Registry & Archive</p>
          </div>
          <Link
            href="/admin/poems/new"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-zinc-900 dark:hover:bg-amber-100 dark:hover:text-black rounded text-xs font-bold uppercase tracking-wider transition shadow cursor-pointer border border-current/10"
          >
            <PlusIcon size={12} /> New Poem
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-theme p-6 rounded border flex items-center gap-4 shadow-sm relative">
            <div className="p-3 bg-current/5 text-secondary-theme rounded">
              <BookIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-theme/60 uppercase tracking-widest">Total Poems</p>
              <h3 className="text-xl font-bold text-primary-theme mt-1">{poems.length}</h3>
            </div>
          </div>

          <div className="card-theme p-6 rounded border flex items-center gap-4 shadow-sm relative">
            <div className="p-3 bg-current/5 text-emerald-800 dark:text-emerald-500 rounded">
              <SealIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-theme/60 uppercase tracking-widest">Published</p>
              <h3 className="text-xl font-bold text-primary-theme mt-1">{publishedCount}</h3>
            </div>
          </div>

          <div className="card-theme p-6 rounded border flex items-center gap-4 shadow-sm relative">
            <div className="p-3 bg-current/5 text-secondary-theme rounded">
              <StitchIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-theme/60 uppercase tracking-widest">Drafts</p>
              <h3 className="text-xl font-bold text-primary-theme mt-1">{draftCount}</h3>
            </div>
          </div>

          <div className="card-theme p-6 rounded border flex items-center gap-4 shadow-sm relative">
            <div className="p-3 bg-current/5 text-amber-800 dark:text-amber-500 rounded">
              <NibIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-theme/60 uppercase tracking-widest">Collections</p>
              <h3 className="text-xl font-bold text-primary-theme mt-1">{collections.length}</h3>
            </div>
          </div>
        </div>

        {/* Filter and Table Section */}
        <div className="card-theme rounded border overflow-hidden shadow-sm">
          
          {/* Header Controls */}
          <div className="p-6 border-b border-current/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-theme/40">
                <SearchIcon size={14} />
              </span>
              <input
                type="text"
                placeholder="Search poem registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border-b border-current/25 focus:border-accent bg-transparent text-xs focus:outline-none text-primary-theme font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-current/15 rounded bg-current/5 text-[11px] font-bold uppercase tracking-wider focus:outline-none text-secondary-theme font-sans"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>

              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className="px-3 py-2 border border-current/15 rounded bg-current/5 text-[11px] font-bold uppercase tracking-wider focus:outline-none text-secondary-theme font-sans"
              >
                <option value="all">All Chapters</option>
                {collections.map((coll) => (
                  <option key={coll.id} value={coll.id}>{coll.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-xs tracking-widest uppercase text-secondary-theme/60">Reading Ledger...</div>
          ) : filteredPoems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-current/5 text-[10px] font-bold text-secondary-theme/70 uppercase tracking-widest border-b border-current/10">
                    <th className="px-6 py-4">Poem Entry</th>
                    <th className="px-6 py-4">Chapter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Published At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/10 text-xs">
                  {filteredPoems.map((poem) => (
                    <tr key={poem.id} className="hover:bg-current/5 transition text-primary-theme">
                      <td className="px-6 py-4">
                        <div className="font-bold font-bengali text-sm text-secondary-theme">{poem.title}</div>
                        <div className="text-[10px] text-primary-theme/50 font-mono mt-0.5">/{poem.slug}</div>
                      </td>
                      <td className="px-6 py-4 font-bengali">
                        {getCollectionName(poem.collection_id)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                          ${poem.status === 'published' ? 'border-emerald-700/30 text-emerald-800 dark:text-emerald-450 bg-emerald-700/5' : ''}
                          ${poem.status === 'draft' ? 'border-current/20 text-primary-theme/70' : ''}
                          ${poem.status === 'scheduled' ? 'border-blue-700/30 text-blue-800 dark:text-blue-450 bg-blue-700/5' : ''}
                        `}>
                          {poem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-primary-theme/80 font-mono text-[10px]">
                        {new Date(poem.published_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <Link
                            href={`/admin/poems/edit/${poem.id}`}
                            className="p-1.5 border border-current/10 hover:bg-accent hover:text-white rounded transition"
                            title="Edit"
                          >
                            <EditIcon size={12} />
                          </Link>
                          <button
                            onClick={() => handleDeletePoem(poem.id)}
                            className="p-1.5 border border-accent/20 hover:bg-accent hover:text-white text-accent rounded transition cursor-pointer"
                            title="Delete"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs italic text-secondary-theme/50">
              No entries found in the ledger book.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
