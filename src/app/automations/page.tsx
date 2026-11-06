'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Clock, Send, Shuffle, Plus } from 'lucide-react';

export default function AutomationsPage() {
  const [prompt, setPrompt] = useState('');

  const templates = [
    {
      title: 'Industry news digest',
      desc: 'Send a rundown of relevant news to my industry every weekday morning.',
      schedule: 'Every day at 8:00 AM',
    },
    {
      title: 'Morning Slack Digest',
      desc: 'Every morning, summarize all critical Slack messages and pull requests.',
      schedule: 'Weekdays at 9:00 AM',
    },
    {
      title: 'Draft Weekly notes',
      desc: 'Scan relevant project updates and draft team standup notes.',
      schedule: 'Every Friday at 4:00 PM',
    },
  ];

  const handleCreate = (templateText?: string) => {
    const text = templateText || prompt;
    if (!text.trim()) return;
    alert(`Automation created: "${text}"`);
    setPrompt('');
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-threadWidth mx-auto w-full space-y-6">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Automate anything with Computer
        </h1>
        <p className="text-sm text-secondary leading-relaxed">
          Run workflows on a custom schedule or when specific conditions are met and get results delivered automatically.
        </p>
      </div>

      {/* Suggested Templates */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-semibold uppercase tracking-wider text-[11px]">Suggested Templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((t) => (
            <button
              key={t.title}
              onClick={() => handleCreate(t.desc)}
              className="flex flex-col justify-between p-4 rounded-2xl bg-card border border-border/80 hover:border-accent/60 hover:bg-soft/40 transition-all text-left group shadow-2xs space-y-3"
            >
              <div>
                <h3 className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                  {t.title}
                </h3>
                <p className="text-[11px] text-secondary mt-1 line-clamp-3 leading-snug">{t.desc}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-muted pt-2 border-t border-border/30">
                <Clock className="w-3 h-3 text-accent" />
                <span>{t.schedule}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Box */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
        <label className="block text-xs font-semibold text-foreground">
          Or type what you want your automation to do:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Every Monday morning at 9am, search for top AI research papers published on arXiv and send a markdown summary to Slack..."
          rows={3}
          className="w-full bg-subtle p-3 rounded-xl border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={() => handleCreate()}
            disabled={!prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
