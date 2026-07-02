'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/AdminSidebar';
import { Collection } from '@/lib/supabaseServer';
import { 
  NibIcon, 
  PlusIcon, 
  TrashIcon, 
  EditIcon, 
  CloseIcon, 
  SealIcon 
} from '@/components/HandmadeIcons';

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    );
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      const { error } = await supabase
        .from('collections')
        .insert([
          {
            name,
            slug,
            description: description || null,
            display_order: displayOrder,
          },
        ]);

      if (error) throw error;
      
      setName('');
      setSlug('');
      setDescription('');
      setDisplayOrder(0);
      
      fetchCollections();
    } catch (err: any) {
      alert(err.message || 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure? Deleting this collection will delete all poems associated with it!')) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCollections(collections.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete collection');
    }
  };

  const startEdit = (c: Collection) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditDescription(c.description || '');
    setEditDisplayOrder(c.display_order);
  };

  const saveEdit = async (id: string) => {
    if (!editName || !editSlug) return;

    try {
      const { error } = await supabase
        .from('collections')
        .update({
          name: editName,
          slug: editSlug,
          description: editDescription || null,
          display_order: editDisplayOrder,
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchCollections();
    } catch (err: any) {
      alert(err.message || 'Failed to update collection');
    }
  };

  return (
    <div className="min-h-screen theme-sepia book-container-theme paper-texture flex font-sans transition-colors duration-500">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto z-10 text-primary-theme">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-bengali text-secondary-theme letterpress-ink">কবিতা সংকলন সূচী</h1>
          <p className="text-xs text-primary-theme/75 tracking-wider uppercase mt-1">Book Index & Collections Directory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="card-theme p-6 rounded border shadow-sm h-fit">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary-theme mb-6 flex items-center gap-2">
              <PlusIcon size={14} /> Add New Collection
            </h2>

            <form onSubmit={handleCreateCollection} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Collection Name (Bangla)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-bengali"
                  placeholder="e.g. শূন্যতা ও শব্দ"
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary-theme/70 mb-1">
                  Introduction Preface
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-b border-current/25 focus:border-accent bg-transparent text-sm focus:outline-none text-primary-theme font-sans"
                  placeholder="Short introductory line..."
                />
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

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-accent hover:bg-zinc-900 dark:hover:bg-amber-100 dark:hover:text-black text-amber-55 text-xs font-bold uppercase tracking-widest rounded shadow transition cursor-pointer border border-current/10"
              >
                Insert Collection
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className="lg:col-span-2 card-theme rounded border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-current/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary-theme">Ledger Chapter Index</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs tracking-widest uppercase text-secondary-theme/60">Reading Index...</div>
            ) : collections.length > 0 ? (
              <div className="divide-y divide-current/10">
                {collections.map((c) => {
                  const isEditing = editingId === c.id;
                  return (
                    <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-current/5">
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-secondary-theme/50 mb-1">Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 border-b border-current/20 bg-transparent text-xs font-bengali text-primary-theme focus:outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-secondary-theme/50 mb-1">Slug</label>
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="w-full px-2 py-1 border-b border-current/20 bg-transparent text-xs font-mono text-primary-theme focus:outline-none focus:border-accent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[9px] uppercase font-bold text-secondary-theme/50 mb-1">Description</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-2 py-1 border-b border-current/20 bg-transparent text-xs text-primary-theme focus:outline-none focus:border-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-secondary-theme/50 mb-1">Order</label>
                            <input
                              type="number"
                              value={editDisplayOrder}
                              onChange={(e) => setEditDisplayOrder(parseInt(e.target.value, 10))}
                              className="w-full px-2 py-1 border-b border-current/20 bg-transparent text-xs text-primary-theme focus:outline-none focus:border-accent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base font-bengali text-secondary-theme">{c.name}</h3>
                            <span className="text-[10px] font-mono bg-current/5 px-1.5 py-0.5 rounded text-secondary-theme/70">/{c.slug}</span>
                            <span className="text-[10px] font-sans font-bold border border-current/10 px-1.5 py-0.5 rounded text-secondary-theme/80">
                              Order: {c.display_order}
                            </span>
                          </div>
                          {c.description && (
                            <p className="text-xs text-primary-theme/75 mt-1 font-sans">{c.description}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(c.id)}
                              className="p-1.5 border border-emerald-700/30 hover:bg-emerald-700 hover:text-white rounded text-emerald-800 transition cursor-pointer"
                              title="Save"
                            >
                              <SealIcon size={12} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 border border-current/10 hover:bg-current/10 rounded transition cursor-pointer"
                              title="Cancel"
                            >
                              <CloseIcon size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1.5 border border-current/10 hover:bg-accent hover:text-white rounded transition cursor-pointer"
                              title="Edit"
                            >
                              <EditIcon size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(c.id)}
                              className="p-1.5 border border-accent/25 hover:bg-accent hover:text-white text-accent rounded transition cursor-pointer"
                              title="Delete"
                            >
                              <TrashIcon size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-xs italic text-secondary-theme/50">
                No chapters added to this book index.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
