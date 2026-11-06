'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Search, Trash2, ArrowRight } from 'lucide-react';
import { Thread } from '@/lib/types/thread';
import { getStoredThreads, deleteThread } from '@/lib/store';

export default function LibraryPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setThreads(getStoredThreads());
  }, []);

  const handleDelete = (id: string) => {
    deleteThread(id);
    setThreads(getStoredThreads());
  };

  const filtered = threads.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-threadWidth mx-auto w-full space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Library
          </h1>
          <p className="text-sm text-secondary">
            Review your search history, saved threads, and research sessions.
          </p>
        </div>

        <Link
          href="/"
          className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs"
        >
          New session
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your sessions…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent shadow-2xs"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm border border-dashed border-border rounded-2xl">
            {threads.length === 0 ? 'No recent sessions' : 'No matching sessions found'}
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/80 hover:border-accent/50 hover:bg-soft/40 transition-all text-sm"
            >
              <Link href={`/search/${t.id}`} className="flex-1 pr-4 truncate">
                <p className="font-medium text-foreground truncate group-hover:text-accent transition-colors">
                  {t.title}
                </p>
                <p className="text-[11px] text-muted mt-0.5">{t.createdAt || 'Recent'}</p>
              </Link>

              <button
                onClick={() => handleDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-red-500 rounded-lg transition-opacity"
                title="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
