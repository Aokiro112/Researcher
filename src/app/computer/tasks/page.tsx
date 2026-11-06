'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  Shuffle,
  Sparkles,
  ArrowRight,
  FolderSync,
  FileSpreadsheet,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { QueryComposer } from '@/components/composer/QueryComposer';

export default function ComputerTasksPage() {
  const router = useRouter();

  const starterCards = [
    { title: 'Review my recent designs', icon: Sparkles, query: 'Review my recent Figma designs and list UI consistency improvements.' },
    { title: 'Organize my Drive', icon: FolderSync, query: 'Scan and organize my Google Drive workspace into clean topical directories.' },
    { title: 'Summarize shared file changes', icon: FileSpreadsheet, query: 'Summarize all changes across shared spreadsheets this week.' },
    { title: 'Turn Notion notes into a wiki', icon: BookOpen, query: 'Convert raw Notion meeting notes into a structured internal knowledge wiki.' },
    { title: 'Plan next week\'s lessons', icon: Calendar, query: 'Draft a comprehensive lesson schedule and curriculum outline for next week.' },
  ];

  const [cards, setCards] = useState(starterCards);

  const shuffleCards = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
  };

  const handleStartTask = (query: string) => {
    const taskUuid = crypto.randomUUID();
    sessionStorage.setItem(`pending_query_${taskUuid}`, JSON.stringify({ query, mode: 'computer', model: 'claude-sonnet-5.5' }));
    router.push(`/search/${taskUuid}`);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 max-w-threadWidth mx-auto w-full">
      <div className="space-y-6 my-auto py-8">
        {/* Banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Computer researches dozens of sources in parallel and creates deliverables</span>
        </div>

        {/* Hero */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Delegate work to Computer
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            Hand off your projects to get polished, reliable deliverables around the clock.
          </p>
        </div>

        {/* Starter Prompt Cards */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Recommended Starter Tasks</span>
            <button
              onClick={shuffleCards}
              className="inline-flex items-center gap-1 text-xs text-secondary hover:text-foreground transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle starter cards</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.title}
                  onClick={() => handleStartTask(c.query)}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/80 hover:border-purple-500/50 hover:bg-soft/40 transition-all text-left group shadow-2xs"
                >
                  <Icon className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-foreground group-hover:text-purple-600 transition-colors line-clamp-2">
                    {c.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Computer Composer Box */}
        <div className="pt-4">
          <QueryComposer
            placeholder="Start a session with Computer…"
            defaultMode="computer"
            defaultModel="claude-sonnet-5.5"
            onSubmit={(q) => handleStartTask(q)}
          />
        </div>
      </div>
    </div>
  );
}
