'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Grid,
  Search,
  Cpu,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { QueryComposer } from '@/components/composer/QueryComposer';
import { SearchMode } from '@/lib/types/thread';
import { saveThread } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [isIncognito, setIsIncognito] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);

  const handleSubmit = (query: string, mode: SearchMode, model: string, attachments: File[]) => {
    // Generate UUID for thread
    const threadUuid = crypto.randomUUID();

    // Store optimistic thread state in sessionStorage
    const optimisticThread = {
      id: threadUuid,
      slug: threadUuid,
      title: query,
      isIncognito,
      mode,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
      entries: {},
    };

    if (!isIncognito) {
      saveThread(optimisticThread);
    }

    sessionStorage.setItem(`pending_query_${threadUuid}`, JSON.stringify({ query, mode, model }));
    router.push(`/search/${threadUuid}`);
  };

  const appsMenuItems = [
    { label: 'Discover', desc: 'Curated news and insights', href: '/discover' },
    { label: 'Finance', desc: 'Stock analysis & financials', href: '/finance' },
    { label: 'Health', desc: 'Clinical & medical research', href: '/health' },
    { label: 'Academic', desc: 'Scholarly citations & papers', href: '/academic' },
    { label: 'Patents', desc: 'Intellectual property & claims', href: '/patents' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 min-h-full">
      {/* Top Header Floating Controls */}
      <div className="flex items-center justify-end gap-2 relative z-20">
        {/* Incognito Toggle Button */}
        <button
          onClick={() => setIsIncognito(!isIncognito)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isIncognito
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
              : 'bg-card border-border text-secondary hover:text-foreground hover:bg-soft'
          }`}
          title="Use incognito: create anonymous sessions that aren't saved to your history and expire after 24 hours"
          aria-label="Use incognito: create anonymous sessions that aren't saved to your history and expire after 24 hours"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isIncognito ? 'Incognito Active' : 'Incognito'}</span>
        </button>

        {/* Apps and More Popover */}
        <div className="relative">
          <button
            onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-secondary hover:text-foreground hover:bg-soft text-xs font-medium transition-colors"
            aria-expanded={isAppsMenuOpen}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Apps and more</span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {isAppsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {appsMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    router.push(item.href);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-subtle transition-colors"
                >
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted">{item.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Hero & Composer Section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-threadWidth w-full mx-auto my-auto py-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground text-center tracking-tight mb-8">
          What do you want to know?
        </h1>

        <QueryComposer onSubmit={handleSubmit} />

        {/* Onboarding Starter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
          <button
            onClick={() => handleSubmit('Search anything and get fast accurate answers', 'search', 'gemini-3.8-flash', [])}
            className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 hover:border-accent/50 hover:bg-soft/40 transition-all text-left group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                Search anything
              </h3>
              <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                Get fast and accurate answers from the most trusted sources.
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push('/computer/tasks')}
            className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/80 hover:border-accent/50 hover:bg-soft/40 transition-all text-left group shadow-2xs"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-foreground group-hover:text-purple-600 transition-colors">
                  Get work done with Computer
                </h3>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-500/10 px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-0.5 leading-snug">
                Hand off your projects to get polished, reliable deliverables around the clock.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Legal Links */}
      <footer className="text-center text-xs text-muted py-4 space-x-3">
        <a href="#" className="hover:text-secondary underline transition-colors">
          Terms of Service
        </a>
        <span>•</span>
        <a href="#" className="hover:text-secondary underline transition-colors">
          Privacy Notice
        </a>
      </footer>
    </div>
  );
}
