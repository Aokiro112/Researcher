'use client';

import React from 'react';
import { Bot, Plus, Sparkles } from 'lucide-react';

export default function TeammatesPage() {
  const teammates = [
    {
      name: 'Research Analyst',
      role: 'Literature & Market Intelligence',
      prompt: 'Synthesize complex market trends, find primary citations, and compile executive briefings.',
      glyph: 'ASTERISK',
    },
    {
      name: 'Code Reviewer',
      role: 'Architecture & Vulnerabilities',
      prompt: 'Analyze repository changes, inspect dependencies for CVEs, and suggest performance optimizations.',
      glyph: 'SLASH',
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-threadWidth mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Teammates
          </h1>
          <p className="text-sm text-secondary">
            Persistent autonomous AI agents configured to work on recurring tasks.
          </p>
        </div>

        <button
          onClick={() => alert('Create teammate wizard')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New teammate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teammates.map((t) => (
          <div
            key={t.name}
            className="p-5 rounded-2xl bg-card border border-border hover:border-accent/50 hover:bg-soft/30 transition-all space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                <p className="text-[11px] text-muted">{t.role}</p>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed line-clamp-3">{t.prompt}</p>

            <div className="pt-2 border-t border-border/40 flex justify-end">
              <button
                onClick={() => alert(`Start session with ${t.name}`)}
                className="px-3 py-1.5 rounded-lg bg-card hover:bg-soft border border-border text-xs font-medium text-foreground transition-colors"
              >
                Chat with agent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
